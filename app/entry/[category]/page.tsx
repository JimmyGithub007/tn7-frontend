"use client";
import { Header, Loader } from "@/components";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa6";
import { TbArrowBackUp } from "react-icons/tb";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useCreateBlockNote } from "@blocknote/react";
import { InlineContent, TableContent, Block } from "@blocknote/core";
import moment from "moment";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Masonry } from 'react-plock';

const entryList = [
    {
        id: 1,
        title: "Entry 1",
        author: "Author 1",
        date: "2021-01-01",
        content: "Content 1"
    },
    {
        id: 2,
        title: "Entry 2",
        author: "Author 2",
        date: "2021-01-02",
        content: "Content 2"
    },
    {
        id: 3,
        title: "Entry 3",
        author: "Author 3",
        date: "2021-01-03",
        content: "Content 3"
    },
    {
        id: 4,
        title: "Entry 4",
        author: "Author 4",
        date: "2021-01-04",
        content: "Content 4"
    },
    {
        id: 5,
        title: "Entry 5",
        author: "Author 5",
        date: "2021-01-05",
        content: "Content 5"
    },
    {
        id: 6,
        title: "Entry 6",
        author: "Author 6",
        date: "2021-01-06",
        content: "Content 6"
    },
    {
        id: 7,
        title: "Entry 7",
        author: "Author 7",
        date: "2021-01-07",
        content: "Content 7"
    }
]

type blockType = {
    id: string;
    type: string;
    props: Record<string, boolean | number | string>;
    content: InlineContent<any, any>[] | TableContent<any, any> | undefined;
    children: Block[];
};

