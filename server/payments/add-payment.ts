"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { revalidatePath } from "next/cache";
import { PaymentType } from "@prisma/client";

interface Data {
    amount: number;
    type: PaymentType;
    dueDate: Date;
    eventId: string;
    description?: string | null;
    eventVendorId?: string | null;
}

export default async function addPayment(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const payment = await prisma.payment.create({
            data: { userId, ...data },
        });

        revalidatePath(`/dashboard/events/${data.eventId}/payments`);

        return { payment };
    }, "addPayment");
}
