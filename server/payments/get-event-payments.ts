"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getEventPayments(eventId: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const payments = await prisma.payment.findMany({
            where: { event: { userId }, eventId },
        });

        return { payments };
    }, "getEventPayments");
}
