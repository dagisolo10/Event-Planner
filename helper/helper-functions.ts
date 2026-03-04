export const formatUSD = (val: number) => {
    return val.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
export const formatDate = (val: Date) => {
    return new Date(val).toLocaleString("en-US", { month: "short", year: "numeric", day: "numeric" });
};

export const getDaysRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
};

export const getHoursRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const hours = Math.ceil(diff / (1000 * 60 * 60 * 60 * 24));
    return hours > 0 ? hours : 0;
};

export const getRemainingTime = (date: Date) => {
    const target = date.getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
};

export const formatTimeForInput = (date: Date | string) => new Date(date).toTimeString().split(":").slice(0, 2).join(":");
export const formatDateForInput = (date: Date | string) => new Date(date).toISOString().split("T")[0];
