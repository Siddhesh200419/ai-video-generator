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
    <div className="mt-5">
      <h2>Video Styles</h2>
      <p className="text-sm text-gray-400 mb-1">Select video style</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {options?.map((option, index) => (
          <div
            key={index}
            className="relative"
            onClick={() => {
              setSelectedStyle(option.name);
              onHandleInputChange("videoStyle", option.name);
            }}
          >
            <Image
              src={option.image}
              alt={option.name}
              width={500}
              height={120}
              className={`object-cover h-[90px] lg:h-[130px] xl:h-[180px] rounded-lg p-1 hover:border border-gray-300 cursor-pointer ${
                option.name === selectedStyle ? "border-2 border-blue-500" : ""
              }`}
            />
            <h2 className="absolute bottom-1 text-center w-full text-white bg-black/50 text-sm rounded-b-lg">
              {option.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoStyle;
