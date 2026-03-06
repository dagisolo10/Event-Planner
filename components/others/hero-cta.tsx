import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import authCheck from "@/server/auth/auth-check";

export default async function HeroCTA() {
    const user = await authCheck();

    return (
        <Button className="dark:shadow-primary from-primary group mt-4 rounded-full bg-linear-to-l to-purple-600 px-4 shadow-2xl shadow-black/70 transition-all duration-300 hover:scale-105" asChild>
            <Link className="flex items-center gap-2" href={user ? "/dashboard" : "/register"}>
                {user ? "Resume Session" : "Get Started Free"} <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
        </Button>
    );
}
