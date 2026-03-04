"use client";
import { useState } from "react";
import React, { SyntheticEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { checkUserExists } from "@/lib/config/auth";

export default function RegisterForm() {
    const supabase = createClient();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleEmailAuth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = `${formData.get("first-name")} ${formData.get("last-name")}`;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // 1. Check if they already exist in your DB
        // const exists = await checkUserExists(email);

        // if (exists) {
        //     toast.error("An account with this email already exists. Try signing in!");
        //     setLoading(false);
        //     return;
        // }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success("Check your email for the confirmation link.");
            router.push("/verify-email");
        }
    };

    const handleOAuth = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

        if (error) throw error;

        router.push("/dashboard");
    };

    return (
        <main className="grid min-h-screen place-items-center border">
            <div className="max-w-md p-4">
                <h2 className="text-3xl font-bold">Welcome!</h2>
                <p className="text-muted-foreground mt-2 mb-4 max-w-sm text-sm">Join to simplify your scheduling and handle reservations, clients, and your daily flow.</p>

                <form className="mt-4" onSubmit={handleEmailAuth}>
                    <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                        <LabelInputContainer>
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" name="first-name" placeholder="Tyler" type="text" />
                        </LabelInputContainer>
                        <LabelInputContainer>
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" name="last-name" placeholder="Smith" type="text" />
                        </LabelInputContainer>
                    </div>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" placeholder="tylersmith@gmail.com" type="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>

                    <Button disabled={loading} size={`lg`} className="bg-foreground text-background hover:bg-foreground/80 w-full cursor-pointer font-medium" type="submit">
                        Register &rarr;
                    </Button>

                    <div className="text-muted-foreground my-4 flex items-center gap-2 md:text-sm">
                        <p>Already have an account?</p>
                        <Button variant="link" className="text-foreground p-0">
                            <Link href={`/login`}>Login</Link>
                        </Button>
                    </div>

                    <Button type="button" disabled={loading} onClick={handleOAuth} size={`lg`} className="bg-foreground text-background hover:bg-foreground/80 w-full cursor-pointer font-medium">
                        <IconBrandGoogle className="size-4" />
                        <span className="dark: text-sm">Google</span>
                    </Button>
                </form>
            </div>
        </main>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
