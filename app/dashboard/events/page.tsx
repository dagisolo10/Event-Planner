import { Plus } from "lucide-react";
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
        <main className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Events</h1>
                    <p className="">Manage and track all your upcoming and past events.</p>
                </div>
                <Button className="w-full sm:w-auto" asChild>
                    <Link href="/dashboard/events/new">
                        <Plus className="size-4" /> Create New Event
                    </Link>
                </Button>
            </div>

            <SearchEvent events={events} />
        </main>
    );
}
