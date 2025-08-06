"use client";

import { Dialog, EntryDialog, Header, Loader } from "@/components";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FaBookmark, FaCaretDown, FaHeart, FaRegBookmark, FaTrash } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Masonry } from 'react-plock';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { FaEdit } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { LuImageUp } from "react-icons/lu";
import { RiVideoUploadLine } from "react-icons/ri";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import axios from "axios";
import moment from "moment";
import Image from "next/image";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

const EntryCard = ({ entry, handleDelete, setIsOpenEntryModal, setEntryId }: { entry: any, handleDelete: (entry: any) => void, setIsOpenEntryModal: (isOpen: boolean) => void, setEntryId: (id: string) => void }) => {
    const MAX_HEIGHT = 250;
    const contentRef = useRef<HTMLDivElement>(null);
    const mediaRef = useRef<any>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [showExpand, setShowExpand] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(entry.likes_count);
    const [bookmarked, setBookmarked] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkHeight = () => {
            if (contentRef.current && mediaRef.current) {
                const contentHeight = contentRef.current.scrollHeight;
                const mediaHeight = mediaRef.current.clientHeight;
                setShowExpand(contentHeight + mediaHeight > MAX_HEIGHT);
            }
        };

        // 立即检查一次
        checkHeight();

        // 如果媒体元素存在，监听加载完成事件
        if (mediaRef.current) {
            const mediaElement = mediaRef.current;
            
            if (mediaElement.tagName === 'IMG') {
                if (mediaElement.complete) {
                    checkHeight();
                } else {
                    mediaElement.addEventListener('load', checkHeight);
                    mediaElement.addEventListener('error', checkHeight);
                }
            } else if (mediaElement.tagName === 'VIDEO') {
                mediaElement.addEventListener('loadedmetadata', checkHeight);
                mediaElement.addEventListener('error', checkHeight);
            }
        }

        // 使用 ResizeObserver 监听内容变化
        const resizeObserver = new ResizeObserver(checkHeight);
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            if (mediaRef.current) {
                const mediaElement = mediaRef.current;
                if (mediaElement.tagName === 'IMG') {
                    mediaElement.removeEventListener('load', checkHeight);
                    mediaElement.removeEventListener('error', checkHeight);
                } else if (mediaElement.tagName === 'VIDEO') {
                    mediaElement.removeEventListener('loadedmetadata', checkHeight);
                    mediaElement.removeEventListener('error', checkHeight);
                }
            }
            resizeObserver.disconnect();
        };
    }, [entry.content, entry.media_url, entry.media_type]);

    useEffect(() => {
        // 获取当前用户信息
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }).then(res => res.json()).then(data => {
                setCurrentUserId(data.id);
            }).catch(() => {
                setCurrentUserId(null);
            });
        } else {
            setCurrentUserId(null);
        }
    }, []);

    useEffect(() => {
        // 获取点赞数和状态
        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/validate-like`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(res => res.json()).then(data => {
            setLiked(data.liked);
        });
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/validate-bookmark`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(res => res.json()).then(data => {
            setBookmarked(data.bookmarked);
        });
    }, [entry.id]);

    const handleBookmark = (entry: any) => {
        const token = localStorage.getItem("token");
        if (!bookmarked) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/bookmark`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
                setBookmarked(true);
            });
        } else {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/bookmark`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
                setBookmarked(false);
            });
        }
    }

    const handleLike = () => {
        const token = localStorage.getItem("token");
        if (!liked) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/like`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
                setLikeCount((c: number) => c + 1);
                setLiked(true);
            });
        } else {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entries/${entry.id}/like`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
                setLikeCount((c: number) => c - 1);
                setLiked(false);
            });
        }
    };

    const handleEdit = async () => {
        setIsOpenEntryModal(true);
        setEntryId(entry.id);
    }

    // 点击外部关闭菜单
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <motion.div key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="text-white max-w-64 md:max-w-80 lg:max-w-96"
        >
            <Image alt=""
                height={132} width={1241} src={`/assets/images/entry/entryContentTopCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryContentTopCardFrame.png`}
            />
            <div className="relative flex justify-center items-center">
                <Image className="absolute left-0 top-0 w-full h-full" alt=""
                    height={1272} width={1241} src={`/assets/images/entry/entryContentCenterCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryContentCenterCardFrame.png`}
                />
                <div className="flex flex-col w-[90.5%] z-10 relative">
                    <div className="flex justify-between items-center px-4 py-2">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="w-6 h-6 md:w-10 md:h-10 bg-white rounded-full overflow-hidden">
                                <Image alt=""
                                    height={24} width={24} src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${entry.author.profile_picture}`}
                                    className="w-full h-full object-cover"
                                    placeholder="blur"
                                    blurDataURL={`${process.env.NEXT_PUBLIC_BACKEND_URL}${entry.author.profile_picture}`}
                                    priority
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-xs sm:text-sm font-semibold text-white">{entry.title}</div>
                                <div className="text-[0.4rem] sm:text-[0.5rem] text-white/60">{moment(entry.updated_at).format("YYYY-MM-DD HH:mm")}</div>
                            </div>
                        </div>
                        {/* 三点按钮及下拉菜单 */}
                        <div className="relative">
                            <button
                                className="duration-300 text-white hover:text-white/60"
                                onClick={() => setShowMenu((v) => !v)}
                            >
                                <BsThreeDotsVertical />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        ref={menuRef}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-40 bg-black/90 rounded-lg shadow-lg overflow-hidden z-30"
                                    >
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-white/20 text-white flex items-center gap-2"
                                            onClick={() => { setShowMenu(false); handleEdit(); }}
                                        >
                                            <FaEdit /> Edit Post
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-white/20 text-white flex items-center gap-2"
                                            onClick={() => { setShowMenu(false); handleDelete(entry); }}
                                        >
                                            <FaTrash /> Delete Post
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-white/20 text-white flex items-center gap-2"
                                            onClick={() => { setShowMenu(false); handleBookmark(entry); }}
                                        >
                                            { bookmarked ? <span className="flex items-center gap-2 text-yellow-500"><FaBookmark /> Bookmarked</span> : <span className="flex items-center gap-2"><FaRegBookmark className="text-white" /> Bookmark</span> }
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div
                        className="min-h-[200px]"
                        style={{
                            maxHeight: expanded ? "none" : `${MAX_HEIGHT}px`,
                            overflow: expanded ? "visible" : "hidden",
                            transition: "max-height 0.3s",
                        }}
                    >
                        {/* 渲染媒体内容 */}
                        { entry.category === "artwork" && entry.media_type === "image" && entry.media_url && (
                            <img
                                ref={mediaRef}
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                alt="entry media"
                                className="mt-2 max-w-full"
                            />
                        )}
                        { entry.category === "artwork" && entry.media_type === "video" && entry.media_url && (
                            <video
                                ref={mediaRef}
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${entry.media_url}`}
                                controls
                                className="mt-2 max-w-full"
                            />
                        )}
                        <div ref={contentRef} className="px-4" dangerouslySetInnerHTML={{ __html: entry.content }} />
                    </div>
                    <div className={`flex flex-col w-full ${showExpand && !expanded ? '-mt-[100px]' : ''}`}>
                        {showExpand && !expanded && (
                            <div className="h-[100px] bg-gradient-to-b from-black/80 to-black flex justify-center items-center w-full">

                                    <button
                                        className="text-white underline hover:text-white/60 duration-300"
                                        onClick={() => setExpanded((v) => !v)}
                                    >
                                        READ MORE
                                    </button>
                                
                            </div>
                        )}
                        <div className="flex justify-between items-center gap-2 w-full px-4 py-2">
                            <div className="rounded-full border-2 border-white px-4 py-1 text-white/60 text-xs">{likeCount}</div>
                            <FaHeart className={`cursor-pointer active:scale-90 hover:opacity-60 duration-300 ${liked ? 'text-red-500' : 'text-white'}`} onClick={handleLike} />
                        </div>
                    </div>
                </div>
            </div>
            <Image alt=""
                height={132} width={1241} src={`/assets/images/entry/entryContentBottomCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryContentBottomCardFrame.png`}
            />
        </motion.div>
    );
};

