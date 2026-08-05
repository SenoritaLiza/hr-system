import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Candidate } from "@/types/candidate";

interface CandidatesContextValue {
  candidates: Candidate[];
  toggleFavorite: (id: string) => void;
}

const CandidatesContext = createContext<CandidatesContextValue | null>(null);

export function CandidatesProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const toggleFavorite = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)),
    );
  };

  const value = useMemo(() => ({ candidates, toggleFavorite }), [candidates]);
  return <CandidatesContext.Provider value={value}>{children}</CandidatesContext.Provider>;
}

export function useCandidates(): CandidatesContextValue {
  const ctx = useContext(CandidatesContext);
  if (!ctx) throw new Error("useCandidates must be used within CandidatesProvider");
  return ctx;
}