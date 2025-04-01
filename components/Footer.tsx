"use client";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname
import { BsDiscord, BsInstagram, BsTwitterX } from "react-icons/bs";
import { opinionPro } from "./Font";
import { useDispatch } from "react-redux";
import { setJumpPage } from "@/store/slice/pageSlice";

const Footer = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const pathname = usePathname(); // Get the current route

    return (
        <div className="text-white hidden sm:block z-[100]">
            {   pathname === "/home" ? 
                <div className="fixed bottom-4 flex gap-4 left-8 text-2xl">
                    <a href="https://x.com/tn7_viu" target="_blank"><BsTwitterX className="cursor-pointer duration-300 hover:opacity-50" /></a>
                    <a href="https://discord.gg/ynEgRUF2UA" target="_blank"><BsDiscord className="cursor-pointer duration-300 hover:opacity-50" /></a>
                    <a href="https://www.instagram.com/tn7_viu" target="_blank"><BsInstagram className="cursor-pointer duration-300 hover:opacity-50" /></a>
                </div> :
                <button 
                    className="fixed bottom-2 duration-300 flex items-center left-8 text-2xl hover:opacity-50"
                    onClick={() => {
                        if(pathname === "/home") return;
                        dispatch(setJumpPage(true));
                        const timeout = setTimeout(() => {
                            router.push(`/home`);
                        }, 200);
                        return () => clearTimeout(timeout);
                    }}
                >
                    <IoIosArrowBack /> BACK
                </button>
            }
            <div className={`fixed bottom-2 right-8 text-xs text-right ${opinionPro.className}`}>
                PCCW OTT (Singapore) Pte. Ltd<br />
                All rights reserved.
            </div>
        </div>
    );
}

export default Footer;
