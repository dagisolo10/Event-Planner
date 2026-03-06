"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { TaskStatus, Priority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import addActivity from "../activity/create-activity";

interface Data {
    id: string;
    eventId: string;
    title: string;
    description?: string | null;
    assignedTo?: string | null;
    status: TaskStatus;
    dueDate: Date;
    priority: Priority;
}

export default async function updateTask(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (trx) => {
            const { id, ...updateData } = data;

            const task = await trx.task.findFirst({
                where: {
                    id,
                    event: { id: data.eventId, userId },
                },
            });

            if (!task) throw new Error("Task not found");

            return await trx.task.update({
                where: {
                    id,
                    event: { id: data.eventId, userId },
                },
                data: updateData,
            });
        });

        await addActivity({
            type: "TaskCompleted",
            eventId: data.eventId,
            message: `Milestone reached: ${data.title}`,
        });

        revalidatePath(`/dashboard/events/${data.eventId}/tasks`);

        return { task: result };
    }, "updateTask");
}
