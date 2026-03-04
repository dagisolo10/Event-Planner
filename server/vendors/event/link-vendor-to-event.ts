"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "@/server/auth/auth-check";
import { revalidatePath } from "next/cache";

interface Data {
    cost: number;
    deposit: number;
    dueDate: Date;
    eventId: string;
    globalVendorId: string;
}

export default async function linkVendorToEvent(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (tx) => {
            const existingLink = await tx.eventVendor.findFirst({
                where: {
                    eventId: data.eventId,
                    globalVendorId: data.globalVendorId,
                },
            });

            if (existingLink) throw new Error("Vendor already added to this event");
            if (data.deposit > data.cost) throw new Error("Deposit cannot exceed cost.");

            const newEventVendor = await tx.eventVendor.create({
                data: {
                    cost: data.cost,
                    deposit: data.deposit,
                    dueDate: data.dueDate,
                    eventId: data.eventId,
                    globalVendorId: data.globalVendorId,
                },
                include: { globalVendor: true, event: true },
            });

            if (data.deposit > 0) {
                await tx.payment.create({
                    data: {
                        amount: data.deposit,
                        type: "Vendor",
                        dueDate: data.dueDate,
                        eventId: data.eventId,
                        description: "Initial deposit",
                        eventVendorId: newEventVendor.id,
                        userId,
                    },
                });
            }

            return newEventVendor;
        });

        revalidatePath(`/dashboard/events/${data.eventId}/vendors`);

        return { eventVendor: result };
    }, "linkVendorToEvent");
}
