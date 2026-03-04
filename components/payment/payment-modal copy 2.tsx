"use client";
import { SyntheticEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Info, Loader2, Edit2 } from "lucide-react";
import { FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { Event, Payment } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import addPayment from "@/server/payments/add-payment";
import updatePayment from "@/server/payments/update-payment"; // You'll need this server action
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProp {
    event?: Event;
    events: Event[];
    eventVendors: PopulatedEventVendor[];
    payment?: Payment;
}

export function PaymentModal({ event, events, eventVendors, payment }: ModalProp) {
    const isEditMode = !!payment;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState<"Client" | "Vendor">(payment?.type || "Client");

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        // Validation
        const amount = Number(payload.amount);
        if (isNaN(amount) || amount <= 0) {
            setLoading(false);
            return toast.error("Please enter a valid amount");
        }

        const data = {
            type,
            amount,
            dueDate: new Date(`${payload.dueDate}T00:00`),
            eventId: event ? event.id : String(payload.eventId),
            eventVendorId: type === "Vendor" ? String(payload.vendorId) : null,
            description: String(payload.description) || null,
        };

        const action = isEditMode ? updatePayment({ id: payment?.id, ...data }) : addPayment(data);

        toast.promise(action, {
            loading: isEditMode ? "Updating transaction..." : "Recording transaction...",
            success: (res) => {
                if (res && "error" in res) throw new Error(res.error);
                setOpen(false);
                return isEditMode ? "Payment Updated" : "Payment Recorded";
            },
            error: (err) => err.message || "Something went wrong",
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditMode ? (
                    <Button variant="ghost" size="icon" className="size-8">
                        <Edit2 className="size-4" />
                    </Button>
                ) : (
                    <Button>
                        <Plus className="size-4" /> Record Payment
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Transaction" : "Record Transaction"}</DialogTitle>
                        <DialogDescription>{isEditMode ? "Update the details of this transaction." : event ? `Recording a payment for ${event.title}` : "Enter payment details below."}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Lock type selection in Edit Mode to prevent data orphans */}
                        <Tabs value={type} onValueChange={(v) => setType(v as "Client" | "Vendor")}>
                            <TabsList className={cn("grid w-full grid-cols-2", isEditMode && "pointer-events-none opacity-50")}>
                                <TabsTrigger value="Client">Inbound (Client)</TabsTrigger>
                                <TabsTrigger value="Vendor">Outbound (Vendor)</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="grid gap-4">
                            {/* Layout Logic */}
                            <FieldGroup className={cn("grid gap-4", event && type !== "Vendor" ? "hidden" : "grid", !event && type === "Vendor" ? "grid-cols-2" : "grid-cols-1")}>
                                {!event && (
                                    <div id="eventId" className="grid gap-2">
                                        <Label htmlFor="event">Event</Label>
                                        <Select name="eventId" defaultValue={payment?.eventId}>
                                            <SelectTrigger id="event">
                                                <SelectValue placeholder="Select event" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {events.map((e) => (
                                                    <SelectItem key={e.id} value={e.id}>
                                                        {e.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {type === "Vendor" && (
                                    <div id="vendorId" className="grid gap-2">
                                        <Label htmlFor="vendor">Pay to Vendor</Label>
                                        <Select name="vendorId" defaultValue={payment?.eventVendorId || undefined}>
                                            <SelectTrigger id="vendor">
                                                <SelectValue placeholder="Choose vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eventVendors.length === 0 ? (
                                                    <SelectItem value="none" disabled className="italic">
                                                        No vendors linked
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
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={payment?.amount} placeholder="0.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate">Date</Label>
                                    <Input id="dueDate" name="dueDate" type="date" defaultValue={payment?.dueDate ? new Date(payment.dueDate).toISOString().split("T")[0] : ""} />
                                </div>
                            </FieldGroup>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" name="description" defaultValue={payment?.description || ""} placeholder="e.g. Initial Deposit" />
                            </div>
                        </div>

                        <div className="bg-muted flex items-center gap-2 rounded-lg p-3 text-xs">
                            <Info className="text-primary size-4 shrink-0" />
                            <p className="text-muted-foreground">{type === "Client" ? "Increases event's Cash on Hand." : "Deducted from funds and credited to vendor."}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : `Post ${type} Payment`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
