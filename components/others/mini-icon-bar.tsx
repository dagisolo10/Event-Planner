"use client";
import { SidebarSeparator, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { eventsSubItems, vendorSubItems, financialSubItems } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { UserButton } from "@stackframe/stack";

export function MiniIconBar() {
    const { state } = useSidebar();
    const path = usePathname();
    const isCollapsed = state === "collapsed";

    const sections = [
        { group: "Core", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
        { group: "Events", items: eventsSubItems },
        { group: "Vendors", items: vendorSubItems },
        { group: "Payments", items: financialSubItems },
    ];

    return (
        <div className="sticky top-0 flex h-screen flex-col items-center gap-2 border-r p-1 sm:border-r-0 md:p-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <SidebarTrigger title="Toggle Sidebar (CTRL + B)" />
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{isCollapsed ? "Expand" : "Collapse"}</p>
                </TooltipContent>
            </Tooltip>
            {isCollapsed && <SidebarSeparator />}

            {isCollapsed && (
                <div className="no-scrollbar flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="flex w-full flex-col items-center gap-1">
                            {sIdx !== 0 && <SidebarSeparator />}

                            {section.items.map((item, idx) => {
                                const isActive = item.href === path;

                                return (
                                    <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group relative grid size-9 place-items-center rounded-lg transition-all duration-200",
                                                    isActive && "dark:bg-accent bg-primary text-zinc-100",
                                                    !isActive && "hover:bg-sidebar-accent hover:text-foreground text-zinc-500",
                                                )}
                                            >
                                                <item.icon className="size-5 transition-transform group-active:scale-90" />
                                                {isActive && <span className="dark:bg-accent bg-primary absolute -right-1.5 h-4 w-1 rounded-r-full" />}
                                            </Link>
                                        </TooltipTrigger>

                                        <TooltipContent side="right" sideOffset={10}>
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {isCollapsed && <SidebarSeparator />}

            {isCollapsed && <ThemeToggle />}

            {isCollapsed && (
                <div className="mt-auto pb-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <UserButton />
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <p className="font-semibold">Alex Rivers</p>
                            <p className="text-zinc-300">alexriver@gmail.com</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    );
}
