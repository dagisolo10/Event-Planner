"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

interface Data {
    id: string;
    name: string;
    category: string;
    website?: string | null;
    contact?: string | null;
    email?: string | null;
}

export default async function updateGlobalVendor(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (trx) => {
            const globalVendor = await trx.globalVendor.findFirst({
                where: { id: data.id, userId, isActive: true },
            });

            if (!globalVendor) throw new Error("Global vendor not found");

            const { id, ...updateData } = data;

            return await trx.globalVendor.update({
                where: { id, userId, isActive: true },
                data: updateData,
            });
        });

        revalidatePath("/dashboard/vendors/directory");

        return { globalVendor: result };
    }, "updateGlobalVendor");
}
