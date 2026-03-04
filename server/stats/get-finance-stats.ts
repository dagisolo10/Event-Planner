"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function getFinanceStats() {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const totalBudget = await prisma.event.aggregate({
            where: { userId },
            _sum: { budget: true },
        });

        const totalClientPaid = await prisma.payment.aggregate({
            where: {
                userId,
                type: "Client",
            },
            _sum: { amount: true },
        });

        const totalVendorExpense = await prisma.eventVendor.aggregate({
            where: {
                event: { userId },
            },
            _sum: { cost: true },
        });

        const totalVendorPaid = await prisma.payment.aggregate({
            where: {
                userId,
                type: "Vendor",
            },
            _sum: { amount: true },
        });

        const budget = totalBudget._sum.budget || 0;
        const collected = totalClientPaid._sum.amount || 0;
        const liability = totalVendorExpense._sum.cost || 0;
        const paidOut = totalVendorPaid._sum.amount || 0;

        const cashOnHand = collected - paidOut;
        const profit = budget - liability;
        const margin = budget > 0 ? ((profit / budget) * 100).toFixed(1) : 0;

        return { budget, collected, liability, paidOut, cashOnHand, profit, margin };
    }, "getFinanceStats");
}
