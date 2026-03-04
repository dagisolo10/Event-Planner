"use client";
import { CalendarIcon, ExternalLink, Globe, Mail, MoreHorizontal, Search } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { paymentCompletionProgressBarColor, statusColors } from "@/mocks/status-colors";
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

type VendorSortKey = "Balance Ascending" | "Balance Descending" | "Total Ascending" | "Total Descending" | "Name Ascending" | "Name Descending" | "Date Ascending" | "Date Descending" | "Priority Risk";

interface VendorProp {
    eventTitle: string;
    globalVendors: GlobalVendor[];
    eventVendors: PopulatedEventVendor[];
    eventId: string;
}

export default function EventVendorsTable({ eventVendors, eventId, globalVendors, eventTitle }: VendorProp) {
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<VendorSortKey>("Name Ascending");
    const [editingVendor, setEditingVendor] = useState<PopulatedEventVendor | null>(null);
    const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending" | "Overdue">("All");

    const display = useMemo(() => {
        const filteredEventVendor = eventVendors.filter((vendor) => {
            const paid = vendor.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const status = getPaymentStatus(vendor.cost, paid, vendor.dueDate);
            return (vendor.globalVendor.name.toLowerCase().includes(search.toLowerCase()) || vendor.globalVendor.category.toLowerCase().includes(search.toLowerCase())) && (statusFilter === "All" || status === statusFilter);
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
    }, [eventVendors, search, sortBy, statusFilter]);

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
        setSearch(e.currentTarget.value);
        setCurrentPage(1);
    };
    const clearFilters = () => {
        setSearch("");
        setSortBy("Name Ascending");
    };

    const perPage = 5;
    const totalPages = Math.ceil(display.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const paginated = display.slice(startIndex, startIndex + perPage);

    return (
        <div>
            <LinkVendorForEvent open={isAddDialogOpen} setOpen={setIsAddDialogOpen} eventId={eventId} eventVendors={eventVendors} eventTitle={eventTitle} globalVendors={globalVendors} />

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                        <Label htmlFor="query">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        </Label>
                        <Input value={search} onChange={handleQueryChange} id="query" placeholder="Search vendors, categories..." className="pl-10 focus-visible:ring-0" />
                    </div>
                    {selectedVendors.length > 0 && (
                        <Badge variant="outline" className="h-9 rounded-lg px-3">
                            {selectedVendors.length} Selected
                        </Badge>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Sort By: {sortBy}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={() => handleSortChange("Name Ascending")}>Name: A to Z</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Name Descending")}>Name: Z to A</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Total Descending")}>Contract: High to Low</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Total Ascending")}>Contract: Low to High</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Balance Descending")}>Balance: High to Low</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Balance Ascending")}>Balance: Low to High</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Date Ascending")}>Due Date: Earliest First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Date Descending")}>Due Date: Latest First</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Priority Risk")}>Priority: Overdue First</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter: {statusFilter}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("All")}>All Statuses</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Paid")}>Paid / Settled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Pending")}>Payment Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Overdue")}>Overdue Only</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center">
                                <Checkbox checked={selectedVendors.length === display.length && display.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                            </TableHead>
                            <TableHead>Vendor Details</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Contract Total</TableHead>
                            <TableHead>Total Paid</TableHead>
                            <TableHead>Outstanding Balance</TableHead>
                            <TableHead>Payment Progress</TableHead>
                            <TableHead>Next Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventVendors.length === 0 ? (
                            <EmptyState type="vendor" colSpan={10} onAddClick={() => setIsAddDialogOpen(true)} />
                        ) : display.length === 0 ? (
                            <EmptyState type="vendor" colSpan={10} onClearFilters={clearFilters} isSearching />
                        ) : (
                            paginated.map((vendor) => {
                                const paidToDate = vendor.payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                                const status = getPaymentStatus(vendor.cost, paidToDate, vendor.dueDate);
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
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{vendor.globalVendor.name}</span>
                                                <span className="text-xs text-zinc-500">{vendor.globalVendor.contact || "No contact info"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge className="text-primary bg-primary/20 dark:border-primary dark:bg-transparent">{vendor.globalVendor.category}</Badge>
                                        </TableCell>

                                        <TableCell>{formatUSD(vendor.cost)}</TableCell>
                                        <TableCell className="text-emerald-500">{formatUSD(paidToDate)}</TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={remainingCost > 0 ? "text-destructive" : remainingCost === 0 ? "text-emerald-500" : "text-purple-400"}>{formatUSD(remainingCost)}</span>
                                                {remainingCost < 0 && <Badge className="text-ss border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Overpaid</Badge>}
                                            </div>
                                        </TableCell>

                                        <TableCell className="w-36">
                                            <div className="flex flex-col gap-1">
                                                <Progress className={remainingCost < 0 ? "[&>div]:bg-purple-500" : paymentCompletionProgressBarColor(progress)} value={progress} />
                                                <span className="text-ss text-left text-zinc-500">{Math.round(progress)}% Complete</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs">
                                                <CalendarIcon className="size-3" />
                                                {formatDate(vendor.dueDate)}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge className={statusColors.vendor[status]}>{status}</Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <ActionDropdown eventTitle={eventTitle} eventId={eventId} selectedVendors={selectedVendors} setSelectedVendors={setSelectedVendors} setEditingVendor={setEditingVendor} vendor={vendor} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </div>
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

                {selectedVendors.length > 0 && <UniversalDeleteDialog type="bulk-vendor-unlink" id={selectedVendors} name={selectedVendors.length.toString()} eventId={eventId} onComplete={() => setSelectedVendors([])} />}

                <UniversalDeleteDialog type="vendor-unlink" id={vendor.id} name={vendor.globalVendor.name} extra={eventTitle} eventId={eventId} />

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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
