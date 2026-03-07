"use client";
import { SyntheticEvent, useState } from "react";
import { Plus, Calendar as CalendarIcon, User2, Loader2, ClipboardList, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Priority, TaskStatus, Task } from "@prisma/client";
import createTask from "@/server/tasks/create-task";
import updateTask from "@/server/tasks/update-task";
import { formatDateForInput } from "@/helper/helper-functions";

interface TaskSheetProps {
    eventId: string;
    task?: Task;
    open?: boolean;
    setOpen?: (open: boolean) => void;
}

export function TaskSheet({ eventId, task, open: controlledOpen, setOpen: setControlledOpen }: TaskSheetProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;
    const isEditMode = !!task;

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData);

        const validationErrors: string[] = [];
        const scrollTargets: string[] = [];
        const fieldLabels: Record<string, string> = { title: "Task Title", status: "Status", dueDate: "Due Date", priority: "Priority" };

        Object.keys(fieldLabels).forEach((key) => {
            const value = formData.get(key);
            if (String(value).trim() === "" || !value) {
                validationErrors.push(`${fieldLabels[key]} is required`);
                if (!scrollTargets.includes(key)) scrollTargets.push(key);
            }
        });

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
            eventId,
            title: String(payload.title).trim(),
            description: (payload.description as string)?.trim() || null,
            assignedTo: (payload.assignedTo as string)?.trim() || null,
            status: payload.status as TaskStatus,
            dueDate: new Date(String(payload.dueDate)),
            priority: payload.priority as Priority,
        };

        const action = isEditMode ? updateTask({ id: task.id, ...data }) : createTask(data);

        toast.promise(action, {
            loading: isEditMode ? "Updating task..." : "Creating task...",
            success: (res) => {
                if ("error" in res) throw new Error(res.error);
                router.refresh();
                setIsOpen(false);
                return isEditMode ? "Task updated!" : "Task created successfully!";
            },
            error: (err) => err.message || "Something went wrong",
            finally: () => setLoading(false),
        });
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {!isEditMode && (
                <SheetTrigger asChild>
                    <Button className="group relative flex items-center gap-2 overflow-hidden bg-zinc-900 px-4 py-2 font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                        <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span>New Action</span>
                        <span className="via-background/20 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    </Button>
                </SheetTrigger>
            )}

            <SheetContent className="overflow-y-auto border-none p-8 sm:max-w-lg">
                <SheetHeader className="space-y-2 p-0 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-foreground text-background flex size-7 items-center justify-center rounded-full">
                            <Zap className="size-4 fill-current" />
                        </div>
                        <span className="text-muted-foreground text-[10px] font-bold tracking-[0.3em] uppercase">System / Task / {isEditMode ? "Edit" : "Create"}</span>
                    </div>
                    <SheetTitle className="text-4xl font-black tracking-tight uppercase">{isEditMode ? "Revise" : "Launch"}</SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs font-medium">{isEditMode ? "Adjusting parameters for active event nodes." : "Initializing new objective for the current sequence."}</SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FieldGroup>
                        <Field id="title">
                            <Label htmlFor="title">Objective Title</Label>
                            <div className="relative">
                                <ClipboardList className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    name="title"
                                    id="title"
                                    defaultValue={task?.title}
                                    placeholder="What needs to be done?"
                                    className="h-9 rounded-none border-0 border-b bg-transparent pl-9 text-sm focus-visible:border-zinc-800 focus-visible:ring-0 dark:border-zinc-800 dark:focus-visible:border-white"
                                />
                            </div>
                        </Field>

                        <Field id="assignedTo">
                            <Label htmlFor="assignedTo">Assign To</Label>
                            <div className="relative">
                                <User2 className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    name="assignedTo"
                                    id="assignedTo"
                                    defaultValue={task?.assignedTo || ""}
                                    placeholder="Operator"
                                    className="h-9 rounded-none border-0 border-b bg-transparent pl-9 text-sm focus-visible:border-zinc-800 focus-visible:ring-0 dark:border-zinc-800 dark:focus-visible:border-white"
                                />
                            </div>
                        </Field>

                        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Field id="status">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={task?.status}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field id="priority">
                                <Label>Priority</Label>
                                <Select name="priority" defaultValue={task?.priority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Priority Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="text-rose-600" value="Urgent">
                                            Urgent
                                        </SelectItem>
                                        <SelectItem className="text-orange-500" value="High">
                                            High
                                        </SelectItem>
                                        <SelectItem className="text-amber-500" value="Medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem className="text-blue-600" value="Low">
                                            Low
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>

                        <Field id="dueDate">
                            <Label htmlFor="dueDate">Deadline</Label>
                            <div className="relative">
                                <CalendarIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    name="dueDate"
                                    id="dueDate"
                                    type="date"
                                    defaultValue={task?.dueDate && formatDateForInput(task.dueDate)}
                                    className="h-9 rounded-none border-0 border-b bg-transparent pl-9 text-sm focus-visible:border-zinc-800 focus-visible:ring-0 dark:border-zinc-800 dark:focus-visible:border-white"
                                />
                            </div>
                        </Field>

                        <Field id="description">
                            <Label htmlFor="description">Description</Label>
                            <Textarea name="description" id="description" defaultValue={task?.description || ""} placeholder="Add details..." className="min-h-25 resize-none focus-visible:border-zinc-800 dark:focus-visible:border-white" />
                        </Field>

                        <SheetFooter className="mt-2 p-0">
                            <Button disabled={loading} className="text-background bg-foreground w-full transition-all hover:bg-zinc-800 active:scale-95 dark:hover:bg-zinc-200">
                                {loading && <Loader2 className="size-4 animate-spin" />}
                                {isEditMode ? "Save Changes" : "Create Task"}
                            </Button>
                        </SheetFooter>
                    </FieldGroup>
                </form>
            </SheetContent>
        </Sheet>
    );
}
