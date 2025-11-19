"use client";

import { useState, useReducer, useEffect } from "react";
import { BiLike, BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowLeft } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { Pixelify_Sans, Rubik_Distressed } from "next/font/google";
import { RootState } from "@/store";
import Lenis from '@studio-freight/lenis';
import Image from "next/image";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedCounter } from "react-animated-counter";
import { setJumpPage } from "@/store/slice/pageSlice";

const pixelify_sans = Pixelify_Sans({ subsets: ["latin"], weight: "400" });
const rubik_distressed = Rubik_Distressed({ subsets: ["latin"], weight: "400" });

type citizenProps = {
    id: string;
    code: string;
    name: string;
    background: string;
    body: string;
    eyes: string;
    tattoo: string | null;
    clothes: string;
    headgear: string | null;
    facegear: string | null;
    eyes_flare: string | null;
    hair: string | null;
    weapon: string | null;
    image_url: string | null;
    likes_count: number;
    likes: Array<{
        id: string;
        user_id: string;
        citizen_id: string;
        created_at: string;
        updated_at: string;
    }>;
    created_at: string;
    updated_at: string;
};

/*const BGColors = [
    { background: "BG-1", bg_color: "#3c487f", card_color: "#455495", text_color: "#ffffff" },
    { background: "BG-2", bg_color: "#1b4850", card_color: "#205e68", text_color: "#ffffff" },
    { background: "BG-3", bg_color: "#5c2a61", card_color: "#82398a", text_color: "#ffffff" },
    { background: "BG-4", bg_color: "#415432", card_color: "#4d653b", text_color: "#ffffff" },
    { background: "BG-5", bg_color: "#3b4244", card_color: "#4b5456", text_color: "#ffffff" },
    { background: "BG-6", bg_color: "#57471d", card_color: "#6b5825", text_color: "#ffffff" }
];*/

const bgColors = [
    { id: 2107, color: "#f4e8e2", card_color: "#f4e8e2", text_color: "#000000" },
    { id: 2112, color: "#bbbfb8", card_color: "#bbbfb8", text_color: "#000000" },
    { id: 2121, color: "#edf3f2", card_color: "#edf3f2", text_color: "#000000" },
    { id: 2108, color: "#f7eddc", card_color: "#f7eddc", text_color: "#000000" },
    { id: 2111, color: "#a4ccf6", card_color: "#a4ccf6", text_color: "#000000" },
    { id: 2120, color: "#1fd2c7", card_color: "#1fd2c7", text_color: "#000000" },
    { id: 2117, color: "#844f85", card_color: "#844f85", text_color: "#ffffff" },
    { id: 2109, color: "#526280", card_color: "#526280", text_color: "#ffffff" },
    { id: 2116, color: "#fd9da7", card_color: "#fd9da7", text_color: "#000000" },
    { id: 2110, color: "#91a3ac", card_color: "#91a3ac", text_color: "#000000" },
    { id: 2113, color: "#bddad2", card_color: "#bddad2", text_color: "#000000" },
]

