"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";

export default async function getAllEventVendors() {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const eventVendors = await prisma.eventVendor.findMany({
            where: { event: { userId } },
            include: { payments: true, globalVendor: true },
        });

        return { eventVendors };
    }, "getAllEventVendors");
}
