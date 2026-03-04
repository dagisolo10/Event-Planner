import { LinkVendorForEvent } from "@/components/vendor/vendor-to-event-link";
import VendorsTable from "@/components/vendor/event-vendors-table";
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
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{event.title} Vendors</h1>
                    <p className="text-zinc-500">Manage partners and contracts for this event.</p>
                </div>
                <LinkVendorForEvent mainButton eventId={id} eventVendors={vendors} eventTitle={event.title} globalVendors={globalVendors} />
            </header>

            <VendorsTable eventVendors={vendors} eventId={id} eventTitle={event.title} globalVendors={globalVendors} />
        </main>
    );
}
