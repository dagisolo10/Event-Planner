"use server";
import { stackServerApp } from "@/stack/server";

export default async function authCheck() {
    const user = await stackServerApp.getUser();

    return user?.id;
}
