import { formatUSD } from "@/helper/helper-functions";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Card, CardContent } from "../ui/card";

interface FinanceStatCardProp {
    title: string;
    value: number;
    subValue: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    color: string;
}

export default function FinanceStatCard({ title, value, subValue, icon: Icon, color }: FinanceStatCardProp) {
    const colorStyles: Record<string, { bg: string; text: string }> = {
        emerald: { bg: "bg-emerald-500/20 text-emerald-500", text: "text-emerald-500" },
        rose: { bg: "bg-rose-500/20 text-rose-500", text: "text-rose-500" },
        zinc: { bg: "bg-zinc-500/20 text-zinc-500", text: "text-zinc-500" },
        blue: { bg: "bg-blue-500/20 text-blue-500", text: "text-blue-500" },
    };

    const style = colorStyles[color];

    return (
        <Card className="group relative">
            <CardContent className="p-6">
                <div className={cn("absolute top-4 right-4 rounded-lg p-2 transition-transform group-hover:scale-110", style.bg, style.text)}>
                    <Icon className="size-5" />
                </div>

                <div>
                    <p className="text-ss font-black tracking-widest text-zinc-500 uppercase">{title}</p>
                    <h3 className={cn("mt-1 text-3xl font-black tracking-tight", style.text)}>{formatUSD(value)}</h3>
                    <p className="mt-2 text-xs font-medium text-zinc-400">{subValue}</p>
                </div>
            </CardContent>
        </Card>
    );
}
