"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
//import { Lilita_One } from "next/font/google";
import { Navbar } from "@/components";

import Image from "next/image";
import { CgClose } from "react-icons/cg";
import { IoIosArrowRoundForward } from "react-icons/io";
import Link from "next/link";

//const lilita_one = Lilita_One({ subsets: ["latin"], weight: "400" });

const chatContent = [
    { content: "Greetings, I am Alice. Welcome to TN7 Universe!", img: "Alice_Default" },
    { content: "Your arrival has been expected. Please follow me.", img: "Alice_Blush" },
    { content: "Let me introduce you to the TN7 Universe!", img: "Alice_Embarrassed" },
    { content: "TN7 is VIU's first orginal digital comic series, a gripping 10 episode saga.", img: "Alice_Happy" },
];

const maps = [
    { id: 1, name: "Ocean", },
    { id: 2, name: "Castel", },
    { id: 3, name: "Forest 1", },
    { id: 4, name: "Mountain", },
    { id: 5, name: "Forest 2", }
];

const buildings = [
    { id: 1, name:"THE TEMPLE ON THE HILL", img: "Shin_Temple" },
    { id: 2, name:"THE PINNACLE TOWERS", img: "Shin_HQ" },
    { id: 3, name:"SILVERCOIN DISTRICT", img: "Shin_SilvercoinDistrict" },
    { id: 4, name:"THE WATERING HOLE", img: "Reiko_WateringHole" },
    { id: 5, name:"KOI AND LOTUS CLUB", img: "Reiko_KoiLotusClub" },
    { id: 6, name:"THE CODEX", img: "Reiko_TheCodex" },
    { id: 7, name:"THE GATEL", img: "Akio_TheGatel" },
    { id: 8, name:"AKIO INDUSTRIES HQ", img: "Akio_HQ" },
    { id: 9, name:"THE ENERGY FIELD", img: "Akio_EneygyField" },
];

