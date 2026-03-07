"use client";
import { Building2, Globe, Loader2, Mail, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SyntheticEvent, useState } from "react";
import { Field, FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { GlobalVendor } from "@prisma/client";
import updateGlobalVendor from "@/server/vendors/global/update-global-vendor";

interface EditProp {
    globalVendor: GlobalVendor;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function UpdateGlobalVendor({ globalVendor, open, setOpen }: EditProp) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleEdit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const shakeTargets: string[] = [];
        const fieldLabels: Record<string, string> = { name: "Vendor Name", category: "Category" };

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
            id: globalVendor.id,
            name: String(payload.name).trim(),
            category: String(payload.category).trim(),
            website: (payload.website as string).trim() || null,
            contact: (payload.contact as string).trim() || null,
            email: (payload.email as string).trim() || null,
        };

        toast.promise(updateGlobalVendor(data), {
            loading: "Updating global vendor...",
            success: (data) => {
                if ("error" in data) throw new Error(data.error);
                setOpen(false);
                return {
                    message: "Changes Saved",
                    description: `Master details for ${data.globalVendor.name} have been updated successfully.`,
                };
            },
            error: (err) => err.message || "Could not update vendor",
            finally: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleEdit}>
                    <DialogHeader className="relative border-b border-zinc-100 pb-4 dark:border-zinc-800">
                        <div className="absolute top-0 -left-6 h-full w-1 bg-amber-500" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">Master Directory</span>
                            <DialogTitle className="space-x-1 text-xl font-black tracking-tight uppercase">
                                {/* Modify / <span className="text-zinc-600 dark:text-zinc-300">Partner Profile</span> */}
                                <span className="text-accent-foreground">Modify /</span>
                                <span className="text-amber-600 dark:text-amber-400">Partner Profile</span>
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-[13px] leading-relaxed font-medium">
                                Updating core identity for <strong className="text-foreground">{globalVendor.name}</strong>. These changes will reflect across all associated events.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <FieldGroup className="grid gap-5 py-6">
                        <Field id="name" className="grid gap-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Building2 className="text-muted-foreground size-3.5" />
                                Company Name
                            </Label>
                            <Input id="name" name="name" defaultValue={globalVendor.name} placeholder="Starlight Catering" />
                        </Field>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field id="category" className="grid gap-2">
                                <Label htmlFor="category" className="flex items-center gap-2">
                                    <Tag className="text-muted-foreground size-3.5" /> Category
                                </Label>
                                <Input id="category" name="category" defaultValue={globalVendor.category} placeholder="Catering" />
                            </Field>

                            <Field className="grid gap-2">
                                <Label htmlFor="contact" className="flex items-center gap-2">
                                    <User className="text-muted-foreground size-3.5" /> Point of Contact
                                </Label>
                                <Input id="contact" name="contact" defaultValue={globalVendor.contact || ""} placeholder="Marcus Throne" />
                            </Field>
                        </FieldGroup>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field className="grid gap-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="text-muted-foreground size-3.5" /> Business Email
                                </Label>
                                <Input id="email" name="email" type="email" defaultValue={globalVendor.email || ""} placeholder="hello@vendor.com" />
                            </Field>

                            <Field className="grid gap-2">
                                <Label htmlFor="website" className="flex items-center gap-2">
                                    <Globe className="text-muted-foreground size-3.5" /> Website
                                </Label>
                                <Input id="website" name="website" type="url" defaultValue={globalVendor.website || ""} placeholder="https://vendor.com" />
                            </Field>
                        </FieldGroup>
                    </FieldGroup>

                    <div className="flex justify-end gap-3">
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
