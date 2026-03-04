"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { PaymentType } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface Data {
    id: string;
    type: PaymentType;
    amount: number;
    dueDate: Date;
    eventId: string;
    description?: string | null;
    eventVendorId?: string | null;
}

export default async function updatePayment(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const { id, eventId, eventVendorId, type, ...updateData } = data;

        const result = await prisma.$transaction(async (trx) => {
            const existingPayment = await trx.payment.findFirst({
                where: {
                    id,
                    event: { userId },
                },
            });

            if (!existingPayment) throw new Error("Payment not found or unauthorized");

            return await trx.payment.update({
                where: { id },
                data: {
                    ...updateData,
                    type,
                    eventId,
                    eventVendorId: type === "Vendor" ? eventVendorId : null,
                },
            });
        });

        revalidatePath(`/dashboard/finance`);
        revalidatePath(`/dashboard/events/${eventId}/payments`);

        return { payment: result };
    }, "updatePayment");
}
