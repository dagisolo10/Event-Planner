"use client";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SyntheticEvent, useState } from "react";
import { Field, FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { Event, GlobalVendor } from "@prisma/client";
import linkVendorToEvent from "@/server/vendors/event/link-vendor-to-event";
import { PopulatedEventVendor } from "@/types/vendor";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

interface GlobalVendorAddProps {
    events: Event[];
    globalVendor: GlobalVendor | null;
    eventVendors: PopulatedEventVendor[];
    open: boolean;
    setOpen: (val: boolean) => void;
}

export default function LinkGlobalVendorToEvent({ open, setOpen, globalVendor, events, eventVendors }: GlobalVendorAddProps) {
    const router = useRouter();
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(query.toLowerCase()) || event.id.toLowerCase().includes(query.toLowerCase()));
    const selectedEventObj = events.find((e) => e.id === selectedEventId);

    const handleAddVendorToEvent = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];
        const fieldLabels: Record<string, string> = { cost: "Contract", deposit: "Deposit", dueDate: "Due Date" };
        if (!selectedEventId) {
            validationErrors.unshift("You must select an event from the list.");
            shakeTargets.unshift("eventId");
        }

        if (Number(payload.cost) < 0) {
            validationErrors.push("Please enter a valid contract amount (0 or greater).");
            if (!shakeTargets.includes("cost")) shakeTargets.push("cost");
        }

        if (Number(payload.deposit) < 0) {
            validationErrors.push("Please enter a valid deposit amount (0 or greater).");
            if (!shakeTargets.includes("deposit")) shakeTargets.push("deposit");
        }

        if (Number(payload.deposit) > Number(payload.cost)) {
            validationErrors.push("Deposit cannot exceed the total contract amount.");
            if (!shakeTargets.includes("deposit")) shakeTargets.push("deposit");
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
                        element.classList.toggle("animate-shake");
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
            eventId: selectedEventId || "",
            globalVendorId: globalVendor?.id || "",
            cost: Number(payload.cost),
            deposit: Number(payload.deposit),
            dueDate: new Date(`${payload.dueDate}T00:00`),
        };

        await toast.promise(linkVendorToEvent(data), {
            loading: `Assigning ${globalVendor?.name} to ${selectedEventObj?.title}...`,
            success: (data) => {
                if ("error" in data) throw new Error(data.error);

                router.push(`/dashboard/events/${selectedEventId}/vendors`);
                return `${globalVendor?.name} is assigned to ${selectedEventObj?.title}`;
            },
            error: (err) => err.message || "Failed to link vendor to event",
            finally: () => {
                setOpen(false);
                setLoading(false);
                setSelectedEventId(null);
            },
        });
    };

    const handleOnSelect = (id: string) => {
        setSelectedEventId(id);
        setPopoverOpen(false);
        setQuery("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add {globalVendor?.name} to Event</DialogTitle>
                    <DialogDescription>Select an event from the list below to add this vendor to.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddVendorToEvent}>
                    <div className="grid gap-6 py-4">
                        <div id="eventId" className="grid gap-2">
                            <Label>Select Event from Events List</Label>

                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="justify-between font-normal">
                                        {selectedEventObj ? `${selectedEventObj.title} (${selectedEventObj.location})` : "Search events..."}
                                        <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-94 p-0" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandInput value={query} onValueChange={setQuery} placeholder="Type event title or ID..." />

                                        <CommandList className="scrollbar-thin max-h-64 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                                            <CommandEmpty>No event found.</CommandEmpty>

                                            <CommandGroup>
                                                {filteredEvents.map((event) => {
                                                    const isAlreadyHired = eventVendors.some((vendor) => vendor.globalVendorId === globalVendor?.id && vendor.eventId === event.id);
                                                    return (
                                                        <CommandItem key={event.id} value={event.id} onSelect={() => handleOnSelect(event.id)} disabled={isAlreadyHired}>
                                                            <Check className={`mr-2 size-4 ${selectedEventId === event.id ? "opacity-100" : "opacity-0"}`} />
                                                            <div className="flex w-full items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span>{event.title}</span>
                                                                    <span className="text-muted-foreground text-xs">{event.location}</span>
                                                                </div>
                                                                {isAlreadyHired && <Badge>Already Assigned</Badge>}
                                                            </div>
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field id="cost" className="grid gap-2">
                                <Label htmlFor="cost">Signed Contract Amount</Label>
                                <Input name="cost" id="cost" type="number" placeholder="0.00" />
                            </Field>

                            <Field id="deposit" className="grid gap-2">
                                <Label htmlFor="deposit">Deposit Paid</Label>
                                <Input name="deposit" id="deposit" type="number" placeholder="0.00" />
                            </Field>
                        </FieldGroup>

                        <Field id="dueDate" className="grid gap-2">
                            <Label htmlFor="dueDate">Payment Due Date</Label>
                            <Input name="dueDate" id="dueDate" type="date" />
                        </Field>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={loading}>
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            Assign to Event
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
