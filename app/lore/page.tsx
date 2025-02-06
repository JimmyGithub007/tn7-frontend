"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components";

const lores = [
    { id: 1, name: "Locations" }
];

const childrens = [
    { id: 1, name: "THE TEMPLE OF THE HILL", img: "TempleontheShrine.png", categoryId: 2 },
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

    return (<div className="fixed flex justify-center items-center bg-cover bg-no-repeat h-screen top-0 w-screen" /*style={{ backgroundImage: `url(./assets/images/lore/Background.png)` }}*/>
        <Image className="absolute" alt="" width={5760} height={3260} src={`/assets/images/lore/Background.png`} priority />
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
            <div className="h-full cursor-not-allowed w-[230px] flex items-center">
                <Image className="z-10" alt="" height={2448} width={1384} src={`/assets/images/lore/SideBarFrame2.png`} priority />
            </div>
            <div className="relative gap-8 grid grid-cols-4 p-20 w-[1200px]">
                <Image className="absolute -top-6" alt="" height={2573} width={4374} src={`/assets/images/lore/ContentFrame.png`} priority />
                <AnimatePresence>
                    {
                        loreId > 0 &&
                        <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="absolute -top-6 z-10" alt="" height={2573} width={4374} src={`/assets/images/lore/ContentFrame2.png`} />
                    }
                </AnimatePresence>
                <AnimatePresence>
                    {loreId === 0 ?
                        childrens.map((value, key) => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: key * 0.1, duration: 0.5 }} className="relative" key={key} onClick={() => setLoreId(value.id)}>
                                <Image className="cursor-pointer duration-300 hover:scale-105 hover:saturate-200 z-10 shadow-md shadow-white/10" alt="" height={2048} width={2048} src={`/assets/images/lore/${value.img}`} priority />
                                <div className="absolute text-white bottom-6 w-full text-center text-lg px-4">{value.name}</div>
                            </motion.div>
                        )) : childrens.map((value, key) => (
                            <div className="relative opacity-0" key={key} onClick={() => setLoreId(value.id)}>
                                <Image className="cursor-pointer duration-300 hover:scale-105 hover:saturate-200 z-10 shadow-md shadow-white/10" alt="" height={2048} width={2048} src={`/assets/images/lore/${value.img}`} priority />
                                <div className="absolute text-white bottom-6 w-full text-center text-lg px-4">{value.name}</div>
                            </div>
                        ))
                    }
                </AnimatePresence>
            </div>
        </div>
    </div>)
}

export default Lore;