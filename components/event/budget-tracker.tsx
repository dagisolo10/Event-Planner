"use client";
import { Card } from "../ui/card";
import { Wallet, AlertTriangle, ShieldCheck, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { badgeColor, progressBarColor } from "@/mocks/status-colors";
import { Badge } from "../ui/badge";
import { differenceInDays, isBefore } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BudgetTrackerProps {
    utilizationPercentage: number;
    remainingBudget: number;
    isOverBudget: boolean;
    startDate: Date;
    endDate: Date;
}

const formatUSD = (val: number) => val.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function BudgetTracker({ utilizationPercentage, remainingBudget, isOverBudget, startDate, endDate }: BudgetTrackerProps) {
    const calculateBurnRate = () => {
        const totalDays = differenceInDays(endDate, startDate) || 1;
        const daysPassed = differenceInDays(new Date(), startDate);

        if (isBefore(new Date(), startDate))
            return {
                label: "Pending",
                color: "text-muted-foreground",
                description: "The event has not started yet. Burn rate monitoring will begin on the start date.",
            };

        const timeWeight = (daysPassed / totalDays) * 100;
        const drift = utilizationPercentage - timeWeight;

        if (isOverBudget)
            return {
                label: "Deficit",
                color: "text-rose-500",
                description: "Budget exceeded. Total expenditure has surpassed the allocated 100% threshold.",
            };

        if (utilizationPercentage > 90)
            return {
                label: "Critical",
                color: "text-rose-500",
                description: "Near-exhaustion state. Less than 10% of total budget remains available.",
            };

        if (drift > 15)
            return {
                label: "Aggressive",
                color: "text-amber-500",
                description: `Spending is outpacing time elapsed by ${drift.toFixed(0)}%. You are consuming budget faster than scheduled.`,
            };

        return {
            label: "Optimal",
            color: "text-emerald-500",
            description: "Spending is aligned with the event timeline. Your current burn rate is sustainable.",
        };
    };

    const burnRate = calculateBurnRate();

    const status = isOverBudget ? { label: "Deficit", icon: <AlertTriangle className="size-3" /> } : utilizationPercentage <= 70 ? { label: "Optimal", icon: <ShieldCheck className="size-3" /> } : { label: "Critical", icon: <TrendingUp className="size-3" /> };

    return (
        <Card className={cn("group relative overflow-hidden border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl transition-all duration-500", isOverBudget ? "border-rose-900/50 shadow-rose-500/10" : "")}>
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03]" />
            <div className={cn(badgeColor(isOverBudget, utilizationPercentage).replace("border", "bg"), "absolute -top-4 -right-4 size-24 opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-45")} />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("rounded-lg border border-white/10 bg-white/5 p-1.5", isOverBudget ? "text-rose-500" : "text-emerald-400")}>
                            <Wallet className="size-4" />
                        </div>
                        <h2 className="font-poppins text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">Budget Utilization</h2>
                    </div>
                    <Badge className={cn("gap-1.5 px-3 uppercase", badgeColor(isOverBudget, utilizationPercentage))}>
                        {status.icon}
                        {status.label}
                    </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className={cn("font-poppins text-5xl font-black tracking-tighter", isOverBudget ? "text-rose-500" : "text-white")}>
                        {utilizationPercentage.toFixed(0)}
                        <span className="text-2xl">%</span>
                    </span>

                    <div className="flex flex-col">
                        <span className={cn("flex items-center text-[10px] font-bold tracking-wider uppercase", isOverBudget ? "text-rose-500" : "text-emerald-500")}>
                            {isOverBudget ? <ArrowUpRight className="mr-1 size-3" /> : <ArrowDownRight className="mr-1 size-3" />}
                            {isOverBudget ? "Limit Breach" : "Under Cap"}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/5 bg-zinc-900">
                        <Progress value={utilizationPercentage} className={progressBarColor(isOverBudget, utilizationPercentage)} />
                        {isOverBudget && <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-size-[10px_10px]" />}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-black tracking-[0.15em] uppercase">
                        <div className="flex items-center gap-2">
                            <Activity className={cn("size-3", burnRate.color)} />
                            <span className={burnRate.color}>Burn Rate:</span>
                            <span className={burnRate.color}>{burnRate.label}</span>
                            <InfoTooltip content={burnRate.description} />
                        </div>
                        <span className="text-muted-foreground">Allocation: 100%</span>
                    </div>
                </div>

                <div className={cn("mt-4 flex items-center justify-between rounded-xl border p-4 transition-all", isOverBudget ? "border-rose-500/20 bg-rose-500/5" : "border-white/5 bg-white/5")}>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-tight uppercase">{isOverBudget ? "Budget Deficit" : "Available Funds"}</span>
                        <span className={cn("font-poppins text-xl font-bold", isOverBudget ? "text-rose-400" : "text-white")}>{formatUSD(Math.abs(remainingBudget))}</span>
                    </div>

                    <div className="border-l border-white/5 pl-4 text-right">
                        <span className="text-muted-foreground text-[8px] font-black tracking-tighter uppercase italic">Status</span>
                        <p className={cn("text-xs font-bold uppercase", isOverBudget ? "text-rose-500" : "text-emerald-500")}>{isOverBudget ? "Action Required" : "Nominal"}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <div className="cursor-help opacity-50 transition-opacity hover:opacity-100">
                    <Info className="size-3" />
                </div>
            </TooltipTrigger>

            <TooltipContent side="bottom" className="max-w-60 border-zinc-800 bg-zinc-950 p-3 leading-relaxed text-white shadow-xl">
                <div className="flex flex-col gap-1.5">
                    <p className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">Telemetry Analysis</p>
                    <p className="font-light tracking-wider">{content}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
