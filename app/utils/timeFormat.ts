export const formatLocalTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
};

export const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 19).replace("T", " ");
};

export const parseDurationToMinutes = (duration: string | number) => {
    if (typeof duration === "number") return duration;
    if (typeof duration === "string") {
        const [min, sec] = duration.split(":").map(Number);
        if (!isNaN(min) && !isNaN(sec)) {
            return min + sec / 60;
        }
    }
    return 0;
};

export default {
    formatLocalTime,
    formatDateTime,
    parseDurationToMinutes
};