const EntryPage = ({ params }: { params: { category: string } }) => {
    const editor = useCreateBlockNote();

    const { ref, inView, entry } = useInView({
        threshold: 0.1,
        triggerOnce: false,
    });

    const router = useRouter();
    const { category } = params;
    const [entries, setEntries] = useState<any[]>([]);
    const [tab, setTab] = useState<string>(category);

    // 分页状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const [imgHeight, setImgHeight] = useState<number>(0);
    const [imgWidth, setImgWidth] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filter, setFilter] = useState<string>("");
    const filterOptions = [
        { label: "Most Likes", value: "likes" },
        { label: "Alphabetical (A to Z)", value: "az" },
        { label: "Alphabetical (Z to A)", value: "za" },
        { label: "Latest to Earliest", value: "latest" },
        { label: "Earliest to Latest", value: "earliest" },
    ];

    const calculateImgHeight = () => {
        if (window.innerWidth < 640) {
            setIsMobile(true);

            const maxH = (window.innerWidth * 2260 / 1379);
            const H = Math.min(window.innerHeight - 120, maxH);
            setImgHeight(H);
            setImgWidth(H * 1379 / 2260);
        } else {
            setIsMobile(false);
            const maxW = ((window.innerHeight - 80) * 2260 / 1379);
            const W = Math.min(window.innerWidth * 0.8, maxW);
            setImgHeight(W * 1379 / 2260);
            setImgWidth(W);
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

    // 获取条目的函数
    const fetchEntries = async (page: number = 1, isLoadMore: boolean = false) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/list`, {
                category: category,
                page: page,
                per_page: 6,
                filter: filter,
            }, {
                headers: { Authorization: token ? `Bearer ${token}` : "" }
            });

            const { data, pagination } = res.data;

            data.forEach(async (e: any) => {
                const content = JSON.parse(e.content);
                const html = await editor.blocksToHTMLLossy(content);
                e.content = html.toString();
            });

            if (isLoadMore) {
                setEntries(prev => [...prev, ...data]);
            } else {
                setEntries(data);
            }

            setCurrentPage(pagination.current_page);
            setHasMore(pagination.has_more_pages);

        } catch (error) {
            console.error("Error fetching entries:", error);
            // 如果是初始加载失败，显示错误状态
            if (!isLoadMore) {
                setEntries([]);
                setHasMore(false);
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // 初始加载
    useEffect(() => {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMore(true);
        fetchEntries(1, false);
        // 滚动到顶部
        document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category, filter]);

    // 无限滚动逻辑
    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && !isLoading) {
            console.log("page", currentPage);
            setIsLoadingMore(true);
            fetchEntries(currentPage + 1, true);
        }
    }, [inView, hasMore, isLoadingMore, isLoading, currentPage, category]);

    return (<div className="fixed h-screen w-full overflow-hidden flex justify-center">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
        <Header />
        {/*<Loader />*/}
        <div className="flex h-[calc(100vh-80x)] items-top sm:items-center justify-center w-full mt-[80px] sm:mt-0">
            <div className="relative flex flex-col gap-4 items-center justify-center pt-12"
                style={{ height: imgHeight, width: imgWidth }}
            >
                <Image className="absolute invisible sm:visible" alt=""
                    height={1379} width={2260} src={`/assets/images/entry/entryFrameHorizontal.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryFrameHorizontal.png`}
                />
                <div className="flex items-center gap-2 w-[80%] text-white z-50">
                    <div className="cursor-pointer w-48 relative" onClick={() => router.push("/entry/stories")}>
                        <Image className="" alt=""
                            height={168} width={700} src={`/assets/images/share/tabFrame.png`}
                            placeholder="blur"
                            blurDataURL={`/assets/images/share/tabFrame.png`}
                        />
                        <AnimatePresence>
                            {tab === "stories" && (
                                <motion.img className="absolute top-0 left-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    alt=""
                                    height={168} width={700} src={`/assets/images/share/tabActiveFrame.png`}
                                />
                            )}
                        </AnimatePresence>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">STORIES</div>
                    </div>
                    <div className="cursor-pointer w-48 relative" onClick={() => router.push("/entry/artworks")}>
                        <Image className="" alt=""
                            height={168} width={700} src={`/assets/images/share/tabFrame.png`}
                            placeholder="blur"
                            blurDataURL={`/assets/images/share/tabFrame.png`}
                        />
                        <AnimatePresence>
                            {tab === "artworks" && (
                                <motion.img className="absolute top-0 left-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    alt=""
                                    height={168} width={700} src={`/assets/images/share/tabActiveFrame.png`}
                                />
                            )}
                        </AnimatePresence>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">ARTWORKS</div>
                    </div>
                    <div className="relative">
                        <button
                            className="bg-white/50 backdrop-blur-lg text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                            onClick={() => setShowFilterDropdown((v) => !v)}
                        >
                            Filter by {filterOptions.find(opt => opt.value === filter)?.label} <FaCaretDown />
                        </button>
                        <AnimatePresence>
                            {showFilterDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 mt-2 w-48 bg-black/90 rounded-lg shadow-lg overflow-hidden"
                                >
                                    {filterOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`block duration-300 w-full text-left px-4 py-2 hover:bg-white/30 text-white ${filter === opt.value ? 'font-bold' : ''}`}
                                            onClick={() => {
                                                setFilter(opt.value);
                                                setShowFilterDropdown(false);
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="w-[80%] h-[80%] overflow-y-auto z-10 filter-bar flex flex-col items-center">
                    <Masonry
                        items={entries}
                        config={{
                            columns: [1, 2, 3],
                            gap: [2, 4, 6],
                            media: [640, 1024, 1440],
                        }}
                        render={(entry) => (
                            <motion.div key={entry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className="text-white max-w-64 md:max-w-80 lg:max-w-96"
                            >
                                <Image alt=""
                                    height={198} width={1425} src={`/assets/images/entry/entryContentTopCardFrame.png`}
                                    placeholder="blur"
                                    blurDataURL={`/assets/images/entry/entryContentTopCardFrame.png`}
                                />
                                <div className="relative min-h-64">
                                    <Image className="absolute left-0 top-0 w-full h-full" alt=""
                                        height={1272} width={1425} src={`/assets/images/entry/entryContentCenterCardFrame.png`}
                                        placeholder="blur"
                                        blurDataURL={`/assets/images/entry/entryContentCenterCardFrame.png`}
                                    />
                                    <div className="flex flex-col gap-4 px-8 md:px-10 lg:px-12 xl:px-16 z-10 relative">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-full">

                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-semibold text-white">{entry.title}</div>
                                                    <div className="text-[0.5rem] text-white/60">{moment(entry.updated_at).format("YYYY-MM-DD HH:mm")}</div>
                                                </div>
                                            </div>
                                            <button className="duration-300 text-white hover:text-white/60"><BsThreeDotsVertical /></button>
                                        </div>
                                        {/* 渲染媒体内容 */}
                                        {entry.media_type === "image" && entry.media_url && (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                                alt="entry media"
                                                className="mt-2 max-w-full"
                                            />
                                        )}
                                        {entry.media_type === "video" && entry.media_url && (
                                            <video
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                                controls
                                                className="mt-2 max-w-full"
                                            />
                                        )}
                                        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                                    </div>
                                </div>
                                <Image alt=""
                                    height={198} width={1425} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                                    placeholder="blur"
                                    blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
                                />
                            </motion.div>
                        )}
                    />
                    {/* 加载更多指示器 */}
                    {isLoadingMore && (
                        <div className="col-span-full flex justify-center py-4 z-10">
                            <div className="text-white">Loading more entries...</div>
                        </div>
                    )}

                    {/* 没有更多数据的提示 */}
                    {!hasMore && entries.length > 0 && (
                        <div className="col-span-full flex justify-center py-4 z-10">
                            <div className="text-white/60">No more entries to load</div>
                        </div>
                    )}

                    {/* 无限滚动触发器 */}
                    {hasMore && (
                        <div ref={ref} className="h-10 col-span-full z-10"></div>
                    )}
                </div>
                {/*<div className="grid grid-cols-3 gap-4 overflow-y-auto w-[80%] h-[80%]">
                    <div className="flex flex-col gap-4 z-10">
                        {entries.map((entry) => (
                            <div key={entry.id}
                                className="bg-red-500 h-80 text-white"
                            >
                                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 z-10">
                        {entries.map((entry) => (
                            <div key={entry.id}
                                className="bg-red-500 h-80 text-white"
                            >
                                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 z-10">
                        {entries.map((entry) => (
                            <div key={entry.id}
                                className="bg-red-500 h-80 text-white"
                            >
                                <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                            </div>
                        ))}
                    </div>
                </div>*/}
                { false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-[80%] h-[80%] overflow-y-auto">
                    {/* 初始加载状态 */}
                    {isLoading && entries.length === 0 && (
                        <div className="col-span-full flex justify-center items-center py-8">
                            <div className="text-white">Loading entries...</div>
                        </div>
                    )}

                    {/* 没有数据时的显示 */}
                    {!isLoading && entries.length === 0 && (
                        <div className="col-span-full flex justify-center items-center py-8">
                            <div className="text-white/60">No entries found</div>
                        </div>
                    )}

                    {entries.map((entry) => (
                        <div key={entry.id}
                            className="relative"
                        >
                            <Image className="" alt=""
                                height={1669} width={1425} src={`/assets/images/entry/entryFrame.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/entry/entryFrame.png`}
                            />
                            <div className="absolute p-4 flex flex-col w-full z-10 left-0 top-0 px-[20%] py-[15%] overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full">

                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold text-white">{entry.title}</div>
                                            <div className="text-[0.5rem] text-white/60">{moment(entry.updated_at).format("YYYY-MM-DD HH:mm")}</div>
                                        </div>
                                    </div>
                                    <button className="duration-300 text-white hover:text-white/60"><BsThreeDotsVertical /></button>
                                </div>
                                <div className="text-sm text-white/80 mt-2 line-clamp-3">
                                    {/* 渲染媒体内容 */}
                                    {entry.media_type === "image" && entry.media_url && (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                            alt="entry media"
                                            className="mt-2 max-w-full"
                                        />
                                    )}
                                    {entry.media_type === "video" && entry.media_url && (
                                        <video
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                            controls
                                            className="mt-2 max-w-full"
                                        />
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 加载更多指示器 */}
                    {isLoadingMore && (
                        <div className="col-span-full flex justify-center py-4 z-10">
                            <div className="text-white">Loading more entries...</div>
                        </div>
                    )}

                    {/* 没有更多数据的提示 */}
                    {!hasMore && entries.length > 0 && (
                        <div className="col-span-full flex justify-center py-4 z-10">
                            <div className="text-white/60">No more entries to load</div>
                        </div>
                    )}

                    {/* 无限滚动触发器 */}
                    {hasMore && (
                        <div ref={ref} className="h-10 col-span-full z-10"></div>
                    )}
                </div>)}
            </div>
        </div>
    </div>);
};

export default EntryPage;

