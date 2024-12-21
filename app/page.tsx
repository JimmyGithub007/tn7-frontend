"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["ABOUT", "TN7 UNIVERSE", "COMMUNITY"];
    const intervals: NodeJS.Timeout[] = [];

    targetMenus.forEach((menu, index) => {
      let currentText = "";
      let iteration = 0;

      const interval = setInterval(() => {
        currentText = menu
          .split("")
          .map((char, i) => (i < iteration ? char : randomCharacters[Math.floor(Math.random() * randomCharacters.length)]))
          .join("");

        setMenuText((prev) => {
          const updated = [...prev];
          updated[index] = currentText;
          return updated;
        });

        if (iteration >= menu.length) {
          clearInterval(interval);
        } else {
          iteration++;
        }
      }, 50);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isOpenMenu]);

  const handleMouseEnter = (index: number, targetText: string) => {
    setHoverState((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });

    let currentText = "";
    let iteration = 0;

    const interval = setInterval(() => {
      currentText = targetText
        .split("")
        .map((char, i) => (i < iteration ? char : randomCharacters[Math.floor(Math.random() * randomCharacters.length)]))
        .join("");

      setMenuText((prev) => {
        const updated = [...prev];
        updated[index] = currentText;
        return updated;
      });

      if (iteration >= targetText.length) {
        clearInterval(interval);
        setHoverState((prev) => {
          const updated = [...prev];
          updated[index] = false;
          return updated;
        });
      } else {
        iteration++;
      }
    }, 50);
  };

  return (
    <AnimatePresence>
      {isOpenMenu && (
        <motion.div
          className="absolute bg-white/20 right-0 h-screen backdrop-blur-md overflow-y-auto w-full md:w-[500px] z-[40]"
          initial={{ translateX: "100%" }}
          animate={{ translateX: "0%" }}
          exit={{ translateX: "100%" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="pt-40 px-12">
            <ul className="text-xl font-bold text-white">
              {["ABOUT", "TN7 UNIVERSE", "COMMUNITY"].map((menu, key) => (
                <li
                  key={key}
                  className={`border-b-2 border-slate-50/30 cursor-pointer duration-300 py-4 ${hoverState[key] ? "text-red-800" : "hover:text-red-800"
                    }`}
                  onMouseEnter={() => handleMouseEnter(key, menu)}
                >
                  {menuText[key] || menu}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

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

  return (<div className="h-screen w-full relative overflow-hidden">
    <div className="flex fixed items-center justify-between navbar px-12 top-0 w-full z-50">
      <Image alt="logo" className="w-32" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} />
      <button onClick={() => setIsOpenMenu(!isOpenMenu)} className="duration-300 relative h-[36px] w-[36px] hover:opacity-80">
        <div className={`absolute bg-white duration-300 h-[4px] w-[36px] left-0 ${isOpenMenu ? "rotate-45 top-[16px]" : "rotate-0 top-[8px]"}`}></div>
        <div className={`absolute bg-white duration-300 h-[4px] left-0 ${isOpenMenu ? "rotate-[135deg] top-[16px] w-[36px] border-2" : "rotate-0 top-[24px] w-[28px]"}`}></div>
      </button>
    </div>
    <Sidebar isOpenMenu={isOpenMenu} />
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