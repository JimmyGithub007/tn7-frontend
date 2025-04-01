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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setJumpPage } from "@/store/slice/pageSlice";

const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

const Divider = () => {
  return <div className="bg-black/10 w-full h-[0.15rem]" />
}

const Sidebar = ({ isOpenMenu }: { isOpenMenu: boolean }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [menuText, setMenuText] = useState<string[]>(["", "", ""]);
  const [hoverState, setHoverState] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!isOpenMenu) return;

    const targetMenus = ["Home", "TN7 Universe", "LORE", "Comic", "World Map", "Socials",
      "X", "Discord", "Instagram", "Discover More"
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
              <button className={`py-4 text-left ${pathname === "/home" ? 
                "text-yellow-400 hover:text-yellow-300" 
                : "hover:text-white" 
              }`} 
                  onClick={() => {
                    if(pathname === "/home") return;
                    dispatch(setJumpPage(true));
                    const timeout = setTimeout(() => {
                      router.push(`/home`);
                    }, 200);
                    return () => clearTimeout(timeout);
                  }}
                  onMouseEnter={() => handleMouseEnter(0, "Home")}>
                  {menuText[0] || "Home"}
              </button>
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
                  onMouseEnter={() => handleMouseEnter(1, "TN7 Universe")}
                  className={`target text-white text-md sm:text-xl ${opinionPro.className}`}>
                    {menuText[1] || "TN7 Universe"}
                  </div>} key="1"
                >
                  <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                    <button
                      className={`pb-4 text-left ${pathname === "/lore"
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "hover:text-white"
                        }`}
                        onClick={() => {
                          if(pathname === "/lore") return;
                          dispatch(setJumpPage(true));
                          const timeout = setTimeout(() => {
                            router.push(`/lore`);
                          }, 200);
                          return () => clearTimeout(timeout);
                        }}
                        onMouseEnter={() => handleMouseEnter(2, "Lore")}
                    >
                      {menuText[2] || "Lore"}
                    </button>
                    <Divider />
                    <button
                      className={`py-4 text-left ${pathname === "/comics"
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "hover:text-white"
                        }`}
                      onClick={() => {
                          if(pathname === "/comics") return;
                          dispatch(setJumpPage(true));
                          const timeout = setTimeout(() => {
                            router.push(`/comics`);
                          }, 200);
                          return () => clearTimeout(timeout);
                      }}
                      onMouseEnter={() => handleMouseEnter(3, "Comic")}
                    >
                      {menuText[3] || "Comic"}
                    </button>
                    <Divider />
                    <button
                      className={`pt-4 text-left ${pathname === "/worldmap"
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "hover:text-white"
                        }`}
                        onClick={() => {
                          if(pathname === "/worldmap") return;
                          dispatch(setJumpPage(true));
                          const timeout = setTimeout(() => {
                            router.push(`/worldmap`);
                          }, 200);
                          return () => clearTimeout(timeout);
                        }}
                        onMouseEnter={() => handleMouseEnter(4, "World Map")}
                    >
                      {menuText[4] || "World Map"}
                    </button>
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
                style={{ padding: "16px 0" }}
              >
                <Panel header={<div 
                  onMouseEnter={() => handleMouseEnter(5, "Socials")}
                  className={`target text-white text-md sm:text-xl ${opinionPro.className}`}>
                    {menuText[5] || "Socials"}
                  </div>} key="2"
                >
                  <div className={`flex flex-col pl-4 text-md sm:text-xl text-white ${opinionPro.className}`}>
                    <a href="https://x.com/tn7_viu" target="_blank" className="flex gap-2 items-center pb-4 hover:text-white" onMouseEnter={() => handleMouseEnter(6, "X")}><BsTwitterX /> {menuText[6] || "X"}</a>
                    <Divider />
                    <a href="https://discord.gg/ynEgRUF2UA" target="_blank" className="flex gap-2 items-center py-4 hover:text-white" onMouseEnter={() => handleMouseEnter(7, "Discord")}><BsDiscord /> {menuText[7] || "Discord"}</a>
                    <Divider />
                    <a href="https://www.instagram.com/tn7_viu" target="_blank" className="flex gap-2 items-center pt-4 hover:text-white" onMouseEnter={() => handleMouseEnter(8, "Instagram")}><BsInstagram /> {menuText[8] || "Instagram"}</a>
                  </div>
                </Panel>
              </Collapse>
              <Divider />
              <button className={`py-4 text-left ${pathname === "/discovermore" ? 
                "text-yellow-400 hover:text-yellow-300" : 
                "hover:text-white" 
              }`}  
                onClick={() => {
                  if(pathname === "/discovermore") return;
                  dispatch(setJumpPage(true));
                  const timeout = setTimeout(() => {
                    router.push(`/discovermore`);
                  }, 200);
                  return () => clearTimeout(timeout);
                }}
                onMouseEnter={() => handleMouseEnter(9, "Discover More")}
              >
                {menuText[9] || "Discover More"}
              </button>
              <Divider />
            </div>
            <div className={`flex flex-col text-sm ${opinionPro.className}`}>
              <div className="flex gap-2">
                <Link className="duration-300 hover:opacity-50" href={`/termsofuse`}>TERMS OF USE</Link> |
                <Link className="duration-300 hover:opacity-50" href={`/privacy`}>PRIVACY NOTICE</Link>
              </div>
              <div>TN7 © 2024 - 2025</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ setIsOpenMenuParent, isOpenMenuParent }: { setIsOpenMenuParent?: (state: boolean) => void, isOpenMenuParent?: boolean }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

  return (<>
    <Image alt="logo" 
      className="cursor-pointer target fixed left-8 top-0 w-20 sm:w-26 z-[100]" 
      width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50} 
      onClick={() => {
        if (pathname !== "/home") {
          dispatch(setJumpPage(true));
          const timeout = setTimeout(() => {
            router.push(`/home`);
          }, 200);
          return () => clearTimeout(timeout);
        }
      }}
    />
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

