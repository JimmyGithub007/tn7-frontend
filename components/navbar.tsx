"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["ABOUT", "TN7 UNIVERSE", "TN7 LORE", "TN7 MAP"];
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
              {[
                { name: "ABOUT", url: "/" },
                { name: "TN7 UNIVERSE", url: "/universe" },
                { name: "TN7 WORLD LORE", url: "/lore" },
                { name: "TN& WORLD MAP", url: "/unity/map" }
              ].map((menu, key) => (
                <li
                  key={key}
                  className={`border-b-2 border-slate-50/30 cursor-pointer duration-300 py-4 ${hoverState[key] ? "text-red-800" : "hover:text-red-800"
                    }`}
                  onMouseEnter={() => handleMouseEnter(key, menu.name)}
                >
                  <Link href={menu.url}>{menuText[key] || menu.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ setIsOpenMenuParent, isOpenMenuParent }: { setIsOpenMenuParent?: (state: boolean) => void, isOpenMenuParent?:boolean }) => {
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

  return (<>
    <div className="flex fixed items-center justify-between navbar px-12 top-0 w-full z-50">
      <Image alt="logo" className="w-32" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} />
      <button onClick={() => {
        setIsOpenMenu(!isOpenMenu);
        if(setIsOpenMenuParent) setIsOpenMenuParent(!isOpenMenuParent);
      }} className="duration-300 relative h-[36px] w-[36px] hover:opacity-80">
        <div className={`absolute bg-white duration-300 h-[4px] w-[36px] left-0 ${isOpenMenu ? "rotate-45 top-[16px]" : "rotate-0 top-[8px]"}`}></div>
        <div className={`absolute bg-white duration-300 h-[4px] left-0 ${isOpenMenu ? "rotate-[135deg] top-[16px] w-[36px] border-2" : "rotate-0 top-[24px] w-[28px]"}`}></div>
      </button>
    </div>
    <Sidebar isOpenMenu={isOpenMenu} />
  </>)
}

export default Navbar;

