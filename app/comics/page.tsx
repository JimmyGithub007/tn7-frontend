"use client";

import { useCallback, useEffect, useState } from "react";
import { Footer, Header } from "@/components";
import { useRouter } from "next/navigation";

import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { setUnityHover } from "@/store/slice/mouseSlice";
import { useDispatch } from "react-redux";

const Comics = () => {
    const router = useRouter();

    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener, sendMessage } = useUnityContext({
        loaderUrl: "unity/build/ComicTimeLineScene.loader.js",
        dataUrl: "unity/build/ComicTimeLineScene.data.unityweb",
        frameworkUrl: "unity/build/ComicTimeLineScene.framework.js.unityweb",
        codeUrl: "unity/build/ComicTimeLineScene.wasm.unityweb",
    });

    const [ loadingPercentage, setLoadingPercentage ] = useState<number>(0);
    const [ loaderHidden, setLoaderHidden ] = useState<boolean>(false);
    const [ hoverComicId, setHoverComicId ] = useState<number>(0);
    const dispatch = useDispatch();

    const handleHoverComic = useCallback((comicData: any) => {
        const [comicId, comicX, comicY] = comicData.split(",");
        setHoverComicId(parseInt(comicId))
        dispatch(setUnityHover(parseInt(comicId) > 0 ? true : false));
    }, []);

    const handleClickComic = useCallback((comicId: any) => {
        clickComic(parseInt(comicId));
    }, []);

    useEffect(() => {
        addEventListener("ReactHoverComic", handleHoverComic);
        return () => {
            removeEventListener("ReactHoverComic", handleHoverComic);
        };
    }, [addEventListener, removeEventListener, handleHoverComic]);

    useEffect(() => {
        addEventListener("ReactClickComic", handleClickComic);
        return () => {
            removeEventListener("ReactClickComic", handleClickComic);
        };
    }, [addEventListener, removeEventListener, handleClickComic]);

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

    const clickComic = (hoverComicId:number) => {
        let url = "";
        switch (hoverComicId) {
            case 1:
                //url = "/comics/pk";
                break;
            case 2:
                url = "/comics/azuki";
                break;
            case 3:
                //url = "/comics/thepathofvengeance";
                break;
        }

        if(url != "") router.push(url);
    }

    return (
        <div className="bg-slate-100 h-screen w-full relative overflow-hidden">
            <Header />
            { hoverComicId > 0 && <div className={`absolute hidden lg:block w-full h-full opacity-0 ${hoverComicId === 2 ? "cursor-pointer" : "cursor-not-allowed"}`} onClick={() => clickComic(hoverComicId) }></div> }
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
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
                        <span className="font-bold text-5xl text-white">
                            {loadingPercentage}%
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Comics;
