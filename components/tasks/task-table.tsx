"use client";
import { useState, useMemo, Fragment } from "react";
import { formatDate } from "@/helper/helper-functions";
import { Search, User2, MoreHorizontal, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import PaginatedTable from "../common/paginated-table";
import EmptyState from "../common/empty-state";
import { Task } from "@prisma/client";
import { getTaskStatus } from "@/helper/get-status";
import { statusColors } from "@/mocks/status-colors";
import { TaskSheet } from "./task-sheet";
import UniversalDeleteDialog from "../common/universal-alert-dialog";
import TableWrapper from "../others/table-border-wrapper";
import { cn } from "@/lib/utils";

type VendorSortKey = "Name Ascending" | "Name Descending" | "Due Date Ascending" | "Due Date Descending" | "Priority Ascending" | "Priority Descending" | "Over Due First";
type VendorFilterKey = "All" | "Done" | "Pending" | "InProgress";

export default function TaskTable({ tasks, eventId }: { tasks: Task[]; eventId: string }) {
    const [query, setQuery] = useState<string>("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [statusFilter, setStatusFilter] = useState<VendorFilterKey>("All");
    const [sortBy, setSortBy] = useState<VendorSortKey>("Name Ascending");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredTasks = tasks.filter((task) => (task.title.toLowerCase().includes(query.toLowerCase()) || (task.assignedTo && task.assignedTo.toLowerCase().includes(query.toLowerCase()))) && (statusFilter === "All" || task.status === statusFilter));

    const tasksDisplay = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const order: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

        return [...filteredTasks].sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();

            switch (sortBy) {
                case "Name Ascending":
                    return a.title.localeCompare(b.title);

                case "Name Descending":
                    return b.title.localeCompare(a.title);

                case "Due Date Ascending":
                    return dateA - dateB;

                case "Due Date Descending":
                    return dateB - dateA;

                case "Priority Ascending":
                    return (order[a.priority] || 0) - (order[b.priority] || 0);

                case "Priority Descending":
                    return (order[b.priority] || 0) - (order[a.priority] || 0);

                case "Over Due First": {
                    const aOverdue = a.status !== "Done" && dateA < today;
                    const bOverdue = b.status !== "Done" && dateB < today;

                    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

                    return dateA - dateB;
                }

                default:
                    return 0;
            }
        });
    }, [filteredTasks, sortBy]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.currentTarget.value);
        setCurrentPage(1);
    };

    const handleSortChange = (val: VendorSortKey) => {
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
    const totalPages = Math.ceil(tasksDisplay.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedTasks = tasksDisplay.slice(startIndex, startIndex + perPage);

    const sortOptions = [
        {
            group: "Name",
            items: [
                { method: "Name Ascending", label: "Name: A to Z" },
                { method: "Name Descending", label: "Name: Z to A" },
            ],
        },
        {
            group: "Ledger",
            items: [
                { method: "Priority Descending", label: "Priority: High to Low" },
                { method: "Priority Ascending", label: "Priority: Low to High" },
            ],
        },
        {
            group: "Timeline",
            items: [
                { method: "Due Date Ascending", label: "Due Date: Earliest First" },
                { method: "Due Date Descending", label: "Due Date: Latest First" },
            ],
        },
        {
            group: "Risk",
            items: [{ method: "Over Due First", label: "Overdue First" }],
        },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="group relative max-w-sm flex-1">
                    <Label htmlFor="query">
                        <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 transition-colors" />
                    </Label>
                    <Input value={query} onChange={handleQueryChange} id="query" placeholder="Search by task title or assigned to..." className="border-input/80 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-full pr-4 pl-11" />
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

                        <DropdownMenuContent className="w-56">
                            {sortOptions.map((item, index) => (
                                <Fragment key={item.group}>
                                    {item.items.map((subItem) => (
                                        <DropdownMenuItem onClick={() => handleSortChange(subItem.method as VendorSortKey)} className="flex items-center justify-between" key={subItem.method}>
                                            {subItem.label}
                                            {sortBy === subItem.method && <div className="bg-primary size-2 rounded-full" />}
                                        </DropdownMenuItem>
                                    ))}
                                    {index < sortOptions.length - 1 && <DropdownMenuSeparator />}
                                </Fragment>
                            ))}
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
                            {(["All", "Done", "Pending", "InProgress"] as VendorFilterKey[]).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status as VendorFilterKey)} className="flex items-center justify-between">
                                    {status === "InProgress" ? "In Progress" : status}
                                    {statusFilter === status && <div className="bg-primary size-2 rounded-full" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <TableWrapper>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="font-bold hover:bg-transparent">
                            <TableHead className="py-4">
                                <div className="grid gap-px">
                                    <span>Task Objective</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Description / Reference</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Assignment</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Owner</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Status</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Current Phase</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Priority</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Urgency Level</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Timeline</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Target Date</span>
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <EmptyState type="task" colSpan={6} eventId={eventId} />
                        ) : tasksDisplay.length === 0 ? (
                            <EmptyState type="task" colSpan={6} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginatedTasks.map((task) => {
                                const isOverdue = getTaskStatus(task.status, task.dueDate);

                                return (
                                    <TableRow key={task.id} className={cn("font-medium transition-colors")}>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="tracking-tight">{task.title}</span>
                                                <span className="text-muted-foreground line-clamp-1 text-[11px] font-normal">{task.description || "No additional details provided."}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-muted flex size-7 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800">
                                                    <User2 className="size-3.5 text-zinc-500" />
                                                </div>
                                                <span className="text-sm">{task.assignedTo || "Unassigned"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="ghost" className={cn("text-sm!", statusColors.task[task.status])}>
                                                {task.status === "InProgress" ? "Active" : task.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn("size-1.5 animate-pulse rounded-full", statusColors.priority[task.priority])} />
                                                <span className="text-sm font-normal">{task.priority}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Calendar className="size-3 text-zinc-400" />
                                                    <span>{formatDate(task.dueDate)}</span>
                                                </div>
                                                {isOverdue && <span className="animate-pulse text-[10px] font-black tracking-wide text-red-500/80 uppercase">Action Required</span>}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                    <DropdownMenuItem onClick={() => setEditingTask(task)}>Edit Task</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <UniversalDeleteDialog type="task" id={task.id} name={task.title} eventId={eventId} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </TableWrapper>
            {editingTask && <TaskSheet eventId={eventId} task={editingTask} open={!!editingTask} setOpen={(open) => !open && setEditingTask(null)} />}
        </div>
    );
}
