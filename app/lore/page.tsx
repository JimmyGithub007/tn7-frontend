"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Footer, Header, Loader, ProgressiveImage } from "@/components";
import { TbArrowBackUp } from "react-icons/tb";
import { useSearchParams } from 'next/navigation';
import { opinionPro } from "@/components/Font";

import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";

const details = [
    {
        id: "1", category: "cities", detail: `<p>The city is a fascinating mix of old traditions and new technology, where ancient buildings stand side by side with gleaming skyscrapers. A perpetual red glow illuminates the city, casting a warm and reddish light on everything it touches.</p>
            <p>This crimson hue comes from the city's unique energy grid, powered by an ancient power that the locals seldom discuss and often regard as legend.</p><br/>
            <p>Harnessed and amplified by modern technology, this crimson hue symbolizes the harmony between tradition and innovation. The city is split between two districts: The Upper District and The SilverCoin District.</p>
            <p>The Upper District represents the economic power of the city, housing the rich and powerful, an area seamlessly adapted to new technology and modern conveniences. In stark contrast, The SilverCoin District is a crowded and neglected part of SynthCity. Gritty and overpopulated, this district is a place where survival comes above all else.</p>
        `,
        children: [
            { name: "The Pinnacle Towers", url: "/lore?category=locations&id=2" },
            { name: "The Temple on the Hill", url: "/lore?category=locations&id=1" },
            { name: "SilverCoin District", url: "/lore?category=locations&id=3" }
        ]
    },
    {
        id: "2", category: "cities", detail: `<p>Cyber Valley is situated adjacent to SynthCity, separated by a strip of land known as The Black Zone, filled with rundown, abandoned old houses and factories. The ownership of the land remains disputed between the two cities, resulting in the area now serving as a contentious buffer zone between them.</p><br/>
            <p>Cyber Valley stands as the epicenter of all things technological, serving both beneficial and nefarious purposes. In this city, anything has a price, blurring the lines between technology and morality.</p><br/>
            <p>A vibrant city where the streets are bathed in a perpetual neon glow of blue, purple, and fluorescent lights. Punctuated by towering signboards, holographic displays and virtual reality simulations coming alive in a symphony of light and color.</p>
        `,
        children: [
            { name: "The Koi and Lotus Club", url: "/lore?category=locations&id=5" },
            { name: "The Codex", url: "/lore?category=locations&id=6" },
            { name: "The Watering Hole", url: "/lore?category=locations&id=4" }
        ]
    },
    {
        id: "3", category: "cities", detail: `<p>New Helm is an industrial city built on concrete and rich in geothermal energy. Yet, despite its wealth, the city remains far from flourishing. Under the iron rule of the Akio Family, the city is tightly controlled. Surveillance is pervasive, and guards patrol every corner. Nothing moves through New Helm unnoticed. Every transaction, shipment, and visitor is meticulously monitored, and entry is only granted to those with a special permit.</p><br/>
            <p>Surrounded by the vast expanse of The Wandering Wasteland, a relentless desert that acts as a natural barrier, New Helm is further isolated from the outside world.</p><br/>
            <p>Beneath the city, a massive reservoir of geothermal energy is continuously harnessed to sustain it. Relentless extraction and refining have left New Helm shrouded in an eerie green hue, a constant reminder of the industry that sustains it.</p>
        `,
        children: [
            { name: "Akio Industries", url: "/lore?category=locations&id=8" },
            { name: "The Fort", url: "/lore?category=locations&id=7" },
            { name: "The Energy Field", url: "/lore?category=locations&id=9" }
        ]
    },

    {   id: "1", category: "locations", detail: `<p>The Temple overlooks the city, accessible only by a long, steep staircase lined with lush greenery. It features a layered roof, its eaves curving gracefully and adorned with intricate carvings of celestial symbols. The central entranceway is framed by a large illuminated red panel that casts a warm welcoming glow. On either side of the entrance, two stylized fox-like figures stand as silent protectors.</p><br />
            <p>The Temple’s origins are shrouded in mystery, its history tracing back to the time of the Old World when Celestial Beings were worshipped and believed to grant untold power to their followers. For centuries, the Enji-gumi family, leader of the White Lily Clan, has used the temple as a sacred sanctuary—a place where each ruling head sought wisdom and prayed for guidance during times of uncertainty.</p>
        `,
        children: [
            { name: "SynthCity", url: "/lore?category=cities&id=1" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=1" }
        ]
    },
    {   id: "2", category: "locations", detail: `<p>The Pinnacle Towers serve as the headquarters of the White Lily Clan. The complex consists of two structures that dominate the skyline. The sleek glass-and-steel exterior of each tower reflect the modernity and innovation of the clan. Rising side by side, each tower symbolizes a key element of the White Lily clan’s influence: one represents the people—their strength, resilience, and unity—and the other embodies the city itself, a beacon of progress and prosperity. The space between the towers sits the clan's emblem, representing the heights the White Lily clan has reached with its people and the city.</p><br />
            <p>The Pinnacle Towers were constructed at the peak of SynthCity’s technological and economic boom. In a bid to modernize and further cement their legacy, the White Lily Clan sought to build a grand and impenetrable headquarters. The towers symbolize not just the clan’s unwavering dominance but a reinvention of their power, reinforcing their status at the very heart of the city.</p>
        `,
        children: [
            { name: "SynthCity", url: "/lore?category=cities&id=1" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=1" }
        ]
    },
    {   id: "3", category: "locations", detail: `<p>The underbelly of SynthCity, where survival takes precedence over everything else. Seemingly forgotten by time and progress, the district is marked by narrow, cluttered streets lined with dilapidated buildings and flickering street lights. The buildings are old and crumbling, their facades faded and cracked. The air is thick with smoke, and the scent of decay fills the space.</p><br />
            <p>During SynthCity’s economic boom, which attracted an influx of people from across the land, the district became a chaotic overflow. As the upper levels expanded, the lower district was pushed beyond its capacity. Displaced workers, immigrants, and those without homes flooded the area. Smaller clans, eager for power, filled the vacuum left by the absence of the city’s oversight.</p>
        `,
        children: [
            { name: "SynthCity", url: "/lore?category=cities&id=1" },
            { name: "To be revealed", url: "/lore?category=cities&id=1" }
        ]
    },
    {   id: "4", category: "locations", detail: `<p>At the core of Cyber Valley lies a bustling marketplace where vendors assemble to sell their latest tech offerings. The Watering Hole has a massive retractable dome that looms overhead, shielding the square from harsh weather, ensuring that trade never stops. Encircling the market is a circular wall, its intricate mechanical panels, glowing lights, and exposed machinery giving it an industrial look. A vibrant blue light pulses from its base, casting a luminous glow over the marketplace.</p><br />
            <p>What began as a humble trading post for small, independent merchants has grown alongside Cyber Valley, evolving into a central hub for commerce. The retractable dome was added later to protect traders from unpredictable weather. While major corporations have their official storefronts, The Watering Hole remains the go-to place for rare tech, custom modifications, and unregulated innovations.</p>
        `,
        children: [
            { name: "Cyber Valley", url: "/lore?category=cities&id=2" },
            { name: "Secret of the Valley", url: "/lore?category=cities&id=2" }
        ]
    },
    {   id: "5", category: "locations", detail: `<p>The premier hotspot of Cyber Valley—a hub for power plays and secret deals. The Koi and Lotus Club is a sight to behold. A pair of massive koi holograms glide gracefully above a luminous lotus flower. The neon glow radiating from the lotus casts vibrant reflections on their shimmering scales, creating a mesmerizing dance of light and color. The two koi symbolize the dual nature of the club—one side steeped in legitimacy, the other entrenched in the underground.</p><br />
            <p>Before becoming Cyber Valley&apos;s premier hotspot, the Koi and Lotus Club had a dark past. It was a notorious brothel controlled by a powerful syndicate tied to human trafficking. When The Misfits rose to prominence, they dismantled the syndicate in a brutal and calculated takeover, freeing those trapped within its walls. Rather than tearing the place down, they repurposed it - turning it into a high-end club that thrived on exclusivity and influence.</p>
        `,
        children: [
            { name: "Cyber Valley", url: "/lore?category=cities&id=2" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=2" }
        ]
    },
    {   id: "6", category: "locations", detail: `<p>A sanctuary of knowledge, where ancient wisdom meets cutting-edge breakthroughs. A towering structure stands prominently atop a solid base, its multi-leveled structure featuring sections with viewing ports. The angular architecture culminates in five wing-like extensions at the top, glowing with purple and green lights—symbolizing the open acceptance of all knowledge and inviting exploration from every perspective.</p><br />
            <p>The Codex is safeguarded by The Order of the Luminary Brotherhood, the keepers of knowledge. The Librarians within assist visitors in uncovering and interpreting the information they seek.</p>
        `,
        children: [
            { name: "Cyber Valley", url: "/lore?category=cities&id=2" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=2" }
        ]
    },
    {   id: "7", category: "locations", detail: `<p>The Fort serves as the city’s only access point. A heavily fortified mechanized gate, reinforced with red titanium bars, is flanked by automated turrets and towering machine gun emplacements. Guards patrol the perimeter around the clock, their presence constant and unyielding. High-powered surveillance cameras and motion sensors are strategically positioned to track every movement, ensuring that nothing enters or exits unnoticed.</p><br />
            <p>The Fort was built in the aftermath of the failed rebellion during the Great Revolution of New Helm. Shaken by the uprising and determined to prevent another revolt, the Akio Family sealed off the city, constructing The Fort as both a gateway and a symbol of their absolute rule - a reminder to the people that rebellion was no longer an option.</p>
        `,
        children: [
            { name: "New Helm", url: "/lore?category=cities&id=3" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=3" }
        ]
    },
    {   id: "8", category: "locations", detail: `<p>The Akio Family's business headquarters takes the form of a massive concrete pyramid, its colorless facade allowing the pervasive green hue of the city to bounce off its grey surface, casting an eerie, sinister glow. At the centre of the fortress, large glass panels offer a clear view of <a class="text-red-800 underline" href="/lore?category=locations&id=7">The Fort</a></p><br />
            <p>The fortress was the birthplace of the Akio Family's rise to power. Built from the ground up by the first family patriarch, it was designed to house both the growing Akio Industries and the family's political ambitions over New Helm. As the family's influence expanded, so did the fortress, becoming the symbol of their unwavering grip on both business and governance, reflecting their unrelenting drive to control every facet of New Helm.</p>
        `,
        children: [
            { name: "New Helm", url: "/lore?category=cities&id=3" },
            { name: "Path of Vengeance", url: "/lore?category=cities&id=3" }
        ]
    },
    {   id: "9", category: "locations", detail: `<p>The Energy Field, built by Akio Industries, is used to extract geothermal energy. At its core, a colossal turbine spins continuously, activating the drills. The structure is surrounded by angular, reinforced walls that house essential processing and monitoring stations.</p>
            <p>A sickly, unnatural green glow emanates from the reservoir of extracted energy, casting an eerie light onto the surrounding infrastructure. A thick green smog lingers over the facility, creeping into the city.</p><br />
            <p>In the early days, the facility was hailed as a groundbreaking achievement, with Akio Industries promising clean, limitless energy for the entire city. The complex was built over a decade, with the company's vast resources poured into its construction. However, as time passed, rumors began to spread about the true sustainability of the geothermal reservoir. The green smog, a byproduct of the drilling, began to spread through the city, suffocating the air and creating a haze that never fully dissipated.</p>
        `,
        children: [
            { name: "New Helm", url: "/lore?category=cities&id=3" },
            { name: "To be revealed", url: "/lore?category=cities&id=3" }
        ]
    },
]

const contents = [
    { id: "1", name: "SHIN", img: "c1", category: "characters" },
    { id: "2", name: "GAMA", img: "c2", category: "characters" },
    { id: "3", name: "EDWARD", img: "c3", category: "characters" },
    { id: "4", name: "HARU", img: "c4", category: "characters" },
    { id: "5", name: "BARTENDER", img: "c5", category: "characters" },
    { id: "6", name: "GANGSTER", img: "c6", category: "characters" },
    { id: "7", name: "GANGSTER", img: "c7", category: "characters" },
    { id: "8", name: "GANGSTER", img: "c8", category: "characters" },

    { id: "1", name: "SYNTHCITY", img: "city1", category: "cities" },
    { id: "2", name: "CYBER VALLEY", img: "city2", category: "cities" },
    { id: "3", name: "NEW HELM", img: "city3", category: "cities" },

    { id: "1", name: "TEMPLE ON THE HILL", img: "b1", category: "locations" },
    { id: "2", name: "SILVERCOIN DISTRICT", img: "b2", category: "locations" },
    { id: "3", name: "THE LOWER DISTRICT ", img: "b3", category: "locations" },
    { id: "4", name: "THE WATERING HOLE", img: "b4", category: "locations" },
    { id: "5", name: "THE KOI AND LOTUS CLUB", img: "b5", category: "locations" },
    { id: "6", name: "THE CODEX", img: "b6", category: "locations" },
    { id: "7", name: "THE FORT", img: "b7", category: "locations" },
    { id: "8", name: "AKIO INDUSTRIES", img: "b8", category: "locations" },
    { id: "9", name: "THE ENERGY FIELD", img: "b9", category: "locations" },

    { id: "1", name: "THE WHITE LILY", img: "c1", category: "clans" },
    { id: "2", name: "THE REAPER'S HAND", img: "c2", category: "clans" },
    { id: "3", name: "AKIO'S INDUSTRIES", img: "c3", category: "clans" },
    { id: "4", name: "THE MISFITS", img: "c4", category: "clans" },

    { id: "1", name: "LUNEX (LX)", img: "c1", category: "currency" },
    { id: "2", name: "LUNEX (LX)", img: "c2", category: "currency" },
    { id: "3", name: "LUNEX (LX)", img: "c3", category: "currency" },
    { id: "4", name: "LUNEX (LX)", img: "c4", category: "currency" },

    { id: "1", name: "CANE", img: "b1", category: "badges" },
    { id: "2", name: "LILY", img: "b2", category: "badges" },
    { id: "3", name: "BLADE", img: "b3", category: "badges" },
    { id: "4", name: "GONG", img: "b4", category: "badges" },
    { id: "5", name: "BAT", img: "b5", category: "badges" },
    { id: "6", name: "HARU HAT", img: "b6", category: "badges" },
    { id: "7", name: "AKIO ARM", img: "b7", category: "badges" },
    { id: "8", name: "ASSASSIN", img: "b8", category: "badges" },
    { id: "9", name: "SHIN CLAN", img: "b9", category: "badges" },
    { id: "10", name: "REIKO CLAN", img: "b10", category: "badges" },
    { id: "11", name: "AKIO CLAN", img: "b11", category: "badges" },
    { id: "12", name: "PKCHUE", img: "b12", category: "badges" },
    
    { id: "1", name: "DRAGON", img: "g1", category: "government" },
];

const menus = [
    { id: "characters", title: "CHARACTERS", url: "" },
    { id: "cities", title: "CITIES", url: "" },
    { id: "locations", title: "LOCATIONS", url: "" },
    { id: "clans", title: "CLANS", url: "" },
    { id: "currency", title: "CURRENCY", url: "" },
    { id: "badges", title: "BADGES", url: "" },
    { id: "government", title: "GOVERNMENT", url: "" },
];

const Content = () => {
    const searchParams = useSearchParams()
    
    const [category, setCategory] = useState<string>("cities");
    const [loreId, setLoreId] = useState<string>("0");
    const [imgHeight, setImgHeight] = useState<number>(0);
    const [imgWidth, setImgWidth] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        if (searchParams) {  // Ensure the router is ready before accessing query
            if(searchParams.has("category")) setCategory(searchParams.get("category") as string);
            if(searchParams.has("id")) setLoreId(searchParams.get("id") as string);
        }
    }, [searchParams]);

    const calculateImgHeight = () => {
        // 使用图片的比例或任何逻辑动态计算高度
        let contentFrame = document.querySelector("img[alt='contentFrameHorizontal']"); // 选择你的 ContentFrame 图片
        if(window.innerWidth < 640) {
            setIsMobile(true);
            contentFrame = document.querySelector("img[alt='contentFrameVertical']"); // 选择你的 ContentFrame 图片
        } else {
            setIsMobile(false);
        }

        if (contentFrame) {
            const height = contentFrame.clientHeight;
            setImgHeight(height);
            const width = contentFrame.clientWidth;
            setImgWidth(width);
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

    return (<div className="flex h-full items-center w-full">
        <div className="-ml-[68px] hidden lg:flex items-center relative h-[80%] max-h-[600px]">
            <Image className="absolute scale-[1.25] z-10 h-[inherit]" alt="" width={1384} height={2448} src={`/assets/images/lore/SideBarFrame.png`} priority />
            <div className="filter-bar grid grid-rows-7 h-[inherit] overflow-y-auto">
                {
                    menus.map((menu, key) => (
                        <Link
                            href={{ pathname: '/lore', query: { category: menu.id, id: "0" } }}
                            className={`cursor-pointer duration-300 flex items-center py-4 text-white z-10 ${menu.id === category ? "bg-gradient-to-r from-orange-500 to-yellow-500" : "hover:text-yellow-400"}`} key={key}>
                            <span className="px-20 z-10">{menu.title}</span>
                        </Link>
                    ))
                }
            </div>
        </div>
        <div className="h-full w-full flex flex-col items-center justify-center mt-24 lg:mt-0">
            <div className="flex h-10 w-full overflow-x-auto lg:invisible">
                {
                    menus.map((menu, key) => (
                        <Link
                            href={{ pathname: '/lore', query: { category: menu.id, id: "0" } }}
                            className={`cursor-pointer duration-300 flex items-center text-white z-10 ${menu.id === category ? "bg-gradient-to-r from-orange-500 to-yellow-500" : "hover:text-yellow-400"}`} key={key}>
                            <span className="px-6 z-10">{menu.title}</span>
                        </Link>
                    ))
                }
            </div>
            <div className="h-[calc(100vh-120px)] w-full sm:w-[85%] flex items-top sm:items-center justify-center mt-12 sm:-mt-10">
                <div className="relative h-[calc(100vh-300px)] w-full flex items-center justify-center">
                    <Image className="invisible sm:visible absolute" alt="contentFrameHorizontal" height={1287} width={2187} src={`/assets/images/lore/webp/ContentFrameHorizontal.webp`} priority />
                    <Image className="sm:invisible absolute h-[calc(100vh-220px)] w-auto" alt="contentFrameVertical" height={2187} width={1287} src={`/assets/images/lore/webp/ContentFrameVertical.webp`} priority />
                    <AnimatePresence>
                        {
                            loreId != "0" ?
                                <motion.div className={`absolute z-20`}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                                >
                                    <div className="relative flex justify-center" style={{ width: imgWidth }}>
                                        <ProgressiveImage
                                            className="duration-300 group-hover:scale-105 group-hover:saturate-200"
                                            lowQualitySrc={`/assets/images/lore/${category}/webp/tiny/${category === "cities" ? "c" : "b"}${loreId}${isMobile ? "Vertical" : "Horizontal"}.webp`}
                                            highQualitySrc={`/assets/images/lore/${category}/webp/${category === "cities" ? "c" : "b"}${loreId}${isMobile ? "Vertical" : "Horizontal"}.webp`}
                                            alt={``}
                                            width={2187}
                                            height={1287}
                                        />
                                        <motion.div className={`absolute ${ isMobile ? "top-[47%]" : "right-[6%] top-[18%]" } filter-bar flex flex-col gap-2 sm:gap-4 overflow-x-hidden overflow-y-auto px-2 text-white z-20`} 
                                            style={{ height: isMobile ? imgHeight * 45/100 : imgHeight * 70 / 100, width: isMobile ? imgWidth * 80/100 : imgWidth * 40 / 100  }}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
                                        >
                                            <div className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">{contents.find(e => e.category === category && e.id === loreId)?.name}</div>
                                            <div className={`text-xs md:text-sm lg:text-md xl:text-lg ${opinionPro.className}`}>
                                                {parse(details.find(e => e.category === category && e.id === loreId)?.detail || "", {
                                                    replace: (domNode: any) => {
                                                        if (domNode.name === "a") {
                                                            const href = domNode.attribs.href;
                                                            return (
                                                                <Link href={href} className={domNode.attribs.class}>
                                                                    {domNode.children[0].data}
                                                                </Link>
                                                            );
                                                        }
                                                    },
                                                })}
                                            </div>
                                            <div className="flex flex-col text-xs md:text-sm lg:text-md xl:text-lg">
                                                {   category === "cities" && <div>Major landmarks</div> }
                                                <div className={`flex ${ category === "locations" ? "flex-col" : "gap-2 flex-wrap" } ${opinionPro.className}`}>
                                                    {
                                                        details.find(e => e.category === category && e.id === loreId)?.children.map((value, key) => (
                                                            <div key={key}>{ category === "locations" ? ( key === 0 ? "Location : " : "Appearance : " ) : "" }<Link className={`${category === "locations" && key === 1 ?  "cursor-not-allowed line-through" : "duration-300 hover:opacity-50 underline text-red-800"}`} href={category === "locations" && key === 1 ? "#" : value.url}>{value.name}</Link></div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.7 }}
                                            className={`absolute cursor-pointer duration-200 hover:opacity-50 ${isMobile ? "right-[12%] top-[5%]" : "right-[6%] top-[10%]"} text-white text-4xl z-20`}>
                                            <Link href={{ pathname: '/lore', query: { category: category, id: "0" } }}>
                                                <TbArrowBackUp />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </motion.div> :
                                (
                                    category === "locations" || category === "cities" ? 
                                        <div className={`absolute filter-bar gap-6 grid grid-cols-1 items-center
                                            ${category === "locations" ? "sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4" : "md:grid-cols-2"} z-10 overflow-x-hidden overflow-y-auto`}
                                            style={{ 
                                                width: isMobile ? imgWidth * 80/100 : imgWidth * 90 / 100, 
                                                height: isMobile ? "inherit" : imgHeight * 80 / 100 
                                            }}
                                        >
                                        {
                                            contents.map((value, key) => {
                                                if(value.category === category) return <motion.div key={key} 
                                                    initial={{ opacity: 0, y: 10 }} 
                                                    animate={{ opacity: 1, y: 0 }} 
                                                    exit={{ opacity: 0 }} 
                                                    transition={{ duration: 0.8, delay: 0.1 * parseInt(value.id) }} 
                                                    className="cursor-pointer group relative">
                                                    <Link href={{ pathname: '/lore', query: { category: category, id: value.id } }}>
                                                        <ProgressiveImage
                                                            className="duration-300 group-hover:scale-105 group-hover:saturate-200"
                                                            lowQualitySrc={`/assets/images/lore/${category}/webp/tiny/${value.img}.webp`}
                                                            highQualitySrc={`/assets/images/lore/${category}/webp/${value.img}.webp`}
                                                            alt={`lore ${value.name}`}
                                                            width={532}
                                                            height={532}
                                                        />
                                                        <div className="absolute bottom-2 font-bold px-4 text-white text-center text-sm sm:text-md/5 md:text-lg/5 lg:text-xl/5 w-full z-10" style={{ textShadow: "black 1px 4px" }}>{value.name}</div>
                                                    </Link>
                                                </motion.div>
                                            })
                                        }
                                    </div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} 
                                        className="font-bold flex justify-center items-center text-center text-4xl sm:text-5xl text-white w-full z-10"
                                        style={{ 
                                            width: isMobile ? imgWidth * 80/100 : imgWidth * 90 / 100, 
                                            height: isMobile ? "inherit" : imgHeight * 80 / 100 
                                        }}
                                    >
                                        COMING SOON
                                    </motion.div>
                                )
                        }
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </div>)
}

const Lore = () => {
    return (<div className="fixed h-screen w-full">
        <Image id="background" className="absolute top-0 left-0 w-full h-full object-cover" alt="" width={5760} height={3260} src={`/assets/images/lore/Background.png`} priority />
        <Loader />
        <Header />
        <Suspense fallback={
            <div className="absolute flex h-full items-center justify-center left-0 w-full top-0 bg-black z-[100]">
                <span className="font-bold text-5xl text-white">0%</span>
            </div>
        }>
            <Content />
        </Suspense>
        <Footer />
    </div>)
}

export default Lore;