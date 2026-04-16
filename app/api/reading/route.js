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
          error: "请先输入问题并完成抽牌。"
        },
        { status: 400 }
      );
    }

    if (!isThemeSupportedByReader(readerId, themeId)) {
      return NextResponse.json(
        {
          error: "这位占卜师暂时不解读这个主题，请换一位更擅长的占卜师。"
        },
        { status: 400 }
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
        sections: normalizeReadingSections(aiSections, fallback.sections)
      });
    } catch (aiError) {
      return NextResponse.json({
        ...fallback,
        source: "fallback",
        fallbackReason: "ai_unavailable"
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "解读暂时没有成功生成，请重新试一次。"
      },
      { status: 500 }
    );
  }
}