const UnityMap = () => {
    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "build/WorldMapScene.loader.js",
        dataUrl: "build/WorldMapScene.data.unityweb",
        frameworkUrl: "build/WorldMapScene.framework.js.unityweb",
        codeUrl: "build/WorldMapScene.wasm.unityweb",
    });
    const loadingPercentage = Math.round(loadingProgression * 100);

    const [chatId, setChatId] = useState<number>(0); // 当前聊天 ID
    const [buildingId, setBuildingId] = useState<number>(0); // 当前聊天 ID
    const [hoverBuildingId, setHoverBuildingId] = useState<number>(0); // 当前聊天 ID
    const [displayText, setDisplayText] = useState<string>(""); // 当前显示的文字
    const [isAnimating, setIsAnimating] = useState<boolean>(false); // 是否正在显示文字动画
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [ mousePosition, setMousePosition ] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (chatId < 4) {
            // 重置显示文字并启动逐字显示动画
            const fullText = chatContent[chatId].content;
            let currentIndex = 0;
            setDisplayText(""); // 清空当前显示内容
            setIsAnimating(true); // 标记为动画中

            const interval = setInterval(() => {
                if (currentIndex <= fullText.length) {
                    setDisplayText(fullText.slice(0, currentIndex)); // 使用 slice 避免拼接错误
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    setIsAnimating(false); // 动画完成
                }
            }, 30); // 每个字显示的时间间隔 (50ms)

            return () => clearInterval(interval); // 清理定时器
        }
    }, [chatId]); // 当 chatId 变化时触发

    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const handleClickBuilding = useCallback((buildingId: any) => {
        setBuildingId(buildingId)
        setImageLoaded(false)
    }, []);

    const handleHoverBuilding = useCallback((buildingData: any) => {
        const [buildingId, buildingX, buildingY] = buildingData.split(",");
        if(buildingId > 0) setMousePosition({ x: parseInt(buildingX) - 100, y: window.innerHeight - parseInt(buildingY) - 100 });
        setHoverBuildingId(parseInt(buildingId))
    }, []);

    useEffect(() => {
        addEventListener("ReactClickBuilding", handleClickBuilding);
        return () => {
            removeEventListener("ReactClickBuilding", handleClickBuilding);
        };
    }, [addEventListener, removeEventListener, handleClickBuilding]);

    useEffect(() => {
        addEventListener("ReactHoverBuilding", handleHoverBuilding);
        return () => {
            removeEventListener("ReactHoverBuilding", handleHoverBuilding);
        };
    }, [addEventListener, removeEventListener, handleHoverBuilding]);

    //random text - start
    const [buildingName, setBuildingName] = useState<string>("");

    const generateRandomString = (length: number) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    };
    
    const animateBuildingName = (finalName: string) => {
      let currentLength = 0;
      const interval = setInterval(() => {
        if (currentLength <= finalName.length) {
          const partialName = finalName.slice(0, currentLength);
          const randomString = generateRandomString(finalName.length - currentLength);
          setBuildingName(partialName + randomString);
          currentLength++;
        } else {
          clearInterval(interval);
          setBuildingName(finalName);
        }
      }, 50); // 控制每次变化的速度 (50ms)
    };
    
    useEffect(() => {
      if (hoverBuildingId > 0) {
        const building = buildings.find((b) => b.id === hoverBuildingId);
        if (building) {
          animateBuildingName(building.name); // 开始动画
        }
      }
    }, [hoverBuildingId]);
    //end

    const handleNextChat = () => {
        if (isAnimating) return; // 如果正在显示动画，不允许切换
        setChatId((prevId) => (prevId + 1));
    };

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden" onClick={handleNextChat}>
            <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
            <AnimatePresence>{/*Loading Percentage For Unity*/}
                {!isLoaded && (
                    <motion.div
                        id="loader"
                        className="absolute flex h-full items-center justify-center left-0 w-full top-0 bg-black z-[100]"
                        initial={{ y: 0 }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <span className="font-bold text-5xl text-white">
                            {loadingPercentage}%
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="absolute h-12 overflow-hidden w-full" style={{ left: mousePosition.x, top: mousePosition.y }}>
                <AnimatePresence>
                    {   hoverBuildingId > 0 && buildingId == 0 && (
                        <motion.div
                            className={`absolute font-bold text-3xl text-white`}
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            key={hoverBuildingId} // Ensure animation runs for each new ID
                        >
                            {
                                //buildings.find((e) => e.id === hoverBuildingId)?.name || ""
                                buildingName
                            }
                        </motion.div>
                    )}
                </AnimatePresence>                
            </div>
            {/* Building Image Display */}
            <AnimatePresence>
                {buildingId > 0 && (
                    <motion.div
                        key={buildingId}
                        initial={{ y: "20%", opacity: 0 }}
                        animate={{ y: 0, opacity: 0.8 }}
                        exit={{ y: "20%", opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute z-[200] w-[80%] lg:w-[1024px] right-0
                            ${buildingId >= 1 && buildingId <= 6 && "bottom-0"} 
                            ${buildingId >= 1 && buildingId <= 3 && "right-0"} 
                            ${buildingId >= 4 && buildingId <= 6 && "left-0"} 
                            ${buildingId >= 7 && buildingId <= 9 && "top-0 left-0"}   
                        `}
                    >

                        {/* Skeleton Loader */}
                        {!imageLoaded && (
                            <Image alt="placeholder" width={1375} height={756}
                                className="absolute animate-pulse grayscale" src={`/assets/images/worldmap/webp/placeholder.webp`}
                                priority
                            />
                        )}
                        {/* Lazy Loaded Image */}
                        <Image
                            src={`/assets/images/worldmap/webp/${buildings.find(b => b.id === buildingId)?.img}.webp`}
                            alt={buildings.find(b => b.id === buildingId)?.name || "Building"}
                            layout="responsive"
                            width={1833}
                            height={1008}
                            className={`transition-opacity duration-300 ${imageLoaded ? "opacity-90" : "opacity-0"}`}
                            onLoadingComplete={() => setImageLoaded(true)} // Handle loading state
                            loading="lazy" // Enable lazy loading
                            onError={() => console.error("Failed to load image.")}
                        />
                        <Link href={{ pathname: "/lore", query: { category: "locations", id: buildingId } }}>
                            <button
                                className="absolute bottom-[20%] duration-200 flex group items-center justify-center left-60 text-white underline z-20 hover:opacity-60">
                                READ MORE
                                <IoIosArrowRoundForward className="duration-200 -rotate-45 group-hover:rotate-0 text-4xl" />
                            </button>
                        </Link>
                        <button
                            onClick={() => {
                                sendMessage(`b${buildingId}_0`, "UnClickBuilding");
                            }}
                            className="absolute bg-white duration-300 p-2 right-2 rounded-full shadow-xl shadow-black/50 text-3xl top-4 z-20 hover:bg-black hover:text-white">
                            <CgClose />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/*<AnimatePresence>
                {
                    chatId < 4 && <div
                        className="absolute bottom-8 z-50 flex justify-center w-full">
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "192px" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-blue-800 rounded-lg text-white py-8 px-12 w-full lg:w-[1280px] shadow-md relative">
                            <div className="absolute top-0 text-2xl">Alice</div>
                            <div className="border-slate-50/50 border-[1px] rounded-lg h-full flex items-center justify-center p-4">
                                {displayText}
                            </div>
                            {!isAnimating && <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-0 flex gap-2 items-center text-sm">NEXT <TbPlayerTrackNextFilled />
                            </motion.div>}
                            <motion.img
                                initial={{ right: -50, opacity: 0 }}
                                animate={{ right: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="absolute bottom-0 w-60 right-0"
                                alt="Alice"
                                src={`/assets/images/Alice_VNSpriteSet/${chatContent[chatId]?.img}.png`}
                            />
                        </motion.div>
                    </div>
                }
            </AnimatePresence>*/}
        </div>
    );
};

export default UnityMap;
