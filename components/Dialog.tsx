"use client";

import { RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Dialog = () => {
    const { isOpen, content } = useSelector((state: RootState) => state.dialog);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (<AnimatePresence>
        {
            isOpen && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed flex h-screen items-center justify-center left-0 top-0 w-full z-50">
                <div className="absolute bg-slate-900 h-full left-0 opacity-50 top-0 w-full -z-10"></div>
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-800/50">
                    { content }
                </motion.div>
            </motion.div>
        }
    </AnimatePresence>)
}

export default Dialog;