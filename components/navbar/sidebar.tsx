"use client";
import { Sidebar as SidebarComp, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Truck, DollarSign, CheckCircle2, ChevronRight, LayoutDashboard, PlusCircle, LucideProps, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@stackframe/stack";
import { ThemeToggle } from "../others/theme-toggle";

export const eventsSubItems = [
    { href: "/dashboard/events", label: "All Events", icon: Calendar },
    { href: "/dashboard/events/new", label: "New Event", icon: PlusCircle },
];

export const vendorSubItems = [{ href: "/dashboard/vendors/directory", label: "Directory", icon: Users }];

export const financialSubItems = [{ href: "/dashboard/finance", label: "Finance", icon: IconCurrencyDollar }];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <SidebarComp>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="hover:text-primary text-primary! text-xl font-bold hover:bg-transparent" asChild>
                            <Link href="/dashboard">EventSync</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarLink label="Dashboard" pathname={pathname} href="/dashboard" icon={LayoutDashboard} />
                        <SidebarLink label="Tasks" pathname={pathname} href="/dashboard/tasks" icon={CheckCircle2} />

                        <CollapsibleLink trigger="Events" icon={Calendar} links={eventsSubItems} pathname={pathname} />
                        <CollapsibleLink trigger="Vendors" icon={Truck} links={vendorSubItems} pathname={pathname} />
                        <CollapsibleLink trigger="Financial" icon={DollarSign} links={financialSubItems} pathname={pathname} />
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <ThemeToggle />
                <UserButton showUserInfo />
            </SidebarFooter>
        </SidebarComp>
    );
}

interface Links {
    href: string;
    label: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

interface CollapsibleProp {
    pathname: string;
    links: Links[];
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    trigger: string;
}

function CollapsibleLink({ icon: Icon, trigger, links, pathname }: CollapsibleProp) {
    return (
        <Collapsible asChild className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild className={cn("text-zinc-600 transition-colors", "data-[state=open]:bg-sidebar-accent/70 data-[state=open]:text-sidebar-accent-foreground!")}>
                    <SidebarMenuButton tooltip={trigger}>
                        <Icon />
                        <span>{trigger}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {links.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href} size="sm">
                                    <Link href={subItem.href}>
                                        <subItem.icon />
                                        <span>{subItem.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

interface SidebarProp {
    label: string;
    pathname: string;
    href: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

function SidebarLink({ label, pathname, href, icon }: SidebarProp) {
    const Icon = icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === href}>
                <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
