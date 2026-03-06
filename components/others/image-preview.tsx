"use client";
import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Skeleton } from "../ui/skeleton";

export default function ImagePreview() {
    const mounted = React.useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const { theme } = useTheme();

    if (!mounted)
        return (
            <div className="relative mx-auto aspect-video w-4xl">
                <Skeleton className="bg-accent/20 h-100 w-full" />
            </div>
        );

    return (
        <section className="dark:shadow-primary/50 mx-auto h-auto w-10/12 shadow-[0_30px_100px_-40px] shadow-black/70 md:w-full md:max-w-4xl">
            <Image src={theme === "dark" ? "/dash-dark.png" : "/job.png"} alt="App Dashboard Preview" width={1920} height={1080} />
        </section>
    );
}
