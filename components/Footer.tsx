"use client";

import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";

const Footer = () => {
    return (<div className="text-white hidden sm:block">
        <button className="absolute bottom-4 duration-300 flex items-center left-8 text-3xl hover:opacity-50"><IoIosArrowBack /> BACK</button>
        <Link className="absolute bottom-4 duration-300 right-8 hover:opacity-50" href={`/termsandconditions`}>TERMS & CONDITIONS</Link>
    </div>)
}

export default Footer;