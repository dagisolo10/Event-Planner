"use client";
import { Search, ArrowUpCircle, ArrowDownCircle, CalendarIcon, MoreHorizontal } from "lucide-react";
import { CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatDate, formatUSD } from "@/helper/helper-functions";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import PaginatedTable from "../common/paginated-table";
import EmptyState from "../common/empty-state";
import { Event, Payment } from "@prisma/client";
import { getPaymentStatus } from "@/helper/get-status";
import { PopulatedEventVendor } from "@/types/vendor";
import { statusColors } from "@/mocks/status-colors";
import UniversalDeleteDialog from "../common/universal-alert-dialog";
import { PaymentModal } from "./payment-modal";

type VendorSortKey = "Amount Ascending" | "Amount Descending" | "Date Ascending" | "Date Descending" | "Status Risk";

interface PTableProp {
    eventId?: string;
    payments: Payment[];
    events: Event[];
    eventVendors: PopulatedEventVendor[];
}

export default function PaymentTable({ eventId, events, payments, eventVendors }: PTableProp) {
    const [query, setQuery] = useState<string>("");
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState<VendorSortKey>("Date Ascending");
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending" | "Overdue">("All");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const enrichedPayments = useMemo(() => {
        const clientTotalPaid = payments.filter((payment) => payment.type === "Client").reduce((acc, curr) => acc + curr.amount, 0);
        const vendorTotals = payments.reduce(
            (acc, curr) => {
                if (curr.eventVendorId) acc[curr.eventVendorId] = (acc[curr.eventVendorId] || 0) + curr.amount;

                return acc;
            },
            {} as Record<string, number>,
        );

        return payments.map((payment) => {
            let status: "Paid" | "Pending" | "Overdue";
            let displayName = "General Payment";

            const currentEvent = events.find((event) => event.id === payment.eventId);
            const eventBudget = currentEvent?.budget || 0;

            if (payment.type === "Client") {
                displayName = "Client Payment";
                status = getPaymentStatus(eventBudget, clientTotalPaid, payment.dueDate);
            } else {
                const vendor = eventVendors.find((vendor) => vendor.id === payment.eventVendorId);
                displayName = vendor?.globalVendor.name || "Unknown Vendor";

                const totalPaidToThisVendor = vendorTotals[payment.eventVendorId || ""] || 0;
                status = vendor ? getPaymentStatus(vendor.cost, totalPaidToThisVendor, payment.dueDate) : "Pending";
            }

            return { ...payment, calculatedStatus: status, displayName };
        });
    }, [payments, events, eventVendors]);

    const filtered = enrichedPayments.filter((pay) => {
        const matchesQuery = pay.displayName.toLowerCase().includes(query.toLowerCase());
        const matchesType = filter === "All" || pay.type.toLowerCase() === filter.toLowerCase();
        const matchesStatus = statusFilter === "All" || pay.calculatedStatus === statusFilter;

        return matchesQuery && matchesType && matchesStatus;
    });

    const display = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "Amount Ascending":
                    return a.amount - b.amount;

                case "Amount Descending":
                    return b.amount - a.amount;

                case "Date Ascending":
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

                case "Date Descending":
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();

                case "Status Risk": {
                    const weights = { Overdue: 3, Pending: 2, Paid: 1 };
                    return weights[b.calculatedStatus] - weights[a.calculatedStatus];
                }
                default:
                    return 0;
            }
        });
    }, [filtered, sortBy]);

    const clearFilters = () => {
        setQuery("");
        setFilter("All");
        setStatusFilter("All");
        setSortBy("Date Descending");
    };

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

    const perPage = 5;
    const startIndex = (currentPage - 1) * perPage;
    const totalPages = Math.ceil(display.length / perPage);
    const paginated = display.slice(startIndex, startIndex + perPage);

    return (
        <div>
            <div className="my-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex w-full items-center gap-4">
                    {!eventId && <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input value={query} onChange={handleQueryChange} placeholder="Search transactions by description...." className="pl-10 focus-visible:ring-0" />
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Sort By: {sortBy}</Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={() => handleSortChange("Amount Descending")}>Amount: High to Low</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Amount Ascending")}>Amount: Low to High</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Date Ascending")}>Due Date: Earliest First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("Date Descending")}>Due Date: Latest First</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("Status Risk")}>Priority: Overdue First</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter: {statusFilter}</Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("All")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Paid")}>Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Pending")}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("Overdue")}>Overdue</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tabs defaultValue="All" onValueChange={setFilter}>
                    <TabsList>
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="client">Inbound</TabsTrigger>
                        <TabsTrigger value="vendor">Outbound</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Transaction Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {payments.length === 0 ? (
                            <EmptyState type="payment" colSpan={4} events={events} eventVendors={eventVendors} />
                        ) : display.length === 0 ? (
                            <EmptyState type="payment" colSpan={4} isSearching onClearFilters={clearFilters} />
                        ) : (
                            paginated.map((payment) => (
                                <TableRow key={payment.id} className="font-medium">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-full p-2 ${payment.type === "Client" ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"}`}>{payment.type === "Client" ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}</div>

                                            <div>
                                                <p>{payment.displayName}</p>
                                                <p className="text-xs text-zinc-500">{payment.description}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className={statusColors.paymentStatus[payment.calculatedStatus]}>
                                            {payment.calculatedStatus}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-normal">
                                            <CalendarIcon className="size-3" />
                                            {formatDate(payment.dueDate)}
                                        </div>
                                    </TableCell>

                                    <TableCell className={`font-bold ${payment.type === "Client" ? "text-emerald-500" : "text-rose-500"}`}>
                                        {payment.type === "Client" ? "+" : "-"}
                                        {formatUSD(payment.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingPayment(payment)}>Edit</DropdownMenuItem>

                                                <UniversalDeleteDialog type="payment" id={payment.id} name={payment.displayName} eventId={eventId} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {editingPayment && <PaymentModal events={events} eventVendors={eventVendors} payment={editingPayment} open={!!editingPayment} setOpen={(open) => !open && setEditingPayment(null)} />}
                <PaginatedTable currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
}
