import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

interface Data {
    type: ActivityType;
    message: string;
    eventId: string;
}

export default async function addActivity(data: Data) {
    return await wrapAction(async () => {
        const userId = await authCheck();

        if (!userId) return { error: "Unauthorized" };

        const activity = await prisma.activity.create({
            data: {
                type: data.type,
                message: data.message,
                eventId: data.eventId,
            },
        });

        revalidatePath(`/dashboard/events/${data.eventId}`);

        return { activity };
    }, "addActivity");
}
