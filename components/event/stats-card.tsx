import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { formatUSD } from "@/helper/helper-functions";
import GlowCard from "../others/glow-card";

interface CardProp {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    label: string;
    value: string | number;
    subValue?: string | number;
    color: "blue" | "orange" | "emerald" | "red" | "indigo" | "rose"; // Extended types
    isCurrency?: boolean;
}

export default function StatCard({ icon: Icon, label, value, subValue, color = "blue", isCurrency }: CardProp) {
    const displayValue = isCurrency ? formatUSD(Number(value)) : value;

    const colorMap = {
        blue: "text-blue-500 border-blue-500/20 bg-blue-500",
        orange: "text-orange-500 border-orange-500/20 bg-orange-500",
        emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500",
        red: "text-red-500 border-red-500/20 bg-red-500",
        indigo: "text-indigo-500 border-indigo-500/20 bg-indigo-500",
        rose: "text-rose-500 border-rose-500/20 bg-rose-500",
    };

    const currentStyles = colorMap[color as keyof typeof colorMap] || colorMap.blue;
    const styleParts = currentStyles.split(" ");

    return (
        <GlowCard color={styleParts[2]}>
            <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className={`grid size-11 place-items-center rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${styleParts[0]} ${styleParts[1]} bg-white dark:bg-zinc-950`}>
                        <Icon className="size-5" />
                    </div>
                    <span className="font-poppins text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">{label}</span>
                </div>

                <div className="space-y-1.5">
                    <h3 className="font-poppins text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{displayValue}</h3>
                    {subValue && <p className="text-sm leading-relaxed font-semibold text-zinc-500 dark:text-zinc-400">{subValue}</p>}
                </div>
            </div>
        </GlowCard>
    );
}
