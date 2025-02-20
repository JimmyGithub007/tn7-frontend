"use client";

import { Loader, Navbar } from "@/components";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const content = [
    { id: "1", title: "PRELUDE", date: "07 FEB 2025" },
    { id: "2", title: "EPISODE 1", date: "07 FEB 2025" },
    { id: "3", title: "EPISODE 2", date: "07 FEB 2025" }
];

const ComicsId = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    return (<div className="fixed flex justify-center h-screen items-center w-full">
        <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
        <Loader />
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/universe/webp/Background.webp`} priority />
        <div className="relative max-w-[1200px] h-full flex items-center">
            <Image className="invisible sm:visible absolute" alt="ComicsFrameHorizontal" height={1379} width={2260} src={`/assets/images/comics/webp/ComicsFrameHorizontal.webp`} priority />
            <Image className="sm:invisible absolute" alt="ComicsFrameVertical" height={2260} width={1379} src={`/assets/images/comics/webp/ComicsFrameVertical.webp`} priority />
            <div className="grid grid-cols-1 grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 items-center justify-start">
                <div className="relative flex items-center justify-center">
                    <Image className="absolute invisible sm:visible opacity-80 z-10" alt="" height={1379} width={1130} src={`/assets/images/comics/webp/comicsBGHorizontal.webp`} priority />
                    <Image className="absolute sm:invisible opacity-80 z-10" alt="" height={1130} width={1379} src={`/assets/images/comics/webp/comicsBGVertical.webp`} priority />
                </div>
                <div className="flex flex-col gap-8 px-12 sm:pr-24 text-white z-10">
                    <div className="flex flex-col gap-2">
                        <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl">SECRET OF THE VALLEY</div>
                        <div className="text-sm md:text-md lg:text-lg">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s</div>
                        <Link href={`/comics/1/1`} className="bg-slate-300 duration-300 px-8 py-2 rounded-xl hover:opacity-80 shadow-md shadow-slate-500/50 w-fit">START READING</Link>
                    </div>
                    <div className="border-white border-t-2 flex flex-col gap-4">
                        {
                            content.map((value, key) => (
                                <Link href={`/comics/1/${value.id}`} key={key} className="cursor-pointer duration-300 flex group items-center justify-between hover:bg-slate-50/10">
                                    <div className="flex items-center gap-8">
                                        <Image className="duration-300 group-hover:saturate-150 w-16" alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
                                        {value.title}
                                    </div>
                                    <div>{value.date}</div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export default ComicsId;