const filterReducer = (state: any, action: any) => {
    switch (action.type) {
        case "TOGGLE_FILTER":
            const { filterType, value } = action.payload;
            const currentFilters = state[filterType] || [];
            const updatedFilters = currentFilters.includes(value)
                ? currentFilters.filter((item: string) => item !== value)
                : [...currentFilters, value];
            return { ...state, [filterType]: updatedFilters };
        case "INIT_FILTERS":
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

const Collapse = ({ icon, text, children }: { icon: string, text: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useReducer((state: boolean) => !state, false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b-[1px] border-gray-700">
            <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen()}
            >
                <div className="flex items-center gap-2 font-bold text-md pb-2 text-gray-300">
                    {/*<Image className="w-8 bg-white shadow-sm rounded-lg p-1" alt="icon" width={512} height={512} src={icon} />*/}
                    {text}
                </div>
                <span className="font-bold text-gray-300">{isOpen ? "-" : "+"}</span>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="py-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Citizen = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAuth({ type: "user" });
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(true);
    const { isOpen } = useSelector((state: RootState) => state.dialog);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>("");
    const [citizens, setCitizens] = useState<citizenProps[]>([]);
    const [nfts, setNfts] = useState<any[]>([]);
    const [components, setComponents] = useState<{ [key: string]: any[] }>({});
    const [likedCitizens, setLikedCitizens] = useState<Set<string>>(new Set());
    const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const [filters, dispatchFilter] = useReducer(filterReducer, {});

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchKeyword(searchKeyword);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    const handleFilterClick = (filterType: string, value: string) => {
        console.log(filterType, value);
        dispatchFilter({ type: "TOGGLE_FILTER", payload: { filterType, value } });
    };

    const handleLikeToggle = async (nftId: string, event: React.MouseEvent) => {
        console.log(nftId);
        event.stopPropagation(); // 防止触发父元素的点击事件

        if (!isAuthenticated) {
            // 如果用户未登录，可以显示登录提示
            alert('Please login to like citizens');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nfts/${nftId}/toggle-like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();

                // 更新citizens数组中的likes_count
                setNfts(prevNfts =>
                    prevNfts.map(nft =>
                        nft.id === nftId
                            ? { ...nft, likes_count: data.likes_count }
                            : nft
                    )
                );

                // 更新liked状态
                setLikedCitizens(prev => {
                    const newSet = new Set(prev);
                    if (data.is_liked) {
                        newSet.add(nftId);
                    } else {
                        newSet.delete(nftId);
                    }
                    return newSet;
                });
            } else {
                const errorData = await response.json();
                console.error('Error toggling like:', errorData);
                alert('Failed to update like status');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to update like status');
        }
    };

    const filteredNfts = nfts.filter((c) => {
        // First apply filter-based filtering
        const passesFilters = (Object.keys(filters) as (keyof citizenProps)[]).every((key) =>
            filters[key].length === 0 || filters[key].includes(c[key])
        );

        // Then apply keyword search if there's a search term
        if (debouncedSearchKeyword.trim() === "") {
            return passesFilters;
        }

        const keyword = debouncedSearchKeyword.toLowerCase().trim();
        const searchableText = [
            c.code.padStart(4, '0'),
            components["Background"].find(e => e.id === c.background)?.meta_type,
            components["Type"].find(e => e.id === c.type)?.meta_type,
            components["Outfit"].find(e => e.id === c.outfit)?.meta_type,
            components["Eyes"].find(e => e.id === c.eyes)?.meta_type,
            components["Mouth"].find(e => e.id === c.mouth)?.meta_type,
            components["Hair"].find(e => e.id === c.hair)?.meta_type,
            components["Tattoo"].find(e => e.id === c.tattoo)?.meta_type,
            components["Object"].find(e => e.id === c.object)?.meta_type,
            components["Special"].find(e => e.id === c.special)?.meta_type,
            components["Pet"].find(e => e.id === c.pet)?.meta_type,
            components["Element"].find(e => e.id === c.element)?.meta_type,
            components["Glasses"].find(e => e.id === c.glasses)?.meta_type,
        ].filter(Boolean).join(" ").toLowerCase();

        // Support partial matching and multiple keywords
        const keywords = keyword.split(/\s+/);
        const matchesAllKeywords = keywords.every(k => searchableText.includes(k));

        return passesFilters && matchesAllKeywords;
    });

    const handleWindowResize = () => {
        if (window.innerWidth < 900) {
            setIsOpenSidebar(false);
        }
    };

    // Add event listeners on component mount
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        // Cleanup on component unmount
        handleWindowResize();
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    useEffect(() => {
        if (isOpenSidebar && window.innerWidth < 1024) {
            document.body.classList.add("overflow-y-hidden");
        }
        else {
            document.body.classList.remove("overflow-y-hidden");
        }
    }, [isOpenSidebar])

    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 0) {
            setIsHeaderVisible(false);
        } else {
            setIsHeaderVisible(true);
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [])

    useEffect(() => {
        handleScroll();
    }, [])

    /*useEffect(() => {
        const lenis = new Lenis();

        // Hook into Lenis's animation frame loop
        const raf = (time: any) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Pause or resume Lenis based on `isOPen`
        if (isOpen) {
            lenis.stop(); // Stop scrolling
        } else {
            lenis.start(); // Resume scrolling
        }

        return () => {
            lenis.destroy();
        };
    }, [isOpen])*/


    useEffect(() => {
        /*const fetchCitizens = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/citizen/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setCitizens(data);
            
            // 初始化liked状态 - 检查当前用户是否已经like了这些citizens
            if (user) {
                const likedIds = new Set<string>();
                data.forEach((citizen: citizenProps) => {
                    const userLiked = citizen.likes.some(like => like.user_id === user.id);
                    if (userLiked) {
                        likedIds.add(citizen.id);
                    }
                });
                setLikedCitizens(likedIds);
            }
        };
        fetchCitizens();*/
        const fetchNfts = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nfts`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log(data);
            setNfts(data);
        };
        fetchNfts();
        const fetchComponents = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/components`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setComponents(data);
        };
        fetchComponents();
    }, [user]);

    // 初始化过滤器状态
    useEffect(() => {
        const initialFilters: { [key: string]: string[] } = {};
        Object.keys(components).forEach(category => {
            initialFilters[category] = [];
        });
        if (Object.keys(initialFilters).length > 0) {
            dispatchFilter({ type: "INIT_FILTERS", payload: initialFilters });
        }
    }, [components]);

    useEffect(() => {
        dispatch(setJumpPage(false));
    }, []);

    return (<div className="bg-gray-800 fixed h-screen w-full">
        <Loader />
        <div className="bg-gray-900 h-[calc(100vh-72.51px)] mt-[72.51px] overflow-hidden relative w-full">
            {/* Left Sidebar */}
            <div className={`bg-gray-800 duration-200 filter-bar absolute lg:fixed flex flex-col gap-4 h-screen overflow-y-auto px-8 pb-12 top-[72.51px] w-full lg:w-96 z-50 ${isOpenSidebar ? "left-0" : "-left-full"}`}>
                <div className="flex items-center justify-between">
                    {/*<Image alt="logo" className="w-32" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} />*/}
                    <MdClose onClick={() => setIsOpenSidebar(false)} className="cursor-pointer text-5xl lg:hidden text-gray-300 hover:text-white transition-colors" />
                </div>
                <div className="flex font-bold gap-4 text-xl text-gray-100">
                    FILTERS
                </div>
                {
                    Object.entries(components).map(([category, items]) => (
                        <Collapse
                            key={category}
                            icon={`/assets/images/icons/${category.toLowerCase()}.png`}
                            text={category.toUpperCase() + " (" + items.length + ")"}
                        >
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 cursor-pointer mb-2"
                                    onClick={() => handleFilterClick(category.toLowerCase(), item.id)}
                                >
                                    <div
                                        className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters[category.toLowerCase()]?.includes(item.id)
                                            ? "bg-red-500"
                                            : "bg-gray-600"
                                            }`}
                                    ></div>
                                    <div className="flex justify-between w-full">
                                        <div className="flex flex-col">
                                            <div className="text-sm text-gray-300">{item.meta_type}</div>
                                            <div className="text-xs text-gray-500">{item.rarity_percent || '0.00%'}</div>
                                        </div>
                                        <div className="text-sm text-gray-300">{item.rarity_count || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </Collapse>
                    ))
                }
                {/*<Collapse icon={`/assets/images/icons/background.png`} text="BACKGROUND">
                    {["BG-1", "BG-2", "BG-3", "BG-4", "BG-5", "BG-6"].map((bg) => (
                        <div
                            key={bg}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("background", bg)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.background.includes(bg) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{bg}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/upper-body.png`} text="BODY">
                    {["M_BODY_ANGRY_2"].map((body) => (
                        <div
                            key={body}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("body", body)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.body.includes(body) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{body}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/eye-makeup.png`} text="EYES">
                    {["M_GREY", "M_PURPLE", "M_RED", "M_GREEN", "M_PINK"].map((eyes) => (
                        <div
                            key={eyes}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("eyes", eyes)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.eyes.includes(eyes) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{eyes}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/tattoo.png`} text="TATTOO">
                    {["TATTOO-2", "TATTOO-6", "TATTOO-10"].map((tattoo) => (
                        <div
                            key={tattoo}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("tattoo", tattoo)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.tattoo.includes(tattoo) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{tattoo}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/hood.png`} text="CLOTHES">
                    {["CLOTHES-3", "CLOTHES-4-GREY", "CLOTHES-6", "CLOTHES-11", "CLOTHES-12", "CLOTHES-13", "CLOTHES-17", "CLOTHES-21", "CLOTHES-23", "CLOTHES-25", "CLOTHES-28", "CLOTHES-30"].map((clothes) => (
                        <div
                            key={clothes}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("clothes", clothes)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.clothes.includes(clothes) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{clothes}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/helmet.png`} text="HEADGEAR">
                    {["HEADGEAR-3", "HEADGEAR-4", "HEADGEAR-6", "HEADGEAR-7", "HEADGEAR-8", "HEADGEAR-9", "HEADGEAR-10"].map((headgear) => (
                        <div
                            key={headgear}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("headgear", headgear)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.headgear.includes(headgear) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{headgear}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/balaclava.png`} text="FACEGEAR">
                    {["FACEGEAR-1"].map((facegear) => (
                        <div
                            key={facegear}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("headgear", facegear)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.facegear.includes(facegear) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{facegear}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/sun-glasses.png`} text="EYES FLARE">
                    {["EYESFLARE-1"].map((eyes_flare) => (
                        <div
                            key={eyes_flare}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("headgear", eyes_flare)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.eyes_flare.includes(eyes_flare) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{eyes_flare}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/long-wavy-hair-variant.png`} text="HAIR">
                    {["HAIR-3", "HAIR-4", "HAIR-5", "HAIR-7-GREY", "HAIR-8", "HAIR-9", "HAIR-11", "HAIR-11-BLACK", "HAIR-18-GREY", "HAIR-19", "HAIR-20"].map((hair) => (
                        <div
                            key={hair}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("hair", hair)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.hair.includes(hair) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{hair}</span>
                        </div>
                    ))}
                </Collapse>
                <Collapse icon={`/assets/images/icons/weapons.png`} text="WEAPON">
                    {["WEAPON-1", "WEAPON-4", "WEAPON-7", "WEAPON-8", "WEAPON-9", "WEAPON-11", "WEAPON-13", "WEAPON-14", "WEAPON-15", "WEAPON-16", "WEAPON-25", "WEAPON-28", "WEAPON-30", "WEAPON-32"].map((weapon) => (
                        <div
                            key={weapon}
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => handleFilterClick("weapon", weapon)}
                        >
                            <div
                                className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.weapon.includes(weapon) ? "bg-red-500" : "bg-gray-600"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-300">{weapon}</span>
                        </div>
                    ))}
                </Collapse>*/}
            </div>

            {/* Main Content */}
            <div className={`h-[calc(100vh-72.51px)] duration-200 flex flex-col items-center w-full overflow-y-auto filter-bar ${isOpenSidebar ? "lg:pl-96" : "pl-0"}`}>
                <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: isHeaderVisible ? 0 : -100 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-gray-800 flex justify-between p-4 shadow-lg shadow-black/50 w-full border-b border-gray-700`}>
                    <BsArrowLeft onClick={() => setIsOpenSidebar(!isOpenSidebar)} className={`cursor-pointer duration-300 text-3xl text-gray-300 hover:text-white ${!isOpenSidebar && "rotate-180"}`} />
                </motion.div>
                <div className="flex flex-col gap-4 px-4 py-8 w-full">
                    <div className="flex flex-col gap-2 w-full sm:w-[400px]">
                        <div className="flex items-center relative w-full">
                            <BiSearch className="absolute left-2 text-gray-400 text-2xl" />
                            <input
                                className="border-b-2 border-gray-600 bg-gray-800 rounded-t-md text-gray-100 pl-10 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors duration-300 w-full placeholder-gray-400 shadow-md"
                                placeholder="SEARCH CITIZEN"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <AnimatePresence>
                                {searchKeyword && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => setSearchKeyword("")}
                                        className="absolute right-2 text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        <MdClose className="text-xl" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="text-[0.7rem] text-gray-500">
                            Search by token number, background, body type, eyes, clothes, weapons, and more...
                        </div>
                    </div>
                    {debouncedSearchKeyword && (
                        <div className="text-sm text-gray-400">
                            Found {filteredNfts.length} citizen{filteredNfts.length !== 1 ? 's' : ''} for &quot;{debouncedSearchKeyword}&quot;
                        </div>
                    )}
                    <div className="gap-6 flex flex-wrap">
                        {filteredNfts.map((c, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="flex flex-col gap-2"
                                key={index}
                                onClick={() => { setSelectedCitizen(c); setIsOpenModal(true); }}
                            >
                                <Image
                                    alt={c.id.toString()}
                                    className="cursor-pointer duration-300 rounded-xl hover:scale-[1.05] sm:h-56 sm:w-56 shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-red-500/20"
                                    width={1080}
                                    height={1080}
                                    src={`/assets/images/nfts/${c.code.padStart(4, '0')}.png`}
                                />
                                <div className={`flex items-center justify-between text-gray-100`}>
                                    <span className="font-bold">No. {c.code.padStart(4, '0')}</span>
                                    <div className="flex gap-2 items-center text-xs text-gray-300">
                                        <AnimatedCounter value={c.likes_count} color="white" fontSize="16px" includeCommas={true} includeDecimals={false} />
                                        <button
                                            onClick={(e) => handleLikeToggle(c.id, e)}
                                            className={`transition-colors duration-200 active:scale-[1.2] ${likedCitizens.has(c.id)
                                                ? 'text-red-500 hover:opacity-80'
                                                : 'text-gray-400 hover:text-red-500 hover:scale-[0.9]'
                                                }`}
                                        >
                                            <BiLike className={`text-xl ${likedCitizens.has(c.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <AnimatePresence>
            {
                isOpenModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-black/50 fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col lg:flex-row max-h-[calc(100vh-20px)] max-w-[500px] lg:max-w-[1024px] xl:max-w-[1280px] overflow-y-auto relative rounded-2xl overflow-hidden">
                            <Image
                                alt={selectedCitizen.code.padStart(4, '0')}
                                className="lg:w-[50%]"
                                width={1080}
                                height={1080}
                                src={`/assets/images/nfts/${selectedCitizen.code.padStart(4, '0')}.png`}
                            />
                            <button onClick={() => setIsOpenModal(false)} 
                                className="absolute duration-200 flex items-center left-4 bottom-4 text-2xl hover:opacity-50"
                                style={{
                                    color: bgColors.find(e => e.id === selectedCitizen.background)?.text_color
                                }}    
                            >
                                <IoIosArrowBack /> BACK
                            </button>
                            <div className={`flex flex-col gap-2 p-8 w-full`} style={{
                                backgroundColor: bgColors.find(e => e.id === selectedCitizen.background)?.color,
                                color: bgColors.find(e => e.id === selectedCitizen.background)?.text_color
                            }}>
                                <div>TN7 NFTs Main Collection2</div>
                                <div className={`font-bold text-3xl`}>No. {selectedCitizen.code.padStart(4, '0')}</div>
                                <div className="flex gap-4 items-center">
                                    <div className="text-xs text-left">RANK <br /> N/A</div>
                                    <div className="text-xs text-left">LIKES <br /> {filteredNfts.find(e => e.id === selectedCitizen.id)?.likes_count || 0}</div>
                                    <button
                                        onClick={(e) => handleLikeToggle(selectedCitizen.id, e)}
                                        className={`duration-200 active:scale-[1.2] transition-colors ${likedCitizens.has(selectedCitizen.id)
                                            ? 'text-red-500 hover:opacity-80'
                                            : `bg-${bgColors.find(e => e.id === selectedCitizen.background)?.text_color} hover:text-red-500 hover:scale-[0.9]`
                                            }`}
                                    >
                                        <BiLike className={`text-2xl ${likedCitizens.has(selectedCitizen.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <div id="attributes" className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                                    {
                                        [
                                            { name: "BACKGROUND", image: "background", type: "background" as keyof citizenProps },
                                            { name: "TYPE", image: "type", type: "type" as keyof citizenProps },
                                            { name: "OUTFIT", image: "outfit", type: "outfit" as keyof citizenProps },
                                            { name: "EYES", image: "eyes", type: "eyes" as keyof citizenProps },
                                            { name: "MOUTH", image: "mouth", type: "mouth" as keyof citizenProps },
                                            { name: "HAIR", image: "hair", type: "hair" as keyof citizenProps },
                                            { name: "TATTOO", image: "tattoo", type: "tattoo" as keyof citizenProps },
                                            { name: "OBJECT", image: "object", type: "object" as keyof citizenProps },
                                            { name: "SPECIAL", image: "special", type: "special" as keyof citizenProps },
                                            { name: "PET", image: "pet", type: "pet" as keyof citizenProps },
                                            { name: "ELEMENT", image: "element", type: "element" as keyof citizenProps },
                                            { name: "GLASSES", image: "glasses", type: "glasses" as keyof citizenProps },
                                        ].map((attr, index) => (
                                            selectedCitizen[attr.type] !== null && components[attr.type.charAt(0).toUpperCase() + attr.type.slice(1)].find(e => e.id === selectedCitizen[attr.type])?.meta_type ?
                                                <div key={index} className={`bg-black/5 backdrop-blur-lg duration-300 flex gap-2 hover:scale-105 items-center p-4 rounded-md shadow-md`}
                                                    style={{
                                                        color: bgColors.find(e => e.id === selectedCitizen.background)?.text_color
                                                    }}
                                                >
                                                    {/*<Image className="w-6 h-6" alt="" width={512} height={512} src={`/assets/images/icons/${attr.image}.png`} />*/}
                                                    <div className="flex flex-col w-full">
                                                        <span className="font-light text-xs">{attr.name}</span>
                                                        <span className="font-bold text-sm">{components[attr.type.charAt(0).toUpperCase() + attr.type.slice(1)].find(e => e.id === selectedCitizen[attr.type])?.meta_type || "N/A"}</span>
                                                        <div className="flex items-center justify-between mt-2 w-full">
                                                            <div className="bg-black/10 backdrop-blur-md rounded-md p-2 flex gap-2 shadow-md">
                                                                <span className="font-light text-xs">{components[attr.type.charAt(0).toUpperCase() + attr.type.slice(1)].find(e => e.id === selectedCitizen[attr.type])?.rarity_percent || "0.00%"}</span>
                                                                <span className="font-light text-xs">{components[attr.type.charAt(0).toUpperCase() + attr.type.slice(1)].find(e => e.id === selectedCitizen[attr.type])?.rarity_count || 0}</span>
                                                            </div>
                                                            <span className="font-light text-xs">{components[attr.type.charAt(0).toUpperCase() + attr.type.slice(1)].find(e => e.id === selectedCitizen[attr.type])?.rarity_count_full || 0}</span>
                                                        </div>
                                                    </div>
                                                </div> : null
                                        ))
                                    }
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )
            }
        </AnimatePresence>
    </div>);
};

export default Citizen;
