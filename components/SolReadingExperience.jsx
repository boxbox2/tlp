"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getReaderScene } from "@/data/readerScenes";
import { getReaderById, getThemesForReader, spreadOptions } from "@/lib/tarot";

const starterQuestionsByReader = {
  luna: [
    "这段关系接下来还有继续靠近的可能吗？",
    "我现在该主动表达心意，还是先退一步观察？",
    "这段人际关系里，最需要被说清楚的是什么？"
  ],
  iris: [
    "我现在最需要先照顾哪一部分状态？",
    "我最近反复疲惫的根源更像是压力还是节奏失衡？",
    "在生活选择上，我应该先稳住什么？"
  ],
  sol: [
    "我应该接受眼前这个新机会吗？",
    "这份工作会是长期正确的方向吗？",
    "我最近的财运重点应该放在哪一类选择上？"
  ],
  orion: [
    "未来一年里，我最值得把握的运势重点会落在哪个阶段？",
    "我现在正站在人生哪一个转折点上？",
    "如果要进入新的阶段，我最该先放下的旧模式是什么？"
  ]
};

const PHASE_IDLE = "idle";
const PHASE_DRAWING = "drawing";
const PHASE_REVEALING = "revealing";
const PHASE_READY = "ready";

function getStatusCopy(readerName, phase, readingReady) {
  if (phase === PHASE_DRAWING) {
    return `${readerName} 正在洗牌，让问题和牌面慢慢对齐。`;
  }

  if (phase === PHASE_REVEALING && !readingReady) {
    return `牌面已经展开，${readerName} 正在整理这组牌的走势与重点。`;
  }

  if (phase === PHASE_REVEALING && readingReady) {
    return "牌意已经就位，完整结论马上就会浮出来。";
  }

  return "";
}

