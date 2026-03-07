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
import { Calendar, MapPin, MoreHorizontal, CheckCircle2, Briefcase, ArrowUpRight, Truck, DollarSign, ReceiptText, Landmark, Clock, CheckCircle, PlusCircle, Sparkles } from "lucide-react";
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
    const { budget, totalContracted, totalPaidToVendor, remainingBudget, remainingBalance, pendingBalance, utilizationPercentage, isOverBudget, paidVendorsCount, totalTasksCount, completedTasksCount, pendingTasksCount, overdueVendorsCount, paymentCompletion, taskCompletion } = statsRes;

    return (
        <main className="space-y-10 pb-16">
            <header className="relative flex flex-col justify-between gap-8 border-b border-zinc-200/60 pb-10 md:flex-row md:items-end dark:border-zinc-800/60">
                <div className="bg-primary/5 pointer-events-none absolute -top-24 -left-24 hidden size-96 blur-[120px] dark:block" />

                <div className="space-y-6">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                            <Sparkles className="size-3" />
                            Prestige Event
                        </div>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span className="text-muted-foreground text-sm font-bold tracking-tight">{event.clientName}</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-poppins text-4xl tracking-tight md:text-6xl lg:text-7xl">{event.title}</h1>

                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className={`animate-pulse shadow-lg md:text-xs ${statusColors.event[eventStatus]}`}>
                                {eventStatus}
                            </Badge>

                            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                                <span className="relative flex size-1.5">
                                    <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${statusColors.eventDot[eventStatus]}`} />
                                    <span className={`relative inline-flex size-1.5 rounded-full ${statusColors.eventDot[eventStatus]}`} />
                                </span>

                                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Live Intelligence</span>
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/events/${event.id}/vendors`}>
                        <Button variant="outline" className="h-8 rounded-xl px-6 text-xs font-bold tracking-tight hover:bg-zinc-50 md:h-10 md:text-sm dark:hover:bg-zinc-900">
                            Vendors <ArrowUpRight className="size-4 opacity-50" />
                        </Button>
                    </Link>

                    <Link href={`/dashboard/events/${event.id}/payments`}>
                        <Button className="h-8 rounded-xl bg-zinc-900 px-6 text-xs font-bold tracking-tight text-white hover:bg-zinc-800 md:h-10 md:text-sm dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
                            Financial <ReceiptText className="size-4" />
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 rounded-xl text-xs md:h-10 md:text-sm">
                                <MoreHorizontal className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl">
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Calendar} color="indigo" label="Timeline" value={formatDate(event.startDate)} subValue={`Ends ${formatDate(event.endDate)}`} />
                <StatCard icon={MapPin} color="rose" label="Location" value={event.location} subValue="On-site Venue" />
                <StatCard icon={CheckCircle2} color="emerald" label="Milestones" value={`${taskCompletion.toFixed(0)}%`} subValue={`${completedTasksCount} / ${totalTasksCount} tasks done`} />
                <StatCard icon={Truck} color="orange" label="Supply Chain" value={`${eventVendors.length} Vendors`} subValue={`${paidVendorsCount} Settlements`} />
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                <div className="order-2 space-y-12 md:order-1 lg:col-span-7">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                                <Briefcase className="size-5" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">The Vision</h3>
                        </div>

                        <div className="relative overflow-hidden rounded-4xl border bg-linear-to-br from-white to-zinc-50/50 p-8 shadow-sm dark:from-zinc-950 dark:to-zinc-900/50">
                            <p className="text-muted-foreground text-lg leading-relaxed font-medium dark:text-zinc-400">{event.description || "Establish a strategic vision for this event to guide vendor selection and guest experience."}</p>
                            <div className="absolute -right-4 -bottom-8 opacity-5">
                                <Briefcase className="size-32" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
                            <h3 className="text-2xl font-bold tracking-tight">Active Milestones</h3>

                            <Link href={`/dashboard/events/${event.id}/tasks`} className="hover:text-primary text-muted-foreground text-xs font-bold tracking-widest uppercase transition-colors duration-300">
                                Expand Timeline →
                            </Link>
                        </div>

                        <div className="">
                            {totalTasksCount === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed py-16 text-center">
                                    <PlusCircle className="mb-4 size-10 text-zinc-300" />
                                    <p className="text-lg font-bold">No Milestones Defined</p>
                                    <p className="text-muted-foreground mt-1 mb-6 max-w-xs text-sm">Initialize your planning sequence by adding your first task.</p>
                                    <TaskSheet eventId={id} />
                                </div>
                            ) : activeTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-[2rem] border bg-emerald-500/5 py-16 text-center dark:bg-emerald-500/10">
                                    <CheckCircle className="mb-4 size-10 text-emerald-500" />
                                    <p className="text-lg font-bold">Operational Excellence</p>
                                    <p className="text-muted-foreground text-sm">All current milestones have been successfully cleared.</p>
                                </div>
                            ) : (
                                activeTasks.slice(0, 5).map((task, idx) => <TimelineItem isFirst={idx === 0} isLast={idx === 4 || idx === activeTasks.length - 1} key={task.id} time={formatDate(task.dueDate)} title={task.title} status={task.status as TaskStatus} />)
                            )}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                                <Clock className="size-5" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">Audit Trail</h3>
                        </div>

                        {activity.length === 0 ? (
                            <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm font-medium">Synchronizing activity logs...</div>
                        ) : (
                            <div className="scrollbar-thin dark:scrollbar-thumb-muted dark:scrollbar-track-accent max-h-136 overflow-y-auto pr-2">
                                {activity.map((item, idx) => (
                                    <ActivityCard isFirst={idx === 0} isLast={idx === activity.length - 1} item={item} key={item.id} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="order-1 space-y-8 md:order-2 lg:col-span-5">
                    <EventPulse taskPercentage={taskCompletion} clientName={event.clientName} location={event.location} startDate={event.startDate} endDate={event.endDate} />

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Capital Management</h3>
                        <BudgetTracker utilizationPercentage={utilizationPercentage} remainingBudget={remainingBudget} isOverBudget={isOverBudget} startDate={event.startDate} endDate={event.endDate} />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <OverviewCard icon={<IconCurrencyDollar className="size-5 text-emerald-500" />} label="Total Budget" value={budget} color="text-emerald-500" />
                            <OverviewCard icon={<ReceiptText className="size-5 text-blue-500" />} label="Vendor Liability" value={totalContracted} color="text-blue-500" />
                            <OverviewCard icon={<IconCash className="text-muted-foreground size-5" />} label="Settled" value={totalPaidToVendor} color="text-muted-foreground" />
                            <OverviewCard icon={<Landmark className="size-5 text-emerald-500" />} label="Reserves" value={remainingBalance} color="text-emerald-500" />
                            <OverviewCard icon={<DollarSign className="size-5 text-emerald-500" />} dark darkLabel={pendingBalance < 0 ? "Credit Balance" : "Outstanding Account"} value={pendingBalance} paymentCompletion={paymentCompletion} color="text-emerald-500" />
                        </div>
                    </div>

                    <DirectAccess email={event.clientEmail || null} clientName={event.clientName} event={event} eventVendors={eventVendors} events={events} />

                    <SummaryCard overdueVendors={overdueVendorsCount} pendingTasks={pendingTasksCount} />
                </div>
            </div>
        </main>
    );
}
