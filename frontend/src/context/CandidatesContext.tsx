import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCandidates, toggleFavorite as toggleFavoriteApi } from "@/lib/candidatesApi";
import type { CandidateListItem } from "@/types/screening";

interface CandidatesContextValue {
  candidates: CandidateListItem[];
  error: string | null;
  reload: () => void;
  toggleFavorite: (id: string) => void;
}

const CandidatesContext = createContext<CandidatesContextValue | null>(null);

export function CandidatesProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setError(null);
    fetchCandidates()
      .then(setCandidates)
      .catch(() => setError("Не удалось загрузить кандидатов"));
  };

  useEffect(reload, []);

  const toggleFavorite = (id: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
    toggleFavoriteApi(id).catch(() => {
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
    });
  };

  const value = useMemo(() => ({ candidates, error, reload, toggleFavorite }), [candidates, error]);
  return <CandidatesContext.Provider value={value}>{children}</CandidatesContext.Provider>;
}

export function useCandidates(): CandidatesContextValue {
  const ctx = useContext(CandidatesContext);
  if (!ctx) throw new Error("useCandidates должен использоваться внутри CandidatesProvider");
  return ctx;
}