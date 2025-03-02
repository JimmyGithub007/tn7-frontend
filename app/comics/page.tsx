"use client";

import { useState } from "react";
import { Header, Loader } from "@/components";
import { useRouter } from "next/navigation";

import Image from "next/image";

const Comics = () => {
    const router = useRouter();

    return (
        <div className="bg-black h-screen w-full text-white flex flex-col justify-center items-center text-nowrap overflow-y-hidden">
            <Header />
            <Loader />
            <div className="flex gap-16">
                <div className="flex flex-col items-center justify-end">
                    <div className="cursor-pointer flex flex-col items-center" onClick={() => { router.push(`/comics/azuki`) }}>
                        <Image alt="" className="h-36 opacity-80 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/azuki/webp/profile.webp`} />
                        <div className="text-2xl">AZUKI</div>
                    </div>
                    <div className="rounded-full h-20 w-[2px] bg-white"></div>
                    <div>17 JAN 2025</div>
                </div>
                <div className="flex flex-col items-center justify-end">
                    <div className="cursor-pointer flex flex-col items-center" onClick={() => { router.push(`/comics/pk`) }}>
                        <Image alt="" className="h-48 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/pk/webp/profile.webp`} />
                        <div className="text-2xl">PK OON: ORIGINS</div>
                    </div>
                    <div className="rounded-full h-8 w-[2px] bg-white"></div>
                    <div>05 MAR 2025</div>
                </div>
            </div>
            <div className="border-y-2 text-center text-4xl font-bold tracking-[50px] min-w-full">TN7 PHASE ONE</div>
            <div className="flex gap-16">
                <div className="flex flex-col items-center justify-start">
                    <div>22 FEB 2025</div>
                    <div className="rounded-full h-8 w-[2px] bg-white"></div>
                    <div className="cursor-pointer flex flex-col items-center" onClick={() => { router.push(`/comics/thepathofvengeance`) }}>
                        <Image alt="" className="h-48 overflow-hidden object-cover object-top" width={200} height={200} src={`/assets/images/comics/thepathofvengeance/webp/profile.webp`} />
                        <div className="text-2xl">THE PATH OF VENGEANCE</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comics;
