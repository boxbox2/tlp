"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import firstScene from "@/png/first.png";
import { readers } from "@/data/readers";
import { getReaderScene } from "@/data/readerScenes";

const secondVideoSrc = "/video/second.mp4";

const selectableReaders = readers
  .map((reader) => ({
    ...reader,
    scene: getReaderScene(reader.id)
  }))
  .filter((reader) => reader.scene);

export default function TarotEntry() {
  const router = useRouter();
  const [scene, setScene] = useState("first");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredReaderId, setHoveredReaderId] = useState("");

  function goToSecondScene() {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    window.setTimeout(() => {
      setScene("second");
      setIsTransitioning(false);
    }, 420);
  }

  function handleReaderSelect(readerId) {
    router.push(`/transition/${readerId}`);
  }

  return (
    <main className="entry-shell">
      <section
        className={`entry-stage ${scene === "second" ? "second" : "first"} ${
          isTransitioning ? "transitioning" : ""
        }`}
      >
        <div className={`scene-panel ${scene === "first" ? "active" : ""}`}>
          <Image
            src={firstScene}
            alt="塔罗入口场景"
            fill
            priority
            sizes="100vw"
            className="scene-image"
          />
          <div className="scene-overlay first-overlay">
            <div className="gear-ring gear-ring-left" aria-hidden="true" />
            <div className="gear-ring gear-ring-right" aria-hidden="true" />
            <button
              type="button"
              className="crystal-trigger"
              aria-label="进入占卜师选择界面"
              onClick={goToSecondScene}
            >
              <span className="crystal-core" />
              <span className="crystal-hint">触碰水晶球，进入指引</span>
            </button>
          </div>
        </div>

        <div className={`scene-panel ${scene === "second" ? "active" : ""}`}>
          <video
            className="scene-video active-scene-video"
            src={secondVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="scene-overlay second-overlay second-video-overlay">
            {selectableReaders.map((reader) => (
              <button
                key={reader.id}
                type="button"
                className={`sol-choice-button ${hoveredReaderId === reader.id ? "hovered" : ""}`}
                style={reader.scene.buttonArea}
                onMouseEnter={() => setHoveredReaderId(reader.id)}
                onMouseLeave={() => setHoveredReaderId("")}
                onFocus={() => setHoveredReaderId(reader.id)}
                onBlur={() => setHoveredReaderId("")}
                onClick={() => handleReaderSelect(reader.id)}
                aria-label={`选择${reader.name}的指引`}
              >
                <span className="sol-choice-glow" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
