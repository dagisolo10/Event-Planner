import { Button } from "../ui/button";
import { TaskSheet } from "../tasks/task-sheet";
import { TableRow, TableCell } from "../ui/table";
import { PaymentModal } from "../payment/payment-modal";
import { CreateGlobalVendor } from "../vendor/global-vendor-create";

import Link from "next/link";
import { Event, GlobalVendor } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Plus, CalendarIcon, LucideProps, Globe, Users, Wallet, ListTodo } from "lucide-react";

type Types = "event" | "vendor" | "globalVendor" | "payment" | "task";
interface TextTypes {
    label: string;
    subtext: string;
}
interface EmptyStateProp {
    type: Types;
    events?: Event[];
    eventVendors?: PopulatedEventVendor[];
    colSpan: number;
    eventId?: string;
    isSearching?: boolean;
    onAddClick?: () => void;
    onClearFilters?: () => void;
    onVendorCreated?: (vendor: GlobalVendor) => void;
}

export default function EmptyState({ type, colSpan, isSearching, onClearFilters, onAddClick, eventId, events, eventVendors, onVendorCreated }: EmptyStateProp) {
    const icons: Record<Types, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
        event: CalendarIcon,
        vendor: Users,
        globalVendor: Globe,
        payment: Wallet,
        task: ListTodo,
    };
    const Icon = icons[type];
    const content: Record<Types, TextTypes> = {
        event: {
            label: isSearching ? "No Matches Found" : "No Events Scheduled",
            subtext: isSearching ? "We couldn't find any events matching your current search. Try resetting your filters." : "Your event calendar is empty. Create your first event to start planning.",
        },
        vendor: {
            label: isSearching ? "No Matches Found" : "No Vendors Yet",
            subtext: isSearching ? "No vendors match your search criteria. Try a different name or category." : "Start by adding vendors to manage contracts and payments for this event.",
        },
        globalVendor: {
            label: isSearching ? "No Matches Found" : "No Vendors Registered",
            subtext: isSearching ? "No global vendors found. Try adjusting your search." : "Your master vendor list is empty. Add vendors here to reuse them across events.",
        },
        payment: {
            label: isSearching ? "No Transactions Found" : "No financial activity",
            subtext: isSearching ? "No payments match your current filters." : "You haven't recorded any client payments or vendor payouts yet.",
        },
        task: {
            label: isSearching ? "No Tasks Found" : "No Tasks Assigned",
            subtext: isSearching ? "We couldn't find any tasks matching your current search. Try checking your spelling or filters." : "Your task list is clear. Add a new task to start tracking your event progress.",
        },
    };

    const renderActionButton = () => {
        if (isSearching) {
            return (
                <Button variant="outline" size="lg" onClick={() => onClearFilters?.()}>
                    Clear all filters
                </Button>
            );
        }

        switch (type) {
            case "event":
                return (
                    <Button className="hover:bg-primary/90 w-full sm:w-auto" asChild>
                        <Link href="/dashboard/events/new">
                            <Plus className="size-4" /> Create New Event
                        </Link>
                    </Button>
                );

            case "vendor":
                return (
                    <Button type="button" onClick={() => onAddClick?.()}>
                        <Plus className="size-4" />
                        Add Vendor
                    </Button>
                );

            case "globalVendor":
                return <CreateGlobalVendor onVendorCreated={onVendorCreated} />;

            case "payment":
                return <PaymentModal events={events || []} eventVendors={eventVendors || []} />;

            case "task":
                return <TaskSheet eventId={eventId || ""} />;

            default:
                return null;
        }
    };

    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan}>
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                    <div className="bg-accent mb-4 flex size-20 items-center justify-center rounded-full">
                        <Icon className="text-muted-foreground size-10" />
                    </div>
                    <h3 className="text-lg font-semibold">{content[type].label}</h3>
                    <p className="text-muted-foreground text-sm">{content[type].subtext}</p>
                    <div className="mt-1 flex items-center justify-center">{renderActionButton?.()}</div>
                </div>
            </TableCell>
        </TableRow>
    );
}
