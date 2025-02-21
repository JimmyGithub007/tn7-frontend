"use client";

import { Header } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = clientX - window.innerWidth / 2;
      const y = clientY - window.innerHeight / 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return redirect('/home');

  return (<div className="h-screen w-full relative overflow-hidden">
    <Header />
    <motion.img
      style={{
        transform: `translateX(${mousePosition.x * 0.01}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="background"
      width={3840}
      height={2160}
      src={`/assets/images/645825eaa3a38d2dc94b1601_BG.jpg`}
      className={`absolute inset-0 h-full w-full object-cover`}
    />
    <motion.img
      style={{
        transform: `translateX(${-mousePosition.x * 0.02}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="train"
      width={3840}
      height={2160}
      src={`/assets/images/645825eaa3a38dff924b161c_Train.png`}
      className={`absolute inset-0 h-full w-full object-cover`}
    />
    <motion.img
      style={{
        transform: `translateX(${mousePosition.x * 0.05}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="hero1"
      width={2600}
      height={1463}
      src={`/assets/images/645825eaa3a38d227a4b164b_Bill-p-2600.png`}
      className={`absolute inset-0 h-full w-full object-cover`}
    />
    <motion.img
      style={{
        transform: `translateX(${mousePosition.x * 0.07}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="hero2"
      width={3840}
      height={2160}
      src={`/assets/images/645825eaa3a38d46674b164e_Flynn.png`}
      className={`absolute inset-0 h-full w-full object-cover`}
    />
    <motion.img
      style={{
        transform: `translateX(${mousePosition.x * 0.08}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="hero3"
      width={3840}
      height={2160}
      src={`/assets/images/645825eaa3a38d8ab84b164c_Gin.png`}
      className={`absolute inset-0 h-full w-full object-cover z-10`}
    />
    <motion.img
      style={{
        transform: `translateX(${mousePosition.x * 0.05}px) scale(1.05)`,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      alt="hero4"
      width={3840}
      height={2160}
      src={`/assets/images/645825eaa3a38d3d0d4b164d_Deer.png`}
      className={`absolute inset-0 h-full w-full object-cover`}
    />
  </div>)
}

export default Home;