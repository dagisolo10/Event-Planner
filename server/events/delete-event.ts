"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import { revalidatePath } from "next/cache";
import authCheck from "../auth/auth-check";

export default async function deleteEvent(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        await prisma.$transaction(async (trx) => {
            const event = await trx.event.findFirst({ where: { id, userId } });

            if (!event) throw new Error("Event not found or not in your list");

            await trx.event.delete({ where: { id, userId } });
        });

        revalidatePath("/dashboard/events");
    }, "deleteEvent");
}
