"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useInView } from 'react-intersection-observer';

const MaskText = ({ children, className, bgColor = "bg-white" }: { children: ReactNode, className?: string, bgColor?: string }) => {
    const EnterAnimation = {
        initial: { y: "100%" },
        enter: () => ({ y: "0", transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1], delay: 0.1 } })
    }

    const exitAnimation = {
        initial: { x: "0" },
        enter: () => ({ x: "101%", transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1] } })
    }

    const { ref, inView } = useInView({
        threshold: 0.75,
        triggerOnce: true
    });

    return (<div ref={ref} className={`overflow-hidden relative w-fit ${className}`}>
        <motion.div variants={exitAnimation} initial="initial" animate={inView ? "enter" : ""} className={`absolute bottom-0 ${bgColor} h-full left-0 w-full z-10`}></motion.div>
        <motion.div variants={EnterAnimation} initial="initial" animate={inView ? "enter" : ""}>{children}</motion.div>
    </div>)
}

export default MaskText;