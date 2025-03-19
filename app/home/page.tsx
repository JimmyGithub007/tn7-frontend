"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Footer, Header } from "@/components";
import { useDispatch } from "react-redux";
import { setUnityHover } from "@/store/slice/mouseSlice";

interface versionProps {
    handleHoverTV: (tvData: any) => void;
    handleClickTV: (tvId: any) => void;
}

const PCVersion: React.FC<versionProps> = ({ handleHoverTV, handleClickTV }) => {
    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);

    const { unityProvider, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "unity/build/HomeScene.loader.js",
        dataUrl: "unity/build/HomeScene.data.unityweb",
        frameworkUrl: "unity/build/HomeScene.framework.js.unityweb",
        codeUrl: "unity/build/HomeScene.wasm.unityweb",
    });

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
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => setLoaderHidden(true), 200); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        addEventListener("ReactHoverTV", handleHoverTV);
        return () => {
            removeEventListener("ReactHoverTV", handleHoverTV);
        };
    }, [addEventListener, removeEventListener, handleHoverTV]);

    useEffect(() => {
        addEventListener("ReactClickTV", handleClickTV);
        return () => {
            removeEventListener("ReactClickTV", handleClickTV);
        };
    }, [addEventListener, removeEventListener, handleClickTV]);

    return (<>
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
        </AnimatePresence></>)
}

const MobileVersion: React.FC<versionProps> = ({ handleHoverTV, handleClickTV }) => {
    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);

    const { unityProvider, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "unity/build/MobileVersionHomeScene.loader.js",
        dataUrl: "unity/build/MobileVersionHomeScene.data.unityweb",
        frameworkUrl: "unity/build/MobileVersionHomeScene.framework.js.unityweb",
        codeUrl: "unity/build/MobileVersionHomeScene.wasm.unityweb",
    });

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
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => setLoaderHidden(true), 200); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        addEventListener("ReactHoverTV", handleHoverTV);
        return () => {
            removeEventListener("ReactHoverTV", handleHoverTV);
        };
    }, [addEventListener, removeEventListener, handleHoverTV]);

    useEffect(() => {
        addEventListener("ReactClickTV", handleClickTV);
        return () => {
            removeEventListener("ReactClickTV", handleClickTV);
        };
    }, [addEventListener, removeEventListener, handleClickTV]);

    return (<>
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
        </AnimatePresence></>)
}

const Home = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [ hoverTvId, setHoverTvId ] = useState<number>(0);
    const [ isMobile, setIsMobile ] = useState(false);

    const [ tvData, setTvData ] = useState<{ id: number, name: string, x: number, y: number }[]>([
        { id: 1, name: "", x: 0, y: 0 },
        { id: 2, name: "", x: 0, y: 0 },
        { id: 3, name: "", x: 0, y: 0 },
    ]);

    const handleHoverTV = useCallback((tvData: any) => {
        const [tvId, tvX, tvY] = tvData.split(",");
        if(tvId > 0) {
            setTvData(prev =>
                prev.map(item =>
                    item.id === parseInt(tvId)
                        ? { ...item, x: parseInt(tvX) - (tvId == 2 ? -100 : 80), y: window.innerHeight - parseInt(tvY) - 50 } // Update the matching entry
                        : item // Keep the rest unchanged
                )
            );
        }
        setHoverTvId(parseInt(tvId));
        dispatch(setUnityHover(parseInt(tvId) > 0 ? true : false));
    }, []);

    const handleClickTV = useCallback((tvId: any) => {
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

    const clickTV = () => {
        let url = "";
        switch (hoverTvId) {
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
    }

    //random text - start
    const tvs = [
        { id: 1, name: "TN7 UNIVERSE" },
        { id: 2, name: "LORE" },
        { id: 3, name: "WORLD MAP" }
    ];

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
                setTvData(prev =>
                    prev.map(item =>
                        item.id === hoverTvId
                            ? { ...item, name: partialName + randomString } // Update the matching entry
                            : item // Keep the rest unchanged
                    )
                );
                currentLength++;
            } else {
                clearInterval(interval);
                setTvData(prev =>
                    prev.map(item =>
                        item.id === hoverTvId
                            ? { ...item, name: finalName } // Update the matching entry
                            : item // Keep the rest unchanged
                    )
                );
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

    useEffect(() => {
        // 检测是否是移动端
        const checkMobile = () => {
          setIsMobile(window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
        };
    
        checkMobile();
        window.addEventListener("resize", checkMobile);
    
        return () => window.removeEventListener("resize", checkMobile);
      }, []);

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden">
            <Header />
            {   isMobile ? <MobileVersion handleHoverTV={handleHoverTV} handleClickTV={handleClickTV} /> : 
                <PCVersion handleHoverTV={handleHoverTV} handleClickTV={handleClickTV} />
            }
            { hoverTvId > 0 && <div className="absolute hidden lg:block cursor-pointer w-full h-full opacity-0 z-10" onClick={() => clickTV() }></div> }
            {
                [1, 2, 3].map((value, key) => (
                    <div key={key} className="absolute h-12 overflow-hidden w-full" style={{ left: tvData.find(e => e.id === value)?.x || 0, top: tvData.find(e => e.id === value)?.y || 0 }}>
                        <AnimatePresence>
                            {   hoverTvId === value && (
                                <motion.div
                                    className={`absolute font-bold text-3xl text-white`}
                                    initial={{ opacity: 0, y: "100%", rotate: 3 }}
                                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                                    exit={{ opacity: 0, y: "100%" }}
                                    transition={{ duration: 0.5 }}
                                    key={value}
                                >
                                    {
                                        tvData.find(e => e.id === value)?.name || ""
                                    }
                                </motion.div>
                            )}
                        </AnimatePresence>                
                    </div>
                ))
           }
            <Footer />
        </div>
    );
};

export default Home;
