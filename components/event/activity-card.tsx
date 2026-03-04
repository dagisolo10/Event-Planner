import { formatDate } from "@/helper/helper-functions";
import { cn } from "@/lib/utils";
import { statusColors } from "@/mocks/status-colors";
import { Activity, ActivityType } from "@prisma/client";
import { LucideProps, Clock, CheckCircle2, Truck, DollarSign, Archive } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

const activityIcons: Record<ActivityType, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    TaskCreated: Clock,
    TaskCompleted: CheckCircle2,
    VendorAdded: Truck,
    VendorUpdated: Truck,
    VendorPaid: DollarSign,
    EventArchived: Archive,
};

export default function ActivityCard({ item }: { item: Activity }) {
    const Icon = activityIcons[item.type as ActivityType];

    return (
        <div className="flex gap-4 rounded-xl border p-6">
            <div className={cn("flex size-10 items-center justify-center rounded-full", statusColors.activityColors[item.type])}>
                <Icon className="size-4" />
            </div>

            <div className="flex flex-col gap-1 font-semibold">
                <span className="text-xs tracking-wide text-zinc-500 uppercase">{formatDate(item.createdAt)}</span>
                <span className="text-sm">{item.message}</span>
            </div>
        </div>
    );
}
