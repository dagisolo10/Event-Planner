"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import deleteEvent from "@/server/events/delete-event";
import deleteTask from "@/server/tasks/delete-task";
import unlinkVendor from "@/server/vendors/event/unlink-vendor";
import deleteGlobalVendor from "@/server/vendors/global/archive-global-vendor";
import bulkUnlinkVendors from "@/server/vendors/event/bulk-vendor-unlink";
import deletePayment from "@/server/payments/delete-payment";

type DeleteType = "event" | "task" | "vendor-unlink" | "global-vendor" | "bulk-vendor-unlink" | "payment";

const DELETE_CONFIG = {
    event: (name: string) => ({
        title: `Delete Event: ${name}?`,
        description: "This is a permanent action. You will lose all recorded payments, task progress, and vendor contracts associated with it.",
        actionText: "Confirm Delete",
        loadingText: "Deleting event...",
        successText: `${name} has been removed.`,
    }),
    task: (name: string) => ({
        title: "Delete Task?",
        description: `This will permanently delete the task "${name}". This action cannot be undone and will remove it from all calendars and reports.`,
        actionText: "Delete Task",
        loadingText: "Deleting task...",
        successText: `Task "${name}" deleted.`,
    }),
    payment: (name: string) => ({
        title: `Void ${name} Payment?`,
        description: `This will permanently void this ${name} transaction. The record will be marked as cancelled and removed from active financial processing.`,
        actionText: "Void Payment",
        loadingText: "Processing void...",
        successText: `${name} payment has been voided successfully.`,
    }),
    "vendor-unlink": (name: string, extra?: string) => ({
        title: `Remove ${name} from ${extra}?`,
        description: "This action cannot be undone. All recorded payments and financial data associated with this vendor link will be permanently deleted.",
        actionText: "Confirm Remove",
        loadingText: `Removing ${name}...`,
        successText: `${name} unlinked from event.`,
    }),
    "global-vendor": (name: string) => ({
        title: `Archive ${name}?`,
        description: `${name} will be hidden from your master list and cannot be added to new events. However, all existing event records and payments will remain intact.`,
        actionText: "Archive Vendor",
        loadingText: "Archiving...",
        successText: `${name} has been archived.`,
    }),
    "bulk-vendor-unlink": (count: string) => ({
        title: "Remove Selected Vendors?",
        description: `This will remove ${count} vendors from this event and delete all their associated payment records. This cannot be undone.`,
        actionText: "Confirm Bulk Remove",
        loadingText: `Removing ${count} vendors...`,
        successText: `Successfully removed ${count} vendors.`,
    }),
};

interface UniversalDeleteProps {
    type: DeleteType;
    id: string | string[];
    name: string;
    eventId?: string;
    extra?: string;
    onComplete?: () => void;
}

export default function UniversalDeleteDialog({ type, id, name, eventId, extra, onComplete }: UniversalDeleteProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const config = DELETE_CONFIG[type](name, extra);

    async function handleConfirm() {
        setLoading(true);

        const actionMap = {
            event: () => deleteEvent(id as string),
            task: () => deleteTask(id as string, eventId!),
            payment: () => deletePayment(id as string, eventId as string),
            "vendor-unlink": () => unlinkVendor(id as string, eventId!),
            "global-vendor": () => deleteGlobalVendor(id as string),
            "bulk-vendor-unlink": () => bulkUnlinkVendors(id as string[], eventId!),
        };

        const selectedAction = actionMap[type];

        toast.promise(selectedAction() as Promise<unknown>, {
            loading: config.loadingText,
            success: (res) => {
                if (res && typeof res === "object" && "error" in res) throw new Error((res as { error: string }).error);

                if (type === "event") router.push("/dashboard/events");
                if (type === "global-vendor") router.refresh();
                if (onComplete) onComplete();

                return config.successText;
            },
            error: (err) => err.message || "Something went wrong",
            finally: () => setLoading(false),
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                    <Trash2 className="size-4" />
                    {type === "bulk-vendor-unlink" ? `Remove (${id.length})` : "Delete"}
                </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">{config.title}</AlertDialogTitle>
                    <AlertDialogDescription>{config.description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={loading}
                        variant="destructive"
                    >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        {config.actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
