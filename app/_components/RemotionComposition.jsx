import React, { useEffect } from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  spring,
  Audio,
} from "remotion";

function RemotionComposition({ videoData, setDurationInFrame }) {
  const captions = videoData?.captionJson;
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const imageList = videoData?.images;
  const style = videoData?.caption?.style;

  useEffect(() => {
    if (captions && captions.length > 0 && fps) {
      const totalDuration = captions[captions.length - 1]?.end * fps;
      setDurationInFrame(totalDuration);
    }
  }, [captions, fps, setDurationInFrame]);

  if (!Array.isArray(imageList) || imageList.length === 0) {
    return <div>Loading...</div>;
  }

  const totalDuration = captions?.[captions.length - 1]?.end * fps || 0;
  const framePerImage = totalDuration / imageList.length;

  // Increase overlap to ensure no black frames appear
  const overlap = Math.ceil(framePerImage * 0.5); // 50% overlap for smoother transitions

  const getCurrentCaption = () => {
    const currentTime = frame / fps;
    const currentCaption = captions?.find(
      (item) => currentTime >= item?.start && currentTime <= item?.end
    );
    return currentCaption ? currentCaption?.word : "";
  };
  return (
    <div>
      <AbsoluteFill style={{ backgroundColor: "black" }}>
        {imageList.map((item, index) => {
          const startTime = Math.floor(index * framePerImage) - overlap;
          const endTime = Math.ceil((index + 1) * framePerImage) + overlap;
          const adjustedStartTime = startTime < 0 ? 0 : startTime;
          const duration = endTime - adjustedStartTime;

          // For calculating animations
          const relativeFrame = frame - adjustedStartTime;

          // Calculate opacity for crossfade effect
          let opacity = 1;
          if (index > 0) {
            // Fade in at the start of this image's sequence
            opacity = interpolate(relativeFrame, [0, overlap], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          }

          if (index < imageList.length - 1) {
            // Fade out at the end of this image's sequence
            const fadeOutStart = duration - overlap;
            if (relativeFrame > fadeOutStart) {
              opacity = interpolate(
                relativeFrame,
                [fadeOutStart, duration],
                [1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
            }
          }

          // Smoother scale animation using spring
          const scale = spring({
            frame: relativeFrame,
            fps,
            config: {
              damping: 200,
              mass: 0.5,
              stiffness: 200,
            },
            durationInFrames: duration,
            from: index % 2 === 0 ? 1 : 1.1,
            to: index % 2 === 0 ? 1.1 : 1,
          });

          return (
            <Sequence
              key={index}
              from={adjustedStartTime}
              durationInFrames={duration}
            >
              <AbsoluteFill>
                <Img
                  src={item}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          color: "#FFA500", // warm orange-yellow like in your screenshot
          justifyContent: "center",
          textAlign: "center",
          fontSize: "48px", // BIGGER captions for better readability
          fontWeight: "700", // bold for strong presence
          textShadow: "2px 2px 8px rgba(0,0,0,0.7)", // soft shadow for contrast on any bg
          position: "absolute",
          bottom: "10%", // slightly above bottom
          width: "100%", // center perfectly
        }}
      >
        <h2 className={style}>{getCurrentCaption()}</h2>
      </AbsoluteFill>
      {videoData?.audioUrl && <Audio src={videoData?.audioUrl} />}
    </div>
  );
}

export default RemotionComposition;
