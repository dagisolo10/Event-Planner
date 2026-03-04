"use client";
import { Check, ChevronsUpDown, Loader2, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SyntheticEvent, useState } from "react";
import { Field, FieldGroup } from "../ui/field";
import { CreateGlobalVendor } from "./global-vendor-create";
import { toast } from "sonner";
import { GlobalVendor } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";
import linkVendorToEvent from "@/server/vendors/event/link-vendor-to-event";
import { Badge } from "../ui/badge";

interface Props {
    eventId: string;
    eventTitle: string;
    globalVendors: GlobalVendor[];
    eventVendors: PopulatedEventVendor[];
    mainButton?: boolean;
    open?: boolean;
    setOpen?: (open: boolean) => void;
}

export function LinkVendorForEvent({ eventId, eventTitle, eventVendors, globalVendors, open: propOpen, setOpen: propSetOpen, mainButton }: Props) {
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [internalOpen, setInternalOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

    const filtered = globalVendors.filter((vendor) => vendor.name.toLowerCase().includes(query.toLowerCase()) || vendor.category.toLowerCase().includes(query.toLowerCase()));
    const availableVendors = globalVendors.filter((vendor) => !eventVendors.some((eVendor) => eVendor.globalVendorId === vendor.id));

    const selectedVendorObj = globalVendors.find((vendor) => vendor.id === selectedVendorId);

    const isControlled = propOpen !== undefined && propSetOpen !== undefined; // empty state button
    const isOpen = isControlled ? propOpen : internalOpen;
    const handleOpenChange = (val: boolean) => {
        if (isControlled) propSetOpen(val);
        else setInternalOpen(val);
    };

    const handleAddVendor = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];
        const fieldLabels: Record<string, string> = { cost: "Contract", deposit: "Deposit", dueDate: "Due Date" };

        if (!selectedVendorId) {
            validationErrors.unshift("You must select a vendor from the list.");
            shakeTargets.unshift("vendorId");
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
            eventId,
            globalVendorId: selectedVendorObj?.id || "",
            cost: Number(payload.cost),
            deposit: Number(payload.deposit),
            dueDate: new Date(`${payload.dueDate}T00:00`),
        };

        await toast.promise(linkVendorToEvent(data), {
            loading: `Adding ${selectedVendorObj?.name} to ${eventTitle}...`,
            success: (data) => {
                if ("error" in data) throw new Error(data.error);
                handleOpenChange(false);
                setSelectedVendorId(null);
                return `${data.eventVendor.globalVendor.name} is successfully added to ${data.eventVendor.event.title}`;
            },
            error: (err) => err.message || "Failed to link vendor to event",
            finally: () => setLoading(false),
        });
    };

    const handleOnSelect = (id: string) => {
        setSelectedVendorId(id);
        setPopoverOpen(false);
        setQuery("");
    };

    const handleOnVendorCreated = (newVendor: GlobalVendor) => {
        setSelectedVendorId(newVendor.id);
        setQuery("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {mainButton && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="size-4" /> Add Vendor
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="gap-1 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Vendor to {eventTitle || "Event"}</DialogTitle>
                    <DialogDescription>Select a vendor from the list below to hire them for this event.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddVendor}>
                    <div className="grid gap-6 py-4">
                        <div id="vendorId" className="grid gap-2">
                            <Label>Select Vendor from Master List</Label>

                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" type="button" className="justify-between">
                                        {selectedVendorObj ? `${selectedVendorObj.name} (${selectedVendorObj.category})` : "Search vendors..."}
                                        <ChevronsUpDown className="size-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-100 p-0" align="start">
                                    <Command value="globalVendorId" shouldFilter={false}>
                                        <CommandInput value={query} onValueChange={setQuery} placeholder="Search by name, category..." />

                                        <CommandList className="scrollbar-thin max-h-64 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                                            <CommandEmpty>
                                                <div className="flex flex-col items-center p-4 text-center">
                                                    <SearchX className="size-7 text-zinc-500" />
                                                    <p className="text-muted-foreground mb-4 text-sm">No vendor found.</p>

                                                    <CreateGlobalVendor onVendorCreated={(newVendor) => handleOnVendorCreated(newVendor)} />
                                                </div>
                                            </CommandEmpty>

                                            {query === "" && availableVendors.length === 0 && globalVendors.length > 0 && (
                                                <div className="flex flex-col items-center border-b p-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <p className="mb-1 text-sm font-medium">All vendors are already hired.</p>
                                                    <p className="text-muted-foreground mb-4 text-xs">Need someone else?</p>
                                                    <CreateGlobalVendor onVendorCreated={handleOnVendorCreated} />
                                                </div>
                                            )}

                                            <CommandGroup>
                                                {filtered.map((vendor) => {
                                                    const isAlreadyHired = eventVendors.some((eVendor) => eVendor.globalVendorId === vendor.id);
                                                    return (
                                                        <CommandItem key={vendor.id} value={`${vendor.name} ${vendor.id}`} onSelect={() => handleOnSelect(vendor.id)} disabled={isAlreadyHired}>
                                                            <Check className={`mr-2 size-4 ${selectedVendorId === vendor.id ? "opacity-100" : "opacity-0"}`} />
                                                            <div className="flex w-full items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span>{vendor.name}</span>
                                                                    <span className="text-muted-foreground text-xs">{vendor.category}</span>
                                                                </div>
                                                                {isAlreadyHired && <Badge>Already Hired</Badge>}
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
                                <Input name="cost" id="cost" type="number" step="0.01" placeholder="0.00" />
                            </Field>

                            <Field id="deposit" className="grid gap-2">
                                <Label htmlFor="deposit">Deposit Paid</Label>
                                <Input name="deposit" id="deposit" type="number" step="0.01" placeholder="0.00" />
                            </Field>
                        </FieldGroup>

                        <Field id="dueDate" className="grid gap-2">
                            <Label htmlFor="date">Payment Due Date</Label>
                            <Input name="dueDate" id="dueDate" type="date" />
                        </Field>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>

                        <Button disabled={loading}>
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            Add to Event
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
