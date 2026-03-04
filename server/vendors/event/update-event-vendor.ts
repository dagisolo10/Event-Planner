"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

interface Data {
    id: string;
    eventId: string;
    cost: number;
    dueDate: Date;
}

export default async function updateEventVendor(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };
        const { id, eventId, ...updateData } = data;

        const result = await prisma.$transaction(async (trx) => {
            const eventVendor = await trx.eventVendor.findFirst({
                where: { id, eventId, event: { userId } },
            });

            if (!eventVendor) throw new Error("Event Vendor not found");

            return await trx.eventVendor.update({
                where: { id, eventId, event: { userId } },
                data: updateData,
            });
        });

        revalidatePath(`/dashboard/events/${data.eventId}/vendors`);

        return { eventVendor: result };
    }, "updateEventVendor");
}
