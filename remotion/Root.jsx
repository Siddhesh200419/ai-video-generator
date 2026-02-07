import React from "react";
import { MyComposition } from "./Composition";
import { Composition } from "remotion";
import RemotionComposition from "./../app/_components/RemotionComposition";


export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="youtubeShort"
        component={RemotionComposition}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{
          videoData: {},
        }}
        calculateMetadata={({ props, defaultProps }) => {
          const data = props?.videoData ?? defaultProps?.videoData ?? {};
          const last = Array.isArray(data?.captionJson)
            ? data.captionJson[data.captionJson.length - 1]
            : null;
          const duration =
            last && typeof last.end === "number"
              ? Math.round(last.end * 30)
              : 300;
          return { durationInFrames: duration };
        }}
      />
    </>
  );
};
