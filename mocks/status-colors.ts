// export const progressBarColor = (isOverBudget: boolean, percentage: number) => {
//     return isOverBudget || percentage >= 90 ? "[&>div]:bg-rose-500" : percentage >= 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-emerald-500";
// };
// export const paymentCompletionProgressBarColor = (paymentCompletion: number | undefined) => {
//     return paymentCompletion !== undefined ? (paymentCompletion > 80 ? "[&>div]:bg-emerald-500" : paymentCompletion > 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500") : "";
// };
// export const badgeColor = (isOverBudget: boolean, percentage: number) => {
//     const destructive = "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-500";
//     const warning = "bg-yellow-100 dark:bg-transparent text-yellow-600 border-yellow-500";
//     const safe = "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-500";

//     return isOverBudget || percentage > 90 ? destructive : percentage > 70 ? warning : safe;
// };

// export const eventStatusDot: Record<string, string> = {
//     Completed: "bg-emerald-500",
//     Ongoing: "bg-amber-500",
//     Upcoming: "bg-blue-500",
// };

// export const vendorPaymentStatus: Record<string, string> = {
//     Paid: "[&>div]:bg-emerald-100 text-emerald-600 border-emerald-300",
//     Pending: "[&>div]:bg-amber-100 text-amber-600 border-amber-300",
//     Overdue: "[&>div]:bg-red-100 text-red-600 border-red-300",
// };

// export const taskStatus: Record<string, string> = {
//     Done: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-500",
//     Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-500",
//     InProgress: "bg-blue-100 dark:bg-transparent text-blue-600 border-blue-300 dark:border-blue-500",
//     Overdue: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-500",
// };

// export const taskPriority: Record<string, string> = {
//     Urgent: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-700",
//     High: "bg-orange-100 dark:bg-transparent text-orange-600 border-orange-300 dark:border-orange-700",
//     Medium: "bg-yellow-100 dark:bg-transparent text-yellow-600 border-yellow-300 dark:border-yellow-700",
//     Low: "bg-blue-100 dark:bg-transparent text-blue-600 border-blue-300 dark:border-blue-700",
// };

// export const paymentStatus: Record<string, string> = {
//     Paid: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-700",
//     Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
//     Overdue: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-700",
// };

// export const activityColors: Record<string, string> = {
//     task_created: "bg-blue-500/15 text-blue-500",
//     task_completed: "bg-emerald-500/15 text-emerald-400",
//     vendor_added: "bg-violet-500/15 text-violet-400",
//     vendor_updated: "bg-sky-500/15 text-sky-400",
//     vendor_paid: "bg-amber-500/15 text-amber-500",
//     event_archived: "bg-rose-500/15 text-rose-400",
// };

// export const statusColors: Record<string, Record<string, string>> = {
//     event: {
//         Completed: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-700",
//         Ongoing: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
//         Upcoming: "bg-blue-100 dark:bg-transparent text-blue-600 border-blue-300 dark:border-blue-700",
//     },

//     vendor: {
//         Paid: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-700",
//         Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
//         Overdue: "bg-red-100 dark:bg-transparent text-red-600 border-red-300 dark:border-red-700",
//     },
//     vendorPayment: {
//         Paid: "[&>div]:bg-emerald-100 text-emerald-600 border-emerald-300",
//         Pending: "[&>div]:bg-amber-100 text-amber-600 border-amber-300",
//         Overdue: "[&>div]:bg-red-100 text-red-600 border-red-300",
//     },

//     eventDot: {
//         Completed: "bg-emerald-500",
//         Ongoing: "bg-amber-500",
//         Upcoming: "bg-blue-500",
//     },

//     eventTask: {
//         Done: "bg-emerald-100 dark:bg-transparent text-emerald-600 dark:text-emerald-500 border-emerald-300 dark:border-emerald-500",
//         Pending: "bg-amber-100 dark:bg-transparent text-amber-600 dark:text-amber-500 border-amber-300 dark:border-amber-500",
//         InProgress: "bg-blue-100 dark:bg-transparent text-blue-600 dark:text-blue-500 border-blue-300 dark:border-blue-500",
//     },

