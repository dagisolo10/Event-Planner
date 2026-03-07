"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SyntheticEvent, useState } from "react";
import { Field } from "../ui/field";
import { toast } from "sonner";
import { PopulatedEventVendor } from "@/types/vendor";
import updateEventVendor from "@/server/vendors/event/update-event-vendor";

interface EditProp {
    vendor: PopulatedEventVendor;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function UpdateEventVendor({ vendor, open, setOpen }: EditProp) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleEdit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];
        const fieldLabels: Record<string, string> = { cost: "Total Contract Value", dueDate: "Final Payment Deadline" };

        if (Number(payload.cost) < 0) {
            validationErrors.push("Total contract value cannot be negative");
            if (!shakeTargets.includes("cost")) shakeTargets.push("cost");
        }

        Object.keys(fieldLabels).forEach((key) => {
            const value = formData.get(key);
            if (!value || String(value).trim() === "") {
                validationErrors.push(`${fieldLabels[key]} is required`);
                if (!shakeTargets.includes(key)) shakeTargets.push(key);
            }
        });

        if (validationErrors.length > 0) {
            setLoading(false);

            shakeTargets
                .map((id) => document.getElementById(id))
                .forEach((element) => {
                    if (element) {
                        element.classList.add("animate-shake");
                        setTimeout(() => element.classList.remove("animate-shake"), 500);
                    }
                });

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
            id: vendor.id,
            eventId: vendor.eventId,
            cost: Number(payload.cost),
            dueDate: new Date(`${payload.dueDate}T00:00`),
        };

        toast.promise(updateEventVendor(data), {
            loading: "Updating vendor...",
            success: (data) => {
                if ("error" in data) throw new Error(data.error);
                setOpen(false);
                return { message: "Contract Updated", description: `Terms for ${vendor.globalVendor.name} have been saved.` };
            },
            error: (err) => err.message || "Failed to update",
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="gap-1 sm:max-w-md">
                <DialogHeader className="relative border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="absolute top-0 -left-6 h-full w-1 bg-amber-500" />
                    <div className="space-y-1">
                        <DialogTitle className="space-x-1 text-xl font-black tracking-tight uppercase">
                            <span className="text-accent-foreground">Modify /</span>
                            <span className="text-amber-600 dark:text-amber-400">Contract Terms</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Current Vendor: <span className="text-zinc-900 dark:text-zinc-200">{vendor.globalVendor.name}</span>
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleEdit}>
                    <div className="grid gap-4 py-4">
                        <Field id="cost" className="grid gap-2">
                            <Label htmlFor="cost">Total Contract Value</Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500">$</span>
                                <Input name="cost" id="cost" defaultValue={vendor.cost} type="number" className="pl-6" placeholder="0.00" />
                            </div>
                        </Field>

                        <Field id="dueDate" className="grid gap-2">
                            <Label htmlFor="dueDate">Final Payment Due Date</Label>
                            <Input name="dueDate" id="dueDate" defaultValue={vendor.dueDate.toISOString().split("T")[0]} type="date" />
                        </Field>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button disabled={loading} variant="ghost" className="bg-amber-600 hover:bg-amber-600/50!">
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
