"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

interface Data {
    id: string;
    title: string;
    description?: string | null;
    clientName: string;
    clientEmail?: string | null;
    startDate: Date;
    endDate: Date;
    budget: number;
    location: string;
}

export default async function updateEvent(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const result = await prisma.$transaction(async (trx) => {
            const invalidDate = data.endDate.getTime() < data.startDate.getTime();

            if (invalidDate) throw new Error("End date can't be after start date.");

            const { id, ...updateData } = data;

            const event = await trx.event.findFirst({ where: { id, userId } });

            if (!event) throw new Error("Event not found or not in your list");

            return await trx.event.update({
                where: { id, userId },
                data: updateData,
            });
        });

        return { event: result };
    }, "updateEvent");
}
