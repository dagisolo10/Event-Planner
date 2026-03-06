import { ReactNode } from "react";
import { Card } from "../ui/card";

export default function GlowCard({ children, color }: { children: ReactNode; color: string }) {
    return (
        <Card className="group relative overflow-hidden border-zinc-200/50 bg-white/50 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 dark:border-white/5 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/40">
            <div className={`absolute -top-4 -right-4 size-24 opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25 ${color}`} />

            {children}

            <div className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${color}`} />
        </Card>
    );
}
