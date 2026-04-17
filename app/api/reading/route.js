import { NextResponse } from "next/server";
import {
  buildFallbackReading,
  buildReadingPrompt,
  generateAiReading,
  getReaderById,
  getSpreadById,
  getThemeById,
  isThemeSupportedByReader,
  normalizeReadingSections
} from "@/lib/tarot";
import { consumeReadingRateLimit, getReadingRateLimit } from "@/lib/readingRateLimit";

function formatAbsoluteResetTime(resetAt) {
  const date = new Date(resetAt);

  if (Number.isNaN(date.getTime())) {
    return "稍后";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function buildRateLimitError(rateLimit) {
  return `塔罗牌正在积蓄能量，请于 ${formatAbsoluteResetTime(rateLimit?.resetAt)} 后再来。`;
}

export async function GET(request) {
  return NextResponse.json({
    rateLimit: getReadingRateLimit(request)
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const question = body?.question?.trim();
    const themeId = body?.themeId;
    const readerId = body?.readerId;
    const spreadId = body?.spreadId;
    const cards = body?.cards;

    if (!question || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        {
          error: "请先输入问题并完成抽牌。",
          rateLimit: getReadingRateLimit(request)
        },
        { status: 400 }
      );
    }

    if (!isThemeSupportedByReader(readerId, themeId)) {
      return NextResponse.json(
        {
          error: "这位占卜师暂时不解读这个主题，请换一位更擅长的占卜师。",
          rateLimit: getReadingRateLimit(request)
        },
        { status: 400 }
      );
    }

    const rateLimit = consumeReadingRateLimit(request);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: buildRateLimitError(rateLimit),
          rateLimit
        },
        { status: 429 }
      );
    }

    const theme = getThemeById(themeId);
    const reader = getReaderById(readerId);
    const spread = getSpreadById(spreadId);
    const fallback = buildFallbackReading({
      question,
      themeId,
      readerId,
      cards,
      spreadId
    });

    try {
      const aiSections = await generateAiReading({
        prompt: buildReadingPrompt({
          question,
          theme,
          reader,
          cards,
          spread
        })
      });

      if (!aiSections) {
        throw new Error("ai_not_configured");
      }

      return NextResponse.json({
        source: "ai",
        theme,
        reader,
        spread,
        rateLimit,
        sections: normalizeReadingSections(aiSections, fallback.sections)
      });
    } catch (aiError) {
      return NextResponse.json({
        ...fallback,
        source: "fallback",
        fallbackReason: "ai_unavailable",
        rateLimit
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "解读暂时没有成功生成，请重新试一次。",
        rateLimit: getReadingRateLimit(request)
      },
      { status: 500 }
    );
  }
}
