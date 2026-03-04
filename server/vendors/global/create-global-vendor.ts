"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

interface Data {
    name: string;
    category: string;
    website?: string | null;
    contact?: string | null;
    email?: string | null;
}

export default async function createGlobalVendor(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const globalVendor = await prisma.globalVendor.create({ data: { ...data, userId } });

        revalidatePath("/dashboard/vendors/directory");

        return { globalVendor };
    }, "createGlobalVendor");
}
