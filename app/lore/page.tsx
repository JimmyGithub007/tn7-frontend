"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar, ProgressiveImage } from "@/components";
import { TbArrowBackUp } from "react-icons/tb";
import { useSearchParams } from 'next/navigation';

import Image from "next/image";
import Link from "next/link";

const contents = [
    { id: "1", name: "SHIN", img: "c1", category: "characters" },
    { id: "2", name: "GAMA", img: "c2", category: "characters" },
    { id: "3", name: "EDWARD", img: "c3", category: "characters" },
    { id: "4", name: "HARU", img: "c4", category: "characters" },
    { id: "5", name: "BARTENDER", img: "c5", category: "characters" },
    { id: "6", name: "GANGSTER", img: "c6", category: "characters" },
    { id: "7", name: "GANGSTER", img: "c7", category: "characters" },
    { id: "8", name: "GANGSTER", img: "c8", category: "characters" },

    { id: "1", name: "SYNTHCITY", img: "city1", category: "cities" },
    { id: "2", name: "CYBERVALLEY", img: "city2", category: "cities" },
    { id: "3", name: "NEW HELM", img: "city3", category: "cities" },

    { id: "1", name: "THE TEMPLE ON THE HILL", img: "b1", category: "locations" },
    { id: "2", name: "THE PINNACLE TOWERS", img: "b2", category: "locations" },
    { id: "3", name: "SILVERCOIN DISTRICT", img: "b3", category: "locations" },
    { id: "4", name: "THE WATERING HOLE", img: "b4", category: "locations" },
    { id: "5", name: "KOI AND LOTUS CLUB", img: "b5", category: "locations" },
    { id: "6", name: "THE CODEX", img: "b6", category: "locations" },
    { id: "7", name: "THE GATEL", img: "b7", category: "locations" },
    { id: "8", name: "AKIO INDUSTRIES HQ", img: "b8", category: "locations" },
    { id: "9", name: "THE ENERGY FIELD", img: "b9", category: "locations" },

    { id: "1", name: "THE WHITE LILY", img: "c1", category: "clans" },
    { id: "2", name: "THE REAPER'S HAND", img: "c2", category: "clans" },
    { id: "3", name: "AKIO'S INDUSTRIES", img: "c3", category: "clans" },
    { id: "4", name: "THE MISFITS", img: "c4", category: "clans" },

    { id: "1", name: "LUNEX (LX)", img: "c1", category: "currency" },
    { id: "2", name: "LUNEX (LX)", img: "c2", category: "currency" },
    { id: "3", name: "LUNEX (LX)", img: "c3", category: "currency" },
    { id: "4", name: "LUNEX (LX)", img: "c4", category: "currency" },

    { id: "1", name: "CANE", img: "b1", category: "badges" },
    { id: "2", name: "LILY", img: "b2", category: "badges" },
    { id: "3", name: "BLADE", img: "b3", category: "badges" },
    { id: "4", name: "GONG", img: "b4", category: "badges" },
    { id: "5", name: "BAT", img: "b5", category: "badges" },
    { id: "6", name: "HARU HAT", img: "b6", category: "badges" },
    { id: "7", name: "AKIO ARM", img: "b7", category: "badges" },
    { id: "8", name: "ASSASSIN", img: "b8", category: "badges" },
    { id: "9", name: "SHIN CLAN", img: "b9", category: "badges" },
    { id: "10", name: "REIKO CLAN", img: "b10", category: "badges" },
    { id: "11", name: "AKIO CLAN", img: "b11", category: "badges" },
    { id: "12", name: "PKCHUE", img: "b12", category: "badges" },
    
    { id: "1", name: "DRAGON", img: "g1", category: "government" },
];

