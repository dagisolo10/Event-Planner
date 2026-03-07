// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";

// import Link from "next/link";
// import SearchEvent from "@/components/event/event-table";
// import getEvents from "@/server/events/get-events";
// import { redirect, notFound } from "next/navigation";

// export default async function EventsPage() {
//     const eventRes = await getEvents();

//     if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();

//     const events = eventRes.events;

//     return (
//         <main className="flex flex-col gap-8">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <h1 className="text-4xl font-bold tracking-tight">Events</h1>
//                     <p className="">Manage and track all your upcoming and past events.</p>
//                 </div>
//                 <Button className="w-full sm:w-auto" asChild>
//                     <Link href="/dashboard/events/new">
//                         <Plus className="size-4" /> Create New Event
//                     </Link>
//                 </Button>
//             </div>

//             <SearchEvent events={events} />
//         </main>
//     );
// }
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchEvent from "@/components/event/event-table";
import getEvents from "@/server/events/get-events";
import { redirect, notFound } from "next/navigation";

export default async function EventsPage() {
    const eventRes = await getEvents();
    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();
    const events = eventRes.events;

    return (
        <main className="flex flex-col gap-10 pb-12">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="bg-primary/5 pointer-events-none absolute -top-24 -left-24 hidden size-96 blur-[120px] dark:block" />

                <div className="space-y-2">
                    <Link href="/dashboard" className="text-muted-foreground group hover:text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors duration-500">
                        <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-1" /> Dashboard
                    </Link>

                    <h1 className="font-poppins text-4xl tracking-tight uppercase lg:text-5xl">
                        Your <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">Events</span>
                    </h1>
                    <p className="text-muted-foreground">Manage, track, and synchronize every detail of your events in one unified workspace.</p>
                </div>

                <Button className="group relative flex items-center gap-2 overflow-hidden bg-zinc-900 px-4 py-2 font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <Link href="/dashboard/events/new" className="flex items-center gap-2">
                        <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span>Create New Event</span>
                        <span className="via-background/20 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    </Link>
                </Button>
            </div>

            <SearchEvent events={events} />
        </main>
    );
}
