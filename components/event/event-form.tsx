"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { formatDateForInput, formatTimeForInput } from "@/helper/helper-functions";
import createEvent from "@/server/events/create-event";
import updateEvent from "@/server/events/update-event";
import { Event } from "@prisma/client";
import { Copy, User, MapPin, DollarSign, Mail, Loader2, LucideProps, FileText, Sparkles, AlertCircle, Clock, Calendar as CalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, ForwardRefExoticComponent, ReactNode, RefAttributes, SyntheticEvent, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export default function EventForm({ event }: { event?: Event }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isUpdate = !!event;

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

    const calculateProgress = useCallback((formData: FormData) => {
        const requiredFields = ["title", "clientName", "budget", "location", "startDate", "startTime", "endDate", "endTime"];

        let filledCount = 0;

        requiredFields.forEach((field) => {
            const value = formData.get(field);

            if (field === "budget" && Number(value) > 0) filledCount++;
            else if (value && String(value).trim() !== "") filledCount++;
        });

        if (String(formData.get("description")).trim().length > 0) filledCount++;
        if (String(formData.get("clientEmail")).trim().length > 0) filledCount++;

        setCompletion(filledCount * 10);
    }, []);

    useEffect(() => {
        if (isUpdate) setCompletion(100);
    }, [isUpdate]);

    const handleFormChange = (e: SyntheticEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        calculateProgress(formData);
    };

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const scrollTargets: string[] = [];

        const fieldLabels: Record<string, string> = { title: "Title", clientName: "Client", location: "Location", budget: "Budget", startDate: "Start Date", startTime: "Start Time", endDate: "End Date", endTime: "End Time" };

        Object.keys(fieldLabels).forEach((key) => {
            const value = formData.get(key);
            if (!value || String(value).trim() === "") {
                validationErrors.push(`${fieldLabels[key]} is required`);
                if (!scrollTargets.includes(key)) scrollTargets.push(key);
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
            startDate: new Date(`${payload.startDate}T${payload.startTime}`),
            endDate: new Date(`${payload.endDate}T${payload.endTime}`),
            budget: Number(payload.budget),
            location: String(payload.location).trim(),
        };

        const action = isUpdate ? updateEvent({ ...data, id: event!.id }) : createEvent(data);

        await toast.promise(action, {
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

    const handleCopy = () => {
        if (!event?.clientEmail) return;
        navigator.clipboard.writeText(event.clientEmail);
        toast.success("Email copied");
    };

    const handleBudgetChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        setFormValues((prev) => ({ ...prev, budget: Number(e.target.value) }));
    };

    return (
        <div className="mx-auto max-w-3xl flex-1 p-12">
            <header className="mb-6 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="bg-foreground h-1 w-8 rounded-full" />
                    <p className="text-xs font-black tracking-wide text-zinc-500 uppercase">{isUpdate ? "Edit Event" : "Create New Event"}</p>
                </div>
                <h2 className="text-4xl font-extrabold">{isUpdate ? "Refine the Details" : "Start With the Essentials"}</h2>
                <p className="text-muted-foreground">{isUpdate ? "Update your event's core information. Changes reflect everywhere." : "Define the core details. Managing vendors and budgets starts here."}</p>
            </header>

            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-accent-foreground">Profile Completion</span>
                    <span className={completion === 100 ? "text-emerald-500" : ""}>{completion}%</span>
                </div>
                <Progress value={completion} className={completion === 100 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary"} />
            </div>

            <form onChange={handleFormChange} onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField id="title" label="Event Title" icon={FileText} name="title" defaultValue={event?.title} placeholder="e.g. Annual Leadership Summit" />
                    <InputField id="clientName" label="Client / Organization" icon={User} name="clientName" defaultValue={event?.clientName} placeholder="e.g. Acme Corp" />
                </FieldGroup>

                <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField id="clientEmail" name="clientEmail" label="Email (optional)" icon={Mail} defaultValue={event?.clientEmail || ""} placeholder="client@example.com" type="email" toCopy onClick={handleCopy} />
                    <InputField id="location" label="Venue or Location" icon={MapPin} name="location" placeholder="Physical address or 'Virtual'" defaultValue={event?.location} />
                </FieldGroup>

                <WarningWrapper id="budget" invalid={formValues.budget < 0} message="Budget can't be negative">
                    <InputField id="budget" label="Estimated Budget" icon={DollarSign} name="budget" type="number" defaultValue={event?.budget} placeholder="e.g. 15000" onChange={handleBudgetChange} formValues={formValues} />
                </WarningWrapper>

                <WarningWrapper id="date" invalid={!!isDateError} message="Ending schedule cannot be before or same as starting schedule.">
                    <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <InputField id="startDate" label="Start Date" icon={CalIcon} name="startDate" type="date" defaultValue={formValues.startDate} onChange={(e) => setFormValues((prev) => ({ ...prev, startDate: e.target.value }))} />
                        <InputField id="startTime" label="Start Time" icon={Clock} name="startTime" type="time" defaultValue={event ? formatTimeForInput(event.startDate) : ""} onChange={(e) => setFormValues((prev) => ({ ...prev, startTime: e.target.value }))} />
                    </FieldGroup>

                    <FieldGroup className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <InputField id="endDate" label="End Date" icon={CalIcon} name="endDate" type="date" defaultValue={formValues.endDate} onChange={(e) => setFormValues((prev) => ({ ...prev, endDate: e.target.value }))} />
                        <InputField id="endTime" label="Ending Time" icon={Clock} name="endTime" type="time" defaultValue={event ? formatTimeForInput(event.endDate) : ""} onChange={(e) => setFormValues((prev) => ({ ...prev, endTime: e.target.value }))} />
                    </FieldGroup>
                </WarningWrapper>

                <TextAreaField id="description" label="Event Description (optional)" name="description" defaultValue={event?.description || ""} placeholder="Vision and goals..." />

                <footer className="mt-8 flex items-center justify-end gap-4">
                    {isUpdate && (
                        <Button disabled={loading} variant="outline" type="button" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    )}
                    <Button disabled={loading} size="lg" className={isUpdate ? "" : "w-full"}>
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        {isUpdate ? "Save Changes" : "Create Event"}
                    </Button>
                </footer>
            </form>
        </div>
    );
}

interface InputProp {
    label: string;
    id: string;
    name: string;
    type?: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    placeholder?: string;
    defaultValue?: string | number;
    onChange?: (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
    toCopy?: boolean;
    onClick?: () => void;
    formValues?: Record<string, string | number>;
}

function InputField({ label, id, name, type = "text", icon: Icon, defaultValue, placeholder, onChange, toCopy, onClick, formValues }: InputProp) {
    const isHighBudget = id === "budget" && formValues && Number(formValues.budget) > 100000;
    return (
        <Field id={id} className="gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>
                <span className={`${isHighBudget ? "block" : "invisible"} text-ss flex items-center gap-1 font-medium tracking-wider text-amber-500 uppercase`}>
                    <Sparkles className="size-3" /> High Budget Event
                </span>
            </div>

            <div className="relative">
                <Icon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500" />
                <Input name={name} defaultValue={defaultValue} className={toCopy ? "px-10" : "pl-10"} type={type} id={id} placeholder={placeholder} onChange={onChange} />
                {toCopy && defaultValue && <Copy onClick={onClick} className="absolute top-1/2 right-4 size-4 -translate-y-1/2 cursor-pointer text-zinc-500" />}
            </div>
        </Field>
    );
}

function TextAreaField({ label, id, name, defaultValue, placeholder }: Omit<InputProp, "icon" | "type">) {
    return (
        <Field className="gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Textarea name={name} defaultValue={defaultValue} placeholder={placeholder} className="min-h-32 resize-none p-4" id={id} />
        </Field>
    );
}

function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor: string; className?: string }) {
    return (
        <UILabel className={`font-semibold ${className}`} htmlFor={htmlFor}>
            {children}
        </UILabel>
    );
}

interface Wrapper {
    invalid: boolean;
    message: string;
    children: ReactNode;
}

function WarningWrapper({ invalid, children, message, id }: Wrapper & { id?: string }) {
    return (
        <div id={id} className={`rounded-r-xl border-l-2 transition-all duration-300 ${invalid ? "border-destructive animate-shake bg-destructive/5 p-4" : "border-transparent p-0"}`}>
            {children}
            {invalid && (
                <p className="text-destructive mt-3 flex items-center gap-2 text-xs font-medium">
                    <AlertCircle className="size-3" /> {message}
                </p>
            )}
        </div>
    );
}
