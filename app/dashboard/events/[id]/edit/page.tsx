import EventForm from "@/components/event/event-form";
import getEvent from "@/server/events/get-event";
import { Params } from "next/dist/server/request/params";
import { notFound, redirect } from "next/navigation";

export default async function EditEvent({ params }: { params: Promise<Params> }) {
    const { id: eventId } = await params;
    const id = String(eventId);

    const eventRes = await getEvent(id);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();
    const event = eventRes.event;

    return <EventForm event={event} />;
}
