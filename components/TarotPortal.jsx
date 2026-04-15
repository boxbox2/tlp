"use client";

import { useEffect, useRef, useState } from "react";
import { readers } from "@/data/readers";
import { themes } from "@/data/themes";
import { spreadOptions, getThemesForReader } from "@/lib/tarot";

const dailyGuide = {
  title: "今日提示",
  line: "占卜不是替你做决定，而是帮你把心里已经察觉到的部分看得更清楚。"
};

const exampleQuestions = [
  "这段关系接下来还有继续靠近的可能吗？",
  "我适合接受现在这个新的工作机会吗？",
  "最近总觉得很累，我该先调整什么？",
  "我是不是该结束这段反复消耗的相处方式？"
];

const portalNotes = [
  {
    title: "占卜前的小准备",
    body: "先把问题缩成一句话，越具体，牌面给出的指向越清楚。"
  },
  {
    title: "推荐提问方式",
    body: "比起“会不会”，更建议问“我该如何理解这件事的现状与下一步”。"
  },
  {
    title: "结果阅读方式",
    body: "先看趋势，再看建议。塔罗更适合作为自我整理，而不是绝对答案。"
  }
];

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function TarotPortal() {
  const experienceRef = useRef(null);
  const [selectedReaderId, setSelectedReaderId] = useState(readers[0].id);
  const [selectedThemeId, setSelectedThemeId] = useState(readers[0].themeIds[0]);
  const [spreadId, setSpreadId] = useState("triple");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState(null);
  const [recentReading, setRecentReading] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const activeReader = readers.find((reader) => reader.id === selectedReaderId) ?? readers[0];
  const availableThemes = getThemesForReader(selectedReaderId);
  const activeTheme =
    themes.find((theme) => theme.id === selectedThemeId) ?? availableThemes[0] ?? themes[0];
  const activeSpread =
    spreadOptions.find((spread) => spread.id === spreadId) ?? spreadOptions[1];

  useEffect(() => {
    const nextThemes = getThemesForReader(selectedReaderId);
    if (!nextThemes.some((theme) => theme.id === selectedThemeId)) {
      setSelectedThemeId(nextThemes[0]?.id ?? "");
    }
  }, [selectedReaderId, selectedThemeId]);

  useEffect(() => {
    const saved = window.localStorage.getItem("tarot-last-reading");
    if (!saved) {
      return;
    }

    try {
      setRecentReading(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem("tarot-last-reading");
    }
  }, []);

  useEffect(() => {
    if (!reading) {
      return;
    }

    const snapshot = {
      ...reading,
      savedAt: Date.now()
    };
    setRecentReading(snapshot);
    window.localStorage.setItem("tarot-last-reading", JSON.stringify(snapshot));
  }, [reading]);

  function jumpToExperience() {
    experienceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectReader(readerId) {
    setSelectedReaderId(readerId);
    setCards([]);
    setReading(null);
    setError("");
  }

  function useExampleQuestion(text) {
    setQuestion(text);
    jumpToExperience();
  }

  async function handleReading() {
    if (!question.trim()) {
      setError("先写下你现在最想确认的一句话，我们再开始抽牌。");
      jumpToExperience();
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

      await new Promise((resolve) => {
        window.setTimeout(resolve, 1200);
      });

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
          readerId: selectedReaderId,
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
        cards: drawPayload.cards,
        createdAt: Date.now()
      });
      setStatus("ready");
    } catch (fetchError) {
      setStatus("idle");
      setError(fetchError.message || "这次占卜连接有点不稳，请稍后再试。");
    }
  }

  function restoreRecentReading() {
    if (!recentReading) {
      return;
    }

    setSelectedReaderId(recentReading.reader.id);
    setSelectedThemeId(recentReading.theme.id);
    setSpreadId(recentReading.spread.id);
    setQuestion(recentReading.question);
    setCards(recentReading.cards ?? []);
    setReading(recentReading);
    setError("");
    setStatus("ready");
    jumpToExperience();
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">月汐塔罗 · 轻量陪伴感解读</span>
          <h1>把问题交给牌面，也把答案慢慢还给自己。</h1>
          <p>
            先选择一位与你气质贴近的占卜师，再进入他真正擅长的主题范围里提问。
            首版支持单张与三张牌阵，完成后会生成一份中等深度的中文解读。
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={jumpToExperience}>
              开始占卜
            </button>
            <div className="daily-guide">
              <strong>{dailyGuide.title}</strong>
              <span>{dailyGuide.line}</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-card tarot-back" />
          <div className="hero-panel-copy">
            <p>适用场景</p>
            <ul>
              <li>想确认关系里的真实走向</li>
              <li>想看工作与生活选择的节奏</li>
              <li>想用更温和的方式整理情绪</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="portal-grid">
        <article className="portal-card accent-card">
          <h2>占卜入口</h2>
          <p>从占卜师开始，不同的人有不同的语气、视角和主题边界。</p>
          <button className="ghost-button" type="button" onClick={jumpToExperience}>
            去选占卜师
          </button>
        </article>
        <article className="portal-card">
          <h2>常见提问</h2>
          <div className="chip-list">
            {exampleQuestions.slice(0, 3).map((item) => (
              <button
                key={item}
                type="button"
                className="chip-button"
                onClick={() => useExampleQuestion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </article>
        <article className="portal-card">
          <h2>今日引导</h2>
          <div className="note-list">
            {portalNotes.map((note) => (
              <div key={note.title} className="note-item">
                <strong>{note.title}</strong>
                <p>{note.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="reader-showcase">
        <div className="section-heading">
          <span>占卜师</span>
          <h2>四位不同风格的解读者</h2>
        </div>
        <div className="reader-grid">
          {readers.map((reader) => (
            <article key={reader.id} className="reader-card" style={{ "--reader-accent": reader.color }}>
              <div className="reader-badge">{reader.title}</div>
              <h3>{reader.name}</h3>
              <p>{reader.intro}</p>
              <div className="reader-meta">
                <span>擅长主题：{reader.specialties.join(" · ")}</span>
                <span>说话风格：{reader.voice}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="experience-layout" id="experience" ref={experienceRef}>
        <div className="section-heading">
          <span>开始解读</span>
          <h2>先选占卜师，再进入他擅长的主题</h2>
        </div>

        <div className="experience-grid">
          <div className="control-panel">
            <div className="step-card">
              <div className="step-title">
                <span>01</span>
                <h3>选择占卜师</h3>
              </div>
              <div className="option-grid">
                {readers.map((reader) => (
                  <button
                    key={reader.id}
                    type="button"
                    className={`option-card ${selectedReaderId === reader.id ? "active" : ""}`}
                    onClick={() => selectReader(reader.id)}
                  >
                    <strong>{reader.name}</strong>
                    <span>{reader.title}</span>
                    <small>{reader.specialties.join(" · ")}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="step-card">
              <div className="step-title">
                <span>02</span>
                <h3>选择主题</h3>
              </div>
              <p className="step-tip">
                {activeReader.name} 目前只解读这几个方向：
              </p>
              <div className="theme-row">
                {availableThemes.map((theme) => (
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

            <div className="step-card">
              <div className="step-title">
                <span>03</span>
                <h3>写下问题与牌阵</h3>
              </div>
              <div className="spread-grid">
                {spreadOptions.map((spread) => (
                  <button
                    key={spread.id}
                    type="button"
                    className={`spread-card ${spreadId === spread.id ? "active" : ""}`}
                    onClick={() => setSpreadId(spread.id)}
                  >
                    <strong>{spread.name}</strong>
                    <span>{spread.description}</span>
                  </button>
                ))}
              </div>
              <textarea
                className="question-box"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={`例如：${activeTheme?.name || "这个主题"}里，我现在最需要看清的是什么？`}
                rows={5}
              />
              <div className="chip-list">
                {exampleQuestions.map((item) => (
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
              {error ? <p className="error-text">{error}</p> : null}
              <button
                className="primary-button full-width"
                type="button"
                onClick={handleReading}
                disabled={status === "drawing" || status === "reading"}
              >
                {status === "drawing"
                  ? "洗牌中..."
                  : status === "reading"
                    ? "正在解读..."
                    : "抽牌并生成解读"}
              </button>
            </div>
          </div>

          <div className="result-panel">
            <div className="result-stage">
              <div className="result-head">
                <div>
                  <span className="mini-label">当前会话</span>
                  <h3>{activeReader.name} · {activeTheme?.name}</h3>
                </div>
                <span className="status-tag">{activeSpread.name}</span>
              </div>

              {status === "drawing" ? (
                <div className="shuffle-area">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="shuffle-card tarot-back" />
                  ))}
                  <p>正在洗牌，让问题慢慢沉到底部。</p>
                </div>
              ) : cards.length > 0 ? (
                <div className={`card-row ${cards.length === 1 ? "single" : ""}`}>
                  {cards.map((card) => (
                    <article key={card.id} className="drawn-card">
                      <div className="drawn-card-face">
                        <span>{card.position}</span>
                        <strong>{card.name}</strong>
                        <small>{card.orientation === "upright" ? "正位" : "逆位"}</small>
                      </div>
                      <p>{card.keywords.join(" · ")}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-stage">
                  <div className="hero-card tarot-back small" />
                  <p>问题准备好后，我们会在这里展开牌面与解读。</p>
                </div>
              )}
            </div>

            {status === "reading" ? (
              <article className="reading-card">
                <h3>正在组织解读</h3>
                <p>牌面已经落下，正在把它们整理成一份更具体的中文回应。</p>
              </article>
            ) : null}

            {reading ? (
              <article className="reading-card">
                <div className="reading-topline">
                  <div>
                    <span className="mini-label">问题</span>
                    <h3>{reading.question}</h3>
                  </div>
                  <span className="source-tag">
                    {reading.source === "ai" ? "AI 解读" : "基础牌义解读"}
                  </span>
                </div>
                {reading.fallbackReason ? (
                  <p className="soft-note">
                    这次先使用了基础牌义模板解读；等模型环境变量配置好后，这里会自动切换为在线生成版本。
                  </p>
                ) : null}
                <section className="reading-section">
                  <h4>问题回应</h4>
                  <p>{reading.sections.opening}</p>
                </section>
                <section className="reading-section">
                  <h4>逐张解读</h4>
                  <div className="reading-stack">
                    {reading.sections.cardReadings.map((item) => (
                      <article key={item.title} className="reading-item">
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="reading-section">
                  <h4>综合趋势</h4>
                  <p>{reading.sections.trend}</p>
                </section>
                <section className="reading-section">
                  <h4>可执行建议</h4>
                  <ul className="reading-list">
                    {reading.sections.advice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="reading-section">
                  <h4>温和提醒</h4>
                  <p>{reading.sections.reminder}</p>
                </section>
              </article>
            ) : recentReading ? (
              <article className="reading-card muted">
                <div className="reading-topline">
                  <div>
                    <span className="mini-label">最近一次解读</span>
                    <h3>{recentReading.question}</h3>
                  </div>
                  <span className="status-tag">{formatTime(recentReading.savedAt)}</span>
                </div>
                <p>
                  上一次你找的是 {recentReading.reader.name}，主题是 {recentReading.theme.name}。
                </p>
                <button className="ghost-button" type="button" onClick={restoreRecentReading}>
                  恢复这次结果
                </button>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
