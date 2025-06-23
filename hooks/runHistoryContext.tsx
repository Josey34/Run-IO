import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface RunHistoryContextType {
    runHistory: any[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const RunHistoryContext = createContext<RunHistoryContextType | undefined>(undefined);

export const useRunHistory = () => {
    const ctx = useContext(RunHistoryContext);
    if (!ctx) throw new Error("useRunHistory must be used within RunHistoryProvider");
    return ctx;
};

interface Props {
    userId: string | undefined;
    fetchRun: (userId: string) => Promise<any[]>;
    children: ReactNode;
}

export const RunHistoryProvider: React.FC<Props> = ({ userId, fetchRun, children }) => {
    const [runHistory, setRunHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRuns = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const runs = await fetchRun(userId);
            setRunHistory(runs || []);
        } catch (e: any) {
            setError("Failed to load runs");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRuns();
        // eslint-disable-next-line
    }, [userId]);

    return (
        <RunHistoryContext.Provider value={{ runHistory, loading, error, refresh: loadRuns }}>
            {children}
        </RunHistoryContext.Provider>
    );
};