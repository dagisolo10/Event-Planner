"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

export default async function unlinkVendor(eventVendorId: string, eventId: string) {
    return await wrapAction(async () => {
        const userId = await authCheck()
        if (!userId) return { error: "Unauthorized" };

        await prisma.$transaction(async (tx) => {
            await tx.payment.deleteMany({
                where: { eventVendorId, eventId },
            });

            await tx.eventVendor.delete({
                where: { id: eventVendorId, eventId },
            });
        });

        revalidatePath(`/dashboard/events/${eventId}/vendors`);
        revalidatePath(`/dashboard/events/${eventId}/payments`);
    }, "unlinkVendor");
}
