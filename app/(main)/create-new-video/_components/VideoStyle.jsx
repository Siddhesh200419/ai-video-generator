import Image from "next/image";
import React, { useState } from "react";
import {
  Box,
  Camera,
  Cpu,
  Film,
  MessageSquare,
  Moon,
  Paintbrush,
  Sparkles,
} from "lucide-react";

export const options = [
  { name: "Realistic", image: "/realistic.jpeg", icon: Camera },
  { name: "Cinematic", image: "/cinematic.jpeg", icon: Film },
  { name: "Anime", image: "/anime.jpeg", icon: Sparkles },
  { name: "Cyberpunk", image: "/cyberpunk.jpeg", icon: Cpu },
  { name: "GTA", image: "/gta.jpg", icon: MessageSquare },
  { name: "Watercolor", image: "/watercolor.jpg", icon: Paintbrush },
  { name: "cartoon", image: "/cartoon.jpeg", icon: Box },
];

function VideoStyle({ onHandleInputChange }) {
  const [selectedStyle, setSelectedStyle] = useState();

  return (
    <div className="mt-4">
      <h2 className="font-semibold text-2xl tracking-tight !mb-0">
        Choose the world your idea lives in.
      </h2>
      <p className="text-sm text-muted-foreground mb-5 !mt-2">
        Select the visual style for your video
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {options?.map((option, index) => {
          const IconComp = option.icon;
          return (
            <button
              key={index}
              className={`text-left rounded-lg bg-card p-3 transition-all duration-300 border ${
                option.name === selectedStyle
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
                  : "border-border/50 hover:border-primary/50 hover:scale-[1.02]"
              }`}
              onClick={() => {
                setSelectedStyle(option.name);
                onHandleInputChange("videoStyle", option.name);
              }}
            >
              <div className="rounded-md overflow-hidden relative mb-3 h-24">
                <Image
                  src={option.image}
                  alt={option.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <IconComp className="text-white size-8 drop-shadow-md" />
                </div>
                {option.name === selectedStyle && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="font-medium text-sm">{option.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VideoStyle;
