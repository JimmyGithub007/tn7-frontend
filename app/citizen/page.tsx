"use client";

import Image from "next/image";
import { useState, useReducer, useEffect } from "react";
import { BiLike, BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setContent, setIsOpen } from "@/store/slice/dialogSlice";
import { IoIosClose } from "react-icons/io";

type citizenProps = {
    code: number;
    background: string;
    body: string;
    eyes: string;
    tattoo: string | null;
    clothes: string;
    headgear: string | null;
};

const Citizens: citizenProps[] = [
    { code: 10032, background: "BG-2", body: "M_BODY_ANGRY_2", eyes: "M_GREY", tattoo: null, clothes: "CLOTHES-4-GREY", headgear: null },
    { code: 10040, background: "BG-5", body: "M_BODY_ANGRY_2", eyes: "M_PURPLE", tattoo: null, clothes: "CLOTHES-3", headgear: "HEADGEAR-9" },
    { code: 10083, background: "BG-6", body: "M_BODY_ANGRY_2", eyes: "M_PURPLE", tattoo: null, clothes: "CLOTHES-31", headgear: null },
    { code: 10111, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_RED", tattoo: null, clothes: "CLOTHES-17", headgear: "HEADGEAR-4" },
    { code: 10144, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_GREEN", tattoo: null, clothes: "CLOTHES-23", headgear: "HEADGEAR-10" },
    { code: 10155, background: "BG-5", body: "M_BODY_ANGRY_2", eyes: "M_PINK", tattoo: null, clothes: "CLOTHES-12", headgear: null },
    { code: 10156, background: "BG-4", body: "M_BODY_ANGRY_2", eyes: "M_RED", tattoo: "TATTOO-10", clothes: "CLOTHES-6", headgear: null },
    { code: 10175, background: "BG-2", body: "M_BODY_ANGRY_2", eyes: "M_GREEN", tattoo: null, clothes: "CLOTHES-30", headgear: "HEADGEAR-8" },
    { code: 10180, background: "BG-3", body: "M_BODY_ANGRY_2", eyes: "M_GREY", tattoo: "TATTOO-6", clothes: "CLOTHES-13", headgear: "HEADGEAR-3" },
    { code: 10182, background: "BG-5", body: "M_BODY_ANGRY_2", eyes: "M_PURPLE", tattoo: null, clothes: "CLOTHES-16", headgear: null },
    { code: 10183, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_GREEN", tattoo: null, clothes: "CLOTHES-21", headgear: "HEADGEAR-4" },
    { code: 10215, background: "BG-2", body: "M_BODY_ANGRY_2", eyes: "M_RED", tattoo: null, clothes: "CLOTHES-28", headgear: null },
    { code: 10224, background: "BG-3", body: "M_BODY_ANGRY_2", eyes: "M_GREEN", tattoo: null, clothes: "CLOTHES-25", headgear: "HEADGEAR-7" },
    { code: 10230, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_GREEN", tattoo: null, clothes: "CLOTHES-6", headgear: null },
    { code: 10243, background: "BG-5", body: "M_BODY_ANGRY_2", eyes: "M_PINK", tattoo: "TATTOO-2", clothes: "CLOTHES-12", headgear: "HEADGEAR-6" },
    { code: 10255, background: "BG-1", body: "M_BODY_ANGRY_2", eyes: "M_GREY", tattoo: null, clothes: "CLOTHES-11", headgear: null },

];

const filterReducer = (state: any, action: any) => {
    switch (action.type) {
        case "TOGGLE_FILTER":
            const { filterType, value } = action.payload;
            const currentFilters = state[filterType];
            const updatedFilters = currentFilters.includes(value)
                ? currentFilters.filter((item: string) => item !== value)
                : [...currentFilters, value];
            return { ...state, [filterType]: updatedFilters };
        default:
            return state;
    }
};

const Collapse = ({ icon, text, children }: { icon: string, text: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useReducer((state: boolean) => !state, false);

    return (
        <div className="border-b-[1px]">
            <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen()}
            >
                <div className="flex items-center gap-2 font-bold text-xs pb-2">
                    <Image className="w-8" alt="icon" width={512} height={512} src={icon} />
                    {text}
                </div>
                <span className="font-bold">{isOpen ? "-" : "+"}</span>
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
        </div>
    );
};

const Citizen = () => {
    const dispatch = useDispatch();
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(true);

    const [filters, dispatchFilter] = useReducer(filterReducer, {
        background: [],
        body: [],
        eyes: [],
        tattoo: [],
        clothes: [],
        headgear: [],
    });

    const handleFilterClick = (filterType: string, value: string) => {
        dispatchFilter({ type: "TOGGLE_FILTER", payload: { filterType, value } });
    };

    const filteredCitizens = Citizens.filter((c) =>
        (Object.keys(filters) as (keyof citizenProps)[]).every((key) =>
            filters[key].length === 0 || filters[key].includes(c[key])
        )
    );

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

    return (
        <div className="bg-white min-h-screen w-full">
            <div className="flex gap-2">
                {/* Left Sidebar */}
                <div className={`bg-white duration-200 filter-bar absolute lg:fixed flex flex-col gap-4 h-screen overflow-y-auto px-8 w-full lg:w-96 z-50 ${isOpenSidebar ? "left-0" : "-left-full"}`}>
                    <div className="flex items-center justify-between">
                        <Image alt="logo" className="w-32" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} />
                        <MdClose onClick={() => setIsOpenSidebar(false)} className="cursor-pointer text-5xl lg:hidden" />
                    </div>
                    <div className="flex font-bold gap-4 text-xl">
                        <Image className="w-6" alt="filters" width={512} height={512} src={`/assets/images/icons/filter.png`} />
                        FILTERS
                    </div>
                    <Collapse icon={`/assets/images/icons/background.png`} text="BACKGROUND">
                        {["BG-1", "BG-2", "BG-3", "BG-4", "BG-5", "BG-6"].map((bg) => (
                            <div
                                key={bg}
                                className="flex items-center gap-2 cursor-pointer mb-2"
                                onClick={() => handleFilterClick("background", bg)}
                            >
                                <div
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.background.includes(bg) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{bg}</span>
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
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.body.includes(body) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{body}</span>
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
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.eyes.includes(eyes) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{eyes}</span>
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
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.tattoo.includes(tattoo) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{tattoo}</span>
                            </div>
                        ))}
                    </Collapse>
                    <Collapse icon={`/assets/images/icons/hood.png`} text="CLOTHES">
                        {["CLOTHES-3", "CLOTHES-4-GREY", "CLOTHES-6", "CLOTHES-12"].map((clothes) => (
                            <div
                                key={clothes}
                                className="flex items-center gap-2 cursor-pointer mb-2"
                                onClick={() => handleFilterClick("clothes", clothes)}
                            >
                                <div
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.clothes.includes(clothes) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{clothes}</span>
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
                                    className={`duration-200 rounded-sm h-4 shadow-sm w-4 ${filters.headgear.includes(headgear) ? "bg-red-800" : "bg-gray-300"
                                        }`}
                                ></div>
                                <span className="text-xs text-slate-800">{headgear}</span>
                            </div>
                        ))}
                    </Collapse>
                </div>

                {/* Main Content */}
                <div className={`duration-200 flex flex-col items-center w-full ${isOpenSidebar ? "lg:pl-96" : "pl-0"}`}>
                    <div className="bg-slate-50 flex justify-between p-4 shadow-sm w-full">
                        <BsArrowLeftCircleFill onClick={() => setIsOpenSidebar(!isOpenSidebar)} className={`cursor-pointer duration-300 text-3xl ${isOpenSidebar && "rotate-180"}`} />
                    </div>
                    <div className="flex flex-col gap-4 py-8">
                        <div className="flex items-center relative w-fit">
                            <BiSearch className="absolute left-0 text-slate-800 text-2xl" />
                            <input
                                className="border-b-2 pl-8 py-2 text-sm focus:outline-none focus:border-slate-800 transition-colors duration-300 w-screen sm:w-80"
                                placeholder="SEARCH TOKEN"
                            />
                        </div>
                        <div className="items-center gap-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {filteredCitizens.map((c, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col gap-2"
                                    key={index}
                                    onClick={() => {
                                        dispatch(setContent(
                                            <div className="flex flex-col lg:flex-row max-h-[calc(100vh-20px)] max-w-[1280px] overflow-y-auto relative">
                                                <button onClick={() => dispatch(setIsOpen(false))} className="absolute duration-200 p-2 right-4 rounded-full hover:bg-slate-50 hover:shadow-sm top-4 text-4xl">
                                                    <IoIosClose />
                                                </button>
                                                <Image
                                                    alt={c.code.toString()}
                                                    className="w-[50%]"
                                                    width={1080}
                                                    height={1080}
                                                    src={`/assets/images/citizens/${c.code}.png`}
                                                />
                                                <div className="flex flex-col gap-4 p-8 w-full">
                                                    <span className="font-bold text-3xl">No. {c.code}</span>
                                                    <div id="attributes" className="gap-4 grid grid-cols-2">
                                                        {
                                                            [
                                                                { name: "BACKGROUND", image: "background", type: "background" as keyof citizenProps },
                                                                { name: "BODY", image: "upper-body", type: "body" as keyof citizenProps },
                                                                { name: "EYES", image: "eye-makeup", type: "eyes" as keyof citizenProps },
                                                                { name: "TATTOO", image: "tattoo", type: "tattoo" as keyof citizenProps },
                                                                { name: "CLOTHES", image: "hood", type: "clothes" as keyof citizenProps },
                                                                { name: "HEADGEAR", image: "helmet", type: "headgear" as keyof citizenProps }
                                                            ].map((attr, index) => (
                                                                c[attr.type] !== null ?
                                                                <div key={index} className="bg-slate-100 duration-300 flex gap-2 hover:scale-105 items-center p-4 rounded-sm shadow-sm">
                                                                    <Image className="w-6 h-6" alt="" width={512} height={512} src={`/assets/images/icons/${attr.image}.png`} />
                                                                    <div className="flex flex-col text-xs ">
                                                                        <span className="text-slate-400">{attr.name}</span>
                                                                        <span className="font-bold">{c[attr.type]}</span>
                                                                    </div>
                                                                </div> : null
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                        dispatch(setIsOpen(true));
                                    }}
                                >
                            <Image
                                alt={c.code.toString()}
                                className="cursor-pointer duration-300 rounded-xl hover:scale-[1.05] h-48 w-48 shadow-md shadow-slate-800/50"
                                width={1080}
                                height={1080}
                                src={`/assets/images/citizens/${c.code}.png`}
                            />
                            <div className="flex items-center justify-between text-xs">
                                <span>No. {c.code}</span>
                                <div className="flex gap-2 items-center">
                                    1000{" "}
                                    <BiLike className="bg-slate-200 p-1 rounded-md shadow-sm text-2xl" />
                                </div>
                            </div>
                        </motion.div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
};

export default Citizen;
