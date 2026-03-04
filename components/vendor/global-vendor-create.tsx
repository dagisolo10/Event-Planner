"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Mail, User, Tag, Building2, Loader2, Plus } from "lucide-react";
import { SyntheticEvent, useState } from "react";
import { Field, FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { GlobalVendor } from "@prisma/client";
import createGlobalVendor from "@/server/vendors/global/create-global-vendor";

interface Props {
    onVendorCreated?: (vendor: GlobalVendor) => void;
}

export function CreateGlobalVendor({ onVendorCreated }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];

        const fieldLabels: Record<string, string> = { name: "Name", category: "Category" };

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
            name: String(payload.name).trim(),
            category: String(payload.category).trim(),
            contact: String(payload.contact).trim() || null,
            email: String(payload.email).trim() || null,
            website: String(payload.website).trim() || null,
        };

        const result = toast.promise(createGlobalVendor(data), {
            loading: "Creating master vendor profile...",
            success: (res) => {
                if ("error" in res) throw new Error(res.error);
                setOpen(false);
                return { message: "Partner Added", description: `${res.globalVendor.name} is now available in your master vendor list.` };
            },
            error: (err) => err.message || "Failed to create vendor",
            finally: () => setLoading(false),
        });

        if (result && "globalVendor" in result) onVendorCreated?.(result.globalVendor as GlobalVendor);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="size-4" />
                    Create new global vendor
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl">New Global Vendor</DialogTitle>
                        <DialogDescription>Add a new partner to your master list. They will be available for all future events.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="grid gap-5 py-6">
                        <Field id="name" className="grid gap-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Building2 className="text-muted-foreground size-3.5" /> Name
                            </Label>
                            <Input id="name" name="name" placeholder="Starlight Catering" />
                        </Field>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field id="category" className="grid gap-2">
                                <Label htmlFor="category" className="flex items-center gap-2">
                                    <Tag className="text-muted-foreground size-3.5" /> Category
                                </Label>
                                <Input id="category" name="category" placeholder="Catering" />
                            </Field>

                            <Field className="grid gap-2">
                                <Label htmlFor="contact" className="flex items-center gap-2">
                                    <User className="text-muted-foreground size-3.5" /> Contact
                                </Label>
                                <Input id="contact" name="contact" placeholder="Marcus Throne" />
                            </Field>
                        </FieldGroup>

                        <Field className="grid gap-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="text-muted-foreground size-3.5" /> Email Address
                            </Label>
                            <Input id="email" name="email" type="email" placeholder="hello@vendor.com" />
                        </Field>

                        <Field className="grid gap-2">
                            <Label htmlFor="website" className="flex items-center gap-2">
                                <Globe className="text-muted-foreground size-3.5" /> Website
                            </Label>
                            <Input id="website" name="website" type="url" placeholder="https://vendor.com" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="gap-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={loading} className="px-8">
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Create Vendor
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
