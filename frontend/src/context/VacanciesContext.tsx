import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchVacancies } from "@/lib/vacanciesApi";
import type { Vacancy } from "@/types/vacancy";

interface VacanciesContextValue {
  vacancies: Vacancy[] | null;
  error: string | null;
  reload: () => void;
  addVacancy: (v: Vacancy) => void;
}

const VacanciesContext = createContext<VacanciesContextValue | null>(null);

export function VacanciesProvider({ children }: { children: ReactNode }) {
  const [vacancies, setVacancies] = useState<Vacancy[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setError(null);
    fetchVacancies()
      .then(setVacancies)
      .catch(() => setError("Не удалось загрузить вакансии"));
  };

  useEffect(reload, []);

  const addVacancy = (v: Vacancy) => setVacancies((prev) => [v, ...(prev ?? [])]);

  const value = useMemo(() => ({ vacancies, error, reload, addVacancy }), [vacancies, error]);
  return <VacanciesContext.Provider value={value}>{children}</VacanciesContext.Provider>;
}

export function useVacancies(): VacanciesContextValue {
  const ctx = useContext(VacanciesContext);
  if (!ctx) throw new Error("useVacancies должен использоваться внутри VacanciesProvider");
  return ctx;
}