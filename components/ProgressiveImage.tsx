"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProgressiveImageProps {
    lowQualitySrc: string;
    highQualitySrc: string;
    alt: string;
    width: number;
    height: number;
    className?: string;  // 新增 className 属性
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
    lowQualitySrc,
    highQualitySrc,
    alt,
    width,
    height,
    className = "",
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
        >
            <Image
                src={lowQualitySrc}
                alt={alt}
                width={50}
                height={50}
                className="blur-sm h-full w-full"
            />
            <Image
                src={highQualitySrc}
                alt={alt}
                width={width}
                height={height}
                quality={100}
                onLoadingComplete={() => setIsLoaded(true)}
                    className={`absolute duration-700 ease-in-out h-full inset-0 transition-opacity w-full z-10 ${isLoaded ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    );
};

export default ProgressiveImage;

