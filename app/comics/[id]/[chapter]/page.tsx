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
import { useParams } from "next/navigation";

// 示例 Webtoon 图片列表（模拟后端数据）
const comics = [
    { id: "azuki", name: "AZUKI" },
    { id: "pk", name: "PK OON: ORIGINS" },
    { id: "thepathofvengeance", name: "THE PATH OF VENGEANCE" }
];

const content = [
    { id: "1", title: "PRELUDE" },
    { id: "2", title: "EPISODE 1" },
    { id: "3", title: "EPISODE 2" }
];

const ComicsChapter = () => {
    const params = useParams();
    const id = params.id;
    const chapter = params.chapter;

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
                <div className="flex items-center gap-2 text-white"><Link className="underline" href={`/comics/${id}`}>{comics.find(e => e.id === id)?.name || ""}</Link> <IoIosArrowForward /> {content.find(e => e.id === chapter)?.title}</div>
                <div className="flex gap-4 justify-center">
                    <Link href={`/comics/${id}/${Number(chapter) > 1 ? Number(chapter) - 1 : chapter}`} className={`${Number(chapter) === 1 ? "opacity-20 cursor-not-allowed" : "hover:opacity-50" } bg-white duration-300 rounded-sm text-4xl`}><IoIosArrowBack /></Link>
                    <button className="text-white underline" onClick={() => { setIsOpenDropDown(!isOpenDropDown); }}>#{chapter}</button>
                    <Link href={`/comics/${id}/${Number(chapter) < 3 ? Number(chapter) + 1 : chapter}`} className={`${Number(chapter) === 3 ? "opacity-20 cursor-not-allowed" : "hover:opacity-50" } bg-white duration-300 rounded-sm text-4xl`}><IoIosArrowForward /></Link>
                </div>
                <div className="hidden md:flex gap-4 items-center justify-end text-white">
                    <FaFacebookF className="cursor-pointer duration-300 hover:opacity-50" />
                    <FaXTwitter className="cursor-pointer duration-300 hover:opacity-50" />
                    <FaCopy className="cursor-pointer duration-300 hover:opacity-50" />
                </div>
                <AnimatePresence>
                {
                    isOpenDropDown && <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="absolute bg-black flex gap-8 h-36 items-center justify-center w-full top-28 md:top-16 text-white">
                        {
                            content.map((value, key) => (
                                <Link key={key} href={`/comics/${id}/${value.id}`} className={`${value.id === chapter ? "opacity-30 cursor-not-allowed" : ""} flex flex-col gap-2 group items-center`}>
                                    <Image className={`${value.id === chapter ? "border-4 border-green-400" : "group-hover:saturate-150 group-hover:scale-105"} duration-300 w-20`} alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
                                    <div className={`${value.id === chapter ? "text-green-400" : ""}`}>{value.title}</div>
                                </Link>
                            ))
                        }
                    </motion.div>
                }
                </AnimatePresence>
            </motion.div> }                
            </AnimatePresence>
            <div className="max-w-[800px]">
                {[1, 2, 3, 4, 5, 6].map((value, index) => (
                    <Image
                        key={index}
                        src={`/assets/images/comics/chapter${chapter}/0${value}.png`}
                        width={1876}
                        height={1900}
                        alt={`${index + 1}`}
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
