import { Badge } from "../ui/badge";

import { TaskStatus } from "@prisma/client";
import { statusColors } from "@/mocks/status-colors";

interface TimelineProp {
    time: string;
    title: string;
    status: TaskStatus;
}

export default function TimelineItem({ time, title, status }: TimelineProp) {
    return (
        <div className="flex items-center justify-between rounded-xl border p-6 font-semibold">
            <div className="flex flex-col gap-1">
                <span className="text-xs tracking-wide text-zinc-500 uppercase">{time}</span>
                <span>{title}</span>
            </div>
            <Badge variant="outline" className={`${statusColors.task[status]} rounded-lg text-xs`}>
                {status === "InProgress" ? "In Progress" : status}
            </Badge>
        </div>
    );
}
