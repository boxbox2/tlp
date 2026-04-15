import { NextResponse } from "next/server";
import { drawCards, getSpreadById } from "@/lib/tarot";

export async function POST(request) {
  try {
    const body = await request.json();
    const spreadId = body?.spreadId || "triple";
    const spread = getSpreadById(spreadId);
    const cards = drawCards(spreadId);

    return NextResponse.json({
      spread,
      cards
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "抽牌时出现了一点小问题，请稍后再试。"
      },
      { status: 500 }
    );
  }
}
