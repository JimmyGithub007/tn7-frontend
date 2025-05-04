"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Footer, GlitchText, Header } from "@/components";
import { useDispatch, useSelector } from "react-redux";
import { setUnityHover } from "@/store/slice/mouseSlice";
import { RootState } from "@/store";
import { setJumpPage } from "@/store/slice/pageSlice";

import dynamic from 'next/dynamic';

const MobileVersionHomeScene = dynamic(() => import('@/components/MobileVersionHomeScene'), {
    ssr: false, // 只在客户端渲染，避免 SSR 报错
    loading: () => <div className="bg-black"></div>,
});

interface versionProps {
    handleHoverTV: (tvData: any) => void;
    handleClickTV: (tvId: any) => void;
    setLoadingProgression: (state: number) => void;
    message: { id: string, content: string };
}

const PCVersion: React.FC<versionProps> = ({ handleHoverTV, handleClickTV, setLoadingProgression, message }) => {
    const { unityProvider, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "/unity/build/HomeScene.loader.js",
        dataUrl: "/unity/build/HomeScene.data.unityweb",
        frameworkUrl: "/unity/build/HomeScene.framework.js.unityweb",
        codeUrl: "/unity/build/HomeScene.wasm.unityweb",
    });

    useEffect(() => {
        if(message.id !== "" && message.content !== "") sendMessage(message.id, message.content);
    }, [message]);

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

    useEffect(() => {
        setLoadingProgression(loadingProgression);
    }, [loadingProgression]);

    return (<Unity className={`h-full w-full`} unityProvider={unityProvider} />);
}

const Home = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const jumpPage = useSelector((state: RootState) => state.page.jumpPage);
    const [ loadingProgression, setLoadingProgression ] = useState<number>(0);
    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);
    const [ hoverTvId, setHoverTvId ] = useState<number>(0);
    const [ isMobile, setIsMobile ] = useState(false);
    const [ message, setMessage ] = useState<{ id: string, content: string }>({ id: "", content: "" });
    const [ isMenuOpen, setIsMenuOpen ] = useState<boolean>(false);

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
                        ? { ...item, x: parseInt(tvX) - (tvId == 2 ? -100 : 80), y: window.innerHeight - parseInt(tvY) - ( tvId == 1 ? 100 : 50 ) } // Update the matching entry
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

        dispatch(setJumpPage(true));

        const timeout = setTimeout(() => {
            router.push(url);
        }, 200);
        
        return () => clearTimeout(timeout);
    }, []);

    const clickTV = (tvId: number) => {
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

        dispatch(setJumpPage(true));

        const timeout = setTimeout(() => {
            router.push(url);
        }, 200);
        
        return () => clearTimeout(timeout);
    }

    const startHome = () => {
        const timeout = setTimeout(() => {
            setMessage({ id: "Home", content: "StartHome" });
        }, 500);
        return () => clearTimeout(timeout);
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
            }, 150); // 每 200ms 增加 1%
            return () => clearInterval(interval);
        } else if (loadingProgression < 0.9) {
            if (isMobile) {
                const interval = setInterval(() => {
                    setLoadingPercentage((prev) => {
                        if (prev >= 99) {
                            clearInterval(interval);
                            return 100;
                        }
                        return prev + 1;
                    });
                }, 350);
            } else {
                setLoadingPercentage(Math.round(loadingProgression * 100));
            }
        }
    }, [isMobile, loadingProgression]);

    useEffect(() => {
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => {
                startHome();
                setLoaderHidden(true);
            }, 1500); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        if(isMenuOpen) {
            setMessage({ id: "Home", content: "StopHome" });
        } else {
            setMessage({ id: "Home", content: "StartHome" });
        }
    }, [isMenuOpen]);

    useEffect(() => {
        const checkRatio = () => {
            if(window.innerWidth/window.innerHeight <= 1.333) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        checkRatio(); // 初始检测

        window.addEventListener("resize", checkRatio);
        return () => {
            window.removeEventListener("resize", checkRatio);
        };
    }, []);

    useEffect(() => {
        dispatch(setJumpPage(false));
    }, []);

    return (
        <div className="bg-black h-screen w-full relative overflow-hidden">
            <Header isOpenMenuParent={isMenuOpen} setIsOpenMenuParent={setIsMenuOpen} />
            {   isMobile ? <MobileVersionHomeScene
                setHoverTvId={setHoverTvId}
                setTvData={setTvData}
                tvData={tvData}
                clickTV={clickTV}
                onSceneReady={() => setLoadingProgression(1) }
            /> : 
                <PCVersion handleHoverTV={handleHoverTV} 
                    handleClickTV={handleClickTV} 
                    setLoadingProgression={setLoadingProgression} 
                    message={message} 
                />
            }
            <AnimatePresence>
                {!loaderHidden && (
                    <motion.div
                        id="loader"
                        className="absolute bg-black flex h-full items-center justify-center left-0 w-full top-0 z-[300]"
                        initial={{ y: 0 }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <GlitchText text={`${loadingPercentage}%`} />
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {   jumpPage && (
                    <motion.div
                        className="absolute bg-black h-full left-0 w-full top-0 z-[300]"
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }} />
                )}
            </AnimatePresence>
            {   !isMobile && hoverTvId > 0 && <div className="absolute cursor-pointer w-full h-full opacity-0 z-[100] top-0 left-0" onClick={() => clickTV(hoverTvId) }></div> }
            {   !isMobile &&
                [1, 2, 3].map((value, key) => (
                    <div key={key} className="absolute h-12 overflow-hidden w-full flex justify-center hidden lg:block" style={{ 
                        left: isMobile ? 0 : tvData.find(e => e.id === value)?.x || 0, top: tvData.find(e => e.id === value)?.y || 0 
                    }}>
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
