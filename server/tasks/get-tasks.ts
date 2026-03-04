"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getTasks(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const tasks = await prisma.task.findMany({
            where: {
                event: { id, userId },
            },
            include: { event: true },
        });

        return { tasks };
    }, "getTasks");
}
