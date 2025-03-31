"use client";

import { GlitchText } from "@/components";
import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
    return (
        <div className="bg-black flex flex-col items-center justify-center h-screen text-white">
            <Image alt="logo" className="w-48 rotate-6" width={920} height={384} src={`/assets/images/TN7_Blurb.png`} priority quality={50} />
            <div className="relative -rotate-6">
                <GlitchText text="404" fontSize="text-9xl" />
                <div className="absolute bg-red-800 px-2 rotate-12 text-2xl top-12 left-4">Page Not Found</div>
            </div>
            <Link href="/" className="border-2 border-red-800 px-4 py-2 hover:bg-red-800 hover:text-white duration-300 mt-12 text-red-800 text-2xl">Go back to home</Link>
        </div>
    );
}

export default NotFound;
