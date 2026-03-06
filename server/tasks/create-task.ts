"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { Priority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import addActivity from "../activity/create-activity";

interface Data {
    eventId: string;
    title: string;
    description?: string | null;
    assignedTo?: string | null;
    status: TaskStatus;
    dueDate: Date;
    priority: Priority;
}

export default async function createTask(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const { eventId, ...taskData } = data;

        console.log("Creating task for eventId:", eventId);

        const task = await prisma.task.create({
            data: {
                ...taskData,
                event: { connect: { id: eventId } },
            },
            include: { event: true },
        });

        await addActivity({
            type: "TaskCreated",
            eventId: data.eventId,
            message: `New milestone established: ${data.title}`,
        });

        revalidatePath(`/dashboard/events/${eventId}`);
        return { task };
    }, "createTask");
}
