"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

export default async function bulkArchiveGlobalVendors(ids: string[]) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };
        if (!ids || ids.length === 0) return { error: "No vendor IDs provided" };

        const result = await prisma.$transaction(async (trx) => {
            const updateResult = await trx.globalVendor.updateMany({
                where: {
                    id: { in: ids },
                    userId: userId,
                },
                data: { isActive: false },
            });

            return updateResult;
        });

        revalidatePath("/dashboard/vendors/directory");

        return { count: result.count };
    }, "bulkArchiveGlobalVendors");
}
