import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "./stack/server";

export default async function proxy(request: NextRequest) {
    const user = await stackServerApp.getUser();
    const path = request.nextUrl.pathname;

    const publicRoutes = ["/login", "/register"];
    const protectedRoutes = ["/dashboard"];

    const isPublic = publicRoutes.some((route) => path.startsWith(route)) || path === "/";
    const isProtected = protectedRoutes.some((route) => path.startsWith(route));

    if (isProtected && !user) return NextResponse.redirect(new URL("/", request.url));
    if (isPublic && user) return NextResponse.redirect(new URL("/dashboard", request.url));

    return NextResponse.next();
}
