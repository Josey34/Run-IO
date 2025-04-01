export const paceToSpeed = (paceInSecondsPerKm: number): string => {
    if (!paceInSecondsPerKm || paceInSecondsPerKm === 0) return "0.0";
    const speedKmh = 3600 / paceInSecondsPerKm;
    return speedKmh.toFixed(1);
};

export const formatPace = (paceInMinKm: number): string => {
    if (paceInMinKm === 0 || !isFinite(paceInMinKm)) return "--:--";
    const minutes = Math.floor(paceInMinKm);
    const seconds = Math.floor((paceInMinKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
              .toString()
              .padStart(2, "0")}`
        : `${minutes}:${secs.toString().padStart(2, "0")}`;
};
