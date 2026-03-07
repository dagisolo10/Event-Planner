"use server";
import { stackServerApp } from "@/stack/server";

export default async function authCheck() {
    const user = await stackServerApp.getUser();

    // return "ae82c9da-7573-4948-a912-35ee9b87d1a0";
    return user?.id;
}
