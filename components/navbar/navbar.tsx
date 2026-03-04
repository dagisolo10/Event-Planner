"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";

const navItems = [
    { label: "Register", href: "/register" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About Us", href: "/about" },
];

export default function GemNav() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
    }, [isOpen]);

    return (
        <div className="z-100">
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="relative z-110 h-10 pr-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col gap-1">
                        <motion.span animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }} className="h-0.5 w-5 bg-current" />
                        <motion.span animate={{ opacity: isOpen ? 0 : 1 }} className="h-0.5 w-5 bg-current" />
                        <motion.span animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }} className="h-0.5 w-5 bg-current" />
                    </div>
                </div>
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-100 flex justify-end">
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }} className="bg-primary/10 fixed inset-0 backdrop-blur-md" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.6, delay: 0.1, ease: [0.76, 0, 0.24, 1] }} className="fixed inset-0 bg-zinc-100 md:left-1/3 dark:bg-zinc-900" />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
                            className="bg-background relative flex h-screen w-full flex-col p-8 shadow-2xl md:w-[65%] md:p-12 lg:w-[45%]"
                        >
                            <div className="flex items-center gap-3">
                                <Image src="/icon.svg" alt="App icon" width={32} height={32} />
                                <span className="text-3xl font-bold tracking-tighter italic">EventSync</span>
                            </div>

                            <DropdownMenuSeparator className="my-8 opacity-50" />

                            <nav className="flex flex-col gap-6">
                                {navItems.map((item, i) => (
                                    <motion.div key={item.label} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                                        <Link href={item.href} onClick={() => setIsOpen(false)} className="group flex items-center gap-4">
                                            <span className="text-primary font-mono text-xl">0{i + 1}</span>
                                            <span className="group-hover:text-primary text-4xl font-bold transition-all duration-300 group-hover:pl-4 md:text-5xl">{item.label}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
