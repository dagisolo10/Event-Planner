import { LucideProps, Check, Copy, Sparkles } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, ChangeEvent } from "react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

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
    copying?: boolean;
    onClick?: () => void;
    formValues?: Record<string, string | number>;
}

export function InputField({ label, id, name, type = "text", icon: Icon, defaultValue, placeholder, onChange, formValues, toCopy, onClick, copying }: InputProp) {
    const isHighBudget = id === "budget" && Number(formValues?.budget) > 100000;
    const CopyIcon = copying ? Check : Copy;

    return (
        <Field className="gap-3">
            <div className="flex items-center justify-between px-1">
                <Label htmlFor={id} className="text-muted-foreground text-base font-semibold">
                    {label}
                </Label>
                {isHighBudget && (
                    <span className="flex animate-pulse items-center gap-1 text-[10px] font-black tracking-widest text-amber-500 uppercase">
                        <Sparkles className="size-3" /> Prestige Tier
                    </span>
                )}
            </div>
            <div className="group relative">
                <Icon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 size-4 -translate-y-1/2 transition-colors" />
                <Input name={name} defaultValue={defaultValue} type={type} id={id} placeholder={placeholder} onChange={onChange} className={`${toCopy ? "px-10" : "pl-10"} border-input/80 focus-visible:ring-primary focus-visible:border-primary rounded-full`} />
                {toCopy && defaultValue && <CopyIcon onClick={onClick} className={`text-muted-foreground absolute top-1/2 right-5 size-3.5 -translate-y-1/2 ${copying ? "pointer-events-none" : "hover:text-foreground cursor-pointer"}`} />}
            </div>
        </Field>
    );
}

export function TextAreaField({ label, id, name, defaultValue: defaultValue, placeholder }: Omit<InputProp, "icon" | "type">) {
    return (
        <Field className="gap-3">
            <Label htmlFor={id} className="text-muted-foreground text-base font-semibold">
                {label}
            </Label>
            <Textarea name={name} defaultValue={defaultValue} placeholder={placeholder} className="bg-background/50 border-muted-foreground/20 min-h-40 resize-none rounded-2xl p-5 transition-all" id={id} />
        </Field>
    );
}
