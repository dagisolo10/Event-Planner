import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Card, CardHeader, CardContent } from "../ui/card";

interface CardProp {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    label: string;
    value: string;
    subValue?: string | number;
    color: string;
}

export default function StatCard({ icon: Icon, label, value, subValue, color }: CardProp) {
    return (
        <Card className="gap-4">
            <CardHeader className="flex items-center gap-2">
                <Icon className={color} />
                <span className="text-xs font-bold tracking-widest uppercase">{label}</span>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-lg font-bold">{value}</p>
                {subValue && <p className="text-sm font-semibold text-zinc-500">{subValue}</p>}
            </CardContent>
        </Card>
    );
}
