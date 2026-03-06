export const progressBarColor = (isOverBudget: boolean, percentage: number) => {
    if (isOverBudget || percentage >= 100) return "[&>div]:bg-rose-500";
    if (percentage >= 80) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-emerald-500";
};

export const paymentCompletionProgressBarColor = (paymentCompletion: number | undefined) => {
    if (paymentCompletion === undefined) return "[&>div]:bg-zinc-500";

    if (paymentCompletion === 100) return "[&>div]:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    if (paymentCompletion > 100) return "[&>div]:bg-rose-600 animate-pulse";
    if (paymentCompletion >= 90) return "[&>div]:bg-emerald-400/80";
    if (paymentCompletion >= 50) return "[&>div]:bg-amber-400";
    if (paymentCompletion > 0) return "[&>div]:bg-zinc-400";

    return "[&>div]:bg-zinc-800"; // Zero
};

export const badgeColor = (isOverBudget: boolean, percentage: number) => {
    const destructive = "bg-transparent text-rose-600 dark:text-rose-400 border-rose-500";
    const warning = "bg-transparent text-amber-600 dark:text-amber-400 border-amber-500";
    const safe = "bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500";

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
        Medium: "bg-amber-100 dark:bg-transparent text-amber-600 border-amber-300 dark:border-amber-700",
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
        VendorAdded: "bg-violet-500/15 text-violet-500",
        VendorUpdated: "bg-sky-500/15 text-sky-400",
        VendorPaid: "bg-amber-500/15 text-amber-500",
    },

    activityGlowColors: {
        TaskCreated: "bg-blue-500",
        TaskCompleted: "bg-emerald-500",
        VendorAdded: "bg-violet-500",
        VendorUpdated: "bg-sky-500",
        VendorPaid: "bg-amber-500",
    },
};
