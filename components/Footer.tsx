"use client";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { usePathname } from "next/navigation"; // Import usePathname
import { BsDiscord, BsInstagram, BsTwitterX } from "react-icons/bs";
import { opinionPro } from "./Font";

const Footer = () => {
    const pathname = usePathname(); // Get the current route

    return (
        <div className="text-white hidden sm:block z-[100]">
            {   pathname === "/home" ? 
                <div className="fixed bottom-4 flex gap-4 left-8 text-2xl">
                    <a href="https://x.com/tn7_viu"><BsTwitterX className="cursor-pointer duration-300 hover:opacity-50" /></a>
                    <a href="https://discord.gg/ynEgRUF2UA"><BsDiscord className="cursor-pointer duration-300 hover:opacity-50" /></a>
                    <a href="https://www.instagram.com/tn7_viu"><BsInstagram className="cursor-pointer duration-300 hover:opacity-50" /></a>
                </div> :
                <Link className="fixed bottom-2 duration-300 flex items-center left-8 text-2xl hover:opacity-50" href={`/home`}>
                    <IoIosArrowBack /> BACK
                </Link>
            }
            <div className={`fixed bottom-2 right-8 text-xs text-right ${opinionPro.className}`}>
                PCCW OTT (Singapore) Pte. Ltd<br />
                All rights reserved.
            </div>
        </div>
    );
}

export default Footer;
