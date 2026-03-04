"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

interface Data {
    title: string;
    description?: string | null;
    clientName: string;
    clientEmail?: string | null;
    startDate: Date;
    endDate: Date;
    budget: number;
    location: string;
}

export default async function createEvent(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const invalidDate = data.endDate.getTime() < data.startDate.getTime();

        if (invalidDate) return { error: "End date can't be after start date." };

        const event = await prisma.event.create({
            data: { userId, ...data },
        });

        return { event };
    }, "createEvent");
}
