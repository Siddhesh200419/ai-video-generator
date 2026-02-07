import React, { useState } from "react";

export const options = [
  {
    name: "Youtuber",
    style: "text-yellow-400 text-3xl font-extrabold uppercase tracking-wide",
  },
  {
    name: "Superme",
    style: "text-white text-3xl font-bold italic drop-shadow-lg tracking-wide",
  },
  {
    name: "Neon",
    style:
      "text-green-500 text-3xl font-extrabold uppercase tracking-wide border-2 border-green-300",
  },
  {
    name: "Glitch",
    style:
      "text-pink-500 text-3xl font-extrabold uppercase tracking-wide animate-pulse",
  },
  {
    name: "Fire",
    style:
      "text-red-500 text-3xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-400 to-red-600",
  },
  {
    name: "Minimalist",
    style: "text-gray-800 text-2xl font-light tracking-tight",
  },
  {
    name: "Retro",
    style: "text-amber-500 text-3xl font-bold tracking-tight font-mono",
  },
  {
    name: "Gaming",
    style:
      "text-purple-600 text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent",
  },
  {
    name: "Elegant",
    style: "text-gray-200 text-2xl font-serif italic tracking-wide",
  },
  {
    name: "Tech",
    style: "text-cyan-400 text-2xl font-mono uppercase tracking-widest",
  },

  {
    name: "Luxury",
    style:
      "text-yellow-500 text-4xl font-bold uppercase tracking-tighter drop-shadow-2xl",
  },
  {
    name: "Modern",
    style:
      "text-white text-3xl font-sans uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600",
  },
  {
    name: "Classic",
    style: "text-gray-700 text-3xl font-serif italic tracking-normal",
  },
  {
    name: "Futuristic",
    style:
      "text-blue-400 text-3xl font-extrabold uppercase tracking-tight animate-pulse",
  },
  {
    name: "Vibrant",
    style:
      "text-rose-500 text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-yellow-300 to-red-500 bg-clip-text text-transparent",
  },
];

function Captions({ onHandleInputChange }) {
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState();
  return (
    <div className="mt-5">
      <h2>Caption Style</h2>
      <p className="text-sm text-gray-400">Select Caption Style</p>

      <div className="flex flex-wrap gap-4 mt-2">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={()=>{
                setSelectedCaptionStyle(option.name)
                onHandleInputChange('caption',option)
            }}
            className={`p-2 hover:border bg-slate-900 border-gray-300 cursor-pointer rounded-lg ${selectedCaptionStyle == option.name && 'border'}`}
          >
            <h2 className={option.style}>{option.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Captions;
