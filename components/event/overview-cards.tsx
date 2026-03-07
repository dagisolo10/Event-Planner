"use client";
import { Percent, Activity, ShieldAlert } from "lucide-react";
import { ReactNode } from "react";
import { formatUSD } from "@/helper/helper-functions";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { paymentCompletionProgressBarColor } from "@/mocks/status-colors";

interface CardProp {
    icon: ReactNode;
    // icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> | ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    label?: string;
    value: number;
    paymentCompletion?: number;
    color: string;
    dark?: boolean;
    darkLabel?: string;
}

export default function OverviewCard({ dark = false, label, value, icon: Icon, color, paymentCompletion, darkLabel }: CardProp) {
    const isOverpaid = value < 0;
    const displayValue = Math.abs(value);

    if (dark)
        return (
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl transition-all duration-500 hover:border-zinc-700 md:col-span-2">
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[20px_20px] opacity-[0.03]" />

                <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Activity className="size-3 text-zinc-500" />
                                <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">{darkLabel}</p>
                            </div>
                            <p className={cn("font-poppins text-4xl font-black tracking-tighter transition-colors", isOverpaid ? "text-rose-500" : "text-emerald-400")}>{formatUSD(displayValue)}</p>
                        </div>

                        <div className="text-right">
                            <div className={cn("font-poppins flex items-center justify-end gap-1 text-3xl font-black tracking-tighter", isOverpaid ? "text-rose-400" : "text-zinc-200")}>
                                {paymentCompletion !== undefined ? paymentCompletion.toFixed(1) : "0.0"}
                                <Percent className="size-4 text-zinc-500" />
                            </div>
                            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{isOverpaid ? "Over-Limit Threshold" : "Reconciliation"}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress className={`${isOverpaid ? "[&>div]:bg-rose-600" : paymentCompletionProgressBarColor(paymentCompletion)} bg-zinc-300`} value={paymentCompletion} />
                        <div className="flex justify-between">
                            {isOverpaid ? (
                                <div className="flex animate-pulse items-center gap-1 text-rose-500">
                                    <ShieldAlert className="size-3" />
                                    <span className="text-[10px] font-black tracking-tighter uppercase">System Alert: Excess Payment</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-[10px] font-bold tracking-tight uppercase">Verified Ledger Status</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="group text-foreground relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative z-10">
                <div className={cn("mb-3 inline-flex rounded-lg p-2 transition-colors", color === "text-muted-foreground" ? "bg-zinc-900/10 dark:bg-zinc-300/10" : color.replace("text-", "bg-").concat("/10"))}>{Icon}</div>
                <p className="text-muted-foreground text-[10px] font-black tracking-wider uppercase">{label}</p>
                <p className={cn("font-poppins mt-1 text-2xl font-black tracking-tight", label === "Reserves" && value < 0 ? "text-rose-500" : "")}>{formatUSD(value)}</p>
            </div>

            <div className={cn("absolute bottom-0 left-0 h-0.5 w-0 opacity-0 transition-all duration-500 group-hover:w-full group-hover:opacity-100", color === "text-muted-foreground" ? "bg-black dark:bg-white" : color.replace("text-", "bg-"))} />
        </div>
    );
}
