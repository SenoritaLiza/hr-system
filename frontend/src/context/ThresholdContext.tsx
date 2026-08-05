import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ThresholdContextValue {
  threshold: number;
  setThreshold: (value: number) => void;
}

const ThresholdContext = createContext<ThresholdContextValue | null>(null);

const DEFAULT_THRESHOLD = 65;

export function ThresholdProvider({ children }: { children: ReactNode }) {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const value = useMemo(() => ({ threshold, setThreshold }), [threshold]);
  return <ThresholdContext.Provider value={value}>{children}</ThresholdContext.Provider>;
}

export function useThreshold(): ThresholdContextValue {
  const ctx = useContext(ThresholdContext);
  if (!ctx) throw new Error("useThreshold must be used within ThresholdProvider");
  return ctx;
}