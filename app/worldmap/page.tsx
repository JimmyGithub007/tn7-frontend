"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
//import { Lilita_One } from "next/font/google";
import { Navbar } from "@/components";
import { CgClose } from "react-icons/cg";
import { IoIosArrowRoundForward } from "react-icons/io";
import { TbPlayerTrackNextFilled } from "react-icons/tb";

import Image from "next/image";
import Link from "next/link";

//const lilita_one = Lilita_One({ subsets: ["latin"], weight: "400" });

const chatContent = [
    { content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
    { content: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s." },
    { content: "When an unknown printer took a galley of type and scrambled it to make a type specimen book." },
    { content: "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged." },
    { content: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages." },
    { content: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout." },
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

const WorldMap = () => {
    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "unity/build/WorldMapScene.loader.js",
        dataUrl: "unity/build/WorldMapScene.data.unityweb",
        frameworkUrl: "unity/build/WorldMapScene.framework.js.unityweb",
        codeUrl: "unity/build/WorldMapScene.wasm.unityweb",
    });
    const loadingPercentage = Math.round(loadingProgression * 100);

    const [ chatId, setChatId ] = useState<number>(-1); // 当前聊天 ID
    const [ buildingId, setBuildingId ] = useState<number>(0); // 当前聊天 ID
    const [ hoverBuildingId, setHoverBuildingId ] = useState<number>(0); // 当前聊天 ID
    const [ displayText, setDisplayText ] = useState<string>(""); // 当前显示的文字
    const [ isAnimating, setIsAnimating ] = useState<boolean>(false); // 是否正在显示文字动画
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const [ mousePosition, setMousePosition ] = useState({ x: 0, y: 0 });
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);

    useEffect(() => {
        if(isMenuOpen) {
            sendMessage(`World Map`, "StopWorldMap");
        } else {
            sendMessage(`World Map`, "StartWorldMap");
        }
    }, [isMenuOpen])

    useEffect(() => {
        if (chatId > -1 && chatId < 6) {
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
            }, 20); // 每个字显示的时间间隔 (50ms)

            return () => clearInterval(interval); // 清理定时器
        } else if (chatId === 6) {
            sendMessage(`World Map`, "StartWorldMap");
            localStorage.setItem("isCompletedGuide", "true");
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

    useEffect(() => {
        const completed = localStorage.getItem("isCompletedGuide");
        if (loadingPercentage === 100) {
            if(!completed) {
                setChatId(0);         
            } else {
                const timeout = setTimeout(() => {
                    setChatId(6);
                }, 1000);
        
                return () => clearTimeout(timeout);
            }
        }
    }, [loadingPercentage]);

    useEffect(() => {
        if (isLoaded) {
          const timer = setTimeout(() => setLoaderHidden(true), 100); // 确保动画有时间完成
          return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden" onClick={() => {
            if (chatId === 6 || chatId < 0 || isAnimating) return; // 如果正在显示动画，不允许切换
            setChatId((prevId) => (prevId + 1));
        }}>
            { buildingId === 0 && chatId === 6 && <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} /> }
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
            <AnimatePresence>{/*Loading Percentage For Unity*/}
                {!loaderHidden && (
                    <motion.div
                        id="loader"
                        className="absolute bg-black flex h-full items-center justify-center left-0 w-full top-0 z-[100]"
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
                        {   imageLoaded &&
                            <Link href={{ pathname: "/lore", query: { category: "locations", id: buildingId } }}>
                                <button
                                    className="absolute bottom-[20%] duration-200 flex group items-center justify-center left-60 text-white underline z-20 hover:opacity-60">
                                    READ MORE
                                    <IoIosArrowRoundForward className="duration-200 -rotate-45 group-hover:rotate-0 text-4xl" />
                                </button>
                            </Link>
                        }
                        {   imageLoaded &&
                            <button
                                onClick={() => {
                                    sendMessage(`b${buildingId}_0`, "UnClickBuilding");
                                }}
                                className="absolute bg-white duration-300 p-2 right-2 rounded-full shadow-xl shadow-black/50 text-3xl top-4 z-20 hover:bg-black hover:text-white">
                                <CgClose />
                            </button>
                        }
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {
                    loaderHidden && chatId > -1 && chatId < 6 && <div className="absolute bottom-0 z-50 flex justify-center text-white w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="w-full lg:w-[1080px] relative">
                            <Image alt="character" width={1494} height={688} src={`/assets/images/worldmap/webp/character.webp`} />
                            <div className="absolute flex h-full items-center justify-center p-4 left-[10%] text-lg md:text-xl lg:text-2xl xl:text-3xl top-[8%] w-[50%]">
                                {displayText}
                            </div>
                            {!isAnimating && <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-[10%] flex gap-2 items-center left-[10%] text-xl">NEXT <TbPlayerTrackNextFilled />
                            </motion.div>}
                        </motion.div>
                    </div>
                }
            </AnimatePresence>
        </div>
    );
};

export default WorldMap;
