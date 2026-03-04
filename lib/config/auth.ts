"use server";
import prisma from "@/lib/config/prisma";

export async function checkUserExists(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return user;
}
