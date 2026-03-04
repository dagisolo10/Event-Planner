import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, CheckCircle2, Sparkles, ArrowRight, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import PublicNavbar from "@/components/navbar/public-navbar";
import { Card } from "@/components/ui/card";
import ImagePreview from "@/components/navbar/image-preview";

export default function Home() {
    return (
        <div className="scrollbar-thin min-h-screen">
            <PublicNavbar />
            <main className="space-y-8">
                <section className="flex flex-col items-center py-12 text-center">
                    <h1 className="font-poppins text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
                        The Operating System for <br />
                        <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">Flawless Events.</span>
                    </h1>

                    <p className="text-muted-foreground my-4 max-w-2xl text-sm tracking-tight md:text-base">
                        The unified workspace for modern event organizers. Synchronize your vendors, automate budget tracking, and command your timelines with a dashboard that works as hard as you do.
                    </p>

                    <Button className="dark:shadow-primary from-primary group mt-4 rounded-full bg-linear-to-l to-purple-600 px-4 shadow-2xl shadow-black/70 transition-all duration-300 hover:scale-105" asChild>
                        <Link className="flex items-center gap-2" href="/register">
                            Get Started Free <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </section>

                <ImagePreview />

                <section id="features" className="px-4 py-12 md:px-12">
                    <div className="mb-12 flex flex-col justify-center text-center">
                        <h2 className="font-poppins mx-auto mb-4 max-w-3xl text-2xl font-bold md:text-4xl">
                            Everything You Need to <span className="text-primary">Organize Like a Pro</span>
                        </h2>
                        <p className="text-muted-foreground text-sm tracking-tight md:text-base">From budgets to vendors, timelines to tasks — EventSync puts the power back in your hands.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={Calendar}
                            title="Master Your Timeline"
                            subtitle="Keep every task, deadline, and event in perfect order. Coordinate multiple vendors and events with ease."
                            itemText1="Live Event Dashboard"
                            itemText2="Task & Timeline Management"
                            color="primary"
                        />

                        <FeatureCard
                            icon={CheckCircle2}
                            title="Track Budgets & Payments"
                            subtitle="Monitor your budgets, vendor deposits, and client payments effortlessly — never miss a detail."
                            itemText1="Budget vs Actual Tracking"
                            itemText2="Payment Status Alerts"
                            color="green"
                        />

                        <FeatureCard
                            icon={Sparkles}
                            title="Manage Vendors Seamlessly"
                            subtitle="Add, track, and organize all your vendors in one place. Keep communications and schedules clear without the chaos."
                            itemText1="Vendor List & Contact Tracking"
                            itemText2="Deposit & Due Date Management"
                            color="amber"
                        />
                    </div>
                </section>

                <footer id="pricing" className="space-y-6 py-12 text-center">
                    <h2 className="font-poppins text-2xl leading-8 font-bold md:text-4xl">
                        Ready to organize your next <span className="text-primary">event like a pro?</span>
                    </h2>
                    <p className="text-accent-foreground mx-auto max-w-xl text-sm md:text-base">Join hundreds of organizers who have simplified their workflow and reclaimed their time.</p>

                    <Button className="dark:shadow-primary from-primary group mt-4 rounded-full bg-linear-to-l to-purple-600 px-4 shadow-2xl shadow-black/70 transition-all duration-300 hover:scale-105" asChild>
                        <Link className="flex items-center gap-2" href="/register">
                            Get Started Free <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </footer>
            </main>
        </div>
    );
}

interface Card {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    title: string;
    subtitle: string;
    itemText1: string;
    itemText2: string;
    color: string;
}

function FeatureCard({ icon: Icon, title, subtitle, itemText1, itemText2, color }: Card) {
    const colorMap = {
        primary: "text-primary border-primary/20",
        green: "text-emerald-500 border-emerald-500/20",
        amber: "text-amber-500 border-amber-500/20",
    };

    return (
        <Card className={`group relative overflow-hidden p-8 transition-all duration-500 hover:-translate-y-1 dark:border-white/5 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/40`}>
            <div className={`absolute -top-4 -right-4 size-24 opacity-15 blur-3xl ${colorMap[color as keyof typeof colorMap].split(" ")[0].replace("text", "bg")}`} />

            <div className="mb-6 flex flex-col gap-4">
                <div className={`grid size-12 place-items-center rounded-xl border ${colorMap[color as keyof typeof colorMap]}`}>
                    <Icon className="size-6" />
                </div>
                <h3 className="font-poppins dark:text-foreground/50 dark:group-hover:text-foreground text-xl font-bold tracking-wide transition-colors duration-500 md:tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
            </div>

            <div className="mt-6 space-y-3 border-t pt-6 dark:border-white/5">
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
            <span className="dark:text-primary/70 text-primary">{text}</span>
        </div>
    );
}
