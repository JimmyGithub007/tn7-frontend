import React from "react";

const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative text-white font-bold text-6xl md:text-8xl uppercase tracking-wide glitch">
      <span>{text}</span>
      <span className="absolute top-0 left-0 text-slate-100 clip-top animate-glitch-1">{text}</span>
      <span className="absolute top-0 left-0 text-white clip-bottom animate-glitch-2">{text}</span>
    </div>
  );
};

export default GlitchText;