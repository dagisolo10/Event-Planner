"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getEventActivities(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const activity = await prisma.activity.findMany({ where: { event: { id, userId } } });

        return { activity };
    }, "getEventActivities");
}
