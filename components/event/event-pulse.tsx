"use client";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Zap, MapPin, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getRemainingTime } from "@/helper/helper-functions";
import { getEventStatus } from "@/helper/get-status";
import { cn } from "@/lib/utils";

interface PulseProps {
    taskPercentage: number;
    clientName: string;
    location: string;
    startDate: Date;
    endDate: Date;
}

export default function EventPulse({ taskPercentage, clientName, location, startDate, endDate }: PulseProps) {
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const status = getEventStatus(startDate, endDate);

    const statusConfig = {
        Upcoming: {
            badge: "Operation: Countdown",
            text: "text-emerald-400",
            pulse: "bg-emerald-400",
            glow: "shadow-emerald-500/20",
            scan: "via-emerald-500",
        },
        Ongoing: {
            badge: "Operation: Live Now",
            text: "text-blue-400",
            pulse: "bg-blue-400",
            glow: "shadow-blue-500/20",
            scan: "via-blue-500",
        },
        Completed: {
            badge: "Operation: Archived",
            text: "text-muted-foreground",
            pulse: "bg-zinc-600",
            glow: "shadow-transparent",
            scan: "via-zinc-500",
        },
    };

    const current = statusConfig[status];

    useEffect(() => {
        if (status !== "Upcoming") return;
        const updateTime = () => setTimeRemaining(getRemainingTime(startDate));
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [startDate, status]);

    return (
        <Card className={cn("relative overflow-hidden border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl transition-all duration-700", current.glow)}>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
                <div className={cn(current.scan, "animate-scan absolute h-0.5 w-full bg-linear-to-r from-transparent to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]")} />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-2.5">
                            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", current.pulse)}></span>
                            <span className={cn("relative inline-flex size-2.5 rounded-full", current.pulse)}></span>
                        </div>

                        <h2 className={cn("font-poppins text-xs font-black tracking-[0.3em] uppercase md:text-base", current.text)}>{current.badge}</h2>
                    </div>

                    <Zap className={cn("size-4 animate-pulse", current.text)} />
                </div>

                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div className="relative flex shrink-0 items-center justify-center">
                        <svg className="size-28 -rotate-90">
                            <circle cx="56" cy="56" r="52" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-zinc-800" />
                            <circle cx="56" cy="56" r="52" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={327} strokeDashoffset={327 - (327 * taskPercentage) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                        </svg>

                        <div className="absolute flex flex-col items-center">
                            <span className="font-poppins text-2xl font-black">{Math.round(taskPercentage)}%</span>
                            <span className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase">Progress</span>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center md:items-start">
                        {status === "Upcoming" ? (
                            <div className="flex items-baseline gap-3">
                                <TimeUnit value={timeRemaining.days} label="Days" />
                                <span className="self-center text-xl font-light text-zinc-600">:</span>
                                <TimeUnit value={timeRemaining.hours} label="Hrs" />
                                <span className="self-center text-xl font-light text-zinc-600">:</span>
                                <TimeUnit value={timeRemaining.minutes} label="Mins" />
                                <span className="self-center text-xl font-light text-zinc-600">:</span>
                                <TimeUnit value={timeRemaining.seconds} label="Secs" color="text-emerald-400" />
                            </div>
                        ) : (
                            <div className="space-y-1 text-center md:text-left">
                                <h4 className={cn("font-poppins text-2xl font-black tracking-tight", status === "Ongoing" ? "animate-pulse text-white" : "text-muted-foreground")}>{status === "Ongoing" ? "LIVE OPERATIONS" : "EVENT ARCHIVED"}</h4>
                                <p className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">Status: Nominal</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <InfoSlab icon={<User className="size-3" />} label="Principal" value={clientName} />
                    <InfoSlab icon={<MapPin className="size-3" />} label="Location" value={location} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                        <Calendar className={cn("size-4", current.text)} />
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-[8px] font-black tracking-widest uppercase">Timeline Window</span>
                            <span className="text-xs font-bold text-zinc-300">
                                {format(startDate, "MMM dd")} — {format(endDate, "MMM dd, yyyy")}
                            </span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-zinc-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-[8px] font-black tracking-widest uppercase">Confirmation</span>
                        <span className={cn("text-[11px] font-bold", current.text)}>Verified</span>
                    </div>
                </div>
            </div>

            <div className={cn("pointer-events-none absolute -bottom-10 -left-10 size-32 blur-[80px] transition-colors duration-1000", status === "Ongoing" ? "bg-blue-500/10" : "bg-emerald-500/10")} />
        </Card>
    );
}

function TimeUnit({ value, label, color = "text-white" }: { value: number; label: string; color?: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className={cn("font-poppins text-3xl font-black tracking-tighter", color)}>{String(value).padStart(2, "0")}</span>
            <span className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase">{label}</span>
        </div>
    );
}

function InfoSlab({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-1.5">
                {icon}
                <span className="text-[9px] font-black uppercase">{label}</span>
            </div>
            <p className="font-poppins truncate text-sm font-bold text-zinc-200">{value}</p>
        </div>
    );
}
