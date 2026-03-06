import { ReactNode } from "react";

export default function TableWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="bg-background/50 relative overflow-hidden rounded-3xl border p-2 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/20">
            <div className="bg-primary/5 absolute -top-24 -left-24 size-64 blur-3xl" />
            <div className="rounded-xl dark:border">{children}</div>
        </div>
    );
}
