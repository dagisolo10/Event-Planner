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
        <main className="w-full space-y-6">
            <header className="relative flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="bg-primary/5 pointer-events-none absolute -top-24 -left-24 hidden size-96 blur-[120px] dark:block" />

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary h-6 w-1 rounded-full" />
                        <span className="text-muted-foreground text-[10px] font-bold tracking-[0.3em] uppercase">Resource Management</span>
                    </div>
                    <h1 className="text-4xl font-poppins tracking-tight uppercase lg:text-5xl">
                        Vendor <span className="text-gradient">Directory</span>
                    </h1>
                    <p className="text-muted-foreground/80 max-w-md text-sm leading-relaxed font-medium">Centralized database of service providers. Oversee contracts, performance, and cross-event availability.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden flex-col items-end px-4 text-right lg:flex">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Total Database</span>
                        <span className="font-manrope text-xl font-bold">{globalVendors.length}</span>
                    </div>

                    <CreateGlobalVendor />
                </div>
            </header>

            <GlobalVendorsTable globalVendors={globalVendors} events={events} eventVendors={eventVendors} />
        </main>
    );
}
