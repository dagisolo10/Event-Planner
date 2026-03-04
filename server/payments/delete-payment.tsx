"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { revalidatePath } from "next/cache";

export default async function deletePayment(id: string, eventId: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (trx) => {
            const payment = await trx.payment.findFirst({ where: { id, event: { userId } } });

            if (!payment) throw new Error("Payment not found or unauthorized");

            return await trx.payment.delete({ where: { id } });
        });

        revalidatePath(`/dashboard/finance`);
        revalidatePath(`/dashboard/events/${eventId}/payments`);

        return { payment: result };
    }, "deletePayment");
}
