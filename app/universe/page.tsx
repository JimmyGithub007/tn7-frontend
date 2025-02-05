"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/free-mode';
import Image from 'next/image';

const universes = [
    { id: 1, name: "TN7 WORLD LORE", url: "/assets/images/universe/world_lore.png" },
    { id: 2, name: "TN7 WORLD MAP", url: "/assets/images/universe/world_map.png" },
    { id: 2, name: "PUBLIC ENTRIES", url: "/assets/images/universe/public_entries.png" },
    { id: 2, name: "VIDEOS", url: "/assets/images/universe/videos.png" }
];

const Universe = () => {
    return (<div className="fixed flex justify-center items-center bg-cover bg-no-repeat h-screen top-0 w-full" style={{ backgroundImage: `url(./assets/images/universe/Background.png)` }}>

        <Swiper
            loop={false}
            freeMode={true}
            slidesPerView={3}
            spaceBetween={30}
            centeredSlides={true}
            modules={[ FreeMode ]}
        >
            {
                universes?.map((value, key) => (
                    <SwiperSlide key={key}>
                        <div className="cursor-pointer relative h-[585.5px] w-[410.5px]">
                            <Image className="absolute h-[585.5px] w-[410.5px]" alt={`universe`} width={1642} height={2342} src={value.url} priority />
                            <div className="absolute bottom-16 font-bold w-full text-2xl text-center text-white">{value.name}</div>
                        </div>
                    </SwiperSlide>
                ))
            }
        </Swiper>

    </div>)
}

export default Universe;