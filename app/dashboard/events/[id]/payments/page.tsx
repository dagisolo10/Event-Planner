import getEvent from "@/server/events/get-event";
import getEvents from "@/server/events/get-events";
import { notFound, redirect } from "next/navigation";
import { formatUSD } from "@/helper/helper-functions";
import { Params } from "next/dist/server/request/params";
import PaymentTable from "@/components/payment/payment-table";
import { PaymentModal } from "@/components/payment/payment-modal";
import getEventPayments from "@/server/payments/get-event-payments";
import FinanceStatCard from "@/components/payment/finance-stats-card";
import getEventVendors from "@/server/vendors/event/get-event-vendors";
import getEventFinanceStats from "@/server/stats/get-event-finance-stats";
import { ArrowUpCircle, Wallet, TrendingUp, TrendingDown, ArrowDownCircle } from "lucide-react";

export default async function EventPayments({ params }: { params: Promise<Params> }) {
    const { id: eventId } = await params;
    const id = String(eventId);

    const [eventRes, statsRes, eventsRes, vendorRes, paymentRes] = await Promise.all([getEvent(id), getEventFinanceStats(id), getEvents(), getEventVendors(id), getEventPayments(id)]);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();
    if ("error" in statsRes) return notFound();

    const event = eventRes.event;
    const { budget, collected, liability, paidOut, cashOnHand, profit, margin } = statsRes;

    const events = "error" in eventsRes ? [] : eventsRes.events;
    const eventVendors = "error" in vendorRes ? [] : vendorRes.eventVendors;
    const payments = "error" in paymentRes ? [] : paymentRes.payments;

    return (
        <main className="space-y-8 pb-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-1 w-6 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Project Finance</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic">{event.title}</h1>
                    <p className="mt-1 font-medium text-zinc-500">Detailed financial breakdown and transaction history for this event.</p>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <PaymentModal event={event} events={events} eventVendors={eventVendors} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FinanceStatCard title="Total Budget" value={budget} subValue={`Collected: ${formatUSD(collected)}`} icon={TrendingUp} color="emerald" />
                <FinanceStatCard title="Vendor Expenses" value={liability} subValue={`Paid Out: ${formatUSD(paidOut)}`} icon={TrendingDown} color="rose" />
                <FinanceStatCard title="Cash on Hand" value={cashOnHand} subValue="Liquid funds in escrow" icon={Wallet} color="blue" />
                <FinanceStatCard title="Est. Net Profit" value={profit} subValue={`${margin}% margin`} icon={profit > 0 ? ArrowUpCircle : ArrowDownCircle} color={profit > 0 ? "emerald" : "rose"} />
            </div>

            <PaymentTable events={events} eventVendors={eventVendors} eventId={id} payments={payments} />
        </main>
    );
}
