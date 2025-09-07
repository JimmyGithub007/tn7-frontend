"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import GlitchText from "./GlitchText";

interface LoaderProps {
    setIsLoadedParent?: (value: boolean) => void;
}

const Loader = ({ setIsLoadedParent }: LoaderProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState(0);

    useEffect(() => {
        setTimeout(() => setIsLoadedParent?.(isLoaded), 1000);
    }, [isLoaded]);

    useEffect(() => {
        // Simulate loading process
        const interval = setInterval(() => {
            setLoadingPercentage((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoaded(true), 500); // Delay after reaching 100%
                    return 100;
                }
                return prev + 5; // Increase percentage every interval
            });
        }, 100); // 100 ms interval for smoother progress
    }, []);

    return (<AnimatePresence>
        {!isLoaded && (
            <motion.div
                id="loader"
                className="absolute flex h-full items-center justify-center left-0 w-full top-0 bg-black z-[300]"
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <GlitchText text={`${loadingPercentage}%`} />
            </motion.div>
        )}
    </AnimatePresence>)
}

export default Loader;