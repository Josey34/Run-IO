export const calculatePaceFromTimeAndDistance = (
    timeInSeconds: number,
    distanceInKm: number
): string => {
    if (!distanceInKm || distanceInKm === 0) return "--:--";
    
    const totalPaceSeconds = timeInSeconds / distanceInKm;
    
    const minutes = Math.floor(totalPaceSeconds / 60);
    const seconds = Math.round(totalPaceSeconds % 60);
    
    if (seconds === 60) {
        return `${minutes + 1}:00`;
    }
    
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

export default {
    formatDuration,
    calculatePaceFromTimeAndDistance
};
