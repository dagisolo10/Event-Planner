"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../others/theme-toggle";
import Image from "next/image";
import { usePathname } from "next/navigation";
import GemNav from "./navbar";

export default function PublicNavbar() {
    const path = usePathname();

    return (
        <header className="sticky inset-x-0 top-4 z-50 mx-auto md:max-w-5xl">
            <nav className="flex items-center gap-6 rounded-full border border-zinc-200 bg-white/80 p-2 pl-6 shadow-2xl shadow-zinc-200/50 backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40">
                <Link href="/" className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-60">
                    <Image src="/icon.svg" alt="App icon" width={28} height={28} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-lg font-bold text-zinc-950 dark:text-white">EventSync</span>
                </Link>

                {/* Placeholders */}
                <div className="hidden items-center gap-6 border-l border-zinc-200 pl-4 text-sm font-medium text-zinc-600 md:flex dark:border-white/10 dark:text-zinc-400">
                    <Link href="#features" className={`${path === "/features" ? "text-zinc-950 dark:text-white" : ""} transition-colors hover:text-zinc-950 dark:hover:text-white`}>
                        Features
                    </Link>

                    <Link href="#pricing" className={`${path === "/pricing" ? "text-zinc-950 dark:text-white" : ""} transition-colors hover:text-zinc-950 dark:hover:text-white`}>
                        Pricing
                    </Link>
                </div>

                <div className="ml-auto md:hidden">
                    <GemNav />
                </div>

                <div className="ml-auto hidden items-center gap-2 md:flex">
                    <Button className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>

                    <Button className="bg-primary hover:bg-primary/90 shadow-primary/20 rounded-full px-6 text-white shadow-lg transition-all duration-300 active:scale-95" asChild>
                        <Link href="/register">Get Started</Link>
                    </Button>

                    <div className="ml-2 border-l border-zinc-200 pl-2 dark:border-white/10">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
}
