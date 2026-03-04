import { Event, Task } from "@prisma/client";

export type PopulatedTask = Task & {
    event: Event
}