"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components";
import { TbArrowBackUp } from "react-icons/tb";
import { transition } from "three/examples/jsm/tsl/display/TransitionNode.js";

const childrens = [
    { id: 1, name: "THE TEMPLE ON THE HILL", img: "b1.png", categoryId: 2 },
    { id: 2, name: "THE PINNACLE TOWERS", img: "b2.png", categoryId: 2 },
    { id: 3, name: "SILVERCOIN DISTRICT", img: "b3.png", categoryId: 2 },
    { id: 4, name: "THE WATERING HOLE", img: "b4.png", categoryId: 2 },
    { id: 5, name: "KOI AND LOTUS CLUB", img: "b5.png", categoryId: 2 },
    { id: 6, name: "THE CODEX", img: "b6.png", categoryId: 2 },
    { id: 7, name: "THE GATEL", img: "b7.png", categoryId: 2 },
    { id: 8, name: "AKIO INDUSTRIES HQ", img: "b8.png", categoryId: 2 },
    { id: 9, name: "THE ENERGY FIELD", img: "b9.png", categoryId: 2 },
];

const Lore = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loreId, setLoreId] = useState<number>(0);
    const [menuId, setMenuId] = useState<number>(3);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [imgHeight, setImgHeight] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

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

    return (<div className="fixed flex justify-center items-center bg-cover bg-no-repeat h-screen top-0 w-screen" style={{ backgroundImage: `url(./assets/images/lore/Background.png)` }}>
        <AnimatePresence>
            {!isLoaded && (
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
        <div className="flex items-center h-full w-full">
            <div className="h-full hidden lg:flex w-[350px] flex-col items-center justify-center -ml-16">
                <Image className="z-10" alt="" width={1384} height={289} src={`/assets/images/lore/SideBarFrameTop.png`} priority />
                <div className="relative flex flex-col z-10 w-full items">
                    <Image className="absolute h-96" alt="" width={1384} height={1865} src={`/assets/images/lore/SideBarFrameBody.png`} priority />
                    {
                        [
                            { id: 1, title: "CHARACTERS", url: "" },
                            { id: 2, title: "CITIES", url: "" },
                            { id: 3, title: "LOCATIONS", url: "" },
                            { id: 4, title: "CLAIMS", url: "" },
                            { id: 5, title: "BADGES", url: "" },
                            { id: 6, title: "GOVERNMENT", url: "" }
                        ].map((menu, key) => (
                            <div onClick={() => setMenuId(menu.id)} className={`cursor-pointer duration-300 flex h-16 items-center relative text-white z-10 ${menu.id != menuId && "hover:text-yellow-400"}`} key={key}>
                                <AnimatePresence>
                                    {menu.id === menuId &&
                                        <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute h-[inherit]" alt="" width={1384} height={350} src={`/assets/images/lore/SideBarMenuHover.png`} />
                                    }
                                </AnimatePresence>
                                <span className="px-20 z-10">{menu.title}</span>
                            </div>
                        ))
                    }
                </div>
                <Image className="z-10" alt="" width={1384} height={289} src={`/assets/images/lore/SideBarFrameBottom.png`} priority />
            </div>
            <div className="h-full w-full flex items-center justify-center">
                <div className="relative w-[80%] max-w-[1000px] h-full flex items-center">
                    <Image className="invisible sm:visible absolute scale-[1.15]" alt="contentFrameHorizontal" height={2573} width={4374} src={`/assets/images/lore/ContentFrameHorizontal.png`} priority />
                    <Image className="sm:invisible absolute scale-[1.25]" alt="contentFrameVertical" height={2573} width={4374} src={`/assets/images/lore/ContentFrameVertical.png`} priority />
                    <AnimatePresence>
                        {
                            loreId > 0 ?
                                <motion.div className={`absolute z-20`} 
                                    style={{ scale: isMobile ? "1.25" : "1.15" }}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                                >
                                    <div className="relative">
                                        <Image className="" alt="" height={2573} width={4374} src={`/assets/images/lore/b${loreId}${isMobile ? "Vertical" : "Horizontal"}.png`} priority />
                                        <motion.div className={`absolute ${ !isMobile ? "right-[6%] top-[18%]" : "top-[48%]" } filter-bar flex flex-col gap-2 sm:gap-4 overflow-x-hidden overflow-y-auto px-10 text-white`} 
                                            style={{ height: isMobile ? imgHeight * 45/100 : imgHeight * 70 / 100, width: isMobile ? "90%" : "45%" }}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <div className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">{childrens.find(e => e.id === loreId)?.name}</div>
                                            <div className="text-xs md:text-sm lg:text-md xl:text-lg">
                                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                            </div>
                                        </motion.div>
                                        <TbArrowBackUp onClick={() => setLoreId(0)} className={`absolute cursor-pointer duration-200 hover:opacity-50 ${isMobile ? "right-[12%]" : "right-[6%]"} text-white text-4xl top-[10%] z-20`} />
                                    </div>
                                </motion.div> :
                                <div className="absolute filter-bar gap-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 z-10 overflow-x-hidden overflow-y-auto p-4" style={{ height: imgHeight * 80 / 100 }}>
                                    {
                                        childrens.map((value, key) => (
                                            <motion.div key={key} onClick={() => setLoreId(value.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 * key }} className="cursor-pointer group relative">
                                                <Image className="duration-300 group-hover:scale-105 group-hover:saturate-200 z-10" alt="" height={2048} width={2048} src={`/assets/images/lore/${value.img}`} priority />
                                                <div className="absolute bottom-6 font-bold px-4 text-white text-center text-xs sm:text-sm/5 md:text-md/5 lg:text-lg/5 w-full" style={{ textShadow: "black 1px 4px" }}>{value.name}</div>
                                            </motion.div>
                                        ))
                                    }
                                </div>
                        }
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </div>)
}

export default Lore;