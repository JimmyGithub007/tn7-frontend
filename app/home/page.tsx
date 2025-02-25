"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Home = () => {
    const router = useRouter();

    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "unity/build/HomeScene.loader.js",
        dataUrl: "unity/build/HomeScene.data.unityweb",
        frameworkUrl: "unity/build/HomeScene.framework.js.unityweb",
        codeUrl: "unity/build/HomeScene.wasm.unityweb",
    });

    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);
    const [ hoverTvId, setHoverTvId ] = useState<number>(0);
    const [ mousePosition, setMousePosition ] = useState({ x: 0, y: 0 });
    const [ showHandScroll, setShowHandScroll ] = useState<boolean>(false);

    const handleHoverTV = useCallback((tvData: any) => {
        const [tvId, tvX, tvY] = tvData.split(",");
        if(tvId > 0) setMousePosition({ x: parseInt(tvX) - 100, y: window.innerHeight - parseInt(tvY) - 100 });
        setHoverTvId(parseInt(tvId))
    }, []);

    useEffect(() => {
        addEventListener("ReactHoverTV", handleHoverTV);
        return () => {
            removeEventListener("ReactHoverTV", handleHoverTV);
        };
    }, [addEventListener, removeEventListener, handleHoverTV]);

    const handleClickTV = useCallback((tvId: any) => {
        //setTvId(tvId)
        let url = "";
        switch (tvId) {
            case 1:
                url = "/universe";
                break;
            case 2:
                url = "/lore?category=cities";
                break;
            case 3:
                url = "/worldmap";
                break;
            default:
                url = "";
        }

        router.push(url);
    }, []);

    useEffect(() => {
        addEventListener("ReactClickTV", handleClickTV);
        return () => {
            removeEventListener("ReactClickTV", handleClickTV);
        };
    }, [addEventListener, removeEventListener, handleClickTV]);

    useEffect(() => {
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => setLoaderHidden(true), 200); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        if (loadingProgression === 1) {
            if (loadingPercentage < 90) {
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

    useEffect(() => {
        const checkRatio = () => {
            if(window.innerWidth/window.innerHeight <= 1.333) {
                setShowHandScroll(true);
            } else {
                setShowHandScroll(false);
            }
        };

        checkRatio(); // 初始检测

        window.addEventListener("resize", checkRatio);
        return () => {
            window.removeEventListener("resize", checkRatio);
        };
    }, []);

    //random text - start
    const tvs = [
        { id: 1, name: "TN7 UNIVERSE" },
        { id: 2, name: "TN7 LORE" },
        { id: 3, name: "TN7 WORLD MAP" }
    ];

    const [tvName, setTvName] = useState<string>("");

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
                setTvName(partialName + randomString);
                currentLength++;
            } else {
                clearInterval(interval);
                setTvName(finalName);
            }
        }, 50); // 控制每次变化的速度 (50ms)
    };

    useEffect(() => {
        if (hoverTvId > 0) {
            const tv = tvs.find((b) => b.id === hoverTvId);
            if (tv) {
                animateBuildingName(tv.name); // 开始动画
            }
        }
    }, [hoverTvId]);
    //end

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden">
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
            {   showHandScroll &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-12 flex flex-col gap-2 items-center left-[calc(50%-105px)] text-white text-center w-[210px] z-[10]">
                    <div className="relative  text-xl">
                        <FaArrowLeft className="absolute animate-left-arrow -left-12" />
                        <FaArrowRight className="absolute animate-right-arrow -right-12" />
                    </div>
                    <Image className="animate-wiggle w-[40px]" alt="" width={328} height={481} src={`/assets/images/icons/hand-scroll.png`} />
                    <div>Scroll left/right to view full map</div>
                </motion.div>
            }
            <div className="absolute h-12 overflow-hidden w-full" style={{ left: mousePosition.x, top: mousePosition.y-80 }}>
                <AnimatePresence>
                    {   hoverTvId > 0 && (
                        <motion.div
                            className={`absolute font-bold text-4xl text-white`}
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            transition={{ duration: 0.5 }}
                            key={hoverTvId} // Ensure animation runs for each new ID
                        >
                            {
                                tvName
                            }
                        </motion.div>
                    )}
                </AnimatePresence>                
            </div>
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
        </div>
    );
};

export default Home;
