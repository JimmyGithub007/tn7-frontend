"use client";

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/free-mode';
import Image from 'next/image';
import { Navbar } from '@/components';

const universes = [
    { id: 1, name: "TN7 WORLD LORE", url: "/assets/images/universe/world_lore.png" },
    { id: 2, name: "TN7 WORLD MAP", url: "/assets/images/universe/world_map.png" },
    { id: 2, name: "PUBLIC ENTRIES", url: "/assets/images/universe/public_entries.png" },
    { id: 2, name: "VIDEOS", url: "/assets/images/universe/videos.png" }
];

const Universe = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
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

    return (<div className="fixed flex justify-center items-center bg-cover bg-no-repeat h-screen top-0 w-full" style={{ backgroundImage: `url(./assets/images/universe/Background.png)` }}>
        <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
        <Swiper
            loop={false}
            freeMode={true}
            slidesPerView={4}
            spaceBetween={20}
            centeredSlides={true}
            modules={[FreeMode]}
        >
            {
                universes?.map((value, key) => (
                    <SwiperSlide key={key}
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
                            <Image className="absolute duration-300 hover:saturate-200 h-[585.5px] w-[410.5px]" alt={`universe`} width={1642} height={2342} src={value.url} priority />
                            <div className="absolute bottom-16 font-bold w-full text-2xl text-center text-white">{value.name}</div>
                        </motion.div>
                    </SwiperSlide>
                ))
            }
        </Swiper>
    </div>)
}

export default Universe;