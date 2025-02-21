"use client";

import { Loader, Header } from "@/components";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const content = [
    { id: "1", title: "PRELUDE", date: "07 FEB 2025" },
    { id: "2", title: "EPISODE 1", date: "07 FEB 2025" },
    { id: "3", title: "EPISODE 2", date: "07 FEB 2025" }
];

const comics = [
    { id: "azuki", name: "AZUKI" },
    { id: "pk", name: "PK OON: ORIGINS" },
    { id: "thepathofvengeance", name: "THE PATH OF VENGEANCE" }
];

const ComicsId = () => {
    const params = useParams();
    const id = params.id;

    const [imgHeight, setImgHeight] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const calculateImgHeight = () => {
        // 使用图片的比例或任何逻辑动态计算高度
        let contentFrame = document.querySelector("img[alt='comicsFrameHorizontal']"); // 选择你的 ContentFrame 图片
        if(window.innerWidth < 640) {
            setIsMobile(true);
            contentFrame = document.querySelector("img[alt='comicsFrameVertical']"); // 选择你的 ContentFrame 图片
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

    return (<div className="fixed flex justify-center h-screen items-center w-full">
        <Header />
        <Loader />
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/universe/webp/Background.webp`} priority />
        <div className="relative max-w-[1200px] h-full flex items-center justify-center">
            <Image className="invisible sm:visible absolute" alt="comicsFrameHorizontal" 
                height={1379} width={2260} src={`/assets/images/comics/${id}/webp/comicsFrameHorizontal.webp`}
                placeholder="blur"
                blurDataURL={`/assets/images/comics/${id}/webp/tiny/comicsFrameHorizontal.webp`}
            />
            <Image className="sm:invisible absolute" alt="comicsFrameVertical" 
                height={2260} width={1379} 
                src={`/assets/images/comics/${id}/webp/comicsFrameVertical.webp`} 
                placeholder="blur"
                blurDataURL={`/assets/images/comics/${id}/webp/tiny/comicsFrameVertical.webp`}
            />
            <div className="grid grid-cols-1 grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 items-center w-[80%]">
                <div className=""></div>
                <div className={`filter-bar flex flex-col gap-8 md:justify-center overflow-y-auto overflow-x-hidden overflow-y-auto px-4 text-white z-10`}
                    style={{ height: isMobile ? imgHeight * 45/100 : imgHeight * 80/100 }}
                >
                    <div className="flex flex-col gap-2">
                        <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl">{comics.find(e => e.id === id)?.name || ""}</div>
                        <div className="text-sm md:text-md lg:text-lg">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s</div>
                        <Link href={`/comics/${id}/1`} className="bg-[#007d6b] duration-300 px-8 py-2 rounded-2xl hover:opacity-80 w-fit">START READING</Link>
                    </div>
                    <div className="border-[#007d6b] border-t-2 flex flex-col gap-4">
                        {
                            content.map((value, key) => (
                                <Link href={`/comics/${id}/${value.id}`} key={key} className="cursor-pointer duration-300 flex group items-center justify-between hover:bg-slate-50/10">
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