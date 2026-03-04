import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function PublicNavbar() {
    return (
        <header className="px-8 py-4">
            <nav className="flex items-center gap-2">
                <div className="text-primary flex items-center gap-2 text-xl">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide">
                        <Calendar className="h-8 w-8" />
                        <span>EventSync</span>
                    </Link>
                </div>
                <Button className="text-foreground ml-auto" variant="link">
                    <Link href="/login">Login</Link>
                </Button>
                <Button className="text-primary-foreground">
                    <Link href="/register">Get Started</Link>
                </Button>
            </nav>
        </header>
    );
}
