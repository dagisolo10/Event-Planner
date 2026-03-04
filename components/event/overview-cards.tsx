import { LucideProps, Percent } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { formatUSD } from "@/helper/helper-functions";
import { Progress } from "../ui/progress";
import { paymentCompletionProgressBarColor } from "@/mocks/status-colors";
import { Badge } from "../ui/badge";

interface CardProp {
    dark?: boolean;
    label?: string;
    value: number;
    paymentCompletion?: number;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    color: string;
    darkLabel?: string;
}

export default function OverviewCard({ dark = false, label, value, icon: Icon, color, paymentCompletion, darkLabel }: CardProp) {
    const isOverpaid = value < 0;
    const displayValue = Math.abs(value);
    if (dark)
        return (
            <div className="col-span-2 rounded-3xl bg-zinc-900 p-6 text-zinc-100 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-ss font-black tracking-widest text-zinc-400 uppercase">{darkLabel}</p>
                        <p className={`text-3xl font-black ${isOverpaid ? "text-rose-500" : "text-orange-400"}`}>{formatUSD(displayValue)}</p>
                        {isOverpaid && <Badge className="text-ss mt-2 animate-pulse border-none bg-rose-500/30 text-rose-500">Action Required</Badge>}
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-2xl font-black">
                            <Percent className="size-5 text-zinc-500" />
                            {paymentCompletion !== undefined ? paymentCompletion.toFixed(1) : "0.0"}
                        </div>
                        <p className="text-ss font-black text-zinc-500 uppercase">{isOverpaid ? "Over-Limit" : "Completed"}</p>
                    </div>
                </div>
                <Progress className={`${isOverpaid ? "[&>div]:bg-rose-600" : paymentCompletionProgressBarColor(paymentCompletion)} bg-zinc-300`} value={paymentCompletion} />
            </div>
        );

    return (
        <div className="rounded-xl border p-5 shadow-sm">
            <Icon className={`mb-2 size-5 ${color}`} />
            <p className="text-ss font-black tracking-wider text-zinc-400 uppercase">{label}</p>
            <p className={`text-foreground text-xl font-bold ${label === "Remaining Budget" && value < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatUSD(value)}</p>
        </div>
    );
}
