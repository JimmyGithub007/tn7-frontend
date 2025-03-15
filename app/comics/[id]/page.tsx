"use client";

import { Loader, Header, Footer } from "@/components";
import { opinionPro } from "@/components/Font";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TbArrowBackUp } from "react-icons/tb";

import Image from "next/image";
import Link from "next/link";

const content = [
    { id: "1", title: "PRELUDE", date: "07 FEB 2025" },
    //{ id: "2", title: "EPISODE 1", date: "07 FEB 2025" },
    //{ id: "3", title: "EPISODE 2", date: "07 FEB 2025" }
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
    const [winWidth, setWinWidth] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const calculateImgHeight = () => {
        setWinWidth(window.innerWidth);

        // 使用图片的比例或任何逻辑动态计算高度
        let contentFrame = document.querySelector("img[alt='comicsFrameHorizontal']"); // 选择你的 ContentFrame 图片
        console.log(window.innerWidth)
        if(window.innerWidth < 640) {
            setIsMobile(true);
            contentFrame = document.querySelector("img[alt='comicsFrameVertical']"); // 选择你的 ContentFrame 图片
        } else {
            setIsMobile(false);
        }

        if (contentFrame) {
            const h = contentFrame.clientHeight;
            setImgHeight(h);
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

    return (<div className="h-screen w-full overflow-hidden flex justify-center">
        <Header />
        <Loader />
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/universe/webp/Background.webp`} priority />
        <div className="flex h-[calc(100vh-52px)] sm:h-full sm:w-[85%] items-top sm:items-center justify-center w-full mt-[52px] sm:mt-0">
            <div className="relative h-[calc(100vh-104px)] w-full flex items-center justify-center"
                style={{ maxHeight: (winWidth*2260/1379)+"px" }}
            >
                <Image className="invisible sm:visible absolute xl:h-[-webkit-fill-available] w-auto" alt="comicsFrameHorizontal" 
                    height={1379} width={2260} src={`/assets/images/comics/${id}/webp/comicsFrameHorizontal.webp`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/comics/${id}/webp/tiny/comicsFrameHorizontal.webp`}
                />
                <Image className={`sm:invisible absolute h-full w-auto`} alt="comicsFrameVertical" 
                    height={2260} width={1379} 
                    src={`/assets/images/comics/${id}/webp/comicsFrameVertical.webp`} 
                    placeholder="blur"
                    blurDataURL={`/assets/images/comics/${id}/webp/tiny/comicsFrameVertical.webp`}
                />
                <div className="grid grid-cols-1 grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 items-center relative"
                    style={{ 
                        height: isMobile ? ((winWidth*2260/1379)*82/100)+"px" : imgHeight * 80/100,
                        width: isMobile ? "75%" : ((imgHeight*2260/1379)*90/100)+"px"
                    }}
                >
                    <Link href={{ pathname: "/comics" }} className={`absolute cursor-pointer duration-300 hover:opacity-50 text-white text-4xl z-20 right-2 top-0`}>
                        <TbArrowBackUp />
                    </Link>
                    <div className=""></div>
                    <div className={`filter-bar flex flex-col gap-8 md:justify-center px-2 text-white z-10 relative`}>
                        <div className={`flex flex-col gap-2`}>
                            <div className="text-lg sm:text-xl md:text-2xl xl:text-3xl">The Secret of the Valley</div>
                            <div className={`text-xs sm:text-sm md:text-md lg:text-lg italic ${opinionPro.className}`}>
                                A search in Cyber Valley turns into a high-stakes showdown. As the battle reaches its peak, an unexpected presence reveals itself, unveiling an unforeseen path.<br />
                                Created in collaboration with <b>Azuki community members</b>, this is just the beginning.
                            </div>
                            <Link href={`/comics/${id}/1`} className="bg-[#007d6b] duration-300 px-4 py-2 text-xs sm:text-lg sm:px-8 rounded-2xl hover:opacity-80 w-fit">START READING</Link>
                        </div>
                        <div className="border-[#007d6b] border-t-2 flex flex-col gap-4">
                            {
                                content.map((value, key) => (
                                    <Link href={`/comics/${id}/${value.id}`} key={key} className="cursor-pointer duration-300 flex group items-center justify-between hover:bg-slate-50/10 text-xs sm:text-sm pr-2">
                                        <div className={`flex items-center gap-8 ${opinionPro.className}`}>
                                            <Image className="duration-300 group-hover:saturate-150 w-12 sm:w-16" alt="prelude" height={315} width={315} src={`/assets/images/comics/prelude.png`} priority />
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
        </div>
        <Footer />
    </div>)
}

export default ComicsId;