import { majorArcana } from "@/data/cards";
import { readers } from "@/data/readers";
import { themes } from "@/data/themes";

export const spreadOptions = [
  {
    id: "single",
    name: "单张指引",
    count: 1,
    description: "适合快速看看当前最值得留意的一件事。"
  },
  {
    id: "triple",
    name: "三张展开",
    count: 3,
    description: "适合完整提问，查看现状、阻碍和接下来的行动方向。"
  }
];

const triplePositions = ["现状", "阻碍", "建议"];
const singlePosition = ["核心提示"];

export function getReaderById(id) {
  return readers.find((reader) => reader.id === id) ?? readers[0];
}

export function getThemeById(id) {
  return themes.find((theme) => theme.id === id) ?? themes[0];
}

export function getThemesForReader(readerId) {
  const reader = getReaderById(readerId);
  return themes.filter((theme) => reader.themeIds.includes(theme.id));
}

export function isThemeSupportedByReader(readerId, themeId) {
  return getThemesForReader(readerId).some((theme) => theme.id === themeId);
}

export function getSpreadById(id) {
  return spreadOptions.find((spread) => spread.id === id) ?? spreadOptions[1];
}

function shuffle(list) {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function drawCards(spreadId = "triple") {
  const spread = getSpreadById(spreadId);
  const positions = spread.count === 1 ? singlePosition : triplePositions;
  const deck = shuffle(majorArcana).slice(0, spread.count);

  return deck.map((card, index) => {
    const orientation = Math.random() > 0.5 ? "upright" : "reversed";
    return {
      id: `${card.id}-${orientation}-${index}`,
      cardId: card.id,
      name: card.name,
      arcana: card.arcana,
      position: positions[index],
      orientation,
      keywords: orientation === "upright" ? card.upright : card.reversed,
      themeLine: card.themes,
      summary:
        orientation === "upright"
          ? `${card.name}以正位出现，提示${card.upright.slice(0, 2).join("、")}。`
          : `${card.name}以逆位出现，提醒你留意${card.reversed.slice(0, 2).join("、")}。`
    };
  });
}

export function buildFallbackReading({ question, themeId, readerId, cards, spreadId }) {
  const theme = getThemeById(themeId);
  const reader = getReaderById(readerId);
  const spread = getSpreadById(spreadId);

  const introCard = cards[0];
  const directionCard = cards[cards.length - 1];

  const sections = {
    opening: `${reader.name}感受到，你现在最在意的是“${question}”。这次占卜更像一次温柔整理：不是替你下绝对结论，而是帮你看清当下真正发生了什么。`,
    cardReadings: cards.map((card) => ({
      title: `${card.position} · ${card.name}${card.orientation === "upright" ? "正位" : "逆位"}`,
      body: `${card.summary}${card.themeLine[theme.id]} 这张牌在${card.position}位置上，也提示你把注意力放在${card.keywords.slice(0, 2).join("和")}上。`
    })),
    trend: `整体来看，这组牌并不在催你立刻做大动作，而是在提醒你先处理“${introCard.keywords[0]}”与“${directionCard.keywords[0]}”之间的关系。只要你愿意把节奏放稳，${theme.name}这件事会从模糊慢慢走向清楚。`,
    advice: [
      "先把问题缩小到一个最核心的决定点，不要一次处理所有不安。",
      `结合${theme.name}主题，优先做一件可执行的小动作，而不是反复脑内推演。`,
      spread.count === 3
        ? `如果你愿意，可以先围绕“${cards[1].position}”这一张牌提醒的内容做修正，再看局势变化。`
        : "把今天最直觉的一条感受记下来，它会成为你接下来判断的重要线索。"
    ],
    reminder:
      theme.id === "health"
        ? "这次解读仅用于生活状态与情绪节奏参考，不能替代医疗建议。如果你已经感到持续不适，请优先寻求专业帮助。"
        : `${reader.name}想提醒你，占卜更像一盏小灯，它照见趋势，但真正决定方向的仍然是你之后的行动与选择。`
  };

  return {
    source: "fallback",
    theme,
    reader,
    spread,
    sections
  };
}

function cleanJsonFence(text) {
  return text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function parseReadingJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model returned empty content");
  }

  return JSON.parse(cleanJsonFence(rawText));
}

function getModelProvider() {
  if (process.env.ARK_API_KEY) {
    return "ark";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return null;
}

async function generateArkReading(prompt) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
  const model = process.env.ARK_MODEL;
  if (!model) {
    throw new Error("ARK_MODEL is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content:
            "你是一位中文塔罗解读写作者。输出必须是合法 JSON，并严格遵守用户提供的结构与限制。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Ark request failed with ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content ?? "";
  return parseReadingJson(rawText);
}

async function generateOpenAiReading(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`);
  }

  const data = await response.json();
  return parseReadingJson(data.output_text || "");
}

export async function generateAiReading(payload) {
  const provider = getModelProvider();
  if (!provider) {
    return null;
  }

  if (provider === "ark") {
    return generateArkReading(payload.prompt);
  }

  return generateOpenAiReading(payload.prompt);
}

export function buildReadingPrompt({ question, theme, reader, cards, spread }) {
  const cardsSummary = cards
    .map(
      (card) =>
        `${card.position}：${card.name}${card.orientation === "upright" ? "正位" : "逆位"}；关键词：${card.keywords.join("、")}；主题解释：${card.themeLine[theme.id]}`
    )
    .join("\n");

  return `
你是一位中文塔罗解读写作者，需要用固定结构输出 JSON。

用户问题：${question}
占卜主题：${theme.name}
主题说明：${theme.promptHint}
占卜师：${reader.name}，人设：${reader.title}；气质：${reader.aura}；说话风格：${reader.voice}
牌阵：${spread.name}
抽到的牌：
${cardsSummary}

要求：
1. 输出中等深度、温柔且具体，不神叨，不夸张。
2. 不要编造新的牌义，只能基于提供的牌面信息组织表达。
3. 健康主题只能做生活状态、压力与恢复建议，禁止医疗诊断。
4. advice 必须是字符串数组，给出 3 条可以执行的小建议。
5. 所有字段都必须存在，且只输出 JSON，不要额外说明。

JSON 结构：
{
  "opening": "string",
  "cardReadings": [
    { "title": "string", "body": "string" }
  ],
  "trend": "string",
  "advice": ["string", "string", "string"],
  "reminder": "string"
}
  `.trim();
}
