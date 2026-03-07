import getTasks from "@/server/tasks/get-tasks";
import { redirect, notFound } from "next/navigation";
import TaskTable from "@/components/tasks/task-table";
import { Params } from "next/dist/server/request/params";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { CheckCircle2, Clock, AlertCircle, LucideProps } from "lucide-react";
import GlowCard from "@/components/others/glow-card";

export default async function EventTasksPage({ params }: { params: Promise<Params> }) {
    const { id: eventId } = await params;
    const id = String(eventId);

    const tasksRes = await getTasks(id);

    if ("error" in tasksRes) return tasksRes.error === "Unauthorized" ? redirect("/") : notFound();

    const tasks = tasksRes.tasks;

    const doneTasks = tasks.filter((t) => t.status === "Done").length;
    const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
    const inProgressTasks = tasks.filter((t) => t.status === "InProgress").length;
    const urgentTasks = tasks.filter((t) => t.priority === "Urgent").length;
    const overdueTasks = tasks.filter((t) => t.status !== "Done" && new Date(t.dueDate) < new Date()).length;

    return (
        <main className="space-y-8 pb-10">
            <header className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary h-5 w-1" />
                        <span className="text-muted-foreground text-[10px] font-black tracking-[0.4em] uppercase">Operations / Task Pipeline</span>
                    </div>

                    <h1 className="font-poppins text-4xl tracking-tight lg:text-5xl">
                        Event <span className="text-gradient">Milestones</span>
                    </h1>

                    <p className="max-w-md text-xs font-bold tracking-wider text-zinc-500/80 uppercase">
                        Synthesizing <span className="text-zinc-900 dark:text-zinc-100">{tasks.length} active records</span> for this deployment.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden flex-col items-end border-r border-zinc-200 pr-4 text-right lg:flex dark:border-zinc-800">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Completion rate</span>
                        <span className="font-poppins text-xl font-black text-emerald-500">{tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0}%</span>
                    </div>

                    <TaskSheet eventId={id} />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <TaskCards title="Done" value={doneTasks} icon={CheckCircle2} color="emerald" />
                <TaskCards title="In Progress" value={inProgressTasks} icon={Clock} color="blue" />
                <TaskCards title="Pending" value={pendingTasks} icon={AlertCircle} color="amber" />
                <TaskCards title="Overdue" value={overdueTasks} icon={AlertCircle} color="red" />
                <TaskCards title="Urgent Tasks" value={urgentTasks} icon={AlertCircle} color="red" />
            </div>

            <TaskTable tasks={tasks} eventId={id} />
        </main>
    );
}

interface TaskCardsProp {
    title: string;
    value: number;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    color: "blue" | "orange" | "emerald" | "red" | "amber";
}

function TaskCards({ title, value, icon: Icon, color }: TaskCardsProp) {
    const colorMap = {
        blue: "text-blue-500 border-blue-500/20 bg-blue-500",
        orange: "text-orange-500 border-orange-500/20 bg-orange-500",
        emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500",
        amber: "text-amber-500 border-amber-500/20 bg-amber-500",
        red: "text-red-500 border-red-500/20 bg-red-500",
    };

    const currentStyles = colorMap[color];

    return (
        <GlowCard color={currentStyles.split(" ")[2]}>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl border transition-transform duration-500 group-hover:scale-110 ${currentStyles.split(" ").slice(0, 2).join(" ")}`}>
                        <Icon className="size-5" />
                    </div>
                    <span className="font-poppins text-muted-foreground text-xs font-bold tracking-widest uppercase">{title}</span>
                </div>

                <div className="space-y-1">
                    <h3 className="font-poppins text-3xl font-extrabold">{value}</h3>
                </div>
            </div>
        </GlowCard>
    );
}
