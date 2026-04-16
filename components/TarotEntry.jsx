"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import firstScene from "@/png/first.png";

const secondVideoSrc = "/video/second.mp4";

const solButtonArea = {
  left: "56%",
  top: "72%",
  width: "13.5%",
  height: "10.5%"
};

export default function TarotEntry() {
  const router = useRouter();
  const [scene, setScene] = useState("first");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSolHovered, setIsSolHovered] = useState(false);

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

  function handleSolSelect() {
    router.push("/transition/sol");
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
            <button
              type="button"
              className={`sol-choice-button ${isSolHovered ? "hovered" : ""}`}
              style={solButtonArea}
              onMouseEnter={() => setIsSolHovered(true)}
              onMouseLeave={() => setIsSolHovered(false)}
              onFocus={() => setIsSolHovered(true)}
              onBlur={() => setIsSolHovered(false)}
              onClick={handleSolSelect}
              aria-label="选择索尔的指引"
            >
              <span className="sol-choice-glow" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
