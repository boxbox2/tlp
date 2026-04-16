"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getReaderById } from "@/lib/tarot";
import { getReaderScene } from "@/data/readerScenes";

export default function SolTransition({ readerId = "sol" }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const reader = getReaderById(readerId);
  const scene = getReaderScene(readerId);

  function goToReading() {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.push(`/reading/${readerId}`);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !scene?.transitionVideoSrc) {
      goToReading();
      return;
    }

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        goToReading();
      });
    }
  }, [scene?.transitionVideoSrc]);

  return (
    <main className="transition-shell">
      <video
        ref={videoRef}
        className="transition-video"
        src={scene?.transitionVideoSrc}
        muted
        playsInline
        preload="auto"
        onEnded={goToReading}
        onError={goToReading}
      />
      <button type="button" className="transition-skip" onClick={goToReading}>
        跳过 {reader.name} 的过场
      </button>
    </main>
  );
}
