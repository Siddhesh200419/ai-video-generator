import Image from "next/image";
import React, { useState } from "react";

export const options = [
  { name: "Realistic", image: "/realistic.jpeg" },
  { name: "Cinematic", image: "/cinematic.jpeg" },
  { name: "Anime", image: "/anime.jpeg" },
  { name: "Cyberpunk", image: "/cyberpunk.jpeg" },
  { name: "GTA", image: "/gta.jpg" },
  { name: "Watercolor", image: "/watercolor.jpg" },
  { name: "cartoon", image: "/cartoon.jpeg" },
];

function VideoStyle({ onHandleInputChange }) {
  const [selectedStyle, setSelectedStyle] = useState();

  return (
    <div className="mt-7">
      <h2 className="text-xl font-bold text-foreground">Video Styles</h2>
      <p className="text-sm text-muted-foreground mb-5">Select the visual style for your video</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {options?.map((option, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
              option.name === selectedStyle 
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]" 
                : "hover:scale-[1.02] hover:ring-2 hover:ring-primary/50 hover:ring-offset-1"
            }`}
            onClick={() => {
              setSelectedStyle(option.name);
              onHandleInputChange("videoStyle", option.name);
            }}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={option.image}
                alt={option.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent">
                <h2 className="text-white font-medium text-center text-sm tracking-wide">
                  {option.name}
                </h2>
              </div>
              
              {/* Selected Indicator Checkmark */}
              {option.name === selectedStyle && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoStyle;
