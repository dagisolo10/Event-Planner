"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { PartyPopper, ArrowLeft, Sparkles, Calendar, Edit3 } from "lucide-react";
import Link from "next/link";
import { Event } from "@prisma/client";

export default function LeftSide({ event }: { event?: Event }) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const isUpdate = !!event;

    if (!isCollapsed) return null;

    return (
        <section className="dark:bg-background relative hidden flex-col justify-between bg-zinc-950 p-12 text-zinc-100 lg:flex lg:w-2/5 dark:static">
            <div className="z-10">
                <Link href={isUpdate ? `/dashboard/events/${event.id}` : "/dashboard/events"} className="group mb-8 flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-100">
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-medium tracking-wide uppercase">{isUpdate ? "Back to Event" : "Back to Events"}</span>
                </Link>

                <div className="space-y-6">
                    <div className="bg-accent text-accent-foreground w-fit rounded-2xl p-4">{isUpdate ? <Edit3 className="size-8" /> : <PartyPopper className="size-8" />}</div>

                    {/* <h1 className="text-6xl leading-[1.1] font-black tracking-tight italic"> */}
                    <h1 className="text-6xl leading-[1.1] font-black tracking-tight italic">
                        {isUpdate ? (
                            <>
                                Refine <br /> Your <br /> <span className="text-zinc-500">Vision.</span>
                            </>
                        ) : (
                            <>
                                Create <br /> Something <br /> <span className="text-zinc-500">Iconic.</span>
                            </>
                        )}
                    </h1>

                    <p className="max-w-md text-lg text-zinc-400">
                        {isUpdate
                            ? `Adjusting the details for "${event.title}". Keep the momentum going and ensure every detail is polished.`
                            : "From intimate gatherings to massive galas. Set the stage, invite the guests, and manage the magic."}
                    </p>
                </div>
            </div>

            <div className="z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <Sparkles className="size-5 text-yellow-400" />
                    </div>

                    <div>
                        <p className="text-sm font-medium">{isUpdate ? "Live Sync" : "Premium Experience"}</p>
                        <p className="text-xs tracking-widest text-zinc-500 uppercase">{isUpdate ? "Updates reflect instantly" : "Built-in RSVP & Guest lists"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <Calendar className="size-5 text-blue-400" />
                    </div>

                    <div>
                        <p className="text-sm font-medium">Smart Timelines</p>
                        <p className="text-xs tracking-widest text-zinc-500 uppercase">Auto-schedule notifications</p>
                    </div>
                </div>
            </div>

            {/* Decorative Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent dark:hidden" />
            <div className="absolute right-0 bottom-0 h-1/2 w-full bg-linear-to-t from-zinc-900 to-transparent dark:hidden" />
        </section>
    );
}
