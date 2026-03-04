"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export default async function dashboardStats() {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const activeEventsCountQuery = prisma.event.count({
            where: { userId, endDate: { gt: new Date() } },
        });

        const totalVendorExpenseQuery = prisma.eventVendor.aggregate({
            where: { event: { userId } },
            _sum: { cost: true },
        });

        const totalPaidToVendorsQuery = prisma.payment.aggregate({
            where: { event: { userId }, type: "Vendor" },
            _sum: { amount: true },
        });

        const totalBudgetQuery = prisma.event.aggregate({
            where: { userId },
            _sum: { budget: true },
        });

        const clientPaidQuery = prisma.payment.aggregate({
            where: { event: { userId }, type: "Client" },
            _sum: { amount: true },
        });

        const urgentTasksQuery = prisma.task.count({
            where: { event: { userId }, status: { not: "Done" }, dueDate: { lte: new Date() } },
        });

        const [activeEventsCount, totalVendorExpense, totalPaidToVendors, totalBudget, clientPaid, urgentTasks] = await prisma.$transaction([activeEventsCountQuery, totalVendorExpenseQuery, totalPaidToVendorsQuery, totalBudgetQuery, clientPaidQuery, urgentTasksQuery]);

        const vendorDebt = (totalVendorExpense._sum.cost || 0) - (totalPaidToVendors._sum.amount || 0);
        const uncollected = (totalBudget._sum.budget || 0) - (clientPaid._sum.amount || 0);

        return { activeEventsCount, vendorDebt, uncollected, urgentTasks };
    }, "dashboardStats");
}
