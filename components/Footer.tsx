"use client";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { usePathname } from "next/navigation"; // Import usePathname
import { FaFacebookF } from "react-icons/fa";
import { BsDiscord, BsInstagram, BsTiktok, BsTwitterX } from "react-icons/bs";
import { opinionPro } from "./Font";

const Footer = () => {
    const pathname = usePathname(); // Get the current route

    return (
        <div className="text-white hidden sm:block z-[100]">
            {   pathname === "/home" || pathname.includes("/comics") ? 
                <div className="fixed bottom-4 flex gap-4 left-8 text-2xl">
                    <FaFacebookF className="cursor-pointer duration-300 hover:opacity-50" />
                    <BsInstagram className="cursor-pointer duration-300 hover:opacity-50" />
                    <BsTwitterX className="cursor-pointer duration-300 hover:opacity-50" />
                    <BsTiktok className="cursor-pointer duration-300 hover:opacity-50" />
                    <BsDiscord className="cursor-pointer duration-300 hover:opacity-50" />
                </div> :
                <Link className="fixed bottom-4 duration-300 flex items-center left-8 text-2xl hover:opacity-50" href={`/home`}>
                    <IoIosArrowBack /> BACK
                </Link>
            }
            <Link className={`fixed bottom-4 duration-300 right-8 underline hover:opacity-50 ${opinionPro.className}`} href={`/termsandconditions`}>
                TERMS & CONDITIONS
            </Link>
        </div>
    );
}

export default Footer;
