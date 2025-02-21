"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { motion } from "framer-motion";
import { FaCopy, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Loader } from "@/components";
import Image from "next/image";
import Link from "next/link";

// 示例 Webtoon 图片列表（模拟后端数据）
const content = [
    "/assets/images/comics/chapter1/text_01.png",
    "/assets/images/comics/chapter1/text_02.png",
    "/assets/images/comics/chapter1/text_03.png",
    "/assets/images/comics/chapter1/text_04.png",
    "/assets/images/comics/chapter1/text_05.png",
    "/assets/images/comics/chapter1/text_06.png",
];

const ComicsChapter = () => {
    const [ isTop, setIsTop ] = useState<boolean>(true);
    const [ isOpenDropDown, setIsOpenDropDown ] = useState<boolean>(true);

    const scrollToTop = () => {
        window.scrollTo({ top:0, behavior: "smooth" });
    }

    useEffect(() => {
        setIsOpenDropDown(false);
    }, [isTop])

    useEffect(() => {
        const scrollEvent = () => {
            if(window.scrollY > 0) {
                setIsTop(false);
            } else {
                setIsTop(true);
            }
        }

        window.addEventListener("scroll", scrollEvent);
        return () => window.removeEventListener("scroll", scrollEvent);
    }, [])

    return (
        <div className="flex flex-col items-center bg-black min-h-screen">
            <Loader />
            <AnimatePresence>
            {   isTop && <motion.div  
                initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-black fixed gap-2 grid grid-cols-1 md:grid-cols-3 h-28 md:h-16 items-center px-8 shadow-md shadow-slate-700/10 text-xl top-0 w-full relative z-[20]" id="comicsHeader">
                <div className="flex items-center gap-2 text-white"><Link href={`/comics/1`}>SECRET OF THE VALLEY</Link> <IoIosArrowForward /> Episode 1</div>
                <div className="flex gap-4 justify-center">
                    <button className="bg-white duration-300 hover:opacity-50 rounded-sm text-4xl"><IoIosArrowBack /></button>
                    <button onClick={() => { setIsOpenDropDown(!isOpenDropDown); }} className="text-white">#1</button>
                    <button className="bg-white duration-300 hover:opacity-50 rounded-sm text-4xl"><IoIosArrowForward /></button>
                </div>
                <div className="hidden md:flex gap-4 items-center justify-end text-white">
                    <FaFacebookF className="cursor-pointer duration-300 hover:opacity-50" />
                    <FaXTwitter className="cursor-pointer duration-300 hover:opacity-50" />
                    <FaCopy className="cursor-pointer duration-300 hover:opacity-50" />
                </div>
                <AnimatePresence>
                {
                    isOpenDropDown && <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute bg-black flex gap-8 h-36 items-center justify-center w-full top-28 md:top-16 text-white">
                        <div className="cursor-pointer flex flex-col gap-2 group items-center opacity-30">
                            <Image className="duration-300 group-hover:saturate-150 w-20" alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
                            <div>Prelude</div>
                        </div>
                        <div className="cursor-pointer flex flex-col gap-2 group items-center">
                            <Image className="border-4 border-green-400 duration-300 group-hover:saturate-150 w-20" alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
                            <div className="text-green-400">Espisode 1</div>
                        </div>
                        <div className="cursor-pointer flex flex-col gap-2 group items-center opacity-30">
                            <Image className="duration-300 group-hover:saturate-150 w-20" alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
                            <div>Espisode 2</div>
                        </div>
                    </motion.div>
                }
                </AnimatePresence>
            </motion.div> }                
            </AnimatePresence>
            <div className="max-w-[800px]">
                {content.map((src, index) => (
                    <Image
                        key={index}
                        src={src}
                        width={1876}
                        height={1900}
                        alt={`Webtoon Page ${index + 1}`}
                        className="object-contain"
                    />
                ))}
            </div>
            <AnimatePresence>
            {   !isTop && <motion.button 
                    onClick={() => scrollToTop() } 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="duration-300 fixed flex flex-col hover:bg-white/50 items-center justify-center bg-white bottom-12 right-12 h-12 shadow-md shadow-slate-100/20 w-12">
                    <IoIosArrowUp /> TOP
                </motion.button>
            }
            </AnimatePresence>
        </div>
    );
}

export default ComicsChapter;
