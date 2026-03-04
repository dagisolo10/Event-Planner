import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import getEvents from "@/server/events/get-events";
import { getEventStatus } from "@/helper/get-status";
import { redirect, notFound } from "next/navigation";
import { statusColors } from "@/mocks/status-colors";
import { Card, CardContent } from "@/components/ui/card";
import { IconCurrencyDollar } from "@tabler/icons-react";
import EmptyState from "@/components/common/empty-state";
import dashboardStats from "@/server/stats/get-dashboard-stats";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { formatDate, formatUSD } from "@/helper/helper-functions";
import { Calendar, CheckCircle2, LucideProps, MoreHorizontal, TrendingUp } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default async function Dashboard() {
    const [eventsRes, dashboardStatsRes] = await Promise.all([getEvents(), dashboardStats()]);

    if ("error" in dashboardStatsRes || "error" in eventsRes) return dashboardStatsRes.error === "Unauthorized" ? redirect("/") : notFound();

    const events = eventsRes.events;
    const { activeEventsCount, vendorDebt, uncollected, urgentTasks } = dashboardStatsRes;

    return (
        <main>
            <h1 className="text-3xl font-bold">Welcome back, Organizer!</h1>

            <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Active Events" value={activeEventsCount ?? 0} icon={Calendar} description="Ongoing and upcoming events" color="blue" />
                <SummaryCard title="Uncollected" value={uncollected ?? 0} icon={TrendingUp} description="Remaining client balances" color="emerald" isCurrency />
                <SummaryCard title="Vendor Debt" value={vendorDebt ?? 0} icon={IconCurrencyDollar} description="Total accounts payable" color="orange" isCurrency />
                <SummaryCard title="Overdue Tasks" value={urgentTasks ?? 0} icon={CheckCircle2} description="Pending past-due actions" color="red" />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="mb-4 text-2xl font-bold">Recent Events</h2>
                <Button variant="link" className="text-foreground">
                    <Link href="/dashboard/events">View All</Link>
                </Button>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Event Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {events.length === 0 ? (
                            <EmptyState type="event" colSpan={7} />
                        ) : (
                            events.slice(0, 5).map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            {event.title}
                                            <span className="text-xs text-zinc-500">{event.location}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className={statusColors.event[getEventStatus(event.startDate, event.endDate)]}>
                                            {getEventStatus(event.startDate, event.endDate)}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>{event.clientName}</TableCell>
                                    <TableCell>{formatDate(event.startDate)}</TableCell>
                                    <TableCell>{formatDate(event.endDate)}</TableCell>
                                    <TableCell>{formatUSD(event.budget)}</TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <Link href={`/dashboard/events/${event.id}`}>
                                                    <DropdownMenuItem>See details</DropdownMenuItem>
                                                </Link>

                                                <Link href={`/dashboard/events/${event.id}/edit`}>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                </Link>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </main>
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

function SummaryCard({ title, value, icon, description, isCurrency, color }: SummaryItem) {
    const Icon = icon;
    const displayValue = isCurrency ? formatUSD(Number(value)) : value;

    const colorMap = {
        blue: "bg-blue-500/10 text-blue-600",
        orange: "bg-orange-500/10 text-orange-600",
        emerald: "bg-emerald-500/10 text-emerald-600",
        red: "bg-red-500/10 text-red-600",
        zinc: "bg-zinc-500/10 text-zinc-600",
    };

    const iconColor = colorMap[color];

    return (
        <Card className="group cursor-default">
            <CardContent className="flex flex-col gap-4">
                <div className="-center flex gap-3">
                    <div className={`rounded-lg p-2.5 transition-transform group-hover:scale-110 ${iconColor}`}>
                        <Icon className="size-5" />
                    </div>
                    <span className="text-ss font-black tracking-widest text-zinc-500 uppercase">{title}</span>
                </div>

                <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight">{displayValue}</h3>
                    <p className="text-xs leading-relaxed font-medium text-zinc-500">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
