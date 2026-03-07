"use client";
import { cn } from "@/lib/utils";
import { statusColors } from "@/mocks/status-colors";
import { TaskStatus } from "@prisma/client";
import { CheckCircle2, CircleDashed, Timer, ShieldCheck } from "lucide-react";
import { Badge } from "../ui/badge";

interface TimelineProp {
    time: string;
    title: string;
    status: TaskStatus;
    isLast?: boolean;
    isFirst?: boolean;
}

export default function TimelineItem({ time, title, status, isLast, isFirst }: TimelineProp) {
    const StatusIcon = {
        Pending: CircleDashed,
        InProgress: Timer,
        Done: CheckCircle2,
    }[status];

    const glowColor = statusColors.taskDot[status];
    const textColor = statusColors.task[status];

    return (
        <div className="group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-transparent p-4 transition-all duration-500 hover:border-zinc-200/50 hover:bg-white/60 dark:hover:border-white/10 dark:hover:bg-zinc-900/40">
            <div className="relative flex flex-col items-center">
                <div className={cn("relative z-10 flex size-8 items-center justify-center rounded-full border border-white shadow-xl transition-transform duration-500 group-hover:scale-110 dark:border-zinc-900", "bg-white dark:bg-zinc-950", textColor)}>
                    <StatusIcon className="size-4" />
                </div>

                {!isLast && <div className="bg-accent absolute top-8 h-full w-px" />}
                {!isFirst && <div className="bg-accent absolute -top-8 h-full w-px" />}
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="font-poppins text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">{time}</span>
                    <span className={cn("size-1.5 animate-pulse rounded-full", glowColor)} />
                </div>

                <p className="font-poppins text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</p>

                <div className="h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:h-4 group-hover:opacity-100">
                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                        <ShieldCheck className="size-3 text-zinc-400" />
                        Status Verified • {status === "InProgress" ? "Active Operation" : "Logged"}
                    </p>
                </div>
            </div>

            <div className={cn("absolute top-1/2 -right-8 size-24 -translate-y-1/2 opacity-0 blur-[60px] transition-all duration-700 group-hover:opacity-20", glowColor)} />

            <div className="relative z-10 hidden pr-2 md:block">
                <div className="flex flex-col items-end opacity-20 transition-all duration-500 group-hover:-translate-x-1 group-hover:opacity-100">
                    <Badge variant="outline" className={cn("rounded-none border-y-0 border-r-2 border-l-0 bg-transparent! px-2 py-0 text-[9px] font-black tracking-[0.15em] uppercase", textColor)}>
                        {status === "InProgress" ? "Active" : status}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
