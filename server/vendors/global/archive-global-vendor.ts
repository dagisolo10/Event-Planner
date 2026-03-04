"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

export default async function deleteGlobalVendor(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (trx) => {
            const globalVendor = await trx.globalVendor.findFirst({ where: { id, userId } });

            if (!globalVendor) return { error: "Global vendor not found" };

            return await trx.globalVendor.update({
                where: { id },
                data: { isActive: false },
            });
        });

        revalidatePath("/dashboard/vendors/directory");
        return { globalVendor: result };
    }, "deleteVendor");
}
