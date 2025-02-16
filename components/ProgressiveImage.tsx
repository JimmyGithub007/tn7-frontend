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

    return (<div className={`relative ${className}`}>
        <Image 
            alt=""
            className="blur-sm"
            height={5000}
            width={5000}
            src={lowQualitySrc}
            priority
        />
        <Image
            alt={alt}
            src={highQualitySrc}
            width={width}
            height={height}
            quality={100}
            onLoadingComplete={() => setIsLoaded(true)}
            className={`absolute duration-700 ease-in-out h-full inset-0 transition-opacity w-full z-10 
                ${isLoaded ? "opacity-100" : "opacity-0"
            }`}
        />
    </div>);
};

export default ProgressiveImage;

