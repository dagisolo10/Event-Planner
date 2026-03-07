"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { formatDateForInput, formatTimeForInput } from "@/helper/helper-functions";
import createEvent from "@/server/events/create-event";
import updateEvent from "@/server/events/update-event";
import { Event } from "@prisma/client";
import { User, MapPin, DollarSign, Mail, Loader2, FileText, Sparkles, Clock, Calendar as CalIcon, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, ReactNode, SyntheticEvent, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { InputField, TextAreaField } from "./input-field";
import WarningWrapper from "./warning-wrapper";
import CalendarPopup from "../common/calendar-dialog-4";

export default function EventForm({ event }: { event?: Event }) {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const isUpdate = !!event;
    const formRef = useRef<HTMLFormElement>(null);
    const [copying, setCopying] = useState<boolean>(false);

    const [completion, setCompletion] = useState(0);
    const [formValues, setFormValues] = useState({
        startDate: event ? formatDateForInput(event.startDate) : "",
        startTime: event ? formatTimeForInput(event.startDate) : "",
        endDate: event ? formatDateForInput(event.endDate) : "",
        endTime: event ? formatTimeForInput(event.endDate) : "",
        budget: event?.budget || 0,
    });

    const startDate = new Date(`${formValues.startDate}T${formValues.startTime}`);
    const endDate = new Date(`${formValues.endDate}T${formValues.endTime}`);
    const isDateError = formValues.startDate && formValues.endDate && formValues.startTime && formValues.endTime && endDate <= startDate;

    const calculateProgress = useCallback(() => {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const fields = ["title", "clientName", "location", "budget", "description", "clientEmail", "startDate", "startTime", "endDate", "endTime"];

        let filledCount = 0;

        fields.forEach((field) => {
            let value;
            if (field in formValues) {
                value = formValues[field as keyof typeof formValues];
            } else {
                value = formData.get(field);
            }

            if (field === "budget") {
                if (Number(value) > 0) filledCount++;
            } else if (value && String(value).trim() !== "") {
                filledCount++;
            }
        });

        setCompletion(filledCount * 10);
    }, [formValues]);

    const handleCopy = () => {
        if (!event?.clientEmail) return;
        setCopying(true);
        navigator.clipboard.writeText(event.clientEmail);
        toast.success("Email copied");
        setTimeout(() => setCopying(false), 2000);
    };

    const handleFormChange = () => calculateProgress();

    const handleBudgetChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => setFormValues((prev) => ({ ...prev, budget: Number(e.target.value) }));

    useEffect(() => calculateProgress(), [formValues, calculateProgress]);

    useEffect(() => {
        if (isUpdate) setCompletion(100);
    }, [isUpdate]);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const scrollTargets: string[] = [];

        const fieldLabels: Record<string, string> = {
            title: "Title",
            clientName: "Client",
            location: "Location",
            budget: "Budget",
        };

        Object.keys(fieldLabels).forEach((key) => {
            const value = formData.get(key);
            if (!value || String(value).trim() === "") {
                validationErrors.push(`${fieldLabels[key]} is required`);
                if (!scrollTargets.includes(key)) scrollTargets.push(key);
            }
        });

        const dateFields: Record<keyof typeof formValues, string> = {
            startDate: "Start Date",
            startTime: "Start Time",
            endDate: "End Date",
            endTime: "End Time",
            budget: "Budget",
        };

        (Object.keys(dateFields) as Array<keyof typeof formValues>).forEach((key) => {
            if (key === "budget") return;

            if (!formValues[key] || String(formValues[key]).trim() === "") {
                validationErrors.push(`${dateFields[key]} is required`);
                if (!scrollTargets.includes("date")) scrollTargets.push("date");
            }
        });

        if (formValues.budget < 0) {
            validationErrors.push("Budget cannot be negative");
            if (!scrollTargets.includes("budget")) scrollTargets.push("budget");
        }
        if (isDateError) {
            validationErrors.push("End date must be after start date");
            if (!scrollTargets.includes("date")) scrollTargets.push("date");
        }
        if (validationErrors.length > 0) {
            setLoading(false);

            const firstErrorId = scrollTargets[0];
            const element = document.getElementById(firstErrorId);

            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("animate-shake");
                setTimeout(() => element.classList.remove("animate-shake"), 500);
            }

            return toast.error("Form Validation Failed", {
                description: (
                    <ul className="text-destructive-foreground mt-1 list-disc space-y-1 pl-4 text-xs font-medium">
                        {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                ),
            });
        }

        const data = {
            title: String(payload.title).trim(),
            description: (payload.description as string).trim() || null,
            clientName: String(payload.clientName).trim(),
            clientEmail: (payload.clientEmail as string).trim() || null,
            startDate: new Date(`${formValues.startDate}T${formValues.startTime}`),
            endDate: new Date(`${formValues.endDate}T${formValues.endTime}`),
            budget: Number(formValues.budget),
            location: String(payload.location).trim(),
        };

        const action = isUpdate ? updateEvent({ ...data, id: event!.id }) : createEvent(data);

        toast.promise(action, {
            loading: isUpdate ? "Updating event..." : "Creating event...",
            success: (res) => {
                if ("error" in res) throw new Error(res.error);
                router.push(`/dashboard/events/${res.event.id}`);
                return `${res.event.title} ${isUpdate ? "updated" : "created"} successfully`;
            },
            error: (err) => err.message || "Something went wrong",
            finally: () => setLoading(false),
        });
    }

    return (
        <main className="mx-auto w-full max-w-5xl space-y-8 pb-20">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary h-1 w-6 rounded-full" />
                        <span className="font-poppins text-muted-foreground text-xs font-bold tracking-widest uppercase">{isUpdate ? "Configuration" : "New Project"}</span>
                    </div>
                    <h1 className="font-poppins text-4xl tracking-tight">
                        {isUpdate ? "Refine " : "Event "}
                        <span className="text-gradient">Blueprint</span>
                    </h1>
                </div>

                <div className="w-full space-y-2 md:w-72">
                    <div className="text-muted-foreground flex justify-between text-xs font-semibold tracking-wide uppercase">
                        <span>Readiness</span>
                        <span className={completion === 100 ? "text-emerald-500" : ""}>{completion}%</span>
                    </div>
                    <Progress value={completion} className={completion === 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary"} />
                </div>
            </header>

            <Card className="bg-background/50 relative overflow-hidden border-none p-8 shadow-2xl backdrop-blur-md dark:bg-zinc-900/20">
                <div className="bg-primary/10 absolute -top-24 -right-24 hidden size-64 blur-3xl dark:block" />

                <form ref={formRef} onChange={handleFormChange} onSubmit={handleSubmit} className="space-y-8">
                    <section className="space-y-6">
                        <h3 className="font-poppins text-xl font-bold">General Information</h3>
                        <InputGroup>
                            <InputField id="title" label="Event Title" icon={FileText} name="title" defaultValue={event?.title} placeholder="e.g. Annual Gala 2024" />
                            <InputField id="clientName" label="Client / Organization" icon={User} name="clientName" defaultValue={event?.clientName} placeholder="Client Name" />
                        </InputGroup>

                        <InputGroup>
                            <InputField id="clientEmail" name="clientEmail" label="Contact Email" icon={Mail} defaultValue={event?.clientEmail || ""} placeholder="client@email.com" type="email" toCopy onClick={handleCopy} copying={copying} />
                            <InputField id="location" label="Venue Location" icon={MapPin} name="location" placeholder="City, Venue, or Remote" defaultValue={event?.location} />
                        </InputGroup>
                    </section>

                    <section className="space-y-6 border-t pt-8 dark:border-white/5">
                        <h3 className="font-poppins text-xl font-bold">Financial & Logistics</h3>

                        <InputGroup>
                            <WarningWrapper id="budget" invalid={formValues.budget < 0} message="Budget can't be negative. Please enter a positive value.">
                                <InputField id="budget" label="Budget Estimate" icon={DollarSign} name="budget" type="number" defaultValue={event?.budget} placeholder="0.00" formValues={formValues} onChange={handleBudgetChange} />
                            </WarningWrapper>

                            <WarningWrapper className="space-y-4" id="date" invalid={!!isDateError} message="End schedule can't be earlier than or equal to the start schedule">
                                <InputGroup>
                                    <CalendarPopup label="Commences" name="startDate" icon={CalIcon} value={formValues.startDate} timeValue={formValues.startTime} onUpdate={(date, time) => setFormValues((prev) => ({ ...prev, startDate: date, startTime: time }))} />
                                    <CalendarPopup label="Concludes" name="endDate" icon={Clock} value={formValues.endDate} timeValue={formValues.endTime} onUpdate={(date, time) => setFormValues((prev) => ({ ...prev, endDate: date, endTime: time }))} />
                                </InputGroup>
                            </WarningWrapper>
                        </InputGroup>
                    </section>

                    <section className="space-y-4 border-t pt-8 dark:border-white/5">
                        <TextAreaField id="description" label="Vision & Goals" name="description" defaultValue={event?.description || ""} placeholder="Describe the atmosphere, objectives, and key requirements..." />
                    </section>

                    <footer className="flex items-center justify-end gap-4 pt-4">
                        <Button disabled={loading} type="submit" size="lg" className="group rounded-full px-8 transition-all hover:scale-105 active:scale-95">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : isUpdate ? <CheckCircle2 className="size-4" /> : <Sparkles className="size-4" />}
                            {isUpdate ? "Save Changes" : "Create Event"}
                        </Button>
                    </footer>
                </form>
            </Card>
        </main>
    );
}

function InputGroup({ children }: { children: ReactNode }) {
    return <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</FieldGroup>;
}
