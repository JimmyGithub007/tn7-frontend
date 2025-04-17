"use client";

import { useEffect, useState } from "react";
import { Footer, GlitchText, Header } from "@/components";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setJumpPage } from "@/store/slice/pageSlice";

import dynamic from "next/dynamic";

const MobileVersionComicTimeLineScene = dynamic(() => import("@/components/MobileVersionComicTimeLineScene"), {
  ssr: false, // very important for components using Three.js or window
  loading: () => <div className="bg-black"></div>
});

const PCVersionComicTimeLineScene = dynamic(() => import("@/components/PCVersionComicTimeLineScene"), {
    ssr: false, // very important for components using Three.js or window
    loading: () => <div className="bg-black"></div>
  });

const Comics = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const jumpPage = useSelector((state: RootState) => state.page.jumpPage);

    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loadingProgression, setLoadingProgression ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);
    const [ hoverComicId, setHoverComicId ] = useState<number>(0);
    const [ isMobile, setIsMobile ] = useState<boolean>(false);

    const clickComic = (hoverComicId:number) => {
        let url = "";
        switch (hoverComicId) {
            case 1:
                //url = "/comics/pk";
                break;
            case 2:
                url = "/comics/secretofthevalley";
                break;
            case 3:
                //url = "/comics/thepathofvengeance";
                break;
        }

        if(url != "") router.push(url);
    }

    useEffect(() => {
        if (loadingPercentage === 100) {
            const timeout = setTimeout(() => setLoaderHidden(true), 500); // 确保动画有时间完成
            return () => clearTimeout(timeout);
        }
    }, [loadingPercentage]);

    useEffect(() => {
        if(isMobile && loadingPercentage < 100) {
            const interval = setInterval(() => {
                setLoadingPercentage((prev) => {
                    if (prev >= 99) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isMobile]);

    useEffect(() => {
        if(!isMobile) {
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
        }
    }, [isMobile, loadingProgression]);

    useEffect(() => {
        dispatch(setJumpPage(false));
    }, []);

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

    return (
        <div className="bg-black h-screen w-full relative overflow-hidden">
            <Header />
            { !isMobile && hoverComicId > 0 && <div className={`absolute hidden lg:block w-full h-full opacity-0 ${hoverComicId === 2 ? "cursor-pointer" : "cursor-not-allowed"}`} onClick={() => clickComic(hoverComicId) }></div> }
            { isMobile ? <MobileVersionComicTimeLineScene /> 
                : <PCVersionComicTimeLineScene 
                    setLoadingProgression={setLoadingProgression}
                    setHoverComicId={setHoverComicId}
                    clickComic={clickComic}
                />}
            <Footer />
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
        </div>
    );
};

export default Comics;