export default function SolReadingExperience({ readerId = "sol" }) {
  const reader = getReaderById(readerId);
  const scene = getReaderScene(readerId);
  const readerThemes = useMemo(() => getThemesForReader(readerId), [readerId]);
  const starterQuestions = useMemo(
    () => starterQuestionsByReader[readerId] ?? starterQuestionsByReader.sol,
    [readerId]
  );

  const [selectedThemeId, setSelectedThemeId] = useState(readerThemes[0]?.id ?? "");
  const [spreadId, setSpreadId] = useState("triple");
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState(null);
  const [phase, setPhase] = useState(PHASE_IDLE);
  const [revealedCount, setRevealedCount] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    setSelectedThemeId(readerThemes[0]?.id ?? "");
  }, [readerId, readerThemes]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    },
    []
  );

  useEffect(() => {
    if (!animationDone || !readingDone || !reading) {
      return;
    }

    setPhase(PHASE_READY);
  }, [animationDone, reading, readingDone]);

  const activeTheme =
    readerThemes.find((theme) => theme.id === selectedThemeId) ?? readerThemes[0];
  const activeSpread =
    spreadOptions.find((spread) => spread.id === spreadId) ?? spreadOptions[1];
  const statusCopy = getStatusCopy(reader.name, phase, readingDone);
  const readingSections = reading?.sections ?? {};
  const readerReply = readingSections.readerMessage ?? readingSections.opening;

  const cardSlots = useMemo(() => {
    if (cards.length > 0) {
      return cards;
    }

    return Array.from({ length: activeSpread.count }, (_, index) => ({
      id: `placeholder-${index}`
    }));
  }, [activeSpread.count, cards]);

  function schedule(callback, delay) {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  }

  function clearTimers() {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }

  function resetConversation({ keepQuestion = false } = {}) {
    clearTimers();
    setPhase(PHASE_IDLE);
    setCards([]);
    setReading(null);
    setSubmittedQuestion("");
    setRevealedCount(0);
    setAnimationDone(false);
    setReadingDone(false);
    setError("");
    setIsSubmitting(false);

    if (!keepQuestion) {
      setQuestion("");
    }
  }

  function startRevealTimeline(nextCards) {
    clearTimers();
    setRevealedCount(0);
    setAnimationDone(false);

    if (nextCards.length === 1) {
      schedule(() => setPhase(PHASE_REVEALING), 320);
      schedule(() => setRevealedCount(1), 860);
      schedule(() => setAnimationDone(true), 1180);
      return;
    }

    schedule(() => setPhase(PHASE_REVEALING), 460);
    schedule(() => setRevealedCount(1), 980);
    schedule(() => setRevealedCount(2), 1280);
    schedule(() => setRevealedCount(3), 1580);
    schedule(() => setAnimationDone(true), 1880);
  }

  async function handleSend() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError("先把你想确认的问题写下来，我再替你展开牌面。");
      return;
    }

    resetConversation({ keepQuestion: true });
    setSubmittedQuestion(trimmedQuestion);
    setPhase(PHASE_DRAWING);
    setIsSubmitting(true);

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

      const nextCards = drawPayload.cards ?? [];
      setCards(nextCards);
      startRevealTimeline(nextCards);

      const readingResponse = await fetch("/api/reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          themeId: selectedThemeId,
          readerId,
          spreadId,
          cards: nextCards
        })
      });
      const readingPayload = await readingResponse.json();

      if (!readingResponse.ok) {
        throw new Error(readingPayload.error || "解读生成失败，请稍后再试。");
      }

      setReading({
        ...readingPayload,
        question: trimmedQuestion,
        cards: nextCards
      });
      setReadingDone(true);
      setIsSubmitting(false);
    } catch (fetchError) {
      resetConversation({ keepQuestion: true });
      setError(fetchError.message || "这次连接有点不稳，请稍后再试。");
    }
  }

  return (
    <main className="sol-reading-shell">
      <Image
        src={scene?.readingBackgroundSrc || "/png/soul_place.png"}
        alt={`${reader.name} 专属占卜场景`}
        fill
        priority
        sizes="100vw"
        className="sol-reading-bg"
      />

      <div className="sol-reading-overlay">
        <header className="sol-reading-header compact">
          <div className="sol-header-copy compact">
            <span className="sol-badge">
              {reader.name} · {reader.title}
            </span>
            <h1>{reader.specialties.join(" / ")}</h1>
            <p>{reader.intro}</p>
          </div>
          <Link href="/" className="ghost-button sol-back-link">
            返回入口
          </Link>
        </header>

        <section className="sol-reading-layout">
          <section className="sol-stage-panel">
            <div className="sol-stage-topline left">
              <span className="sol-stage-chip">{activeTheme?.name}</span>
              <span className="sol-stage-chip">{activeSpread.name}</span>
              <span className="sol-stage-chip">由 {reader.name} 解读</span>
            </div>

            {phase !== PHASE_IDLE ? (
              <article className="sol-question-banner compact">
                <span className="sol-bubble-label">你的问题</span>
                <p>{submittedQuestion}</p>
              </article>
            ) : (
              <article className="sol-intro-panel compact">
                <span className="sol-bubble-label">开始之前</span>
                <p>
                  把问题缩成一句话。越具体，牌面给出的方向就越清楚，也更容易帮助你看见接下来的一步。
                </p>
              </article>
            )}

            <div className={`sol-deck-stack ${phase !== PHASE_READY ? "visible" : ""}`}>
              <span className="sol-deck-card sol-deck-card-one" />
              <span className="sol-deck-card sol-deck-card-two" />
              <span className="sol-deck-card sol-deck-card-three" />
            </div>

            <div className={`sol-card-spread compact ${activeSpread.count === 1 ? "single" : "triple"}`}>
              {cardSlots.map((card, index) => {
                const nextCard = cards[index];
                const revealed = Boolean(nextCard) && index < revealedCount;
                const dealt = Boolean(nextCard);
                const cardReading = readingSections.cardReadings?.[index];
                const cardCopy =
                  nextCard && activeTheme
                    ? `${nextCard.summary}${nextCard.themeLine?.[activeTheme.id] ?? ""}`
                    : "牌位会在翻面后逐一亮起。";

                return (
                  <article
                    key={card.id}
                    className={`sol-card-frame ${dealt ? "dealt" : ""} ${revealed ? "revealed" : ""}`}
                    style={{ "--card-index": index }}
                  >
                    <div className="sol-card-face-card">
                      <div className="sol-card-face sol-card-back">
                        <div className="sol-card-back-core" />
                      </div>

                      <div className="sol-card-face sol-card-front">
                        {nextCard ? (
                          <>
                            <div className="sol-card-image-wrap">
                              <Image
                                src={nextCard.imageSrc}
                                alt={nextCard.name}
                                width={360}
                                height={640}
                                className="sol-card-image"
                              />
                            </div>
                            <div className="sol-card-meta">
                              <span>{nextCard.position}</span>
                              <strong>{nextCard.name}</strong>
                              <small>{nextCard.orientation === "upright" ? "正位" : "逆位"}</small>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="sol-card-caption">
                      {nextCard ? (
                        <>
                          <div className="sol-card-caption-head">
                            <strong>{nextCard.position}</strong>
                            <span>{nextCard.orientation === "upright" ? "正位提示" : "逆位提示"}</span>
                          </div>
                          <div className="sol-card-keywords">
                            {nextCard.keywords?.slice(0, 3).map((keyword) => (
                              <span key={keyword} className="sol-keyword-pill">
                                {keyword}
                              </span>
                            ))}
                          </div>
                          <p>{cardCopy}</p>
                        </>
                      ) : (
                        <p>牌位会在翻面后逐一亮起。</p>
                      )}
                    </div>

                    {cardReading ? (
                      <div className="sol-card-echo">
                        <span className="sol-card-echo-label">角色视角</span>
                        <p>{cardReading.body}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {statusCopy ? (
              <article className="sol-status-banner compact">
                <span className="sol-bubble-label">抽牌进程</span>
                <p>{statusCopy}</p>
              </article>
            ) : null}
          </section>

          <aside className="sol-side-panel">
            {phase === PHASE_IDLE ? (
              <div className="sol-control-card">
                <div className="sol-control-card-head">
                  <span className="sol-bubble-label">本次引导</span>
                  <h2>{reader.name} 会从牌面里为你拆出重点</h2>
                  <p>
                    先选主题与牌阵，再把问题说清楚。问题越准确，翻出来的结论就越像一份可执行的提示，而不是空泛安慰。
                  </p>
                </div>

                <div className="sol-control-group">
                  <span>主题</span>
                  <div className="theme-row">
                    {readerThemes.map((theme) => (
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

                <div className="sol-control-group">
                  <span>灵感提问</span>
                  <div className="sol-starter-list">
                    {starterQuestions.map((item) => (
                      <button key={item} type="button" className="chip-button" onClick={() => setQuestion(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sol-control-group">
                  <span>输入问题</span>
                  <textarea
                    className="sol-input compact"
                    rows={5}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={`例如：在${activeTheme?.name ?? "这个主题"}里，我现在最需要看清的机会或风险是什么？`}
                  />
                </div>

                {error ? <p className="error-text sol-error">{error}</p> : null}

                <button
                  type="button"
                  className="primary-button sol-send-button compact"
                  onClick={handleSend}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "牌面展开中..." : `发送给 ${reader.name}`}
                </button>
              </div>
            ) : (
              <div className="sol-result-card">
                <div className="sol-conversation-panel">
                  <article className="sol-message user">
                    <span className="sol-message-label">你的提问</span>
                    <p>{submittedQuestion}</p>
                  </article>
                  <article className="sol-message reader">
                    <span className="sol-message-label">{reader.name} 的回话</span>
                    <p>{readerReply ?? "角色正在把牌面和你的问题重新组织成更清楚的话语。"}</p>
                  </article>
                </div>

                <div className="sol-result-block hero">
                  <span className="sol-bubble-label">整体判断</span>
                  <h2>{reader.name} 看到的关键落点</h2>
                  <p>{readingSections.opening ?? "牌面正在成形，结论会在翻牌完成后完整出现。"}</p>
                </div>

                <div className="sol-result-grid">
                  <article className="sol-reading-item compact">
                    <strong>综合趋势</strong>
                    <p>{readingSections.trend ?? "先看整体走势，再决定要不要立刻行动。"}</p>
                  </article>
                  <article className="sol-reading-item compact">
                    <strong>提醒</strong>
                    <p>{readingSections.reminder ?? "先把结论看完，再决定下一步。"} </p>
                  </article>
                </div>

                <article className="sol-advice-panel compact">
                  <div className="sol-advice-head">
                    <strong>行动建议</strong>
                    <span>先做最容易落地的一步，把牌意变成现实里的动作。</span>
                  </div>
                  <div className="sol-advice-stack">
                    {(readingSections.advice ?? []).map((item, index) => (
                      <article key={item} className="sol-advice-row">
                        <span className="sol-advice-index">0{index + 1}</span>
                        <p>{item}</p>
                      </article>
                    ))}
                  </div>
                </article>

                <div className="sol-result-actions vertical">
                  <button type="button" className="primary-button" onClick={() => resetConversation()}>
                    重新对话
                  </button>
                  <Link href="/" className="ghost-button">
                    返回入口
                  </Link>
                </div>

                {phase !== PHASE_IDLE && error ? <p className="error-text sol-error">{error}</p> : null}
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
