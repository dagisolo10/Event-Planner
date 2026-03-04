import { Button } from "@/components/ui/button";
import getEvents from "@/server/events/get-events";
import { redirect, notFound } from "next/navigation";
import { formatUSD } from "@/helper/helper-functions";
import getPayments from "@/server/payments/get-payments";
import PaymentTable from "@/components/payment/payment-table";
import getFinanceStats from "@/server/stats/get-finance-stats";
import { PaymentModal } from "@/components/payment/payment-modal";
import FinanceStatCard from "@/components/payment/finance-stats-card";
import getAllEventVendors from "@/server/vendors/event/get-all-event-vendors";
import { ArrowUpCircle, Wallet, Receipt, TrendingUp, TrendingDown, ArrowDownCircle } from "lucide-react";

export default async function Budgeting() {
    const [statRes, eventRes, eventVendorRes, paymentRes] = await Promise.all([getFinanceStats(), getEvents(), getAllEventVendors(), getPayments()]);

    if ("error" in eventRes) return eventRes.error === "Unauthorized" ? redirect("/") : notFound();
    if ("error" in statRes) return notFound();

    const events = "error" in eventRes ? [] : eventRes.events;
    const eventVendors = "error" in eventVendorRes ? [] : eventVendorRes.eventVendors;
    const payments = "error" in paymentRes ? [] : paymentRes.payments;

    const { budget, collected, liability, paidOut, cashOnHand, profit, margin } = statRes;

    return (
        <main className="space-y-8 pb-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Financial Ledger</h1>
                    <p className="font-medium text-zinc-500">Manage inbound client payments and vendor payouts.</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Receipt className="size-4" /> Export CSV
                    </Button>

                    <PaymentModal events={events} eventVendors={eventVendors} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FinanceStatCard title="Total Revenue" value={budget ?? 0} subValue={`Collected: ${formatUSD(collected ?? 0)}`} icon={TrendingUp} color="emerald" />
                <FinanceStatCard title="Vendor Liabilities" value={liability ?? 0} subValue={`Paid Out: ${formatUSD(paidOut ?? 0)}`} icon={TrendingDown} color="rose" />
                <FinanceStatCard title="Cash on Hand" value={cashOnHand ?? 0} subValue="Liquid funds in escrow" icon={Wallet} color="blue" />
                <FinanceStatCard title="Est. Net Profit" value={profit ?? 0} subValue={`${margin ?? 0}% margin`} icon={(profit ?? 0) > 0 ? ArrowUpCircle : ArrowDownCircle} color={(profit ?? 0) > 0 ? "emerald" : "rose"} />
            </div>

            <PaymentTable events={events} payments={payments} eventVendors={eventVendors} />
        </main>
    );
}
