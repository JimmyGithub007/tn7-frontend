"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface BlurLoadingFrameProps {
    src: string;
    alt: string;
}

const BlurLoadingFrame = ({ src, alt }: BlurLoadingFrameProps) => {
    return (
        <motion.div
            id="loader"
            className="absolute flex h-full items-center justify-center left-0 w-full top-0 z-[300]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        >
            <div className="relative w-full h-full overflow-hidden">
                {/* 模糊背景图片 */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        scale: [1.01, 1.02, 1.01],
                        filter: ["blur(8px)", "blur(12px)", "blur(8px)"],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* 动态模糊效果层 */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* 动态光效 */}
                {/*<motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />*/}
            </div>
        </motion.div>
    );
};

export default BlurLoadingFrame;