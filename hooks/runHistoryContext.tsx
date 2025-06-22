import React, { createContext, useContext, useState } from "react";

export interface RunData {
    date: string;
    distance: number;
    speed: number;
    duration: number;
}

const RunHistoryContext = createContext<{
    runHistory: RunData[];
    addRun: (run: RunData) => void;
}>({
    runHistory: [],
    addRun: () => {},
});

export const RunHistoryProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [runHistory, setRunHistory] = useState<RunData[]>([]);
    const addRun = (run: RunData) => setRunHistory((prev) => [...prev, run]);
    return (
        <RunHistoryContext.Provider value={{ runHistory, addRun }}>
            {children}
        </RunHistoryContext.Provider>
    );
};

export const useRunHistory = () => useContext(RunHistoryContext);