//     taskPriority: {
//         Urgent: "bg-red-100 text-red-600 border-red-300",
//         High: "bg-orange-100 text-orange-600 border-orange-300",
//         Medium: "bg-yellow-100 text-yellow-600 border-yellow-300",
//         Low: "bg-blue-100 text-blue-600 border-blue-300",
//     },

//     paymentStatus: {
//         Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
//         Pending: "bg-rose-50 text-rose-600 border-rose-200",
//         Overdue: "bg-zinc-50 text-zinc-600 border-zinc-200",
//     },

//     activityColors: {
//         task_created: "bg-blue-500/15 text-blue-500",
//         task_completed: "bg-emerald-500/15 text-emerald-400",
//         vendor_added: "bg-violet-500/15 text-violet-400",
//         vendor_updated: "bg-sky-500/15 text-sky-400",
//         vendor_paid: "bg-amber-500/15 text-amber-500",
//         event_archived: "bg-rose-500/15 text-rose-400",
//     },
// };

// 1. Progress Bar Logic
export const progressBarColor = (isOverBudget: boolean, percentage: number) => {
    // Red if actually over budget, Yellow if nearing limit (80%+), otherwise Green
    if (isOverBudget || percentage >= 100) return "[&>div]:bg-rose-500";
    if (percentage >= 80) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-emerald-500";
};

export const paymentCompletionProgressBarColor = (paymentCompletion: number | undefined) => {
    if (paymentCompletion === undefined) return "";
    if (paymentCompletion >= 90) return "[&>div]:bg-emerald-500";
    if (paymentCompletion >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-rose-500";
};

// 2. Budget Badge Logic
export const badgeColor = (isOverBudget: boolean, percentage: number) => {
    const destructive = "bg-rose-100 dark:bg-transparent text-rose-600 dark:text-rose-400 border-rose-500";
    const warning = "bg-yellow-100 dark:bg-transparent text-yellow-600 dark:text-yellow-400 border-yellow-500";
    const safe = "bg-emerald-100 dark:bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500";

    if (isOverBudget || percentage >= 100) return destructive;
    if (percentage >= 80) return warning;
    return safe;
};

export const statusColors = {
    // Event
    event: {
        Completed: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-700",
        Ongoing: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
        Upcoming: "bg-blue-100 dark:bg-transparent text-blue-600 border-blue-300 dark:border-blue-700",
    },

    eventDot: {
        Completed: "bg-emerald-500",
        Ongoing: "bg-amber-500",
        Upcoming: "bg-blue-500",
    },

    // Vendor
    vendor: {
        Paid: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-700",
        Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
        Overdue: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-700",
    },

    vendorPayment: {
        Paid: "[&>div]:bg-emerald-500 text-emerald-600 border-emerald-300",
        Pending: "[&>div]:bg-amber-500 text-amber-600 border-amber-300",
        Overdue: "[&>div]:bg-rose-500 text-rose-600 border-rose-300",
    },

    // Task
    task: {
        Done: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-300 dark:border-emerald-500",
        Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-500",
        InProgress: "bg-sky-100 dark:bg-transparent text-sky-600 border-sky-300 dark:border-sky-500",
        Overdue: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-500",
    },

    priority: {
        Urgent: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-300 dark:border-rose-700",
        High: "bg-orange-100 dark:bg-transparent text-orange-600 border-orange-300 dark:border-orange-700",
        Medium: "bg-yellow-100 dark:bg-transparent text-yellow-600 border-yellow-300 dark:border-yellow-700",
        Low: "bg-blue-100 dark:bg-transparent text-blue-600 border-blue-300 dark:border-blue-700",
    },

    // Payment
    paymentStatus: {
        Paid: "bg-emerald-100 dark:bg-transparent text-emerald-600 border-emerald-200 dark:border-emerald-800",
        Pending: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-200 dark:border-amber-800",
        Overdue: "bg-rose-100 dark:bg-transparent text-rose-600 border-rose-200 dark:border-rose-800",
    },

    // Activity
    activityColors: {
        TaskCreated: "bg-blue-500/15 text-blue-500",
        TaskCompleted: "bg-emerald-500/15 text-emerald-400",
        VendorAdded: "bg-violet-500/15 text-violet-400",
        VendorUpdated: "bg-sky-500/15 text-sky-400",
        VendorPaid: "bg-amber-500/15 text-amber-500",
        EventArchived: "bg-rose-500/15 text-rose-400",
    },
};
