"use client";

import { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { AnimatePresence, motion } from "framer-motion";
import { TbPlayerTrackNextFilled } from "react-icons/tb";

const chatContent = [
    { content: "Greetings, I am Alice. Welcome to TN7 Universe!", img: "Alice_Default" },
    { content: "Your arrival has been expected. Please follow me.", img: "Alice_Blush" },
    { content: "Let me introduce you to the TN7 Universe!", img: "Alice_Embarrassed" },
    { content: "TN7 is VIU's first orginal digital comic series, a gripping 10 episode saga.", img: "Alice_Happy" },
];

const maps = [
    {   id: 1, name: "Ocean", },
    {   id: 2, name: "Castel", },
    {   id: 3, name: "Forest 1", },
    {   id: 4, name: "Mountain", },
    {   id: 5, name: "Forest 2", }
];

const UnityMap = () => {
    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "build/MapScene.loader.js",
        dataUrl: "build/MapScene.data.unityweb",
        frameworkUrl: "build/MapScene.framework.js.unityweb",
        codeUrl: "build/MapScene.wasm.unityweb",
    });

    const [chatId, setChatId] = useState<number>(0); // 当前聊天 ID
    const [mapId, setMapId] = useState<number>(0); // 当前聊天 ID
    const [displayText, setDisplayText] = useState<string>(""); // 当前显示的文字
    const [isAnimating, setIsAnimating] = useState<boolean>(false); // 是否正在显示文字动画

    useEffect(() => {
        if(chatId < 4) {
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

    const handleClickMap = useCallback((mapId: any) => {
        console.log(mapId)
        setMapId(mapId)
    }, []);

    useEffect(() => {
        addEventListener("ReactClickMap", handleClickMap);
        return () => {
            removeEventListener("ReactClickMap", handleClickMap);
        };
    }, [addEventListener, removeEventListener, handleClickMap]);

    const handleNextChat = () => {
        if (isAnimating) return; // 如果正在显示动画，不允许切换
        setChatId((prevId) => (prevId + 1));
    };

    return (
        <div className="bg-slate-100 h-screen w-full" onClick={handleNextChat}>
            <Unity className={`h-full w-full`} unityProvider={unityProvider} />
            <div className="absolute flex justify-center h-12 overflow-hidden top-[20%] w-full">
                <AnimatePresence>
                    {  mapId > 0 && (
                        <motion.div
                            className="font-bold text-5xl text-white"
                            initial={{ y: "100%", rotate: 3 }}
                            animate={{ y: "0%", rotate: 0 }}
                            //exit={{ opacity: 0, y: "100%" }}
                            transition={{ duration: 0.5 }}
                            key={mapId} // Ensure animation runs for each new ID
                        >
                            {
                                maps.find((e) => e.id === mapId)?.name || ""
                            }
                        </motion.div>
                    )}
                </AnimatePresence>                
            </div>
            <AnimatePresence>
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
                            { !isAnimating && <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-0 flex gap-2 items-center text-sm">NEXT <TbPlayerTrackNextFilled />
                            </motion.div> }
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
            </AnimatePresence>
        </div>
    );
};

export default UnityMap;
