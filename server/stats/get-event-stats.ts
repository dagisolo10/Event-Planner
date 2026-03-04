"use server";
import { wrapAction } from "@/helper/action-wrapper";
import prisma from "@/lib/config/prisma";
import authCheck from "../auth/auth-check";

export async function getEventStats(id: string) {
    return await wrapAction(async () => {
        const userId = await authCheck();
        if (!userId) return { error: "Unauthorized" };

        const totalBudgetQuery = prisma.event.aggregate({
            where: { id, userId },
            _sum: { budget: true },
        });

        const totalVendorCostQuery = prisma.eventVendor.aggregate({
            where: { event: { id, userId } },
            _sum: { cost: true },
        });

        const totalVendorPaidQuery = prisma.payment.aggregate({
            where: { userId, eventId: id, type: "Vendor" },
            _sum: { amount: true },
        });

        const eventVendorsQuery = prisma.eventVendor.findMany({
            where: { event: { id, userId } },
            include: { payments: true },
        });

        const totalTasksQuery = prisma.task.count({
            where: {
                event: { id, userId },
            },
        });

        const completedTasksQuery = prisma.task.count({
            where: {
                event: { id, userId },
                status: "Done",
            },
        });

        const pendingTasksQuery = prisma.task.count({
            where: {
                event: { id, userId },
                status: "Pending",
            },
        });

        const taskQuery = prisma.task.count({
            where: {
                event: { id, userId },
            },
        });

        const [totalBudget, totalVendorCost, totalVendorPaid, eventVendors, totalTasks, completedTasks, pendingTasks, tasksCount] = await prisma.$transaction([
            totalBudgetQuery,
            totalVendorCostQuery,
            totalVendorPaidQuery,
            eventVendorsQuery,
            totalTasksQuery,
            completedTasksQuery,
            pendingTasksQuery,
            taskQuery,
        ]);

        const budget = totalBudget._sum.budget || 0;
        const totalContracted = totalVendorCost._sum.cost || 0;
        const totalPaidToVendor = totalVendorPaid._sum.amount || 0;

        const remainingBudget = budget - totalContracted;
        const remainingBalance = budget - totalPaidToVendor;
        const pendingBalance = totalContracted - totalPaidToVendor;
        const utilizationPercentage = budget ? (totalContracted / budget) * 100 : 0;

        const isOverBudget = totalContracted > budget;

        const paidVendorsCount = eventVendors.filter((vendor) => vendor.payments.reduce((acc, curr) => acc + curr.amount, 0) >= vendor.cost).length;
        const totalTasksCount = totalTasks;
        const completedTasksCount = completedTasks;
        const pendingTasksCount = pendingTasks;
        const overdueVendorsCount = eventVendors.filter((vendor) => vendor.payments.reduce((acc, curr) => acc + curr.amount, 0) < vendor.cost && vendor.dueDate < new Date()).length;

        const paymentCompletion = totalContracted ? Math.min((totalPaidToVendor / totalContracted) * 100, 100) : 0;
        const taskCompletion = tasksCount ? (completedTasksCount / tasksCount) * 100 : 0;

        return {
            budget,
            totalContracted,
            totalPaidToVendor,
            remainingBudget,
            remainingBalance,
            pendingBalance,
            utilizationPercentage,
            isOverBudget,
            paidVendorsCount,
            totalTasksCount,
            completedTasksCount,
            pendingTasksCount,
            overdueVendorsCount,
            paymentCompletion,
            taskCompletion,
        };
    }, "getEventBudget");
}
