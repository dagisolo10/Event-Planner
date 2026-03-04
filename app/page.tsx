import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import PublicNavbar from "@/components/others/public-navbar";
import { Card } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="min-h-screen">
            <PublicNavbar />
            <main>
                <div className="px-12 py-12 text-center lg:text-left">
                    <h1 className="pb-4 text-5xl font-extrabold tracking-tight lg:text-7xl">Plan perfect events effortlessly</h1>
                    <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-lg leading-relaxed lg:mx-0">Take full control of every event with confidence. Track budgets, manage vendors, coordinate timelines, and keep every detail in perfect harmony — all from one place.</p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                        <Button className="flex items-center rounded-full">
                            <Link className="flex items-center gap-1" href="/register">
                                Get Started Free <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="px-12 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <h2 className="mb-4 text-4xl font-bold">Everything You Need to Organize Like a Pro</h2>
                            <p className="text-lg text-slate-400">From budgets to vendors, timelines to tasks — EventSync puts the power back in your hands.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Organizer Feature 1 */}
                            <FeatureCard
                                icon={<Calendar className="size-7" />}
                                title="Master Your Timeline"
                                subtitle="Keep every task, deadline, and event in perfect order. Coordinate multiple vendors and events with ease."
                                itemText1="Live Event Dashboard"
                                itemText2="Task & Timeline Management"
                                color="text-primary"
                            />

                            {/* Organizer Feature 2 */}
                            <FeatureCard
                                icon={<CheckCircle2 className="size-7" />}
                                title="Track Budgets & Payments"
                                subtitle="Monitor your budgets, vendor deposits, and client payments effortlessly — never miss a detail."
                                itemText1="Budget vs Actual Tracking"
                                itemText2="Payment Status Alerts"
                                color="text-green-500"
                            />

                            {/* Organizer Feature 3 */}
                            <FeatureCard
                                icon={<Sparkles className="size-7" />}
                                title="Manage Vendors Seamlessly"
                                subtitle="Add, track, and organize all your vendors in one place. Keep communications and schedules clear without the chaos."
                                itemText1="Vendor List & Contact Tracking"
                                itemText2="Deposit & Due Date Management"
                                color="text-yellow-500"
                            />
                        </div>
                    </div>
                </section>

                <footer className="mx-auto max-w-4xl py-16 text-center">
                    <h2 className="mb-8 text-3xl font-bold md:text-4xl">Ready to organize your next event like a pro?</h2>
                    <Button className="rounded-full">
                        <Link href="/register">Get Started for Free</Link>
                    </Button>
                </footer>
            </main>
        </div>
    );
}

interface Card {
    icon: ReactNode;
    title: string;
    subtitle: string;
    itemText1: string;
    itemText2: string;
    color: string;
}

function FeatureCard({ icon, title, subtitle, itemText1, itemText2, color }: Card) {
    return (
        <Card className="p-6">
            <div className={`${color} bg-primary/20 grid size-14 place-items-center rounded-2xl`}>{icon}</div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="leading-relaxed">{subtitle}</p>
            <div className="mt-auto space-y-3">
                <FeatureItem text={itemText1} />
                <FeatureItem text={itemText2} />
            </div>
        </Card>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <span className="text-primary">{text}</span>
        </div>
    );
}
