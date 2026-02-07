"use client";
import React, { useState } from "react";
import { Player } from "@remotion/player";
import RemotionComposition from "@/app/_components/RemotionComposition";
import { useVideoConfig } from "remotion";

function RemotionPlayer({ videoData }) {
  const [durationInFrames, setDurationInFrame] = useState(300);
  return (
    <div className="w-full max-w-[400px] mx-auto md:max-w-none md:w-[25vw] aspect-[9/16] relative rounded-xl overflow-hidden shadow-lg border border-border">
      <Player
        component={RemotionComposition}
        durationInFrames={Number(durationInFrames.toFixed(0))}
        compositionWidth={720}
        compositionHeight={1280}
        fps={30}
        controls
        style={{
          width: "100%",
          height: "100%",
        }}
        inputProps={{
          videoData: videoData,
          setDurationInFrame: (frameValue) => setDurationInFrame(frameValue),
        }}
      />
    </div>
  );
}

export default RemotionPlayer;
