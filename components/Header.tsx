"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const pathname = usePathname()
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["TN7 UNIVERSE", "TN7 LORE", "TN7 WORLD MAP", "FAQS"];
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

  useEffect(() => {
    if (isOpenMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
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
          className="fixed bg-white/20 right-0 h-screen backdrop-blur-md overflow-y-auto w-full md:w-[500px] z-[40]"
          initial={{ translateX: "100%" }}
          animate={{ translateX: "0%" }}
          exit={{ translateX: "100%" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="flex flex-col gap-8 pt-40 px-12">
            <ul className="text-xl font-bold text-white">
              {[
                { name: "TN7 UNIVERSE", url: "/universe" },
                { name: "TN7 LORE", url: "/lore" },
                { name: "TN7 WORLD MAP", url: "/worldmap" },
                { name: "FAQS", url: "/faqs" }
              ].map((menu, key) => (
                <Link key={key} href={menu.url}>
                  <li
                    className={`border-b-2 border-slate-50/30 duration-300 py-4 ${pathname.includes(menu.url) || hoverState[key] ? "text-red-800" : "hover:text-red-800"}`}
                    onMouseEnter={() => handleMouseEnter(key, menu.name)}
                  >
                    {menuText[key] || menu.name}
                  </li>
                </Link>
              ))}
            </ul>
            <div className="flex flex-col text-xs font-light text-slate-900">
              <div>TERMS & CONDITIONS</div>
              <div>PRIVACY POLICY</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ setIsOpenMenuParent, isOpenMenuParent }: { setIsOpenMenuParent?: (state: boolean) => void, isOpenMenuParent?: boolean }) => {
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

  return (<>
    <Link href={`/home`}><Image alt="logo" className="fixed left-8 top-0 w-32 z-[100]" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50} /></Link>
    <button onClick={() => {
      setIsOpenMenu(!isOpenMenu);
      if (setIsOpenMenuParent) setIsOpenMenuParent(!isOpenMenuParent);
    }} className="fixed duration-300 h-[36px] right-8 hover:opacity-80 top-8 w-[36px] z-[100]">
      <div className="relative h-full w-full">
        <div className={`absolute bg-white duration-300 h-[4px] w-[36px] left-0 ${isOpenMenu ? "rotate-45 top-[16px]" : "rotate-0 top-[8px]"}`}></div>
        <div className={`absolute bg-white duration-300 h-[4px] left-0 ${isOpenMenu ? "rotate-[135deg] top-[16px] w-[36px] border-2" : "rotate-0 top-[24px] w-[28px]"}`}></div>
      </div>
    </button>
    <Sidebar isOpenMenu={isOpenMenu} />
  </>)
}

export default Header;

