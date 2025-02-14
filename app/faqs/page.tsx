"use client";

import { MaskText, Navbar } from "@/components";
import { ReactNode, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const Collapse = ({ children, title }: { children: ReactNode, title: string }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState<string>("60px");

    useEffect(() => {
        setHeight(isOpen ? `${contentRef.current?.scrollHeight}px` : "60px");
    }, [isOpen]);

    return <div ref={contentRef} className="border-2 border-white duration-300 flex flex-col gap-4 overflow-hidden p-4" style={{ height: height }}>
        <div className={`${isOpen ? "text-red-800" : "text-white"} cursor-pointer duration-300 flex font-bold justify-between text-2xl`} onClick={() => setIsOpen(!isOpen)}>{title} <IoIosArrowDown className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} /></div>
        <div className={`flex flex-col gap-8 text-lg`}>
            {children}
        </div>
    </div>
}

const Faqs = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (<div className="bg-black flex justify-center min-h-screen relative overflow-x-hidden w-full">
        <Navbar setIsOpenMenuParent={setIsMenuOpen} isOpenMenuParent={isMenuOpen} />
        <div className="flex flex-col gap-8 px-12 py-36 2xl:w-[1280px] 2xl:px-0 text-white">
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-4xl">Digital Comic Series</MaskText>
                <div className="border-t-4">
                    <Collapse title="Q: What is the digital comic series?">
                        <MaskText>A: The digital comic series is the first edition to the TN7 universe - the Genesis Arc is Viu&apos;s first-ever digital comic series. This series when launched will be available on our website, providing a rich, visual narrative for fans to enjoy.</MaskText>
                    </Collapse>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-4xl">TN7 Digital Pack and NFTs</MaskText>
                <div className="border-t-4 flex flex-col">
                    <Collapse title="Q: What is the TN7 Digital Pack?">
                        <MaskText>A: The TN7 Digital Pack consists of 4 NFTs, containing images of a unique digital character and three comic covers. The digital character will be minted first, with the comic covers to follow later. These covers will be created by renowned artists.</MaskText>
                    </Collapse>
                    <Collapse title="Q: If I purchase the TN7 Digital Pack, will I own the digital character?">
                        <MaskText>A: You will be granted the relevant licence that allows you to create content, such as writing stories, creating images or videos. Others in the community can also use the character in their own creative projects within our TN7 platform.</MaskText>
                    </Collapse>
                    <Collapse title="Q: I am interested in purchasing a digital pack, how can I do so?">
                        <MaskText>A: You can express your interest in purchasing the digital pack by providing your digital wallet ID to get whitelisted today. Follow us on our social media channels to stay updated on when the drop will happen.</MaskText>
                    </Collapse>
                    <Collapse title="Q: What is whitelisting?">
                        <MaskText>A: Whitelisting is our way of offering early access to the TN7 Digital Pack, ensuring that our most engaged and enthusiastic community members get the first opportunity to participate.</MaskText>
                        <MaskText>Joining the whitelist gives you priority access and special privileges, making sure you are among the first to enjoy these unique benefits. You can join our whitelist [here].</MaskText>
                    </Collapse>
                    <Collapse title="Q: What are NFTs and how do they work?">
                        <MaskText>A: NFTs (Non-Fungible Tokens) are unique digital assets that grant you certain rights within the TN7 universe. We will guide you through the process, making it easy even if you&apos;re new to NFTs.</MaskText>
                    </Collapse>
                    <Collapse title="Q: Which blockchain will the NFTs live on?">
                        <MaskText>A: It will be on the Ethereum blockchain.</MaskText>
                    </Collapse>                    
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MaskText className="font-bold text-4xl">Community and Engagement</MaskText>
                <div className="border-t-4 flex flex-col">
                    <Collapse title="Q: What’s coming?">
                        <MaskText>A: In the near future, you will have the opportunity to contribute and vote on stories, participate in content creation initiatives, and collaborate with other members to shape the TN7 universe. Your involvement will be crucial in driving the evolution and expansion of our world. Stay tuned for exciting updates and new ways to engage!</MaskText>
                    </Collapse>
                    <Collapse title="Q: What are creator points, and how can you benefit from them?">
                        <MaskText>A: Creator points are rewards earned by contributing to the TN7 universe. While they will come into play at a later time, these points can eventually be exchanged for exclusive rewards, event tickets, and more. It&apos;s an exciting way to be recognised and rewarded for your contributions.</MaskText>
                    </Collapse>
                    <Collapse title="Q: How can I stay updated on TN7 news and events?">
                        <MaskText>A: Follow us on our social media channels and subscribe to our newsletter to stay updated on the latest news, events, and content drops in the TN7 universe.</MaskText>
                    </Collapse>
                </div>
            </div>
        </div>
    </div>)
}

export default Faqs;