const EntryPage = ({ params }: { params: { category: string, type: string } }) => {
    const [isOpenEntryModal, setIsOpenEntryModal] = useState(false);
    const [entryId, setEntryId] = useState<string | null>(null);
    const dispatch = useDispatch();

    const editor = useCreateBlockNote();

    const { ref, inView, entry } = useInView({
        threshold: 0.1,
        triggerOnce: false,
    });

    const router = useRouter();
    const { category, type } = params;
    const [entries, setEntries] = useState<any[]>([]);
    const [tab, setTab] = useState<string>(category);

    // 分页状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filter, setFilter] = useState<string>("");
    const filterOptions = [
        { label: "Most Likes", value: "likes" },
        { label: "Alphabetical (A to Z)", value: "az" },
        { label: "Alphabetical (Z to A)", value: "za" },
        { label: "Latest to Earliest", value: "latest" },
        { label: "Earliest to Latest", value: "earliest" },
    ];

    // 获取条目的函数
    const fetchEntries = async (page: number = 1, isLoadMore: boolean = false) => {
        try {
            const token = localStorage.getItem("token");
            const requestConfig: any = {
                type: type,
                category: category,
                page: page,
                per_page: 6,
                sort: filter,
            };

            // 如果是 private 类型，需要 token；如果是 public 类型，不需要 token
            const headers: any = {};
            if (type === 'private') {
                if (!token) {
                    throw new Error('Token required for private entries');
                }
                headers.Authorization = `Bearer ${token}`;
            } else if (token) {
                // 如果是 public 类型但有 token，也发送 token（用于获取用户的点赞/收藏状态）
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entry-list/user`, requestConfig, {
                headers
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

    const handleDeleteConfirm = (entry: any) => {
        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-entry/${entry.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : "" } }).then(() => {
            fetchEntries(1, false);
        });
    }

    const handleDelete = (entry: any) => {
        dispatch(setContent(<div className="bg-black/50 backdrop-blur-lg flex flex-col items-center justify-center gap-4 rounded-lg w-[450px] h-[300px] relative">
            <Image
                className="absolute top-0 left-0 w-full h-full"
                alt=""
                height={581} width={1258} src={`/assets/images/share/smallFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/share/smallFrame.png`}
            />
            <div className="flex flex-col items-center justify-center gap-4 z-10 text-white">
                <div className="text-4xl font-bold">DELETE POST?</div>
                <div className="text-sm text-center">THIS ACTION CANNOT BE UNDONE. <br />YOU MAY CHOSE TO UNPUBLISH THE POST INSTEAD - <br />YOUR CURRENT WILL BE REMAINED IN YOUR PROFILE.</div>
                <div className="flex justify-between items-center gap-4">
                    <button onClick={() => dispatch(setIsOpen(false))} className="bg-gray-600 duration-300 hover:bg-gray-600/80 flex items-center justify-center rounded-xl text-md font-bold h-8 w-40 shadow-lg">NO</button>
                    <button onClick={() => {
                        dispatch(setIsOpen(false));
                        handleDeleteConfirm(entry);
                    } } className="bg-[#45b5d9] duration-300 hover:bg-[#45b5d9]/80 flex items-center justify-center rounded-xl text-md font-bold h-8 w-40 shadow-lg">YES</button>
                </div>
            </div>
        </div>));
        dispatch(setIsOpen(true));
    }

    // 初始加载
    useEffect(() => {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMore(true);
        fetchEntries(1, false);
        // 滚动到顶部，只在客户端执行
        if (typeof window !== 'undefined') {
            document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [category, filter]);

    // 无限滚动逻辑
    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && !isLoading) {
            console.log("page", currentPage);
            setIsLoadingMore(true);
            fetchEntries(currentPage + 1, true);
        }
    }, [inView, hasMore, isLoadingMore, isLoading, currentPage, category]);

    return (<div className="fixed flex h-screen items-center justify-center overflow-hidden w-full">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/entry/entryBG.png`} priority />
        <Header />
        <Loader />
        {/*<div className="flex h-[calc(100vh-80x)] items-top sm:items-center justify-center w-full mt-[80px] sm:mt-0">*/}
        <div className="flex flex-col max-w-[1280px]">
            <Image alt=""
                height={277} width={4608} src={`/assets/images/entry/entryListTopCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryListTopCardFrame.png`}
            />
            <div className="relative flex flex-col gap-4 items-center h-[calc(100vh-200px)] max-h-[700px] py-8"
                //style={{ height: imgHeight, width: imgWidth }}
            >
                {/*<Image className="absolute invisible sm:visible" alt=""
                    height={1379} width={2260} src={`/assets/images/entry/entryFrameHorizontal.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryFrameHorizontal.png`}
                />*/}
                <Image className="absolute left-0 top-0 w-full h-full" alt=""
                    height={1272} width={1425} src={`/assets/images/entry/entryListCenterCardFrame.png`}
                    placeholder="blur"
                    blurDataURL={`/assets/images/entry/entryListCenterCardFrame.png`}
                />
                <div className="flex md:flex-row flex-col items-center gap-2 w-[80%] text-white z-[30]">
                    <div className="flex flex-wrap gap-2">
                        <div className="cursor-pointer w-40 relative" onClick={() => router.push(`/entry/${type}/story`)}>
                            <Image className="" alt=""
                                height={168} width={700} src={`/assets/images/share/tabFrame.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/share/tabFrame.png`}
                            />
                            <AnimatePresence>
                                {tab === "story" && (
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
                        <div className="cursor-pointer w-40 relative" onClick={() => router.push(`/entry/${type}/artwork`)}>
                            <Image className="" alt=""
                                height={168} width={700} src={`/assets/images/share/tabFrame.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/share/tabFrame.png`}
                            />
                            <AnimatePresence>
                                {tab === "artwork" && (
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
                        <div className="w-40 relative opacity-50 cursor-not-allowed" onClick={() => {
                            //router.push(`/entry/${type}/collections`)
                        }}>
                            <Image className="" alt=""
                                height={168} width={700} src={`/assets/images/share/tabFrame.png`}
                                placeholder="blur"
                                blurDataURL={`/assets/images/share/tabFrame.png`}
                            />
                            <AnimatePresence>
                                {tab === "collections" && (
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
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">COLLECTIONS</div>
                        </div>
                        <div className="relative">
                            <button
                                className={`bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg duration-300 ${showFilterDropdown ? 'bg-white/20' : ''}`}
                                onClick={() => setShowFilterDropdown((v) => !v)}
                            >
                                <span className="truncate w-24 md:w-32">Filter by {filterOptions.find(opt => opt.value === filter)?.label}</span> <FaCaretDown />
                            </button>
                            <AnimatePresence>
                                {showFilterDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-48 bg-black/90 rounded-lg shadow-lg overflow-hidden"
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
                </div>
                <div className="w-[92%] md:w-[80%] overflow-y-auto z-10 filter-bar flex flex-col items-center min-h-[calc(100%-40px)]">
                    {entries.length > 0 ? (<>
                        <Masonry
                            items={entries}
                            config={{
                                columns: [2, 2, 3],
                                gap: [6, 12, 24],
                                media: [640, 1024, 1440],
                            }}
                            render={(entry) => <EntryCard entry={entry} handleDelete={handleDelete} setIsOpenEntryModal={setIsOpenEntryModal} setEntryId={setEntryId} />}
                        />
                        
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
                    </>) : (
                        <div className="h-full flex items-center justify-center text-white/60">
                           {
                            type === "private" ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-3xl font-bold">YOU HAVE NO ENTRIES YET.</div>
                                    <div className="text-md">START NOW TO EARN YOUR LUNEX POINTS</div>
                                </div>
                            ) : (
                                <div className="text-3xl font-bold">No entries found</div>
                            )
                           }
                        </div>
                    )}   
                </div>
            </div>
            <Image alt=""
                height={277} width={4608} src={`/assets/images/entry/entryListBottomCardFrame.png`}
                placeholder="blur"
                blurDataURL={`/assets/images/entry/entryListBottomCardFrame.png`}
            />
        </div>
        <Dialog />
        <EntryDialog isOpenEntryModal={isOpenEntryModal} setIsOpenEntryModal={setIsOpenEntryModal} entryId={entryId || ""} />
    </div>);
};

export default EntryPage;

