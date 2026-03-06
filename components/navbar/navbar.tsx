"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../others/theme-toggle";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import { UserButton } from "@stackframe/stack";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { stackClientApp } from "@/stack/client";
import { useEffect, useState } from "react";

export default function Navbar() {
    const path = usePathname();
    const [user, setUser] = useState<string | undefined>(undefined);

    useEffect(() => {
        stackClientApp.getUser().then((data) => setUser(data?.id));
    }, []);

    const publicLinks = [
        { href: "/pricing", label: "Pricing" },
        { href: "/features", label: "Features" },
    ];

    const protectedNavLinks = [
        { href: "/dashboard/vendors/directory", label: "Vendors" },
        { href: "/dashboard/finance", label: "Finance" },
    ];

    const protectedEventSection = {
        trigger: "Event",
        items: [
            { label: "Events", href: "/dashboard/events" },
            { label: "Add Event", href: "/dashboard/events/new" },
        ],
    };

    const navLinks = user ? [...protectedNavLinks, ...publicLinks] : publicLinks;

    return (
        <header className="sticky inset-x-0 top-4 z-50 mx-auto mb-4 md:max-w-5xl">
            <nav className="flex items-center gap-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 shadow-2xl shadow-zinc-200/50 backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40">
                <Link href="/" className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-60">
                    <Image src="/icon.svg" alt="App icon" width={28} height={28} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-lg font-bold text-zinc-950 dark:text-white">EventSync</span>
                </Link>

                <div className="text-muted-foreground hidden items-center gap-6 border-l pl-4 text-sm font-medium md:flex">
                    <NavLink href="/dashboard" label="Dashboard" path={path} />

                    {user && (
                        <NavigationMenu viewport={false}>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>{protectedEventSection.trigger}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="w-36">
                                            {protectedEventSection.items.map((item, itemIndex) => (
                                                <NavigationMenuLink href={item.href} key={itemIndex}>
                                                    {item.label}
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    )}

                    {navLinks.map((nav) => (
                        <NavLink href={nav.href} label={nav.label} path={path} key={nav.href} />
                    ))}
                </div>

                <div className="ml-auto md:hidden">
                    <Sidebar />
                </div>

                <div className="ml-auto hidden items-center gap-2 md:flex">
                    {!user && (
                        <>
                            <Button className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>

                            <Button className="bg-primary hover:bg-primary/90 shadow-primary/20 rounded-full px-6 text-white shadow-lg transition-all duration-300 active:scale-95" asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </>
                    )}
                    <UserButton />

                    <div className="ml-2 border-l border-zinc-200 pl-2 dark:border-white/10">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
}

function NavLink({ path, label, href }: { label: string; href: string; path: string }) {
    return (
        <Link href={href} className={`${path === href ? "border-b-2 border-white text-zinc-950 dark:text-white" : ""} transition-colors hover:text-zinc-950 dark:hover:text-white`}>
            {label}
        </Link>
    );
}
