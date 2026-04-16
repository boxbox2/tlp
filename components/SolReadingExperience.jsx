"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/png/soul_place.png";
import { themes } from "@/data/themes";
import { spreadOptions } from "@/lib/tarot";

const solThemeIds = ["career", "wealth"];
const solThemes = themes.filter((theme) => solThemeIds.includes(theme.id));

const starterQuestions = [
  "我应该接受现在这个新机会吗？",
  "这份工作会是长期正确的方向吗？",
  "我最近的财运重点应该放在哪一类选择上？"
];

export default function SolReadingExperience() {
  const [selectedThemeId, setSelectedThemeId] = useState(solThemes[0]?.id ?? "career");
  const [spreadId, setSpreadId] = useState("triple");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const activeTheme =
    solThemes.find((theme) => theme.id === selectedThemeId) ?? solThemes[0];
  const activeSpread =
    spreadOptions.find((spread) => spread.id === spreadId) ?? spreadOptions[1];

  async function handleSend() {
    if (!question.trim()) {
      setError("先把你想确认的问题写下来，我再替你展开牌面。");
      return;
    }

    setError("");
    setStatus("drawing");
    setCards([]);
    setReading(null);

    try {
      const drawResponse = await fetch("/api/draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ spreadId })
      });
      const drawPayload = await drawResponse.json();

      if (!drawResponse.ok) {
        throw new Error(drawPayload.error || "抽牌失败，请稍后再试。");
      }

      setCards(drawPayload.cards);
      setStatus("reading");

      const readingResponse = await fetch("/api/reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          themeId: selectedThemeId,
          readerId: "sol",
          spreadId,
          cards: drawPayload.cards
        })
      });
      const readingPayload = await readingResponse.json();

      if (!readingResponse.ok) {
        throw new Error(readingPayload.error || "解读生成失败，请稍后再试。");
      }

      setReading({
        ...readingPayload,
        question,
        cards: drawPayload.cards
      });
      setStatus("ready");
    } catch (fetchError) {
      setStatus("idle");
      setError(fetchError.message || "这次连接有点不稳，请稍后再试。");
    }
  }

  return (
    <main className="sol-reading-shell">
      <Image
        src={backgroundImage}
        alt="索尔专属占卜场景"
        fill
        priority
        sizes="100vw"
        className="sol-reading-bg"
      />
      <div className="sol-reading-overlay">
        <header className="sol-reading-header">
          <div>
            <span className="sol-badge">索尔 · 日轮观察者</span>
            <h1>把问题说得更清楚，方向才会自己浮现出来。</h1>
            <p>
              索尔更擅长看事业路径和财运机会。他不会替你决定，但会帮你把局势和行动窗口看得更明白。
            </p>
          </div>
          <Link href="/" className="ghost-button sol-back-link">
            返回入口
          </Link>
        </header>

        <section className="sol-reading-content">
          <div className="sol-dialog-stream">
            {reading ? (
              <>
                <article className="sol-bubble user">
                  <span className="sol-bubble-label">你的问题</span>
                  <p>{reading.question}</p>
                </article>

                <article className="sol-bubble cards">
                  <span className="sol-bubble-label">抽到的牌</span>
                  <div className={`sol-cards ${cards.length === 1 ? "single" : ""}`}>
                    {cards.map((card) => (
                      <div key={card.id} className="sol-card">
                        <strong>{card.name}</strong>
                        <span>{card.position}</span>
                        <small>{card.orientation === "upright" ? "正位" : "逆位"}</small>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="sol-bubble sol">
                  <span className="sol-bubble-label">索尔的回应</span>
                  <p>{reading.sections.opening}</p>
                  <div className="sol-reading-block">
                    {reading.sections.cardReadings.map((item) => (
                      <div key={item.title} className="sol-reading-item">
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="sol-reading-item">
                    <strong>综合趋势</strong>
                    <p>{reading.sections.trend}</p>
                  </div>
                  <div className="sol-reading-item">
                    <strong>建议</strong>
                    <ul>
                      {reading.sections.advice.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sol-reading-item">
                    <strong>提醒</strong>
                    <p>{reading.sections.reminder}</p>
                  </div>
                </article>
              </>
            ) : (
              <article className="sol-bubble sol intro">
                <span className="sol-bubble-label">开始之前</span>
                <p>
                  先把问题缩成一句话。比如“我该不该接受这个机会”会比“我最近为什么这么迷茫”更容易得到清晰指向。
                </p>
              </article>
            )}

            {status === "drawing" ? (
              <article className="sol-bubble system">
                <span className="sol-bubble-label">抽牌中</span>
                <p>牌面正在展开，先别急着替结果下判断。</p>
              </article>
            ) : null}

            {status === "reading" ? (
              <article className="sol-bubble system">
                <span className="sol-bubble-label">解读中</span>
                <p>索尔正在整理这组牌的趋势与行动窗口。</p>
              </article>
            ) : null}
          </div>
        </section>

        <section className="sol-input-dock">
          <div className="sol-control-row">
            <div className="sol-control-group">
              <span>主题</span>
              <div className="theme-row">
                {solThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-pill ${selectedThemeId === theme.id ? "active" : ""}`}
                    onClick={() => setSelectedThemeId(theme.id)}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sol-control-group">
              <span>牌阵</span>
              <div className="theme-row">
                {spreadOptions.map((spread) => (
                  <button
                    key={spread.id}
                    type="button"
                    className={`theme-pill ${spreadId === spread.id ? "active" : ""}`}
                    onClick={() => setSpreadId(spread.id)}
                  >
                    {spread.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sol-control-row starter-row">
            {starterQuestions.map((item) => (
              <button
                key={item}
                type="button"
                className="chip-button"
                onClick={() => setQuestion(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="sol-input-panel">
            <textarea
              className="sol-input"
              rows={4}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={`例如：在${activeTheme?.name ?? "这个主题"}上，我现在最需要看清的机会或风险是什么？`}
            />
            <button
              type="button"
              className="primary-button sol-send-button"
              onClick={handleSend}
              disabled={status === "drawing" || status === "reading"}
            >
              {status === "drawing"
                ? "抽牌中..."
                : status === "reading"
                  ? "解读中..."
                  : `发送给索尔 · ${activeSpread.name}`}
            </button>
          </div>

          {error ? <p className="error-text sol-error">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}
