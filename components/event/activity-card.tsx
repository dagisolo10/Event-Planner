import { formatDate } from "@/helper/helper-functions";
import { cn } from "@/lib/utils";
import { statusColors } from "@/mocks/status-colors";
import { Activity, ActivityType } from "@prisma/client";
import { LucideProps, Clock, CheckCircle2, Truck, DollarSign, Fingerprint } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

const activityIcons: Record<ActivityType, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    TaskCreated: Clock,
    TaskCompleted: CheckCircle2,
    VendorAdded: Truck,
    VendorUpdated: Truck,
    VendorPaid: DollarSign,
};

export default function ActivityCard({ item }: { item: Activity }) {
    const Icon = activityIcons[item.type as ActivityType] || Clock;
    const colorClass = statusColors.activityColors[item.type as keyof typeof statusColors.activityColors] || "bg-zinc-500/20 text-muted-foreground";

    const glowColor = statusColors.activityGlowColors[item.type as keyof typeof statusColors.activityGlowColors];

    return (
        <div className="group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-transparent p-4 transition-all duration-500 hover:border-zinc-200/50 hover:bg-white/60 dark:hover:border-white/10 dark:hover:bg-zinc-900/40">
            <div className="relative flex flex-col items-center">
                <div className={cn("relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-white shadow-xl dark:border-zinc-900", colorClass, "bg-white dark:bg-zinc-950")}>
                    <Icon className="size-5" />
                </div>
                <div className="absolute top-12 h-20 w-px bg-linear-to-b from-zinc-200 to-transparent dark:from-zinc-800" />
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="font-poppins text-ss text-muted-foreground font-black tracking-[0.2em] uppercase">{formatDate(item.createdAt)}</span>
                    <span className={cn("size-1.5 animate-pulse rounded-full", glowColor)} />
                </div>

                <p className="font-poppins text-sm font-bold">{item.message}</p>

                <div className="h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:h-4 group-hover:opacity-100">
                    <p className="text-ss text-muted-foreground font-medium">System verified • ID: {item.id.slice(-6).toUpperCase()}</p>
                </div>
            </div>

            <div className={cn("absolute top-1/2 -right-8 size-24 -translate-y-1/2 opacity-0 blur-[60px] transition-all duration-700 group-hover:opacity-20", colorClass.split(" ")[1].replace("text", "bg"))} />

            <div className="relative z-10 hidden pr-4 md:block">
                <div className="flex flex-col items-end transition-opacity duration-500 dark:opacity-20 dark:group-hover:opacity-100">
                    <Fingerprint className="size-4 text-zinc-400" />
                    <span className="text-ss text-muted-foreground font-black tracking-widest uppercase opacity-50 transition-all duration-700 group-hover:opacity-100">Audit Log</span>
                </div>
            </div>
        </div>
    );
}
