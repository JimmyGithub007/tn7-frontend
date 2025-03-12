"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { opinionPro } from "./Font";
import { IoIosArrowForward } from "react-icons/io";
import { Collapse } from "antd";
import { FaFacebookF } from "react-icons/fa";
import { BsDiscord, BsInstagram, BsTiktok, BsTwitterX } from "react-icons/bs";
const { Panel } = Collapse;
import Image from "next/image";
import Link from "next/link";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Divider = () => {
  return <div className="bg-black/10 w-full h-[0.15rem]" />
}

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["HOME", "LORE", "WORLD MAP", "SOCIALS",
      "X", "DISCORD", "INSTAGRAM", "FAQS"
    ];
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
          className="backdrop-blur-xl bg-white/20 filter-bar fixed right-0 h-screen overflow-y-auto w-full md:w-[500px] z-[40]"
          initial={{ translateX: "100%" }}
          animate={{ translateX: "0%" }}
          exit={{ translateX: "100%" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="flex flex-col gap-8 pt-20 px-8 sm:px-12">
            <div className={`flex flex-col font-bold text-white text-md sm:text-xl ${opinionPro.className}`}>
              {/*<Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <IoIosArrowForward
                    style={{ color: "white", fontSize: "1.5rem" }}
                    className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                  />
                )}
                expandIconPosition="end"
                style={{ padding: "16px 0" }}
                defaultActiveKey={[ pathname.includes("lore") ? "1" : "" ]}
              >
                <Panel header={<div 
                    onMouseEnter={() => handleMouseEnter(0, "TN7 UNIVERSE")}
                    className={`text-white text-md sm:text-xl ${opinionPro.className}`}>{menuText[0] || "TN7 UNIVERSE"}
                  </div>
                } key="1">
                  <a 
                    className={`flex flex-col gap-6 py-4 text-md sm:text-xl text-white ${opinionPro.className} ${pathname === "/comics" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white" }`} href="/comics"
                    onMouseEnter={() => handleMouseEnter(1, "COMICS")}
                  >
                    {menuText[1] || "COMICS"}
                  </a>
                  <Divider />
                  <Collapse
                    ghost
                    expandIcon={({ isActive }) => (
                      <IoIosArrowForward
                          style={{ color: "white", fontSize: "1.5rem" }}
                          className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                      />
                    )}
                    expandIconPosition={"end"}
                    style={{ paddingTop: "16px" }}
                    defaultActiveKey={[ pathname.includes("lore") ? "2" : "" ]}
                  >
                    <Panel header={<div 
                      onMouseEnter={() => handleMouseEnter(2, "TN7 LORE")}
                      className={`text-white text-md sm:text-xl ${opinionPro.className}`}>
                      {menuText[2] || "TN7 LORE"}</div>} 
                      key="2"
                    >
                      <Collapse
                        ghost
                        expandIcon={({ isActive }) => (
                          <IoIosArrowForward
                            style={{ color: "white", fontSize: "1.5rem" }}
                            className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"
                              }`}
                          />
                        )}
                        expandIconPosition={"end"}
                        style={{ padding: "16px 0" }}
                        defaultActiveKey={[ pathname.includes("lore") && searchParams.get("category") === "cities" ? "3" : "" ]}
                      >
                        <Panel header={<div 
                          onMouseEnter={() => handleMouseEnter(3, "CITIES")}
                          className={`text-white text-md sm:text-xl ${opinionPro.className}`}>
                            {menuText[3] || "CITIES"}
                          </div>} key="3"
                        >
                          <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                            <Link className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=cities&id=1" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=cities&id=1" onMouseEnter={() => handleMouseEnter(4, "SYNTHCITY")}>{menuText[4] || "SYNTHCITY"}</Link>
                            <Divider />
                            <Link className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=cities&id=2" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=cities&id=2" onMouseEnter={() => handleMouseEnter(5, "CYBER VALLEY")}>{menuText[5] || "CYBER VALLEY"}</Link>
                            <Divider />
                            <Link className={`pt-4 ${pathname+"?"+searchParams.toString() === "/lore?category=cities&id=3" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=cities&id=3" onMouseEnter={() => handleMouseEnter(6, "NEW HELM")}>{menuText[6] || "NEW HELM"}</Link>
                          </div>
                        </Panel>
                      </Collapse>
                      <Divider />
                      <Collapse
                        ghost
                        expandIcon={({ isActive }) => (
                          <IoIosArrowForward
                            style={{ color: "white", fontSize: "1.5rem" }}
                            className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                          />
                        )}
                        expandIconPosition={"end"}
                        style={{ paddingTop: "16px" }}
                        defaultActiveKey={[ pathname.includes("lore") && searchParams.get("category") === "locations" ? "4" : "" ]}
                      >
                        <Panel header={<div 
                          onMouseEnter={() => handleMouseEnter(7, "LOCATIONS")}
                          className={`text-white text-md sm:text-xl ${opinionPro.className}`}>
                            {menuText[7] || "LOCATIONS"}
                          </div>} key="4"
                        >
                          <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                            <Link className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=1" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=1" onMouseEnter={() => handleMouseEnter(8, "TEMPLE ON THE HELL")}>{menuText[8] || "TEMPLE ON THE HELL"}</Link>
                            <Divider />
                            <Link className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=2" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=2" onMouseEnter={() => handleMouseEnter(9, "THE PINNACLE TOWERS")}>{menuText[9] || "THE PINNACLE TOWERS"}</Link>
                            <Divider />
                            <Link className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=3" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=3" onMouseEnter={() => handleMouseEnter(10, "THE LOWER DISTRICT")}>{menuText[10] || "THE LOWER DISTRICT"}</Link>
                            <Divider />
                            <Link  className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=4" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=4" onMouseEnter={() => handleMouseEnter(11, "THE WATERING HOLE")}>{menuText[11] || "THE WATERING HOLE"}</Link>
                            <Divider />
                            <Link  className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=5" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=5" onMouseEnter={() => handleMouseEnter(12, "THE KOI AND LOTUS CLUB")}>{menuText[12] || "THE KOI AND LOTUS CLUB"}</Link>
                            <Divider />
                            <Link  className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=6" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=6" onMouseEnter={() => handleMouseEnter(13, "THE CODEX")}>{menuText[13] || "THE CODEX"}</Link>
                            <Divider />
                            <Link  className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=7" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=7" onMouseEnter={() => handleMouseEnter(14, "THE FORT")}>{menuText[14] || "THE FORT"}</Link>
                            <Divider />
                            <Link  className={`py-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=8" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=8" onMouseEnter={() => handleMouseEnter(15, "AKIO INDUSTRIES")}>{menuText[15] || "AKIO INDUSTRIES"}</Link>
                            <Divider />
                            <Link  className={`pt-4 ${pathname+"?"+searchParams.toString() === "/lore?category=locations&id=9" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white"}`} href="/lore?category=locations&id=9" onMouseEnter={() => handleMouseEnter(16, "THE ENERGY FIELD")}>{menuText[16] || "THE ENERGY FIELD"}</Link>
                          </div>
                        </Panel>
                      </Collapse>
                    </Panel>
                  </Collapse>
                </Panel>
              </Collapse>*/}
              <Link className={`py-4 ${pathname === "/home" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white" }`} href="/home" onMouseEnter={() => handleMouseEnter(0, "HOME")}>{menuText[0] || "HOME"}</Link>
              <Divider />
              <Link className={`py-4 ${pathname === "/lore" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white" }`} href="/lore" onMouseEnter={() => handleMouseEnter(1, "LORE")}>{menuText[1] || "LORE"}</Link>
              <Divider />
              <Link className={`py-4 ${pathname === "/worldmap" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white" }`} href="/worldmap" onMouseEnter={() => handleMouseEnter(2, "WORLD MAP")}>{menuText[2] || "WORLD MAP"}</Link>
              <Divider />
              <Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <IoIosArrowForward
                    style={{ color: "white", fontSize: "1.5rem" }}
                    className={`transition-transform duration-300 ${isActive ? "rotate-90" : "-rotate-90"}`}
                  />
                )}
                expandIconPosition={"end"}
                style={{ padding: "16px 0" }}
              >
                <Panel header={<div 
                  onMouseEnter={() => handleMouseEnter(3, "SOCIALS")}
                  className={`text-white text-md sm:text-xl ${opinionPro.className}`}>
                    {menuText[3] || "SOCIALS"}
                  </div>} key="5"
                >
                  <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                    <a href="https://x.com/tn7_viu" className="flex gap-2 items-center py-2 hover:text-white" onMouseEnter={() => handleMouseEnter(4, "X")}><BsTwitterX /> {menuText[4] || "X"}</a>
                    <Divider />
                    <a href="https://discord.gg/ynEgRUF2UA" className="flex gap-2 items-center pt-2 hover:text-white" onMouseEnter={() => handleMouseEnter(5, "DISCORD")}><BsDiscord /> {menuText[5] || "DISCORD"}</a>
                    <Divider />
                    <a href="https://www.instagram.com/tn7_viu" className="flex gap-2 items-center py-2 hover:text-white" onMouseEnter={() => handleMouseEnter(6, "INSTAGRAM")}><BsInstagram /> {menuText[6] || "INSTAGRAM"}</a>
                  </div>
                </Panel>
              </Collapse>
              <Divider />
              <Link className={`py-4 ${pathname === "/faqs" ? "text-yellow-400 hover:text-yellow-300" : "hover:text-white" }`} href="/faqs" onMouseEnter={() => handleMouseEnter(9, "FAQS")}>{menuText[9] || "FAQS"}</Link>
              <Divider />
            </div>
            <div className={`flex flex-col text-sm ${opinionPro.className}`}>
              <Link className="duration-300 hover:opacity-50" href={`/termsandconditions`}>TERMS & CONDITIONS</Link>
              <div>TN7 © 2024 - 2025</div>
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
    <Link href={`/home`}><Image alt="logo" className="fixed left-8 top-0 w-20 sm:w-26 z-[100]" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50} /></Link>
    <button onClick={() => {
      setIsOpenMenu(!isOpenMenu);
      if (setIsOpenMenuParent) setIsOpenMenuParent(!isOpenMenuParent);
    }} className="fixed duration-300 h-[36px] right-8 hover:opacity-80 top-4 w-[36px] z-[100]">
      <div className="relative h-full w-full">
        <div className={`absolute bg-white duration-300 h-[4px] w-[36px] left-0 ${isOpenMenu ? "rotate-45 top-[16px]" : "rotate-0 top-[8px]"}`}></div>
        <div className={`absolute bg-white duration-300 h-[4px] left-0 ${isOpenMenu ? "rotate-[135deg] top-[16px] w-[36px] border-2" : "rotate-0 top-[24px] w-[28px]"}`}></div>
      </div>
    </button>
    <Suspense fallback={null}>
      <Sidebar isOpenMenu={isOpenMenu} />
    </Suspense>
  </>)
}

export default Header;

