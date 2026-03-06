import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface Wrapper {
    id: string;
    invalid: boolean;
    message: string;
    children: ReactNode;
    className?: string;
}

export default function WarningWrapper({ invalid, children, message, id, className }: Wrapper) {
    return (
        <div id={id} className={`rounded-2xl transition-all duration-500 ${invalid ? "bg-destructive/5 ring-destructive/20 p-6 ring-1" : ""} ${className}`}>
            {children}
            {invalid && (
                <div className="text-destructive animate-in fade-in slide-in-from-top-1 mt-4 flex items-center gap-2 text-xs font-bold">
                    <AlertCircle className="size-4" /> {message}
                </div>
            )}
        </div>
    );
}
