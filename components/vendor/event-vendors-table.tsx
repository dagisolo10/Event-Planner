"use client";
import { CalendarIcon, ExternalLink, Globe, Mail, MoreHorizontal, Search } from "lucide-react";
import { Dispatch, Fragment, SetStateAction, useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { paymentCompletionProgressBarColor } from "@/mocks/status-colors";
import { UpdateEventVendor } from "./event-vendor-update";
import { Checkbox } from "../ui/checkbox";
import PaginatedTable from "../common/paginated-table";
import { Label } from "../ui/label";
import EmptyState from "../common/empty-state";
import { formatUSD, formatDate } from "@/helper/helper-functions";
import { PopulatedEventVendor } from "@/types/vendor";
import { getPaymentStatus } from "@/helper/get-status";
import { GlobalVendor } from "@prisma/client";
import { LinkVendorForEvent } from "./vendor-to-event-link";
import UniversalDeleteDialog from "../common/universal-alert-dialog";
import TableWrapper from "../others/table-border-wrapper";
import { cn } from "@/lib/utils";

type VendorSortKey = "Balance Ascending" | "Balance Descending" | "Total Ascending" | "Total Descending" | "Name Ascending" | "Name Descending" | "Date Ascending" | "Date Descending" | "Priority Risk";
type VendorFilterKey = "All" | "Paid" | "Pending" | "Overdue";

interface VendorProp {
    eventTitle: string;
    globalVendors: GlobalVendor[];
    eventVendors: PopulatedEventVendor[];
    eventId: string;
}

export default function EventVendorsTable({ eventVendors, eventId, globalVendors, eventTitle }: VendorProp) {
    const [query, setQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<VendorSortKey>("Name Ascending");
    const [editingVendor, setEditingVendor] = useState<PopulatedEventVendor | null>(null);
    const [statusFilter, setStatusFilter] = useState<VendorFilterKey>("All");

    const display = useMemo(() => {
        const filteredEventVendor = eventVendors.filter((vendor) => {
            const paid = vendor.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const status = getPaymentStatus(vendor.cost, paid, vendor.dueDate);
            return (vendor.globalVendor.name.toLowerCase().includes(query.toLowerCase()) || vendor.globalVendor.category.toLowerCase().includes(query.toLowerCase())) && (statusFilter === "All" || status === statusFilter);
        });

        return filteredEventVendor.sort((a, b) => {
            const paidA = a.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const paidB = b.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const remainingBalanceA = a.cost - paidA;
            const remainingBalanceB = b.cost - paidB;
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();

            switch (sortBy) {
                case "Balance Ascending":
                    return remainingBalanceA - remainingBalanceB;

                case "Balance Descending":
                    return remainingBalanceB - remainingBalanceA;

                case "Total Ascending":
                    return a.cost - b.cost;

                case "Total Descending":
                    return b.cost - a.cost;

                case "Name Ascending":
                    return a.globalVendor.name.localeCompare(b.globalVendor.name);

                case "Name Descending":
                    return b.globalVendor.name.localeCompare(a.globalVendor.name);

                case "Date Ascending":
                    return dateA - dateB;

                case "Date Descending":
                    return dateB - dateA;

                case "Priority Risk": {
                    const weights = { Overdue: 3, Pending: 2, Paid: 1 };
                    const aStatus = getPaymentStatus(a.cost, paidA, a.dueDate);
                    const bStatus = getPaymentStatus(b.cost, paidB, b.dueDate);
                    return weights[bStatus as keyof typeof weights] - weights[aStatus as keyof typeof weights];
                }
                default:
                    return 0;
            }
        });
    }, [eventVendors, query, sortBy, statusFilter]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedVendors(display.map((v) => v.id));
        else setSelectedVendors([]);
    };
    const handleSortChange = (val: VendorSortKey) => {
        setSortBy(val);
        setCurrentPage(1);
    };
    const handleStatusChange = (val: typeof statusFilter) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.currentTarget.value);
        setCurrentPage(1);
    };
    const clearFilters = () => {
        setQuery("");
        setStatusFilter("All");
        setSortBy("Name Ascending");
    };

    const perPage = 5;
    const totalPages = Math.ceil(display.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const paginated = display.slice(startIndex, startIndex + perPage);

    const sortOptions = [
        {
            group: "Name",
            items: [
                { method: "Name Ascending", label: "Name: A to Z" },
                { method: "Name Descending", label: "Name: Z to A" },
            ],
        },
        {
            group: "Contract",
            items: [
                { method: "Total Descending", label: "Contract: High to Low" },
                { method: "Total Ascending", label: "Contract: Low to High" },
            ],
        },
        {
            group: "Ledger",
            items: [
                { method: "Balance Descending", label: "Balance: High to Low" },
                { method: "Balance Ascending", label: "Balance: Low to High" },
            ],
        },
        {
            group: "Timeline",
            items: [
                { method: "Date Ascending", label: "Due Date: Earliest First" },
                { method: "Date Descending", label: "Due Date: Latest First" },
            ],
        },
        {
            group: "Risk",
            items: [{ method: "Priority Risk", label: "Priority: Overdue First" }],
        },
    ];

    return (
        <div>
            <LinkVendorForEvent open={isAddDialogOpen} setOpen={setIsAddDialogOpen} eventId={eventId} eventVendors={eventVendors} eventTitle={eventTitle} globalVendors={globalVendors} />

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="group relative max-w-sm flex-1">
                        <Label htmlFor="query">
                            <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 transition-colors" />
                        </Label>
                        <Input value={query} onChange={handleQueryChange} id="query" placeholder="Search vendors, categories..." className="border-input/80 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-full pr-4 pl-11" />
                    </div>

                    {selectedVendors.length > 0 && (
                        <Badge variant="ghost" className="h-11">
                            {selectedVendors.length} Selected
                        </Badge>
                    )}
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
                            {(["All", "Paid", "Pending", "Overdue"] as VendorFilterKey[]).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status as VendorFilterKey)} className="flex items-center justify-between">
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
                    <TableHeader className="bg-muted/50">
                        <TableRow className="font-bold hover:bg-transparent">
                            <TableHead className="w-12 text-center">
                                <Checkbox checked={selectedVendors.length === display.length && display.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} className="border-zinc-400 dark:border-zinc-600" />
                            </TableHead>
                            <TableHead className="py-4">
                                <div className="grid gap-px">
                                    <span>Vendor</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Identity / Category</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Contract</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Total Value</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Ledger</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Paid / Balance</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Disbursement</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Percentage</span>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="grid gap-px">
                                    <span>Timeline</span>
                                    <span className="text-muted-foreground text-[11px] font-medium">Next Due Date</span>
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventVendors.length === 0 ? (
                            <EmptyState type="vendor" colSpan={7} onAddClick={() => setIsAddDialogOpen(true)} />
                        ) : display.length === 0 ? (
                            <EmptyState type="vendor" colSpan={7} onClearFilters={clearFilters} isSearching />
                        ) : (
                            paginated.map((vendor) => {
                                const paidToDate = vendor.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                                const remainingCost = vendor.cost - paidToDate;
                                const progress = vendor.cost > 0 ? Math.min((paidToDate / vendor.cost) * 100, 100) : 0;

                                return (
                                    <TableRow
                                        key={vendor.id}
                                        onDoubleClick={() => setSelectedVendors((prev) => (prev.includes(vendor.id) ? prev.filter((id) => id !== vendor.id) : [...prev, vendor.id]))}
                                        className={`font-medium ${selectedVendors.includes(vendor.id) ? "bg-accent dark:bg-accent/20" : ""}`}
                                    >
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={selectedVendors.includes(vendor.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedVendors((prev) => (checked ? [...prev, vendor.id] : prev.filter((id) => id !== vendor.id)));
                                                }}
                                                className="border-zinc-400 transition-transform active:scale-90 dark:border-zinc-600"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span>{vendor.globalVendor.name}</span>
                                                <div className="flex items-center gap-1 text-xs font-medium">
                                                    <span className="text-muted-foreground">{vendor.globalVendor.contact || "No Contact"}</span>
                                                    <span className="text-zinc-500">/ {vendor.globalVendor.category}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-poppins tabular-nums">{formatUSD(vendor.cost)}</TableCell>

                                        <TableCell>
                                            <div className="font-poppins flex flex-col">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">{formatUSD(paidToDate)}</span>
                                                <span className={cn("text-[12px] font-bold tabular-nums", remainingCost > 0 ? "text-rose-500" : "text-zinc-400")}>{remainingCost > 0 ? `-${formatUSD(remainingCost)}` : "Settled"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="w-64">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground text-xs">Coverage</span>
                                                    <span className="text-[11px]">{Math.round(progress)}%</span>
                                                </div>
                                                <Progress className={remainingCost < 0 ? "[&>div]:bg-purple-500" : paymentCompletionProgressBarColor(progress)} value={progress} />
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-normal">
                                                <CalendarIcon className="size-3" />
                                                {formatDate(vendor.dueDate)}
                                            </div>
                                        </TableCell>

                                        <TableCell className="pr-6 text-right">
                                            <ActionDropdown eventTitle={eventTitle} eventId={eventId} selectedVendors={selectedVendors} setSelectedVendors={setSelectedVendors} setEditingVendor={setEditingVendor} vendor={vendor} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </TableWrapper>
            {editingVendor && <UpdateEventVendor vendor={editingVendor} open={!!editingVendor} setOpen={(open) => !open && setEditingVendor(null)} />}
        </div>
    );
}

interface DropdownProp {
    vendor: PopulatedEventVendor;
    eventTitle: string;
    eventId: string;
    selectedVendors: string[];
    setEditingVendor: Dispatch<SetStateAction<PopulatedEventVendor | null>>;
    setSelectedVendors: Dispatch<SetStateAction<string[]>>;
}

function ActionDropdown({ vendor, setEditingVendor, selectedVendors, setSelectedVendors, eventTitle, eventId }: DropdownProp) {
    const isSelected = selectedVendors.includes(vendor.id);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-54">
                <DropdownMenuItem
                    onClick={() => {
                        setSelectedVendors((prev) => (isSelected ? prev.filter((id) => id !== vendor.id) : [...prev, vendor.id]));
                    }}
                >
                    {isSelected ? "Deselect Vendor" : "Select Vendor"}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setEditingVendor(vendor)}>Edit Contract / Dates</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild disabled={!vendor.globalVendor.email}>
                    {vendor.globalVendor.email ? (
                        <Link target="_blank" href={`mailto:${vendor.globalVendor.email}`} className="flex items-center gap-2">
                            <Mail className="size-4" /> Email Vendor
                        </Link>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Mail className="size-4" /> No Email Found
                        </span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem asChild disabled={!vendor.globalVendor.website}>
                    {vendor.globalVendor.website ? (
                        <Link target="_blank" href={vendor.globalVendor.website.startsWith("http") ? vendor.globalVendor.website : `https://${vendor.globalVendor.website}`} className="flex items-center gap-2">
                            <Globe className="size-4" /> Visit Website <ExternalLink className="size-3" />
                        </Link>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Globe className="size-4" /> No Website
                        </span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {selectedVendors.length > 0 && <UniversalDeleteDialog type="bulk-vendor-unlink" id={selectedVendors} name={selectedVendors.length.toString()} eventId={eventId} onComplete={() => setSelectedVendors([])} />}

                <UniversalDeleteDialog type="vendor-unlink" id={vendor.id} name={vendor.globalVendor.name} extra={eventTitle} eventId={eventId} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
