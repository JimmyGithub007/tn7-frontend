import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const GlitchText = ({ text, fontSize = "text-6xl" }: { text: string, fontSize?: string }) => {
  return (<AnimatePresence>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative text-white font-bold ${fontSize} uppercase tracking-wide glitch`}>
      <span>{text}</span>
      <span className="absolute top-0 left-0 text-slate-100 clip-top animate-glitch-1">{text}</span>
      <span className="absolute top-0 left-0 text-white clip-bottom animate-glitch-2">{text}</span>
    </motion.div>
  </AnimatePresence>
  );
};

export default GlitchText;