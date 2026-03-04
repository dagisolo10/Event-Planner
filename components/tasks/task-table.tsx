"use client";
import { useState, useMemo } from "react";
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

type VendorSortKey = "Name Ascending" | "Name Descending" | "Due Date Ascending" | "Due Date Descending" | "Priority Ascending" | "Priority Descending" | "Over Due First";

export default function TaskTable({ tasks, eventId }: { tasks: Task[]; eventId: string }) {
    const [query, setQuery] = useState<string>("");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [onlyOverDue, setOnlyOverDue] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<"All" | "Done" | "Pending" | "InProgress">("All");
    const [sortBy, setSortBy] = useState<VendorSortKey>("Name Ascending");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredTasks = tasks.filter((task) => (task.title.toLowerCase().includes(query.toLowerCase()) || (task.assignedTo && task.assignedTo.toLowerCase().includes(query.toLowerCase()))) && (statusFilter === "All" || task.status === statusFilter));

    const tasksDisplay = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const order: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

        const list = onlyOverDue
            ? filteredTasks.filter((task) => {
                  const date = new Date(task.dueDate).getTime();
                  return task.status !== "Done" && date < today;
              })
            : [...filteredTasks];

        return list.sort((a, b) => {
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
    }, [filteredTasks, onlyOverDue, sortBy]);

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

    const showOnlyOverdue = () => {
        setOnlyOverDue((prev) => !prev);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("All");
        setOnlyOverDue(false);
        setSortBy("Name Ascending");
    };

    const perPage = 5;
    const totalPages = Math.ceil(tasksDisplay.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedTasks = tasksDisplay.slice(startIndex, startIndex + perPage);

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Label htmlFor="query">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    </Label>
                    <Input value={query} onChange={handleQueryChange} placeholder="Search by task title or assigned to..." id="query" className="pl-10 focus-visible:ring-0" />
                </div>

                <Button variant={onlyOverDue ? "default" : "outline"} onClick={showOnlyOverdue}>
                    Show only overdue
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Sort By: {sortBy}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSortChange("Name Ascending")}>Name: A to Z</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Name Descending")}>Name: Z to A</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Priority Ascending")}>Priority: Low to High</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Priority Descending")}>Priority: High to Low</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Due Date Ascending")}>Due Date: Earliest First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Due Date Descending")}>Due Date: Latest First</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Over Due First")}>Over Due First</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter: {statusFilter}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("All")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Done")}>Done</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Pending")}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("InProgress")}>In Progress</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Task Detail</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <EmptyState type="task" colSpan={6} eventId={eventId} />
                        ) : tasksDisplay.length === 0 ? (
                            <EmptyState type="task" colSpan={6} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginatedTasks.map((task) => (
                                <TableRow key={task.id} className="font-medium">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{task.title}</span>
                                            <span className="text-xs text-zinc-500">{task.description}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-accent flex size-7 items-center justify-center rounded-full">
                                                <User2 className="size-4" />
                                            </div>
                                            <span className="text-sm">{task.assignedTo || "Unassigned"}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge className={statusColors.task[task.status]}>{task.status === "InProgress" ? "In Progress" : task.status}</Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge className={statusColors.priority[task.priority]}>{task.priority}</Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="size-3" />
                                            <span>{formatDate(task.dueDate)}</span>
                                            {getTaskStatus(task.status, task.dueDate) && <Badge className={`text-ss ${statusColors.task.Overdue}`}>Overdue</Badge>}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingTask(task)}>Edit</DropdownMenuItem>

                                                <UniversalDeleteDialog type="task" id={task.id} name={task.title} eventId={eventId} />
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
            {editingTask && <TaskSheet eventId={eventId} task={editingTask} open={!!editingTask} setOpen={(open) => !open && setEditingTask(null)} />}
        </div>
    );
}
