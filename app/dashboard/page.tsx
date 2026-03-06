import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import getEvents from "@/server/events/get-events";
import { getEventStatus } from "@/helper/get-status";
import { redirect, notFound } from "next/navigation";
import { statusColors } from "@/mocks/status-colors";
import { IconCurrencyDollar } from "@tabler/icons-react";
import EmptyState from "@/components/common/empty-state";
import dashboardStats from "@/server/stats/get-dashboard-stats";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { formatDate, formatUSD } from "@/helper/helper-functions";
import { ArrowRight, Calendar, CalendarIcon, CheckCircle2, LucideProps, MoreHorizontal, TrendingUp } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Metadata } from "next";
import { stackServerApp } from "@/stack/server";
import TableWrapper from "@/components/others/table-border-wrapper";
import GlowCard from "@/components/others/glow-card";

export const metadata: Metadata = {
    title: "EventSync — Dashboard",
    description: "Take full control of your events with EventSync. Manage vendors, track budgets, coordinate timelines, and organize every detail effortlessly from one powerful dashboard.",
    keywords: ["event management", "event organizer", "vendor management", "budget tracking", "event planning", "professional planner", "timeline management"],
    authors: [{ name: "EventSync Team" }],
    openGraph: {
        title: "EventSync — Professional Event Organizer Dashboard",
        description: "Manage your events, vendors, budgets, and timelines with ease. EventSync is the ultimate dashboard for professional event organizers.",
        url: "https://www.eventsync.com",
        siteName: "EventSync",
        images: [
            {
                url: "https://www.eventsync.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "EventSync Dashboard Preview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "EventSync — Professional Event Organizer Dashboard",
        description: "Take full control of your events, vendors, budgets, and timelines with EventSync.",
        images: ["https://www.eventsync.com/og-image.png"],
    },
};

export default async function Dashboard() {
    const [eventsRes, dashboardStatsRes] = await Promise.all([getEvents(), dashboardStats()]);
    const user = await stackServerApp.getUser();

    if ("error" in dashboardStatsRes || "error" in eventsRes) return dashboardStatsRes.error === "Unauthorized" ? redirect("/") : notFound();
    const events = eventsRes.events;
    const { activeEventsCount, vendorDebt, uncollected, urgentTasks } = dashboardStatsRes;

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-poppins text-3xl font-extrabold tracking-tight md:text-4xl">
                    Welcome back, <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">{user?.displayName || "Organizer"}!</span>
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Here is what&apos;s happening with your events today.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Active Events" value={activeEventsCount ?? 0} icon={Calendar} description="Ongoing and upcoming events" color="blue" />
                <SummaryCard title="Uncollected" value={uncollected ?? 0} icon={TrendingUp} description="Remaining client balances" color="emerald" isCurrency />
                <SummaryCard title="Vendor Debt" value={vendorDebt ?? 0} icon={IconCurrencyDollar} description="Total accounts payable" color="orange" isCurrency />
                <SummaryCard title="Overdue Tasks" value={urgentTasks ?? 0} icon={CheckCircle2} description="Pending past-due actions" color="red" />
            </div>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-poppins text-2xl font-bold tracking-tight">Recent Events</h2>
                    <Button variant="ghost" className="group text-primary hover:text-primary font-semibold" asChild>
                        <Link href="/dashboard/events" className="flex items-center gap-2">
                            View All <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                <TableWrapper>
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="font-bold hover:bg-transparent">
                                <TableHead>Event Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <EmptyState type="event" colSpan={7} />
                            ) : (
                                events.slice(0, 5).map((event) => (
                                    <TableRow key={event.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col font-medium">
                                                <span>{event.title}</span>
                                                <span className="text-muted-foreground text-xs">{event.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors.event[getEventStatus(event.startDate, event.endDate)]}>
                                                {getEventStatus(event.startDate, event.endDate)}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm">{event.clientName}</TableCell>
                                        <TableCell className="text-primary text-sm font-semibold">{formatUSD(event.budget)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarIcon className="size-3" />
                                                {formatDate(event.startDate)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarIcon className="size-3" />
                                                {formatDate(event.endDate)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-36">
                                                    <Link href={`/dashboard/events/${event.id}`}>
                                                        <DropdownMenuItem>See details</DropdownMenuItem>
                                                    </Link>

                                                    <Link href={`/dashboard/events/${event.id}/edit`}>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    </Link>

                                                    <DropdownMenuSeparator />
                                                    {/* TODO */}
                                                    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableWrapper>
            </section>
        </div>
    );
}

interface SummaryItem {
    title: string;
    value: number;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    description: string;
    isCurrency?: boolean;
    color: "blue" | "orange" | "emerald" | "red";
}

function SummaryCard({ title, value, icon: Icon, description, isCurrency, color }: SummaryItem) {
    const displayValue = isCurrency ? formatUSD(Number(value)) : value;

    const colorMap = {
        blue: "text-blue-500 border-blue-500/20 bg-blue-500",
        orange: "text-orange-500 border-orange-500/20 bg-orange-500",
        emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500",
        red: "text-red-500 border-red-500/20 bg-red-500",
    };

    const currentStyles = colorMap[color];

    return (
        <GlowCard color={currentStyles.split(" ")[2]}>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl border transition-transform duration-500 group-hover:scale-110 ${currentStyles.split(" ").slice(0, 2).join(" ")}`}>
                        <Icon className="size-5" />
                    </div>
                    <span className="font-poppins text-muted-foreground text-xs font-bold tracking-widest uppercase">{title}</span>
                </div>

                <div className="space-y-1">
                    <h3 className="font-poppins text-3xl font-extrabold">{displayValue}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">{description}</p>
                </div>
            </div>
        </GlowCard>
    );
}
