"use client";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { CheckCircle2, ListTodo, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProp {
    overdueVendors: number;
    pendingTasks: number;
}

export default function SummaryCard({ overdueVendors, pendingTasks }: CardProp) {
    const hasCriticalIssues = overdueVendors > 0;

    return (
        <Card className="relative overflow-hidden border-zinc-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className={cn("absolute top-0 left-0 h-1 w-full transition-colors duration-500", hasCriticalIssues ? "bg-rose-500 shadow-[0_2px_10px_rgba(244,63,94,0.4)]" : "bg-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.3)]")} />

            <CardHeader className="py-2">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-zinc-400 dark:text-zinc-500" />
                    <CardTitle className="font-poppins text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase dark:text-zinc-500">Operations Summary</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div
                    className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 transition-all",
                        hasCriticalIssues ? "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400" : "border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400",
                    )}
                >
                    <div className="flex items-center gap-3">
                        {hasCriticalIssues ? <ShieldAlert className="size-4 animate-pulse" /> : <CheckCircle2 className="size-4 text-emerald-500" />}
                        <span className="text-xs font-bold tracking-wide uppercase">Overdue Payments</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={cn("font-poppins text-xl font-black", hasCriticalIssues ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-500")}>{overdueVendors}</span>
                        <span className="text-[8px] font-black tracking-widest uppercase opacity-60">Vendors</span>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-zinc-500 transition-all hover:bg-zinc-100 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10">
                    <div className="flex items-center gap-3">
                        <ListTodo className="size-4 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-xs font-bold tracking-wide uppercase">Pending Tasks</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="font-poppins text-xl font-black text-zinc-900 dark:text-zinc-100">{pendingTasks}</span>
                        <span className="text-[8px] font-black tracking-widest uppercase opacity-60">Remaining</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                        <div className={cn("size-1.5 rounded-full", hasCriticalIssues ? "animate-pulse bg-rose-500" : "bg-emerald-500")} />
                        <span className="text-[10px] font-black tracking-wide text-zinc-400 uppercase dark:text-zinc-600">{hasCriticalIssues ? "Action Required" : "System Nominal"}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-widest">SEC-OP-04</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
