"use client";
import { useMemo, useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
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
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Label htmlFor="query">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    </Label>
                    <Input value={query} onChange={handleQueryChange} placeholder="Search events, clients, or locations..." id="query" className="pl-10 focus-visible:ring-0" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Sort By: {sortBy}</Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={() => handleSortChange("Name Ascending")}>Name: A to Z</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Name Descending")}>Name: Z to A</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Budget Descending")}>Budget: High to Low</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Budget Ascending")}>Budget: Low to High</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Start Date Ascending")}>Start Date: Earliest First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Start Date Descending")}>Start Date: Latest First</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("End Date Ascending")}>End Date: Earliest First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("End Date Descending")}>End Date: Latest First</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter: {statusFilter}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("All")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Completed")}>Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Ongoing")}>Ongoing</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Upcoming")}>Upcoming</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                        ) : displayEvents.length === 0 ? (
                            <EmptyState type="event" colSpan={7} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginatedEvents.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <div className="flex flex-col font-medium">
                                            <span>{event.title}</span>
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
            </div>
        </div>
    );
}
