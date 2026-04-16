"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const transitionVideoSrc = "/video/sol.mp4";

export default function SolTransition() {
  const router = useRouter();
  const videoRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  function goToSolReading() {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.push("/reading/sol");
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      goToSolReading();
      return;
    }

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        goToSolReading();
      });
    }
  }, []);

  return (
    <main className="transition-shell">
      <video
        ref={videoRef}
        className="transition-video"
        src={transitionVideoSrc}
        muted
        playsInline
        preload="auto"
        onEnded={goToSolReading}
        onError={goToSolReading}
      />
      <button type="button" className="transition-skip" onClick={goToSolReading}>
        跳过
      </button>
    </main>
  );
}
