export function getEventStatus(startDate: Date | string, endDate: Date | string) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Ongoing";

    return "Completed";
}

export function getPaymentStatus(cost: number, paid: number, dueDate: Date | string) {
    if (paid >= cost) return "Paid";

    if (new Date(dueDate) < new Date()) return "Overdue";

    return "Pending";
}

export const getTaskStatus = (status: string, dueDate: Date) => new Date(dueDate) < new Date() && status !== "Done";
