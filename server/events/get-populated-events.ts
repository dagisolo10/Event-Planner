"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getPopulatedEvent(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const event = await prisma.event.findFirst({ where: { id, userId }, include: { payments: { include: { vendor: { include: { globalVendor: true } } }, orderBy: { dueDate: "asc" } } } });

        return { event };
    }, "getPopulatedEvent");
}
