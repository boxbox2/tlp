import { tarotDeck } from "@/data/cards";
import { readers } from "@/data/readers";
import { themes } from "@/data/themes";

export const spreadOptions = [
  {
    id: "single",
    name: "单张指引",
    count: 1,
    description: "适合快速看看当下最值得留意的一件事。"
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

const readerStyleGuides = {
  luna: {
    name: "露娜",
    voice: "温柔、细腻、先安抚情绪再进入判断",
    angle: "先看关系里的感受与回应，再谈下一步靠近还是拉开距离"
  },
  sol: {
    name: "索尔",
    voice: "清醒、直接、看重现实窗口与行动判断",
    angle: "先拆局势，再指出最值得执行的动作"
  },
  iris: {
    name: "伊里丝",
    voice: "柔和、疗愈、优先照顾状态与节奏",
    angle: "先看消耗与恢复，再决定是否推进外部选择"
  },
  orion: {
    name: "猎户",
    voice: "有叙事感、擅长看阶段趋势与转折意义",
    angle: "把当下问题放回更长的时间线里理解"
  }
};

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

export function getCardImageSrc(imageSlug) {
  return `/cards/rws/${imageSlug}.jpg`;
}

function shuffle(list) {
  const pool = [...list];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool;
}

function getReaderStyleGuide(readerId) {
  return readerStyleGuides[readerId] ?? readerStyleGuides.sol;
}

function buildSummary(card, orientation, shortKeywords) {
  if (orientation === "upright") {
    return `${card.name}以正位出现，强调${shortKeywords.join("、")}。`;
  }

  return `${card.name}以逆位出现，提醒你留意${shortKeywords.join("、")}。`;
}

function buildReaderMessage({ readerId, question, theme, cards }) {
  const firstCard = cards[0];
  const focusCard = cards[1] ?? cards[0];
  const style = getReaderStyleGuide(readerId);
  const focusKeywords = focusCard?.keywords?.slice(0, 2).join("、") ?? "当下真正的重点";
  const firstKeyword = firstCard?.keywords?.[0] ?? "局势的核心";

  switch (readerId) {
    case "luna":
      return `我先替你把这句“${question}”放轻一点看。牌面没有在催你立刻证明什么，它更像是在告诉你，这段${theme.name}真正需要回应的，是“${firstKeyword}”和“${focusKeywords}”。如果你愿意先把情绪说清楚，很多悬着的部分会慢慢落下来。`;
    case "iris":
      return `我会先看你现在是不是已经有点透支了。就这组牌来说，问题不只是“${question}”，更是在提醒你留意“${firstKeyword}”与“${focusKeywords}”背后的状态消耗。先把节奏照顾好，你才有余裕做出更稳的选择。`;
    case "orion":
      return `把你的问题放回更长的时间线里看，这不是一个孤立片刻。牌面指向的并不只是“${question}”本身，而是你正走到一个和“${firstKeyword}”有关的阶段节点，同时也在被“${focusKeywords}”推向下一段路。别急着求结论，先看清这次转折想把你带去哪里。`;
    case "sol":
    default:
      return `如果直接一点说，这组牌不是在替你犹豫，它是在帮你把问题拆开。围绕“${question}”，最需要你立刻看清的是“${firstKeyword}”，而真正决定后续走向的，是你能不能处理好“${focusKeywords}”。先把判断落到现实动作上，局势就会清楚得多。`;
  }
}

export function drawCards(spreadId = "triple") {
  const spread = getSpreadById(spreadId);
  const positions = spread.count === 1 ? singlePosition : triplePositions;
  const deck = shuffle(tarotDeck).slice(0, spread.count);

  return deck.map((card, index) => {
    const orientation = Math.random() > 0.5 ? "upright" : "reversed";
    const shortKeywords =
      orientation === "upright" ? card.upright.slice(0, 2) : card.reversed.slice(0, 2);

    return {
      id: `${card.id}-${orientation}-${index}`,
      cardId: card.id,
      name: card.name,
      arcana: card.arcana,
      suit: card.suit,
      imageSlug: card.imageSlug,
      imageSrc: getCardImageSrc(card.imageSlug),
      position: positions[index],
      orientation,
      keywords: orientation === "upright" ? card.upright : card.reversed,
      themeLine: card.themes,
      summary: buildSummary(card, orientation, shortKeywords)
    };
  });
}

export function buildFallbackReading({ question, themeId, readerId, cards, spreadId }) {
  const theme = getThemeById(themeId);
  const reader = getReaderById(readerId);
  const spread = getSpreadById(spreadId);
  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];

  const sections = {
    opening: `${reader.name}感受到，你现在最在意的是“${question}”。这次解读不是替你做决定，而是帮你把局势拆清楚，让重点浮出来。`,
    readerMessage: buildReaderMessage({
      readerId,
      question,
      theme,
      cards
    }),
    cardReadings: cards.map((card) => ({
      title: `${card.position} · ${card.name}${card.orientation === "upright" ? "正位" : "逆位"}`,
      body: `${card.summary}${card.themeLine?.[theme.id] ?? ""} 在“${card.position}”这个位置上，它尤其强调${card.keywords
        .slice(0, 2)
        .join("和")}。`
    })),
    trend: `整体来看，这组牌更像是在提醒你先处理“${firstCard.keywords[0]}”与“${lastCard.keywords[0]}”之间的关系。只要你愿意把节奏放稳，${theme.name}这件事会从模糊慢慢走向清楚。`,
    advice: [
      "先把问题缩小到一个最核心的决策点，不要一次处理所有不安。",
      `结合${theme.name}这个主题，优先做一件可执行的小动作，而不是反复脑内推演。`,
      spread.count === 3
        ? `把注意力放在“${cards[1].position}”这张牌提醒的内容上，先修正这里，局势会更容易松动。`
        : "把今天最直觉的一条感受记下来，它会成为你接下来判断的重要线索。"
    ],
    reminder:
      theme.id === "health"
        ? "这次解读只用于生活状态、压力节奏与恢复方向参考，不能替代医疗诊断或治疗建议。"
        : `${reader.name}想提醒你，占卜更像一盏小灯，它照见趋势，但真正改变结果的仍然是你之后的行动。`
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
  return parseReadingJson(data?.choices?.[0]?.message?.content ?? "");
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

export function normalizeReadingSections(rawSections, fallbackSections) {
  const sections = rawSections?.sections ?? rawSections ?? {};

  return {
    opening: sections.opening || fallbackSections.opening,
    readerMessage:
      sections.readerMessage || sections.opening || fallbackSections.readerMessage || fallbackSections.opening,
    cardReadings:
      Array.isArray(sections.cardReadings) && sections.cardReadings.length > 0
        ? sections.cardReadings
        : fallbackSections.cardReadings,
    trend: sections.trend || fallbackSections.trend,
    advice:
      Array.isArray(sections.advice) && sections.advice.length > 0
        ? sections.advice.slice(0, 3)
        : fallbackSections.advice,
    reminder: sections.reminder || fallbackSections.reminder
  };
}

export function buildReadingPrompt({ question, theme, reader, cards, spread }) {
  const style = getReaderStyleGuide(reader.id);
  const cardsSummary = cards
    .map(
      (card) =>
        `${card.position}：${card.name}${card.orientation === "upright" ? "正位" : "逆位"}；关键词：${card.keywords.join("、")}；主题解释：${card.themeLine?.[theme.id] ?? ""}`
    )
    .join("\n");

  return `
你是一位中文塔罗解读写作者，需要用固定结构输出 JSON。
用户问题：${question}
占卜主题：${theme.name}
主题说明：${theme.promptHint}
占卜师：${reader.name}，角色：${reader.title}；说话风格：${reader.voice || style.voice}；解读角度：${style.angle}
牌阵：${spread.name}
抽到的牌：
${cardsSummary}

要求：
1. 输出中等深度、温和且具体，不神叨，不夸张。
2. 不要编造新的牌义，只能基于提供的牌面信息组织表达。
3. health 主题只能做生活状态、压力与恢复建议，禁止医疗诊断。
4. opening 是总引入，readerMessage 必须像该角色在直接对用户说话，要同时回应用户问题和这组牌，不要只是重复 opening。
5. cardReadings 必须与牌位一一对应。
6. advice 必须是字符串数组，给出 3 条可以执行的小建议。
7. 所有字段都必须存在，且只输出 JSON，不要额外说明。

JSON 结构：
{
  "opening": "string",
  "readerMessage": "string",
  "cardReadings": [
    { "title": "string", "body": "string" }
  ],
  "trend": "string",
  "advice": ["string", "string", "string"],
  "reminder": "string"
}
  `.trim();
}
