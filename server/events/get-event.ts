"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getEvent(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const event = await prisma.event.findFirst({ where: { id, userId } });

        if (!event) return { error: "Event not found or not in your list" };

        return { event };
    }, "getEvent");
}
