import { MiniIconBar } from "@/components/navbar/mini-icon-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "EventSync — Dashboard",
    description: "Take full control of your events with EventSync. Manage vendors, track budgets, coordinate timelines, and organize every detail effortlessly from one powerful dashboard.",
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
        <SidebarProvider defaultOpen={false}>
            <div className="relative flex min-h-screen w-full">
                <Sidebar />
                <MiniIconBar />
                <div className="bg-red-70 min-h-screen flex-1 overflow-hidden px-4 py-8 sm:px-12 sm:pl-8">{children}</div>
            </div>
        </SidebarProvider>
    );
}
