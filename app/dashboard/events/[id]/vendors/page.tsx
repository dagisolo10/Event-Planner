import { LinkVendorForEvent } from "@/components/vendor/vendor-to-event-link";
import EventVendorsTable from "@/components/vendor/event-vendors-table";
import getEvent from "@/server/events/get-event";
import getEventVendors from "@/server/vendors/event/get-event-vendors";
import getGlobalVendors from "@/server/vendors/global/get-global-vendors";
import { Params } from "next/dist/server/request/params";
import { notFound, redirect } from "next/navigation";

export default async function EventVendorsPage({ params }: { params: Promise<Params> }) {
    const { id: eventId } = await params;
    const id = String(eventId);
    const [eventRes, vendorRes, globalVendorRes] = await Promise.all([getEvent(id), getEventVendors(id), getGlobalVendors()]);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();

    const event = eventRes.event;
    const vendors = "error" in vendorRes ? [] : vendorRes.eventVendors;
    const globalVendors = "error" in globalVendorRes ? [] : globalVendorRes.globalVendors;

    return (
        <main className="w-full space-y-6">
            <header className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="bg-primary/5 pointer-events-none absolute -top-24 -left-24 hidden size-96 blur-[120px] dark:block" />

                <div className="relative space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary h-1 w-8 rounded-full" />
                        <span className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">Partner Network</span>
                    </div>

                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase italic sm:text-5xl dark:text-white">
                        {event.title} <span className="text-zinc-400 dark:text-zinc-600">VENDORS</span>
                    </h1>

                    <p className="max-w-md text-sm font-medium text-zinc-500 dark:text-zinc-400">Orchestrate partner contracts and logistical sync for this sequence.</p>
                </div>

                <div className="flex items-center gap-3">
                    <LinkVendorForEvent mainButton eventId={id} eventVendors={vendors} eventTitle={event.title} globalVendors={globalVendors} />
                </div>
            </header>

            <EventVendorsTable eventVendors={vendors} eventId={id} eventTitle={event.title} globalVendors={globalVendors} />
        </main>
    );
}
