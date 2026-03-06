"use client";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideProps } from "lucide-react";

interface CalendarProp {
    label: string;
    name: string;
    value?: string;
    timeValue?: string;
    onUpdate: (date: string, time: string) => void;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export default function CalendarPopup({ label, value, timeValue, onUpdate, icon: Icon }: CalendarProp) {
    const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
    const [time, setTime] = useState<string>(timeValue || "");

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        setDate(selectedDate);

        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        const dateString = `${y}-${m}-${d}`;

        onUpdate(dateString, time);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;

        setTime(newTime);

        if (date) {
            const dateString = date.toISOString().split("T")[0];
            onUpdate(dateString, newTime);
        }
    };

    const formatTime12h = (timeStr: string) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        let h = parseInt(hours);
        const amPM = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${minutes} ${amPM}`;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group flex cursor-pointer flex-col gap-2">
                    <Label className="text-muted-foreground mb-1 text-base font-semibold">{label}</Label>

                    <div className="border-input/80 bg-background/50 hover:bg-background group-hover:border-primary flex h-10 items-center gap-3 rounded-full border px-4 transition-all">
                        <Icon className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />

                        <span className="text-sm font-medium">
                            {date ? date.toLocaleDateString("en-US", { day: "numeric", month: "numeric", year: "numeric" }) : "Select Date"}
                            {time && ` at ${formatTime12h(time)}`}
                        </span>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="bg-background/95 overflow-hidden border-none p-0 shadow-2xl backdrop-blur-xl sm:max-w-87.5">
                <DialogHeader className="bg-muted/20 border-b p-4">
                    <DialogTitle className="font-poppins text-center">Schedule {label}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="time" className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                            Set Time
                        </Label>
                        <Input className="border-muted-foreground/20 rounded-xl" id="time" onChange={handleTimeChange} type="time" value={time} />
                    </div>

                    <div className="bg-card rounded-xl border p-1">
                        <Calendar mode="single" onSelect={handleSelect} selected={date} className="rounded-md" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
