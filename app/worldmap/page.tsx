"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
//import { Lilita_One } from "next/font/google";
import { Header } from "@/components";
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
    { id: 1, name:"THE TEMPLE ON THE HILL", img: "b1", content: "<p>The Temple rises majestically over the city, accessible only by a long, steep staircase flanked by lush greenery. Each weathered step carries centuries of devotion, guiding visitors to a serene retreat above the hustle and bustle of the city.</p>" },
    { id: 2, name:"THE PINNACLE TOWERS", img: "b2", content: "<p>HQ of the most powerful clan in SynthCity, The White Lily. A towering fortress of glass and steel that looms over the surrounding buildings. It represents power, honor, influence and unwavering loyalty.</p>" },
    { id: 3, name:"SILVERCOIN DISTRICT", img: "b3", content: "<p>The Silver Coin District is located in the lower part of SynthCity, a place where hope is scarce and survival is the only priority. The district is home to smaller clans, each vying for control and influence</p>" },
    { id: 4, name:"THE WATERING HOLE", img: "b4", content: "<p>At the heart of Cyber Valley lies The Watering Hole, a bustling marketplace where merchants gather to promote their latest technological innovations and services. Deals are made in the open, but for those who know where to look, even the rarest, most illicit tech can be acquired for a right price.</p>" },
    { id: 5, name:"KOI AND LOTUS CLUB", img: "b5", content: "<p>The Koi and Lotus Club is Cyber Valley’s premier hotspot, a hub for power play and secret deals. Beneath its lavish exterior, the club serves as the legitimate front for The Misfits' operations, seamlessly straddling both legal and underground tech ventures—primarily hacking and information brokering.</p>" },
    { id: 6, name:"THE CODEX", img: "b6", content: "<p>The Codex is a sanctuary of knowledge, housing ancient wisdom with cutting-edge breakthroughs. It serves as a pivotal center for scholars, technologists, and seekers of knowledge. Within its walls,lies a profound repository of intellectual discovery and exploration.</p>" },
    { id: 7, name:"THE FORT", img: "b7", content: "<p>A massive concrete fortress dominates the city's skyline, serving as the Akio Family's business headquarters. Guards patrol its perimeter vigilantly, a constant reminder of Akio's iron grip over the city.</p>" },
    { id: 8, name:"AKIO INDUSTRIES", img: "b8", content: "<p>The city's only access point is a massive mechanized gate reinforced with red titanium bars. When it opens, a deep, resonant rumble echoes through the surrounding area, a stark reminder of the city's impenetrable defenses.</p>" },
    { id: 9, name:"THE ENERGY FIELD", img: "b9", content: "<p>The Energy Field, built by Akio Industries, extracts geothermal energy using massive drills that operate continuously. Rumors of a shrinking reservoir and declining output have led to heightened security around this vital resource.</p>" },
];

