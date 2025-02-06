"use client";

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { AnimatePresence, motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/free-mode';
import Image from 'next/image';
import { Navbar } from '@/components';
import Link from 'next/link';

const universes = [
    { id: 1, name: "TN7 WORLD LORE", image: "world_lore.png", url: "/lore" },
    { id: 2, name: "TN7 WORLD MAP", image: "world_map.png", url: "/unity/map" },
    { id: 3, name: "PUBLIC ENTRIES", image: "public_entries.png", url: "/publicentries" },
    { id: 4, name: "VIDEOS", image: "videos.png", url: "/videos" }
];

const Universe = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

        // Mouse movement tracking for the parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = clientX - window.innerWidth / 2;
            const y = clientY - window.innerHeight / 2;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="fixed flex justify-center items-center bg-cover bg-no-repeat h-screen top-0 w-full" /*style={{ backgroundImage: `url(./assets/images/universe/Background.png)` }}*/>
            <Image className="absolute" alt="" width={5760} height={3260} src={`/assets/images/universe/Background.png`} priority />
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
            {isLoaded && (
                <>
                    <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
                    <Swiper
                        loop={false}
                        freeMode={true}
                        slidesPerView={4}
                        spaceBetween={20}
                        centeredSlides={true}
                        modules={[FreeMode]}
                    >
                        {universes.map((value, key) => (
                            <SwiperSlide
                                key={value.id}
                                style={{
                                    transform: `translateX(${mousePosition.x * 0.02}px)`,
                                }}
                            >
                                <motion.div
                                    className="cursor-pointer relative h-[585.5px] w-[410.5px]"
                                    initial={{ opacity: 0, x: "50px" }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: key * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={value.url}>
                                        <Image
                                            className="absolute duration-300 hover:saturate-200 h-[585.5px] w-[410.5px]"
                                            alt={`universe ${value.name}`}
                                            width={1642}
                                            height={2342}
                                            src={`/assets/images/universe/${value.image}`}
                                            priority
                                        />
                                        <div className="absolute bottom-16 font-bold w-full text-2xl text-center text-white">
                                            {value.name}
                                        </div>
                                    </Link>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </>
            )}
        </div>
    );
};

export default Universe;
