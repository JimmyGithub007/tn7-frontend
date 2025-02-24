"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Home = () => {
    const router = useRouter();

    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "unity/build/HomeScene.loader.js",
        dataUrl: "unity/build/HomeScene.data.unityweb",
        frameworkUrl: "unity/build/HomeScene.framework.js.unityweb",
        codeUrl: "unity/build/HomeScene.wasm.unityweb",
    });

    const [loadingPercentage, setLoadingPercentage] = useState<number>(0);
    const [loaderHidden, setLoaderHidden] = useState<boolean>(false);
    //const [tvId, setTvId] = useState<number>(0); // 当前聊天 ID
    const [ showHandScroll, setShowHandScroll ] = useState<boolean>(false);

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
            }
        };

        checkRatio(); // 初始检测

        window.addEventListener("resize", checkRatio);
        return () => {
            window.removeEventListener("resize", checkRatio);
        };
    }, []);

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden">
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
            {showHandScroll &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-8 flex flex-col gap-2 items-center left-[calc(50%-50px)] text-white text-center w-[120px] z-[10]">
                    <Image className="w-[50px]" alt="" width={512} height={512} src={`/assets/images/icons/hand-scroll.png`} />
                    <div>Scroll left/right to view full map</div>
                </motion.div>
            }
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
