"use server";
import { stackServerApp } from "@/stack/server";

export default async function authCheck() {
    const user = await stackServerApp.getUser();

    // return "54d55af7-7f48-4f97-8963-f42bde9b0ce8";
    return user?.id;
}
