import { Card } from "@/components/ui/card";
import getTasks from "@/server/tasks/get-tasks";
import { redirect, notFound } from "next/navigation";
import TaskTable from "@/components/tasks/task-table";
import { Params } from "next/dist/server/request/params";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { CheckCircle2, Clock, AlertCircle, LucideProps } from "lucide-react";

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
            <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Task Pipeline</h1>
                    <p className="text-sm font-medium text-zinc-500">Managing {tasks.length} active milestones for this event.</p>
                </div>

                <TaskSheet eventId={id} />
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <StatWidget label="Done" value={doneTasks} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/20" />
                <StatWidget label="In Progress" value={inProgressTasks} icon={Clock} color="text-blue-500" bg="bg-blue-500/20" />
                <StatWidget label="Pending" value={pendingTasks} icon={AlertCircle} color="text-amber-500" bg="bg-amber-500/20" />
                <StatWidget label="Overdue" value={overdueTasks} icon={AlertCircle} color="text-red-500" bg="bg-red-500/20" />
                <StatWidget label="Urgent Tasks" value={urgentTasks} icon={AlertCircle} color="text-red-500" bg="bg-red-500/20" />
            </div>

            <TaskTable tasks={tasks} eventId={id} />
        </main>
    );
}

interface WidgetProp {
    label: string;
    value: number;
    color: string;
    bg: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

function StatWidget({ label, value, icon: Icon, color, bg }: WidgetProp) {
    return (
        <Card className="flex-row items-center gap-4 p-6">
            <div className={`rounded-full ${bg} p-3 ${color}`}>
                <Icon className="size-6" />
            </div>
            <div>
                <p className="text-ss font-black tracking-wider text-zinc-500 uppercase">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </Card>
    );
}