const Content = () => {
    const searchParams = useSearchParams()
    
    const [category, setCategory] = useState<string>("cities");
    const [loreId, setLoreId] = useState<string>("0");
    const [imgHeight, setImgHeight] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        if (searchParams) {  // Ensure the router is ready before accessing query
            if(searchParams.has("category")) setCategory(searchParams.get("category") as string);
            if(searchParams.has("id")) setLoreId(searchParams.get("id") as string);
        }
    }, [searchParams]);

    const calculateImgHeight = () => {
        // 使用图片的比例或任何逻辑动态计算高度
        let contentFrame = document.querySelector("img[alt='contentFrameHorizontal']"); // 选择你的 ContentFrame 图片
        if(window.innerWidth < 640) {
            setIsMobile(true);
            contentFrame = document.querySelector("img[alt='contentFrameVertical']"); // 选择你的 ContentFrame 图片
        } else {
            setIsMobile(false);
        }

        if (contentFrame) {
            const height = contentFrame.clientHeight;
            setImgHeight(height);
        }
    };

    useEffect(() => {
        // 初始化时计算高度
        calculateImgHeight();

        // 监听 resize 事件
        window.addEventListener("resize", calculateImgHeight);

        // 清除监听器
        return () => {
            window.removeEventListener("resize", calculateImgHeight);
        };
    }, []);

    return (    <div className="flex items-center h-full w-full">
        <div className="h-full hidden lg:flex w-[350px] flex-col items-center justify-center -ml-16">
            <Image className="z-10" alt="" width={1384} height={289} src={`/assets/images/lore/SideBarFrameTop.png`} priority />
            <div className="relative flex flex-col z-10 w-full items">
                <Image className="absolute h-[448px]" alt="" width={1384} height={1865} src={`/assets/images/lore/SideBarFrameBody.png`} priority />
                {
                    [
                        { id: "characters", title: "CHARACTERS", url: "" },
                        { id: "cities", title: "CITIES", url: "" },
                        { id: "locations", title: "LOCATIONS", url: "" },
                        { id: "clans", title: "CLANS", url: "" },
                        { id: "currency", title: "CURRENCY", url: "" },
                        { id: "badges", title: "BADGES", url: "" },
                        { id: "government", title: "GOVERNMENT", url: "" }
                    ].map((menu, key) => (
                        <Link 
                            href={{ pathname: '/lore', query: { category: menu.id, id: "0" } }}
                            className={`cursor-pointer duration-300 flex h-16 items-center relative text-white z-10 ${menu.id != category && "hover:text-yellow-400"}`} key={key}>
                            <AnimatePresence>
                                {   menu.id === category &&
                                    <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute h-[inherit]" alt="" width={1384} height={350} src={`/assets/images/lore/SideBarMenuHover.png`} />
                                }
                            </AnimatePresence>
                            <span className="px-20 z-10">{menu.title}</span>
                        </Link>
                    ))
                }
            </div>
            <Image className="z-10" alt="" width={1384} height={289} src={`/assets/images/lore/SideBarFrameBottom.png`} priority />
        </div>
        <div className="h-full w-full flex items-center justify-center">
            <div className="relative w-[80%] max-w-[1200px] h-full flex items-center">
                <Image className="invisible sm:visible absolute scale-[1.2]" alt="contentFrameHorizontal" height={1287} width={2187} src={`/assets/images/lore/webp/ContentFrameHorizontal.webp`} priority />
                <Image className="sm:invisible absolute scale-[1.25]" alt="contentFrameVertical" height={2187} width={1287} src={`/assets/images/lore/webp/ContentFrameVertical.webp`} priority />
                <AnimatePresence>
                    {
                        loreId != "0" ?
                            <motion.div className={`absolute z-20 ${isMobile ? "scale-[1.25]" : "scale-[1.2]"}`}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                            >
                                <div className="relative">
                                    <ProgressiveImage
                                        className="duration-300 group-hover:scale-105 group-hover:saturate-200"
                                        lowQualitySrc={`/assets/images/lore/${category}/webp/tiny/b${loreId}${isMobile ? "Vertical" : "Horizontal"}.webp`}
                                        highQualitySrc={`/assets/images/lore/${category}/webp/b${loreId}${isMobile ? "Vertical" : "Horizontal"}.webp`}
                                        alt={``}
                                        width={2187}
                                        height={1287}
                                    />
                                    <motion.div className={`absolute ${ isMobile ? "top-[47%] w-[90%]" : "right-[6%] top-[18%] w-[45%]" } filter-bar flex flex-col gap-2 sm:gap-4 overflow-x-hidden overflow-y-auto px-10 text-white z-20`} 
                                        style={{ height: isMobile ? imgHeight * 45/100 : imgHeight * 70 / 100 }}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
                                    >
                                        <div className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">{contents.find(e => e.category === category && e.id === loreId)?.name}</div>
                                        <div className="text-xs md:text-sm lg:text-md xl:text-lg">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.7 }}
                                        className={`absolute cursor-pointer duration-200 hover:opacity-50 ${isMobile ? "left-[12%] top-[5%]" : "right-[6%] top-[10%]"} text-white text-4xl z-20`}>
                                        <Link href={{ pathname: '/lore', query: { category: category, id: "0" } }}>
                                            <TbArrowBackUp />
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div> :
                            (
                                category === "locations" || category === "cities" ? 
                                    <div className={`absolute filter-bar gap-6 grid grid-cols-1 ${category === "locations" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-2"} z-10 overflow-x-hidden overflow-y-auto px-4`}
                                    style={{ height: imgHeight * 80 / 100 }}>
                                    {
                                        contents.map((value, key) => {
                                            if(value.category === category) return <motion.div key={key} 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0 }} 
                                                transition={{ duration: 0.8, delay: 0.1 * parseInt(value.id) }} 
                                                className="cursor-pointer group relative">
                                                <Link href={{ pathname: '/lore', query: { category: category, id: value.id } }}>
                                                    <ProgressiveImage
                                                        className="duration-300 group-hover:scale-105 group-hover:saturate-200"
                                                        lowQualitySrc={`/assets/images/lore/${category}/webp/tiny/${value.img}.webp`}
                                                        highQualitySrc={`/assets/images/lore/${category}/webp/${value.img}.webp`}
                                                        alt={`lore ${value.name}`}
                                                        width={532}
                                                        height={532}
                                                    />
                                                    <div className="absolute bottom-6 font-bold px-4 text-white text-center text-sm sm:text-md/5 md:text-lg/5 lg:text-xl/5 w-full z-10" style={{ textShadow: "black 1px 4px" }}>{value.name}</div>
                                                </Link>
                                            </motion.div>
                                        })
                                    }
                                </div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} 
                                    className="font-bold flex justify-center items-center text-5xl text-white w-full z-10"
                                    style={{ height: imgHeight * 80 / 100 }}>
                                    COMING SOON
                                </motion.div>
                            )
                    }
                </AnimatePresence>
            </div>
        </div>
    </div>)
}

const Lore = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState(0);

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

    return (<div className="fixed h-screen w-full">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/lore/Background.png`} priority />
        <AnimatePresence>
            {   !isLoaded && (
                <motion.div
                    id="loader"
                    className="absolute flex h-full items-center justify-center left-0 w-full top-0 bg-black z-[100]"
                    initial={{ y: 0 }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                >
                    <span className="font-bold text-5xl text-white">{loadingPercentage}%</span>
                </motion.div>
            )}
        </AnimatePresence>
        <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
        <Suspense fallback={
            <div className="absolute flex h-full items-center justify-center left-0 w-full top-0 bg-black z-[100]">
                <span className="font-bold text-5xl text-white">0%</span>
            </div>
        }>
            <Content />
        </Suspense>
    </div>)
}

export default Lore;