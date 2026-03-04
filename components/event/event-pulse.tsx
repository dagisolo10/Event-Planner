"use client";
import { getRemainingTime } from "@/helper/helper-functions";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { useEffect, useState } from "react";
import { getEventStatus } from "@/helper/get-status";

interface EventPulseProp {
    startDate: Date;
    endDate: Date;
    clientName: string;
    location: string;
    taskPercentage: number;
}

export default function EventPulse({ startDate, endDate, location, clientName, taskPercentage }: EventPulseProp) {
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const status = getEventStatus(startDate, endDate);

    const statusConfig = {
        Upcoming: {
            label: "Countdown to Launch",
            subtext: `Finalizing details for ${clientName}`,
            badge: "Upcoming",
            color: "text-indigo-400",
            pulse: "bg-indigo-400",
        },

        Ongoing: {
            label: "Event is Currently Live",
            subtext: "Real-time operations active",
            badge: "Live Now",
            color: "text-emerald-400",
            pulse: "bg-emerald-400",
        },

        Completed: {
            label: "Event Concluded",
            subtext: `Archive generated for ${clientName}`,
            badge: "Post-Event",
            color: "text-rose-500",
            pulse: "bg-rose-500",
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
        <Card className="overflow-hidden border-none bg-zinc-900 text-zinc-100 shadow-2xl">
            <CardContent className="p-0">
                <div className="flex items-center justify-between bg-zinc-800/50 px-6 py-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex size-2">
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${current.pulse}`} />
                            <span className={`relative inline-flex size-2 rounded-full ${current.pulse}`} />
                        </span>
                        <span className={`text-ss font-bold tracking-[0.2em] uppercase ${current.color}`}>{current.badge}</span>
                    </div>
                    <span className="text-ss font-medium tracking-wider text-zinc-300 uppercase">{location}</span>
                </div>

                <div className="p-6">
                    <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">{current.label}</p>

                    {status == "Upcoming" ? (
                        <Countdown timeRemaining={timeRemaining} />
                    ) : (
                        <div className="my-2">
                            <h4 className={`text-3xl font-black tracking-tight ${status === "Ongoing" ? "animate-pulse text-white" : "text-zinc-400"}`}>{status === "Ongoing" ? "Event is Live!" : "Event Successfully Closed"}</h4>
                        </div>
                    )}

                    <p className="text-sm font-medium text-zinc-400">{current.subtext}</p>

                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-500">{status === "Completed" ? "Total Task Completion" : "Planning Progress"}</span>
                            <span className={status === "Completed" ? "text-zinc-400" : "text-emerald-400"}>{taskPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress className={`bg-zinc-800 ${status === "Completed" ? "[&>div]:bg-zinc-600" : "[&>div]:bg-emerald-500"}`} value={taskPercentage} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Countdown({ timeRemaining }: { timeRemaining: { days: number; hours: number; minutes: number; seconds: number } }) {
    return (
        <div className="my-2 flex items-baseline gap-2">
            <h4 className="text-4xl font-black tracking-tighter">{timeRemaining.days}</h4>
            <span className="text-sm font-bold text-zinc-500">Days</span>

            <h4 className="ml-2 text-4xl font-black tracking-tighter">{timeRemaining.hours}</h4>
            <span className="text-sm font-bold text-zinc-500">{timeRemaining.hours > 1 ? "Hrs" : "Hr"}</span>

            <h4 className="text-4xl font-black tracking-tighter">{timeRemaining.minutes}</h4>
            <span className="text-sm font-bold text-zinc-500">Min</span>

            <h4 className="ml-1 text-4xl font-black tracking-tighter text-emerald-500">{timeRemaining.seconds}</h4>
            <span className="text-sm font-bold text-zinc-500">Sec</span>
        </div>
    );
}
