"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { PaymentModal } from "../payment/payment-modal";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Link from "next/link";
import { Mail, Zap, Terminal, CreditCard, ArrowRight } from "lucide-react";
import { Event } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import { cn } from "@/lib/utils";

interface DirectAccessProp {
    event: Event;
    events: Event[];
    eventVendors: PopulatedEventVendor[];
    clientName: string;
    email: string | null;
}

export default function DirectAccess({ clientName, event, events, eventVendors, email }: DirectAccessProp) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Card className="bg-background relative overflow-hidden dark:border-zinc-800 shadow-lg dark:shadow-2xl">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
                <div className="animate-scan absolute h-0.5 w-full bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
            </div>

            <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                    <Terminal className="size-5 text-emerald-500" />
                    <CardTitle className="font-poppins text-ss text-muted-foreground font-black tracking-[0.2em] uppercase">Direct Access Terminal</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 grid gap-3">
                <div className="group relative">
                    <div className="absolute -inset-0.5 rounded-xl bg-emerald-500/5 opacity-0 blur transition duration-500 group-hover:opacity-100" />

                    <Button onClick={() => setOpen(true)} variant="outline" className="group relative h-auto w-full justify-start overflow-hidden border-zinc-800 dark:bg-zinc-900/40 px-4 py-4 shadow-inner transition-all duration-300 hover:border-zinc-700 dark:hover:bg-zinc-900">
                        <div className="flex w-full items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border dark:border-white/10 dark:bg-zinc-950 transition-colors group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10">
                                <CreditCard className="size-4 text-emerald-500/70 transition-colors group-hover:text-emerald-400" />
                            </div>

                            <div className="text-left">
                                <p className="font-poppins text-sm font-bold tracking-tight uppercase">Process Payment</p>
                                <p className="text-ss leading-tight font-medium text-zinc-500">
                                    Initialize <span className="text-emerald-500/80">Financial Settlement</span>
                                </p>
                            </div>

                            <ArrowRight className="ml-auto size-4 -translate-x-2 text-emerald-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>

                        <div className="absolute top-0 right-0 p-1">
                            <div className="size-1 border-t border-r border-emerald-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 p-1">
                            <div className="size-1 border-b border-l border-emerald-500" />
                        </div>
                    </Button>
                </div>

                <AccessButton email={email || ""} clientName={clientName} />

                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-muted-foreground text-[8px] font-bold tracking-widest uppercase">Protocol: Encrypted</span>
                    <Zap className="size-3 animate-pulse text-emerald-500" />
                </div>
            </CardContent>

            <PaymentModal open={open} setOpen={setOpen} event={event} events={events} eventVendors={eventVendors} />
        </Card>
    );
}

function AccessButton({ clientName, email }: { clientName?: string; email?: string }) {
    const content = (
        <div className="flex relative w-full items-center gap-4">
            <div className="absolute -inset-0.5 rounded-xl bg-emerald-500/5 opacity-0 blur transition duration-500 group-hover:opacity-100" />

            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 dark:bg-zinc-950 transition-colors group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10">
                <Mail className="size-4 text-emerald-500/70 transition-colors group-hover:text-emerald-400" />
            </div>

            <div className="text-left">
                <p className="font-poppins text-sm font-bold tracking-tight uppercase">Contact Client</p>
                <p className="text-ss leading-tight font-medium text-zinc-500">
                    Dispatch report to <span className="text-emerald-500">{clientName || "Principal"}</span>
                </p>
            </div>

            <ArrowRight className="ml-auto size-4 -translate-x-2 text-emerald-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
    );

    const classes = cn("group relative h-auto w-full justify-start overflow-hidden border-zinc-800 dark:bg-zinc-900/40 px-4 py-4 transition-all duration-300 dark:hover:bg-zinc-900 hover:border-zinc-700 shadow-inner", !email && "opacity-50 cursor-not-allowed");

    if (email) {
        return (
            <Button variant="outline" className={classes} asChild>
                <Link href={`mailto:${email}?subject=Tactical Status Update`}>
                    {content}
                    <div className="absolute top-0 right-0 p-1">
                        <div className="size-1 border-t border-r border-emerald-500" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-1">
                        <div className="size-1 border-b border-l border-emerald-500" />
                    </div>
                </Link>
            </Button>
        );
    }

    return (
        <Button variant="outline" className={classes} disabled>
            {content}
        </Button>
    );
}
