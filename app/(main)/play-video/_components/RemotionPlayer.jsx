"use client";
import React, { useState } from "react";
import { Player } from "@remotion/player";
import RemotionComposition from "@/app/_components/RemotionComposition";

function RemotionPlayer({ videoData }) {
  const [durationInFrames, setDurationInFrame] = useState(300);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="shadow-lg rounded-xl bg-foreground relative w-full max-w-[400px] md:max-w-none md:w-[25vw] aspect-[9/16] overflow-hidden border border-border">
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
      <div className="text-muted-foreground text-xs">9:16 preview</div>
    </div>
  );
}

export default RemotionPlayer;
