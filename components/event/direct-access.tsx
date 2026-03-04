import { Button } from "../ui/button";
import { PaymentModal } from "../payment/payment-modal";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Event } from "@prisma/client";
import { PopulatedEventVendor } from "@/types/vendor";

interface DirectAccessProp {
    event: Event;
    events: Event[];
    eventVendors: PopulatedEventVendor[];
    clientName: string;
    email: string | null;
}

export default function DirectAccess({ clientName, event, events, eventVendors, email }: DirectAccessProp) {
    return (
        <Card className="gap-2">
            <CardHeader>
                <CardTitle className="text-sm font-bold tracking-wider text-zinc-500 uppercase">Direct Access</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-2">
                <PaymentModal event={event} events={events} eventVendors={eventVendors} />
                <AccessButton email={email || ""} clientName={clientName} />
            </CardContent>
        </Card>
    );
}

function AccessButton({ clientName, email }: { clientName?: string; email?: string }) {
    const content = (
        <>
            <div className="bg-accent flex size-8 items-center justify-center rounded-lg">
                <Mail className="size-4" />
            </div>
            <div className="text-left">
                <p className="font-bold">Contact Client</p>
                <p className="text-ss text-zinc-400">
                    Send status report to <span className="text-primary font-medium">{clientName}</span>
                </p>
            </div>
        </>
    );

    const classes = "w-full justify-start gap-3 py-6 text-muted-foreground";

    if (email) {
        return (
            <Button variant="outline" className={classes} asChild>
                <Link href={`mailto:${email}?subject=Status Update Regarding Your Event`}>{content}</Link>
            </Button>
        );
    }

    return (
        <Button variant="outline" className={classes}>
            {content}
        </Button>
    );
}
