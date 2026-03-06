import { formatUSD } from "@/helper/helper-functions";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import GlowCard from "../others/glow-card";

interface FinanceStatCardProp {
    title: string;
    value: number;
    subValue: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    color: string;
}

export default function FinanceStatCard({ title, value, subValue, icon: Icon, color }: FinanceStatCardProp) {
    const colorStyles: Record<string, string> = {
        emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/20",
        rose: "text-rose-500 border-rose-500/20 bg-rose-500/20",
        zinc: "text-zinc-500 border-zinc-500/20 bg-zinc-500/20",
        blue: "text-blue-500 border-blue-500/20 bg-blue-500/20",
    };

    const style = colorStyles[color];

    return (
        <GlowCard color={style.split(" ")[0].replace("text", "bg")}>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("grid size-10 place-items-center rounded-xl border transition-transform duration-500 group-hover:scale-110", style.split(" ").slice(0, 2).join(" "))}>
                        <Icon className="size-5" />
                    </div>
                    <span className="font-poppins text-muted-foreground text-xs font-bold tracking-widest uppercase">{title}</span>
                </div>

                <div className="space-y-1">
                    <h3 className={cn("font-poppins text-3xl font-extrabold", style.split(" ")[0])}>{formatUSD(value)}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">{subValue}</p>
                </div>
            </div>
        </GlowCard>
    );
}
