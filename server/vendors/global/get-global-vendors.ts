"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";

export default async function getGlobalVendors() {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        return { globalVendors: await prisma.globalVendor.findMany({ where: { userId, isActive: true } }) };
    }, "getGlobalVendors");
}
