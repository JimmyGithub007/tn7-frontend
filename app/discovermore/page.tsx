"use client";

import { MaskText, Header } from "@/components";
import { opinionPro } from "@/components/Font";
import { ReactNode, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const quetions = [
    {
        title: "Digital Comic Series",
        children: [
            { question: "Q: What is the digital comic series?", answer: [ "A: The digital comic series is the first edition of the TN7 universe—the Genesis Arc is Viu’s first-ever digital comic series. This series will be available on our website upon launch, providing a rich, visual narrative for fans to enjoy." ] },
        ]
    },
    {
        title: "TN7 Digital Pack and Citizens",
        children: [
            {   question: "Q: What is the TN7 Digital Pack?", answer: [ "A: The TN7 Digital Pack consists of one ‘Citizen’ NFT, a unique digital character that grants access to future features and opportunities within the TN7 universe." ] },
            {   question: "Q: If I purchase the TN7 Digital Pack, will I own the digital character?", answer: [ "A: You will be granted the relevant licence that allows you to create content, such as writing stories, creating images, or videos. Others in the community may also reference the character in their own creative projects within the TN7 platform." ] },
            {   question: "Q: I am interested in purchasing a digital pack. How can I do so?", answer: [ "A: Follow us on our social media channels to stay updated on when the drop will happen." ] },
            {   question: "Q: What are NFTs and how do they work?", answer: [ "A: NFTs (Non-Fungible Tokens) are unique digital assets that grant certain rights within the TN7 universe. We will guide you through the process, making it easy even if you're new to NFTs." ] },
            {   question: "Q: Which blockchain will the NFTs live on?", answer: [ "A: Stay tuned to our official channels for blockchain announcements." ] }
        ]

    },
    {
        title: "Community and Engagement",
        children: [
            { question: "Q: What’s coming?", answer: [ 
                    "A: In the near future, you will have the opportunity to contribute and vote on stories, participate in content creation initiatives, and collaborate with other members to shape the TN7 universe.",
                    "Your involvement will be crucial in driving the evolution and expansion of our world. Stay tuned for exciting updates and new ways to engage!"
                ] 
            },
            { question: "Q: What is Lunex (a.k.a. Creator Points), and how can you benefit from it?", answer: [ "A: Lunex are rewards earned by contributing to the TN7 universe. While they will come into play at a later time, these points may be exchanged for exclusive rewards, event tickets, and more. It’s an exciting way to be recognised and rewarded for your contributions." ] },
            { question: "Q: How can I stay updated on TN7 news and events?", answer: [ "A: Follow us on our social media channels and subscribe to our newsletter to stay updated on the latest news, events, and content drops in the TN7 universe." ] },
        ]
    },
];

const Collapse = ({ children, title }: { children: ReactNode, title: string }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState<string>("");

    useEffect(() => {
        if (headRef.current) {
            setHeight(isOpen ? `${contentRef.current?.scrollHeight}px` : `${headRef.current?.scrollHeight + 32}px`);
        }
    }, [isOpen]);
    
    return <div ref={contentRef} className="border-2 border-white duration-300 flex flex-col gap-4 overflow-hidden p-4" style={{ height: height }}>
        <div ref={headRef} className={`${isOpen ? "text-red-800" : "text-white"} target cursor-pointer duration-300 flex font-bold gap-4 justify-between text-md sm:text-xl`} onClick={() => setIsOpen(!isOpen)}>
            {title} <IoIosArrowDown className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
        <div className={`flex flex-col text-md sm:text-xl`}>
            {children}
        </div>
    </div>
}

const DiscoverMore = () => {
    return (<div className="bg-black flex justify-center min-h-screen relative overflow-x-hidden w-full">
        <Header />
        <div className="flex flex-col gap-8 px-12 py-36 2xl:w-[1280px] 2xl:px-0 text-white">
            <div className="flex flex-col gap-4 text-center">
                <div className="font-bold text-2xl sm:text-3xl">Welcome to TN7</div>   
                <div className={`${opinionPro.className} text-md sm:text-2xl`}>We are launching a new content universe, anchored by our first digital comic series. This universe offers an interactive experience like no other—where you can unlock new characters, explore evolving narratives, and contribute stories that shape the TN7 world. Backed by a powerhouse in content and distribution, this is a collaborative journey where every participant becomes a creator, contributor, and beneficiary in our lore-rich ecosystem.</div>
                <div className="font-bold text-2xl sm:text-3xl">The Engine Behind the Universe
                </div>   
                <div className={`${opinionPro.className} text-md sm:text-2xl`}>
                    TN7 is Viu’s first content universe and digital comic series. As one of the leading OTT platforms across 16 markets, Viu powers TN7 with unmatched reach and cross-platform amplification.
                    <br />With deep experience in original productions, multimedia storytelling, and event execution, Viu provides the fuel for TN7 to transcend the limitations of typical Web3 projects. From immersive fan events to large-scale marketing, every part of TN7 is engineered to engage and expand.
                    <br />Have questions? Explore our FAQ below to learn more about how you can be part of TN7.
                </div>
            </div>
            <div className="font-bold text-2xl sm:text-3xl text-center">FAQ</div>
            {
                /*quetions.map((q, k) => (
                    <div key={k} className="flex flex-col gap-4">
                        <MaskText className="font-bold text-4xl">{q.title}</MaskText>
                        <div className="border-t-4">
                            {
                                q.children.map((q2, k2) => (
                                    <Collapse key={k2} title={q2.question}>
                                        {
                                            q2.answer.map((q3, k3) => (
                                                <MaskText key={k3}>{q3}</MaskText>
                                            ))
                                        }
                                    </Collapse>
                                ))
                            }
                        </div>
                    </div>
                ))*/
            }
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-xl sm:text-2xl">Digital Comic Series</MaskText>
                <div className={`${opinionPro.className}`}>
                    <Collapse title="Q: What is the digital comic series?">
                        <MaskText>A: The digital comic series is the first edition of the TN7 universe—the Path of Vengeance Arc is Viu’s first-ever digital comic series. This series will be available on our website upon launch, providing a rich, visual narrative for fans to enjoy.</MaskText>
                    </Collapse>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-xl sm:text-2xl">TN7 Digital Pack and Citizens</MaskText>
                <div className={`flex flex-col ${opinionPro.className}`}>
                    <Collapse title="Q: What is the TN7 Digital Pack?">
                        <MaskText>A: The TN7 Digital Pack consists of one NFT, a unique digital character that grants access to future features and opportunities within the TN7 universe.</MaskText>
                    </Collapse>
                    <Collapse title="Q: If I purchase the TN7 Digital Pack, will I own the digital character?">
                        <MaskText>A: You will be granted the relevant licence that allows you to create content, such as writing stories, creating images, or videos. Others in the community may also reference the character in their own creative projects within the TN7 platform.</MaskText>
                    </Collapse>
                    <Collapse title="Q: I am interested in purchasing a digital pack. How can I do so?">
                        <MaskText>A: Follow us on our social media channels to stay updated on when the drop will happen.</MaskText>
                    </Collapse>
                    {/*<Collapse title="Q: What is whitelisting?">
                        <MaskText>A: Whitelisting is our way of offering early access to the TN7 Digital Pack, ensuring that our most engaged and enthusiastic community members get the first opportunity to participate.</MaskText>
                        <MaskText>Joining the whitelist gives you priority access and special privileges, making sure you are among the first to enjoy these unique benefits. You can join our whitelist [here].</MaskText>
                    </Collapse>*/}
                    <Collapse title="Q: What are NFTs and how do they work?">
                        <MaskText>A: NFTs (Non-Fungible Tokens) are unique digital assets that grant certain rights within the TN7 universe. We will guide you through the process, making it easy even if you&apos;re new to NFTs.</MaskText>
                    </Collapse>
                    <Collapse title="Q: Which blockchain will the NFTs live on?">
                        <MaskText>A: Stay tuned to our official channels for blockchain announcements.</MaskText>
                    </Collapse>                    
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-xl sm:text-2xl">Community and Engagement</MaskText>
                <div className={`flex flex-col ${opinionPro.className}`}>
                    <Collapse title="Q: What&apos;s coming?">
                        <MaskText>A: In the near future, you will have the opportunity to contribute and vote on stories, participate in content creation initiatives, and collaborate with other members to shape the TN7 universe. Your involvement will be crucial in driving the evolution and expansion of our world. Stay tuned for exciting updates and new ways to engage!</MaskText>
                    </Collapse>
                    <Collapse title="Q: What is Lunex (a.k.a. Creator Points), and how can you benefit from it?">
                        <MaskText>A: Lunex are rewards earned by contributing to the TN7 universe. While they will come into play at a later time, these points may be exchanged for exclusive rewards, event tickets, and more. It&apos;s an exciting way to be recognised and rewarded for your contributions.</MaskText>
                    </Collapse>
                    <Collapse title="Q: How can I stay updated on TN7 news and events?">
                        <MaskText>A: Follow us on our social media channels and subscribe to our newsletter to stay updated on the latest news, events, and content drops in the TN7 universe.</MaskText>
                    </Collapse>
                </div>
            </div>
        </div>
    </div>)
}

export default DiscoverMore;