"use client";

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { AnimatePresence, motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/free-mode';
import Image from 'next/image';
import { Header, ProgressiveImage } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const universes = [
    { id: 1, name: "COMICS", image: "u1", url: "/comics", available: true },
    { id: 2, name: "TN7 LORE", image: "u2", url: "/lore", available: true },
    { id: 3, name: "PUBLIC ENTRIES", image: "u3", url: "/publicentries", available: false },
    { id: 4, name: "VIDEOS", image: "u4", url: "/videos", available: false }
];

const Universe = () => {
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
        }, 50); // 100 ms interval for smoother progress

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
        <div className="fixed flex justify-center h-screen items-center w-full">
            <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/universe/webp/Background.webp`} priority />
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
                    <Header />
                    <Swiper
                        loop={false}
                        freeMode={true}
                        centeredSlides={false}
                        slidesPerView={1}
                        spaceBetween={10}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                                spaceBetween: 10
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 15
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 20
                            },
                            1920: {
                                slidesPerView: 4,
                                spaceBetween: 25
                            },
                            2560: {
                                slidesPerView: 4,
                                spaceBetween: 200
                            },
                        }}
                        modules={[FreeMode, Mousewheel]}
                        mousewheel={true}
                        style={{ paddingRight: "150px" }}
                    >
                        {universes.map((value, key) => (
                            <SwiperSlide
                                key={value.id}
                                style={{
                                    transform: `translateX(${mousePosition.x * 0.02}px)`,
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: key * 0.1 }}
                                    //viewport={{ once: true }}
                                    onClick={() => value.available && router.push(value.url)}
                                    className={`${value.available ? "cursor-pointer" : "cursor-not-allowed"} relative h-full w-full`}>
                                    <ProgressiveImage
                                        className=""
                                        lowQualitySrc={`/assets/images/universe/webp/tiny/${value.image}.webp`}
                                        highQualitySrc={`/assets/images/universe/webp/${value.image}.webp`}
                                        alt={`universe ${value.name}`}
                                        width={821}
                                        height={1171}
                                    />
                                    {!value.available && <Image className="absolute opacity-90 top-0 z-[30]" alt="without frame" width={1642} height={2342} src={`/assets/images/universe/webp/Frame.webp`} />}
                                    {!value.available &&
                                        <div className="absolute flex font-bold h-full items-center justify-center text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-center text-white top-0 w-full z-[30]">
                                            COMING SOON
                                        </div>
                                    }
                                    <div className="absolute bottom-[10%] font-bold text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-center text-white w-full z-10">
                                        {value.name}
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="absolute bottom-4 flex flex-col gap-1 items-center p-1 rounded-3xl text-white">
                        <div className="border-white border-2 flex h-8 items-center justify-center rounded-3xl w-6 z-10">
                            <div className="animate-scroll bg-white h-1 rounded-full w-1"></div>
                        </div>
                        <div>Scroll the mouse/ Drag the box</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Universe;
