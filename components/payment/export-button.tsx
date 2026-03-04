"use client";
import { Download } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function ExportButton({ eventId }: { eventId: string }) {
    const handleExport = () => {
        window.location.href = `/api/export/${eventId}`;
    };
    return (
        <DropdownMenuItem className="justify-start px-px py-1" onClick={handleExport}>
            <div className="bg-accent flex size-8 items-center justify-center rounded-lg">
                <Download className="size-4" />
            </div>
            <div className="text-left">
                <p className="font-semibold">Export Report</p>
                <p className="text-ss text-zinc-400">Download Excel (.xlsx)</p>
            </div>
        </DropdownMenuItem>
    );
}
