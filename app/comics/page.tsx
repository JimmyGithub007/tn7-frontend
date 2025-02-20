"use client";

import { useState } from "react";
import { Loader } from "@/components";
import { useRouter } from "next/navigation";

import Image from "next/image";

const Comics = () => {
    const router = useRouter();

    return (
        <div className="bg-black h-screen w-full text-white flex flex-col justify-center items-center text-nowrap overflow-y-hidden">
            <Loader />
            <div className="flex gap-16">
                <div className="flex flex-col items-center justify-end">
                <div className="cursor-pointer duration-300 hover:saturate-200 flex flex-col items-center" onClick={() => { router.push(`/comics/1`) }}>
                        <Image alt="" className="h-28 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/webp/comicsBGVertical.webp`} />
                        <div className="text-2xl">SECRET OF THE VALLEY 1</div>
                    </div>
                    <div className="rounded-full h-20 w-[2px] bg-white"></div>
                    <div>17 JAN 2025</div>
                </div>
                <div className="flex flex-col items-center justify-end">
                <div className="cursor-pointer duration-300 hover:saturate-200 flex flex-col items-center" onClick={() => { router.push(`/comics/1`) }}>
                        <Image alt="" className="h-28 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/webp/comicsBGVertical.webp`} />
                        <div className="text-2xl">SECRET OF THE VALLEY 3</div>
                    </div>
                    <div className="rounded-full h-8 w-[2px] bg-white"></div>
                    <div>22 FEB 2025</div>
                </div>
            </div>

            <div className="border-y-2 text-center text-4xl font-bold tracking-[50px] min-w-full">TN7 PHASE ONE</div>

            <div className="flex gap-16">
                <div className="flex flex-col items-center justify-start">
                    <div>21 JUNE 2025</div>
                    <div className="rounded-full h-8 w-[2px] bg-white"></div>
                    <div className="cursor-pointer duration-300 hover:saturate-200 flex flex-col items-center" onClick={() => { router.push(`/comics/1`) }}>
                        <Image alt="" className="h-28 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/webp/comicsBGVertical.webp`} />
                        <div className="text-2xl">SECRET OF THE VALLEY 2</div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-start">
                    <div>30 JULY 2025</div>
                    <div className="rounded-full h-20 w-[2px] bg-white"></div>
                    <div className="cursor-pointer duration-300 hover:saturate-200 flex flex-col items-center" onClick={() => { router.push(`/comics/1`) }}>
                        <Image alt="" className="h-28 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/webp/comicsBGVertical.webp`} />
                        <div className="text-2xl">SECRET OF THE VALLEY 4</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comics;
