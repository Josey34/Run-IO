export const formatLocalTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the device's timezone
    });
};

export const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:MM:SS format
};
