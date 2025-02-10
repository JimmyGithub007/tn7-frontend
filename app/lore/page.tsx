"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components";

const childrens = [
    { id: 1, name: "THE TEMPLE ON THE HILL", img: "TempleontheShrine.png", categoryId: 2 },
    { id: 2, name: "THE PINNACLE TOWERS", img: "Synthcity HQ.PNG", categoryId: 2 },
    { id: 4, name: "THE WATERING HOLE", img: "WateringHole.PNG", categoryId: 2 },
    { id: 5, name: "KOI AND LOTUS CLUB", img: "KoiandLotusClub.PNG", categoryId: 2 },
    { id: 6, name: "THE CODEX", img: "TheCodex.JPG", categoryId: 2 },
    { id: 7, name: "THE GATEL", img: "NewHelm Gates.PNG", categoryId: 2 },
    { id: 8, name: "AKIO INDUSTRIES HQ", img: "NewHelm HQ.JPG", categoryId: 2 },
    { id: 9, name: "THE ENERGY FIELD", img: "NewHelm_enerrgyfield.jpeg", categoryId: 2 },
];

const Lore = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loreId, setLoreId] = useState<number>(0);
    const [menuId, setMenuId] = useState<number>(3);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

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
                <div className="relative flex flex-col z-10 text-white w-full items">
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
                            <div onClick={() => setMenuId(menu.id) } className="cursor-pointer h-16 z-10 flex items-center relative" key={key}>
                                <AnimatePresence>
                                {    menu.id === menuId && 
                                    <motion.img initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute h-[inherit]" alt="" width={1384} height={350} src={`/assets/images/lore/SideBarMenuHover.png`} />
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
                    <Image className="absolute scale-[1.15]" alt="" height={2573} width={4374} src={`/assets/images/lore/ContentFrame.png`} priority />
                    <AnimatePresence>
                        {
                            loreId > 0 && 
                            <motion.div className="absolute scale-[1.15] z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <Image className="" alt="" height={2573} width={4374} src={`/assets/images/lore/ContentFrame2.png`} priority />        
                            </motion.div>
                        }                    
                    </AnimatePresence>
                    <div className="absolute gap-8 grid grid-cols-4 z-10">
                        <AnimatePresence>
                            {
                                childrens.map((value, key) => (
                                    <motion.div key={key} onClick={() => setLoreId(value.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cursor-pointer group relative">
                                        <Image className="duration-300 group-hover:scale-105 group-hover:saturate-200 z-10" alt="" height={2048} width={2048} src={`/assets/images/lore/${value.img}`} priority />
                                        <div className="absolute bottom-6 font-bold px-4 text-white text-center text-xs sm:text-sm/5 md:text-md/5 lg:text-lg/5 w-full" style={{ textShadow: "black 1px 4px" }}>{value.name}</div>
                                    </motion.div>
                                ))
                            }
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export default Lore;