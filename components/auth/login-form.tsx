"use client";
import React, { SyntheticEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function LoginForm() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const handleEmailAuth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        toast.promise(supabase.auth.signInWithPassword({ email, password }), {
            loading: "Signing in...",
            success: ({ error }) => {
                if (error) throw new Error(error.message);

                router.push("/onboard");
                setLoading(false);
                return "Welcome Back!";
            },
            error: (err) => {
                setLoading(false);
                return err.message || "Failed to sign in";
            },
        });
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
        <main className="grid min-h-screen place-items-center">
            <div className="max-w-md">
                <h2 className="text-3xl font-bold">Welcome Back!</h2>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">Sign in to manage your time, your bookings, and your business.</p>

                <form className="mt-8" onSubmit={handleEmailAuth}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" placeholder="tylersmith@gmail.com" type="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>

                    <Button disabled={loading} size={`lg`} className="bg-foreground text-background hover:bg-foreground/80 w-full cursor-pointer font-medium" type="submit">
                        Login &rarr;
                    </Button>

                    <div className="text-muted-foreground my-4 flex items-center gap-2 md:text-sm">
                        <p>Don&apos;t have an account?</p>
                        <Button variant="link" className="text-foreground p-0">
                            <Link href={`/register`}>Register</Link>
                        </Button>
                    </div>

                    <Button type="button" disabled={loading} onClick={handleOAuth} size={`lg`} className="bg-foreground text-background hover:bg-foreground/80 w-full cursor-pointer font-medium">
                        <IconBrandGoogle className="size-4" />
                        <span className="text-sm">Google</span>
                    </Button>
                </form>
            </div>
        </main>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
