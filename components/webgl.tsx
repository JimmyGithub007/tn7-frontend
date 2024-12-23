"use client";

import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./navbar";

const heroes = [
    { id: 1, name: "HERO JIMMY" },
    { id: 2, name: "HERO TERRY" },
    { id: 3, name: "HERO PANG" },
    { id: 4, name: "HERO UNKNOWN" },
];

const WebGL = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedHeroId, setSelectedHeroId] = useState(0);

    const { unityProvider, isLoaded, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "build/v6.loader.js",
        dataUrl: "build/v6.data.unityweb",
        frameworkUrl: "build/v6.framework.js.unityweb",
        codeUrl: "build/v6.wasm.unityweb",
    });

    const [isClient, setIsClient] = useState(false);
    const loadingPercentage = Math.round(loadingProgression * 100);

    const handleClickHero = useCallback((heroId: any) => {
        console.log(heroId)
        setSelectedHeroId(heroId)
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        addEventListener("ReactClickHero", handleClickHero);
        return () => {
            removeEventListener("ReactClickHero", handleClickHero);
        };
    }, [addEventListener, removeEventListener, handleClickHero]);

    if (!isClient) {
        return null; // Don't render the Unity component on the server
    }

    return (
        <div className="bg-black relative h-screen w-full overflow-hidden">
            <AnimatePresence>
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
            <div className="absolute flex justify-center h-12 overflow-hidden top-[20%] w-full">
                <AnimatePresence>
                    {  !isMenuOpen && selectedHeroId > 0 && (
                        <motion.div
                            className="font-bold text-5xl text-white"
                            initial={{ y: "100%", rotate: 3 }}
                            animate={{ y: "0%", rotate: 0 }}
                            //exit={{ opacity: 0, y: "100%" }}
                            transition={{ duration: 0.5 }}
                            key={selectedHeroId} // Ensure animation runs for each new ID
                        >
                            {
                                heroes.find((e) => e.id === selectedHeroId)?.name || ""
                            }
                        </motion.div>
                    )}
                </AnimatePresence>                
            </div>

            <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
            <Unity className={`h-full w-full ${isMenuOpen ? "pointer-events-none" : ""}`} unityProvider={unityProvider} />
        </div>
    );
};

export default WebGL;