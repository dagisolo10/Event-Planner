import { CreateGlobalVendor } from "@/components/vendor/global-vendor-create";
import GlobalVendorsTable from "@/components/vendor/global-vendors-table";
import getEvents from "@/server/events/get-events";
import getAllEventVendors from "@/server/vendors/event/get-all-event-vendors";
import getGlobalVendors from "@/server/vendors/global/get-global-vendors";
import { redirect, notFound } from "next/navigation";

export default async function VendorDirectory() {
    const [eventRes, globalVendorRes, eventVendorRes] = await Promise.all([getEvents(), getGlobalVendors(), getAllEventVendors()]);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();

    const events = eventRes.events;
    const globalVendors = "error" in globalVendorRes ? [] : globalVendorRes.globalVendors;
    const eventVendors = "error" in eventVendorRes ? [] : eventVendorRes.eventVendors;

    return (
        <main className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendor Directory</h1>
                    <p className="text-zinc-500">Manage reusable vendors across events</p>
                </div>
                <CreateGlobalVendor />
            </header>

            <GlobalVendorsTable globalVendors={globalVendors} events={events} eventVendors={eventVendors} />
        </main>
    );
}
