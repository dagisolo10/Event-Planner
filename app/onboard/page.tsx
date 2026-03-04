import { redirect } from "next/navigation";
import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

export default async function Onboard() {
    const user = await stackServerApp.getUser();

    if (!user) return redirect("/register");

    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser)
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                name: user.displayName ?? "",
                email: user.primaryEmail ?? "",
            },
        });

    return redirect("/dashboard");
}
