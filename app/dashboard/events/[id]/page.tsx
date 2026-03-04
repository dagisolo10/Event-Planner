import Link from "next/link";
import { TaskStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import getEvent from "@/server/events/get-event";
import getEvents from "@/server/events/get-events";
import { getEventStatus } from "@/helper/get-status";
import { notFound, redirect } from "next/navigation";
import { statusColors } from "@/mocks/status-colors";
import StatCard from "@/components/event/stats-card";
import { formatDate } from "@/helper/helper-functions";
import EventPulse from "@/components/event/event-pulse";
import { Params } from "next/dist/server/request/params";
import { TaskSheet } from "@/components/tasks/task-sheet";
import SummaryCard from "@/components/event/summary-card";
import ActivityCard from "@/components/event/activity-card";
import DirectAccess from "@/components/event/direct-access";
import TimelineItem from "@/components/event/timeline-item";
import getActiveTasks from "@/server/tasks/get-active-tasks";
import OverviewCard from "@/components/event/overview-cards";
import BudgetTracker from "@/components/event/budget-tracker";
import { getEventStats } from "@/server/stats/get-event-stats";
import { IconCash, IconCurrencyDollar } from "@tabler/icons-react";
import getEventActivities from "@/server/events/get-event-activity";
import getEventVendors from "@/server/vendors/event/get-event-vendors";
import UniversalDeleteDialog from "@/components/common/universal-alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Calendar, MapPin, MoreHorizontal, CheckCircle2, Briefcase, ArrowUpRight, Truck, DollarSign, ReceiptText, Landmark, Clock, CheckCircle, PlusCircle } from "lucide-react";
import ExportButton from "@/components/payment/export-button";

export default async function EventDetailsPage({ params }: { params: Promise<Params> }) {
    const { id: eventId } = await params;
    const id = String(eventId);

    const [eventRes, eventsRes, vendorRes, taskRes, activityRes, statsRes] = await Promise.all([getEvent(id), getEvents(), getEventVendors(id), getActiveTasks(id), getEventActivities(id), getEventStats(id)]);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();
    if ("error" in statsRes) return notFound();

    const event = eventRes.event;
    const events = "error" in eventsRes ? [] : eventsRes.events;
    const eventVendors = "error" in vendorRes ? [] : vendorRes.eventVendors;
    const activeTasks = "error" in taskRes ? [] : taskRes.tasks;
    const activity = "error" in activityRes ? [] : activityRes.activity;

    const eventStatus = getEventStatus(event.startDate, event.endDate);

    const {
        budget,
        totalContracted,
        totalPaidToVendor,
        remainingBudget,
        remainingBalance,
        pendingBalance,
        utilizationPercentage,
        isOverBudget,
        paidVendorsCount,
        totalTasksCount,
        completedTasksCount,
        pendingTasksCount,
        overdueVendorsCount,
        paymentCompletion,
        taskCompletion,
    } = statsRes;

    return (
        <main className="space-y-8 pb-8">
            <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-ss rounded-full font-bold tracking-wider uppercase">
                            Event ID: {id}
                        </Badge>

                        <span>/</span>

                        <span className="text-sm font-semibold">{event.clientName}</span>
                    </div>

                    <h1 className="text-5xl font-black tracking-tight">{event.title}</h1>

                    <div className="flex flex-wrap gap-2">
                        <Badge className={`animate-pulse ${statusColors.event[eventStatus]}`}>{eventStatus}</Badge>

                        <Badge variant="outline" className="relative flex items-center gap-1.5">
                            <span className="relative flex size-1.5">
                                <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${statusColors.eventDot[eventStatus]}`} />
                                <span className={`relative inline-flex size-1.5 rounded-full ${statusColors.eventDot[eventStatus]}`} />
                            </span>
                            Active Planning
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/events/${event.id}/vendors`}>
                        <Button variant="outline" className="shadow-sm">
                            Vendor Directory <ArrowUpRight className="size-4" />
                        </Button>
                    </Link>

                    <Link href={`/dashboard/events/${event.id}/payments`}>
                        <Button className="shadow-sm">
                            View Transactions <ArrowUpRight className="size-4" />
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <ExportButton eventId={id} />

                            <DropdownMenuSeparator />

                            <Link href={`/dashboard/events/${event.id}/edit`}>
                                <DropdownMenuItem>Edit Event Details</DropdownMenuItem>
                            </Link>

                            <UniversalDeleteDialog type="event" id={event.id} name={event.title} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Calendar} color="text-indigo-500" label="Timeline" value={formatDate(event.startDate)} subValue={`Ends ${formatDate(event.endDate)}`} />
                <StatCard icon={MapPin} color="text-rose-500" label="Location" value={event.location} subValue="On-site Venue" />
                <StatCard icon={CheckCircle2} color="text-emerald-500" label="Milestones" value={`${taskCompletion.toFixed(0)}%`} subValue={`${completedTasksCount} / ${totalTasksCount} tasks done`} />
                <StatCard icon={Truck} color="text-blue-500" label="Vendors" value={`${eventVendors.length} Total`} subValue={`${paidVendorsCount} fully paid`} />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-7">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="size-5" />
                            <h3 className="text-xl font-bold">The Brief</h3>
                        </div>

                        <div className="rounded-2xl border p-8 shadow">
                            <p className="font-medium text-zinc-500">{event.description || "Establish a strategic vision for this event to guide vendor selection and guest experience."}</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Active Tasks</h3>
                            <Button variant="ghost">
                                <Link href={`/dashboard/events/${event.id}/tasks`}>View all tasks</Link>
                            </Button>
                        </div>

                        <div className="grid gap-3">
                            {totalTasksCount === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <div className="bg-accent mb-3 rounded-full p-3">
                                        <PlusCircle className="text-accent-foreground size-6" />
                                    </div>
                                    <p className="font-medium">No tasks created</p>
                                    <p className="mt-1 mb-4 text-sm text-zinc-500">Your timeline is empty. Start planning by adding your first milestone.</p>
                                    <TaskSheet eventId={id} />
                                </div>
                            ) : activeTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <div className="mb-3 rounded-full bg-emerald-500/20 p-3">
                                        <CheckCircle className="size-6 text-emerald-600" />
                                    </div>
                                    <p className="font-medium">All caught up!</p>
                                    <p className="mt-1 mb-2 text-sm text-zinc-500">You&apos;ve completed all active milestones for this event. Nice work!</p>
                                </div>
                            ) : (
                                activeTasks.slice(0, 5).map((task) => <TimelineItem key={task.id} time={formatDate(task.dueDate)} title={task.title} status={task.status as TaskStatus} />)
                            )}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Clock className="size-5" />
                            <h3 className="text-xl font-bold">Activity</h3>
                        </div>

                        {activity.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-500">No activity yet. Actions taken in this event will appear here.</div>
                        ) : (
                            <div className="scrollbar-thin max-h-120 space-y-4 overflow-y-auto pr-2">
                                {activity.map((item) => (
                                    <ActivityCard item={item} key={item.id} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="space-y-6 lg:col-span-5">
                    <EventPulse taskPercentage={taskCompletion} clientName={event.clientName} location={event.location} startDate={event.startDate} endDate={event.endDate} />

                    <h3 className="mt-8 text-sm font-black tracking-widest uppercase">Financial Performance</h3>

                    <BudgetTracker utilizationPercentage={utilizationPercentage} remainingBudget={remainingBudget} isOverBudget={isOverBudget} />

                    <div className="grid grid-cols-2 gap-4">
                        <OverviewCard icon={IconCurrencyDollar} label="Total Budget" value={budget} color="text-emerald-500" />
                        <OverviewCard icon={ReceiptText} label="Vendor Total" value={totalContracted} color="text-blue-500" />
                        <OverviewCard icon={IconCash} label="Amount Paid" value={totalPaidToVendor} color="text-foreground" />
                        <OverviewCard icon={Landmark} label="Remaining Budget" value={remainingBalance} color="text-emerald-500" />
                        <OverviewCard dark darkLabel={pendingBalance < 0 ? "Overpaid Amount" : "Pending Payment"} icon={DollarSign} value={pendingBalance} paymentCompletion={paymentCompletion} color="text-emerald-500" />
                    </div>

                    <DirectAccess email={event.clientEmail || null} clientName={event.clientName} event={event} eventVendors={eventVendors} events={events} />

                    <SummaryCard overdueVendors={overdueVendorsCount} pendingTasks={pendingTasksCount} />
                </div>
            </div>
        </main>
    );
}
