"use client";
import { SyntheticEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Info, Loader2 } from "lucide-react";
import { Field, FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { Event } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import addPayment from "@/server/payments/add-payment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface ModalProp {
    event?: Event;
    events: Event[];
    eventVendors: PopulatedEventVendor[];
}

export function PaymentModal({ event, events, eventVendors }: ModalProp) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"Client" | "Vendor">("Client");

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];

        const amount = Number(payload.amount);
        if (isNaN(amount) || amount <= 0) {
            validationErrors.push("Please enter a valid payment amount.");
            shakeTargets.push("amount");
        }

        if (!payload.dueDate) {
            validationErrors.push("Due date is required");
            shakeTargets.push("dueDate");
        }

        if (!event && (!payload.eventId || payload.eventId === "undefined")) {
            validationErrors.push("Please select an event");
            shakeTargets.push("eventId");
        }

        if (type === "Vendor" && (!payload.vendorId || payload.vendorId === "undefined")) {
            validationErrors.push("Please select a vendor");
            shakeTargets.push("vendorId");
        }

        if (validationErrors.length > 0) {
            setLoading(false);

            shakeTargets.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add("animate-shake");
                    setTimeout(() => el.classList.remove("animate-shake"), 500);
                }
            });

            return toast.error("Form Validation Failed", {
                description: (
                    <ul className="mt-1 list-disc pl-4 text-xs font-medium">
                        {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                ),
            });
        }

        const data = {
            type,
            amount,
            dueDate: new Date(`${payload.dueDate}T00:00`),
            eventId: event ? event.id : String(payload.eventId),
            eventVendorId: type === "Vendor" ? String(payload.vendorId) : null,
            description: String(payload.description) || null,
        };

        toast.promise(addPayment(data), {
            loading: `Recording ${type.toLowerCase()} transaction...`,
            success: (res) => {
                if (res && "error" in res) throw new Error(res.error);

                setOpen(false);
                return {
                    message: "Payment Recorded",
                    description: `${type} payment of $${amount.toLocaleString()} has been logged.`,
                };
            },
            error: (err) => err.message || "Something went wrong",
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" /> Record Payment
                </Button>
            </DialogTrigger>

            <DialogContent className="scrollbar-none max-h-[95vh] overflow-y-auto pr-4 sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight">Record Transaction</DialogTitle>
                        <DialogDescription>{event ? `Recording a payment for ${event.title}` : "Enter the payment details below to record a new transaction."}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Tabs value={type} onValueChange={(v) => setType(v as "Client" | "Vendor")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="Client">Inbound (Client)</TabsTrigger>
                                <TabsTrigger value="Vendor">Outbound (Vendor)</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="grid gap-4">
                            <FieldGroup className={`grid gap-4 ${event && type !== "Vendor" ? "hidden" : event ? "grid-cols-1" : !event && type !== "Vendor" ? "grid-cols-1" : "grid-cols-2"}`}>
                                {!event && (
                                    <div id="eventId" className="grid gap-2">
                                        <Label htmlFor="event">Event</Label>
                                        <Select name="eventId">
                                            <SelectTrigger className="w-full" id="event">
                                                <SelectValue placeholder="Select event" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {events.length === 0 ? (
                                                    <SelectItem value="none" className="text-muted-foreground italic">
                                                        No active events found
                                                    </SelectItem>
                                                ) : (
                                                    events.map((e) => (
                                                        <SelectItem key={e.id} value={e.id}>
                                                            {e.title}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {type === "Vendor" && (
                                    <div id="vendorId" className="grid gap-2">
                                        <Label htmlFor="vendor">Pay to Vendor</Label>
                                        <Select name="vendorId">
                                            <SelectTrigger className="w-full" id="vendor">
                                                <SelectValue placeholder="Choose vendor" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {eventVendors.length === 0 ? (
                                                    <SelectItem value="none" className="text-muted-foreground italic">
                                                        {event ? `No vendors have been linked to ${event.title} yet` : "No vendors available in the master list"}
                                                    </SelectItem>
                                                ) : (
                                                    eventVendors.map((v) => (
                                                        <SelectItem key={v.id} value={v.id}>
                                                            {v.globalVendor.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </FieldGroup>
                            <FieldGroup className="grid grid-cols-2 gap-4">
                                <Field id="amount" className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" />
                                </Field>

                                <Field id="dueDate" className="grid gap-2">
                                    <Label htmlFor="dueDate">Date</Label>
                                    <Input id="dueDate" name="dueDate" type="date" />
                                </Field>
                            </FieldGroup>

                            <Field className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" name="description" placeholder="e.g. Initial Deposit" />
                            </Field>
                        </div>

                        <div className="bg-muted flex items-center gap-2 rounded-lg p-3 text-xs">
                            <Info className="text-primary size-4 shrink-0" />
                            <p className="text-muted-foreground">{type === "Client" ? "This will increase your event's Cash on Hand balance." : "This will be deducted from your event funds and credited to the vendor contract."}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Post {type} Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