const WorldMap = () => {
    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "unity/build/WorldMapScene.loader.js",
        dataUrl: "unity/build/WorldMapScene.data.unityweb",
        frameworkUrl: "unity/build/WorldMapScene.framework.js.unityweb",
        codeUrl: "unity/build/WorldMapScene.wasm.unityweb",
    });
    //const loadingPercentage = Math.round(loadingProgression * 100);
    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ chatId, setChatId ] = useState<number>(-1); // 当前聊天 ID
    const [ buildingId, setBuildingId ] = useState<number>(0); // 当前聊天 ID
    const [ hoverBuildingId, setHoverBuildingId ] = useState<number>(0); // 当前聊天 ID
    const [ displayText, setDisplayText ] = useState<string>(""); // 当前显示的文字
    const [ isAnimating, setIsAnimating ] = useState<boolean>(false); // 是否正在显示文字动画
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const [ mousePosition, setMousePosition ] = useState({ x: 0, y: 0 });
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);
    //const [ showRotateWarning, setRotateShowWarning ] = useState(false);
    const [ showHandScroll, setShowHandScroll ] = useState<boolean>(false);

    /*useEffect(() => {
        const checkOrientation = () => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            const isSmallScreen = window.innerWidth < 480;
            setRotateShowWarning(isSmallScreen && isPortrait);
        };

        checkOrientation(); // 初始检测

        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);

        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);*/

    useEffect(() => {
        const checkRatio = () => {
            if(window.innerWidth/window.innerHeight <= 1.333) {
                setShowHandScroll(true);
            }
        };

        checkRatio(); // 初始检测

        window.addEventListener("resize", checkRatio);
        return () => {
            window.removeEventListener("resize", checkRatio);
        };
    }, []);

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
            localStorage.setItem("isCompletedGuide", "true");
            const timeout = setTimeout(() => {
                sendMessage(`World Map`, "StartWorldMap");
            }, 1000);
            return () => clearTimeout(timeout);
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
        if(loadingPercentage === 100) {
            const completed = localStorage.getItem("isCompletedGuide");
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
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => setLoaderHidden(true), 200); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        if (loadingProgression === 1) {
            if(loadingPercentage < 90) {
                const interval = setInterval(() => {
                    setLoadingPercentage((prev) => {
                        if (prev >= 99) {
                            clearInterval(interval);
                            return 100;
                        }
                        return prev + 1;
                    });
                }, 50);
                return () => clearInterval(interval);
            } else {
                setLoadingPercentage(100);
            }
        } else if (loadingProgression >= 0.9) {
            const interval = setInterval(() => {
                setLoadingPercentage((prev) => {
                    if (prev >= 99) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1; // 模拟平滑增加
                });
            }, 200); // 每 200ms 增加 1%
            return () => clearInterval(interval);
        } else if (loadingProgression < 0.9) {
            setLoadingPercentage(Math.round(loadingProgression * 100));
        }
    }, [loadingProgression]);

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden" onClick={() => {
            if (chatId === 6 || chatId < 0 || isAnimating) return; // 如果正在显示动画，不允许切换
            setChatId((prevId) => (prevId + 1));
        }}>
            { buildingId === 0 && chatId === 6 && <Header setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} /> }
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
            <AnimatePresence>
                {   /*showRotateWarning && (
                    <motion.div
                        id="loader"
                        className="absolute bg-white flex flex-col gap-4 h-full items-center justify-center left-0 w-full top-0 z-[100]"
                        initial={{ y: 0 }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <Image alt="rotatePhone" width={100} height={100} src={`/assets/images/worldmap/phone-rotate.gif`} quality={50} priority />
                        <span className="font-bold text-2xl text-center">
                            PLEASE ROTATE YOUR DEVICE FOR BETTER EXPERIENCE
                        </span>
                    </motion.div>
                )*/
                    showHandScroll &&
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-8 flex flex-col gap-2 items-center left-[calc(50%-50px)] text-white text-center w-[120px] z-[10]">
                        <Image className="w-[50px]" alt="" width={512} height={512} src={`/assets/images/icons/hand-scroll.png`} />
                        <div>Scroll left/right to view full map</div>
                    </motion.div>
                }
            </AnimatePresence>
            <div className="absolute h-12 overflow-hidden w-full" style={{ left: mousePosition.x, top: mousePosition.y }}>
                <AnimatePresence>
                    {   hoverBuildingId > 0 && buildingId == 0 && (
                        <motion.div
                            className={`absolute font-bold text-3xl text-white`}
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            transition={{ duration: 0.5 }}
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
                        className={`absolute z-[200] w-[100%] lg:w-[80%] lg:w-[900px] xl:[1024px] left-0 right-0
                            ${buildingId >= 1 && buildingId <= 6 && "bottom-36 lg:bottom-4"} 
                            ${buildingId >= 1 && buildingId <= 3 && "bottom-36 lg:right-4"} 
                            ${buildingId >= 4 && buildingId <= 6 && "bottom-36 lg:left-4"} 
                            ${buildingId >= 7 && buildingId <= 9 && "top-36 lg:top-4 lg:left-4"}   
                        `}
                    >

                        {/* Skeleton Loader */}
                        {!imageLoaded && (
                            <Image alt="placeholder" width={1808} height={971}
                                className="absolute animate-pulse grayscale" src={`/assets/images/worldmap/webp/loadingFrame.webp`}
                                priority
                            />
                        )}
                        {/* Lazy Loaded Image */}
                        <Image
                            src={`/assets/images/worldmap/webp/${buildings.find(b => b.id === buildingId)?.img}.webp`}
                            alt={buildings.find(b => b.id === buildingId)?.name || "Building"}
                            layout="responsive"
                            width={1808}
                            height={971}
                            className={`transition-opacity duration-300 ${imageLoaded ? "opacity-90" : "opacity-0"}`}
                            onLoadingComplete={() => setImageLoaded(true)} // Handle loading state
                            loading="lazy" // Enable lazy loading
                            onError={() => console.error("Failed to load image.")}
                        />
                        {   imageLoaded && <div className="absolute flex flex-col sm:gap-2 left-[8%] top-[25%] lg:top-[30%] text-white w-[80%] sm:w-[45%]">
                                <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl">{buildings.find(b => b.id === buildingId)?.name}</div>
                                <div className="text-xs sm:text-sm md:text-md lg:text-lg" dangerouslySetInnerHTML={{ __html: buildings.find(b => b.id === buildingId)?.content || "<p></p>" }} />
                                <Link href={{ pathname: "/lore", query: { category: "locations", id: buildingId } }}>
                                    <button
                                        className="duration-300 flex group hover:opacity-50 items-center text-sm sm:text-md md:text-lg lg:text-xl underline">
                                        READ MORE
                                        <IoIosArrowRoundForward className="duration-200 -rotate-45 group-hover:rotate-0 text-3xl sm:text-4xl" />
                                    </button>
                                </Link>
                            </div>  
                        }
                        {   imageLoaded &&
                            <button
                                onClick={() => {
                                    sendMessage(`b${buildingId}_0`, "UnClickBuilding");
                                }}
                                className="absolute bg-white duration-300 p-2 right-4 rounded-full shadow-xl shadow-black/50 text-3xl top-4 sm:top-12 z-20 hover:bg-black hover:text-white">
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
