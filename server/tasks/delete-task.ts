"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { revalidatePath } from "next/cache";

export default async function deleteTask(id: string, eventId: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        await prisma.$transaction(async (trx) => {
            const task = await trx.task.findFirst({ where: { id, event: { userId }, eventId } });

            if (!task) throw new Error("Task not found");

            return await trx.task.delete({ where: { id } });
        });

        revalidatePath(`/dashboard/events/${eventId}/tasks`);
    }, "deleteTask");
}
