"use client";
import { useMemo, useState } from "react";
import { Search, MoreHorizontal, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import PaginatedTable from "../common/paginated-table";
import { Label } from "../ui/label";
import { formatDate, formatUSD } from "@/helper/helper-functions";
import EmptyState from "../common/empty-state";
import { Event } from "@prisma/client";
import { getEventStatus } from "@/helper/get-status";
import { statusColors } from "@/mocks/status-colors";
import UniversalDeleteDialog from "../common/universal-alert-dialog";
import TableWrapper from "../others/table-border-wrapper";

type EventSortKey = "Budget Ascending" | "Budget Descending" | "Cost Ascending" | "Cost Descending" | "Name Ascending" | "Name Descending" | "Start Date Ascending" | "Start Date Descending" | "End Date Ascending" | "End Date Descending";
type EventFilterKey = "All" | "Completed" | "Ongoing" | "Upcoming";

export default function SearchEvent({ events }: { events: Event[] }) {
    const [query, setQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<EventSortKey>("Name Ascending");
    const [statusFilter, setStatusFilter] = useState<EventFilterKey>("All");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredEvents = events.filter(
        (event) =>
            (event.title.toLowerCase().includes(query.toLowerCase()) || event.clientName.toLowerCase().includes(query.toLowerCase()) || event.location.toLowerCase().includes(query.toLowerCase())) &&
            (statusFilter === "All" || getEventStatus(event.startDate, event.endDate) === statusFilter),
    );

    const displayEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => {
            switch (sortBy) {
                case "Budget Ascending":
                    return a.budget - b.budget;

                case "Budget Descending":
                    return b.budget - a.budget;

                case "Name Ascending":
                    return a.title.localeCompare(b.title);

                case "Name Descending":
                    return b.title.localeCompare(a.title);

                case "Start Date Ascending":
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

                case "Start Date Descending":
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

                case "End Date Ascending":
                    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

                case "End Date Descending":
                    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();

                default:
                    return 0;
            }
        });
    }, [filteredEvents, sortBy]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.currentTarget.value);
        setCurrentPage(1);
    };

    const handleSortChange = (val: EventSortKey) => {
        setSortBy(val);
        setCurrentPage(1);
    };

    const handleStatusChange = (val: typeof statusFilter) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("All");
        setSortBy("Name Ascending");
    };

    const perPage = 5;
    const startIndex = (currentPage - 1) * perPage;
    const totalPages = Math.ceil(displayEvents.length / perPage);
    const paginatedEvents = displayEvents.slice(startIndex, startIndex + perPage);

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="group relative max-w-sm flex-1">
                    <Label htmlFor="query">
                        <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 transition-colors" />
                    </Label>
                    <Input value={query} onChange={handleQueryChange} placeholder="Search events, clients, or locations..." id="query" className="border-input/80 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-full pr-4 pl-11" />
                </div>

                <div className="flex items-center gap-3">
                    {(query || statusFilter !== "All") && (
                        <Button variant="secondary" size="lg" onClick={clearFilters} className="text-muted-foreground hover:text-destructive rounded-full tracking-wide">
                            Reset
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="border-muted-foreground/20 bg-background/50 hover:bg-accent/5 hover:text-primary rounded-full px-5 tracking-tight transition-all">
                                <span className="text-muted-foreground font-medium">Sort By:</span>
                                {sortBy}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                            {[
                                { method: "Name Ascending", label: "Name: A to Z" },
                                { method: "Name Descending", label: "Name: Z to A" },
                                { method: "Budget Ascending", label: "Budget: High to Low" },
                                { method: "Budget Descending", label: "Budget: Low to High" },
                            ].map((item) => (
                                <DropdownMenuItem onClick={() => handleSortChange(item.method as EventSortKey)} className="flex items-center justify-between" key={item.method}>
                                    {item.label}
                                    {sortBy === item.method && <div className="bg-primary size-2 rounded-full" />}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSortChange("Start Date Ascending")} className="flex items-center justify-between text-xs tracking-widest uppercase opacity-70">
                                Earliest Dates First
                                {sortBy === "Start Date Ascending" && <div className="bg-primary size-2 rounded-full" />}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="border-muted-foreground/20 bg-background/50 hover:bg-primary/5 hover:text-primary rounded-full px-5 tracking-tight transition-all">
                                <span className="text-muted-foreground font-medium">Status:</span>
                                {statusFilter}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                            {(["All", "Completed", "Ongoing", "Upcoming"] as EventFilterKey[]).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status as EventFilterKey)} className="flex items-center justify-between">
                                    {status}
                                    {statusFilter === status && <div className="bg-primary size-2 rounded-full" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <TableWrapper>
                <Table>
                    <TableHeader className="dark:bg-muted/50">
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
                        ) : displayEvents.length === 0 ? (
                            <EmptyState type="event" colSpan={7} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginatedEvents.map((event) => (
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

                                    <TableCell>{event.clientName}</TableCell>
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
                                    <TableCell>{formatUSD(event.budget)}</TableCell>

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

                                                <UniversalDeleteDialog type="event" id={event.id} name={event.title} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </TableWrapper>
        </div>
    );
}
