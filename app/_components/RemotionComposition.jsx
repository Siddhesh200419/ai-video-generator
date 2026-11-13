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

  useEffect(() => {
    if (captions && captions.length > 0 && fps && typeof setDurationInFrame === "function") {
      const totalDuration = captions[captions.length - 1]?.end * fps;
      setDurationInFrame(totalDuration);
    }
  }, [captions, fps, setDurationInFrame]);

  if (!Array.isArray(imageList) || imageList.length === 0) {
    return <div>Loading...</div>;
  }

  const totalDuration = captions?.[captions.length - 1]?.end * fps || 0;
  const framePerImage = totalDuration / imageList.length;

  // Caption styling — driven by the user's selections (position, font, color).
  // NOTE: Tailwind classes passed via `caption.style` do NOT apply inside the
  // Remotion render because no CSS is imported in the Remotion bundle. So we
  // honour the user choices with inline styles, which always render.
  const captionConfig = videoData?.caption || {};
  const captionPosition = captionConfig.position || "bottom";
  const captionColor = captionConfig.color || "#FFA500";
  const captionFont = captionConfig.font
    ? `${captionConfig.font}, Inter, system-ui, sans-serif`
    : "Inter, system-ui, sans-serif";

  // Map the chosen position to vertical placement inside the 9:16 frame.
  const captionContainerStyle =
    captionPosition === "top"
      ? { justifyContent: "flex-start", paddingTop: "12%" }
      : captionPosition === "middle"
      ? { justifyContent: "center" }
      : { justifyContent: "flex-end", paddingBottom: "12%" };

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
          ...captionContainerStyle,
          alignItems: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: captionColor,
            fontFamily: captionFont,
            fontSize: "48px",
            fontWeight: "700",
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
            margin: 0,
            maxWidth: "90%",
            lineHeight: 1.1,
          }}
        >
          {getCurrentCaption()}
        </h2>
      </AbsoluteFill>
      {videoData?.audioUrl && <Audio src={videoData?.audioUrl} />}
    </div>
  );
}

export default RemotionComposition;
