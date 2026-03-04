import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Manrope, Playfair_Display, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import ThemeProvider from "@/components/others/theme-provider";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    weight: "300",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

const poppins = Poppins({
    subsets: ["latin"],
    variable: "--font-poppins",
    weight: "300",
});

export const metadata: Metadata = {
    title: "EventSync — Professional Event Organizer Dashboard",
    description: "Take full control of your events with EventSync. Manage vendors, track budgets, coordinate timelines, and organize every detail effortlessly from one powerful dashboard.",
    icons: {
        icon: "/icon.svg",
    },
    keywords: ["event management", "event organizer", "vendor management", "budget tracking", "event planning", "professional planner", "timeline management"],
    authors: [{ name: "EventSync Team" }],
    openGraph: {
        title: "EventSync — Professional Event Organizer Dashboard",
        description: "Manage your events, vendors, budgets, and timelines with ease. EventSync is the ultimate dashboard for professional event organizers.",
        url: "https://www.eventsync.com",
        siteName: "EventSync",
        images: [
            {
                url: "https://www.eventsync.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "EventSync Dashboard Preview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "EventSync — Professional Event Organizer Dashboard",
        description: "Take full control of your events, vendors, budgets, and timelines with EventSync.",
        images: ["https://www.eventsync.com/og-image.png"],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${manrope.variable} ${playfair.variable} ${poppins.variable} antialiased`}>
                <StackProvider app={stackClientApp}>
                    <StackTheme>
                        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                            <TooltipProvider>{children}</TooltipProvider>
                            <Toaster toastOptions={{ classNames: { description: "!text-current !opacity-100" } }} position="top-center" />
                        </ThemeProvider>
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}
