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
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <Link href="/dashboard" className="text-muted-foreground group hover:text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors duration-500">
                        <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-1" /> Dashboard
                    </Link>

                    <h1 className="font-poppins text-4xl font-extrabold tracking-tight md:text-5xl">
                        Your <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">Events</span>
                    </h1>
                    <p className="text-muted-foreground">Manage, track, and synchronize every detail of your events in one unified workspace.</p>
                </div>

                <Button size="lg" className="group shadow-primary/20 rounded-full py-4 font-medium text-white shadow-xl transition-all duration-500 hover:scale-105 active:scale-95" asChild>
                    <Link href="/dashboard/events/new" className="flex items-center gap-2">
                        <Plus className="size-5 transition-transform group-hover:rotate-90" />
                        Create New Event
                    </Link>
                </Button>
            </div>

            <SearchEvent events={events} />
        </main>
    );
}
