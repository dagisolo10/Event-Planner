import LeftSide from "@/components/event/left-side";
import EventForm from "@/components/event/event-form";

export default function NewEventPage() {
    return (
        <main className="flex w-full py-0">
            <LeftSide />
            <EventForm />
        </main>
    );
}
