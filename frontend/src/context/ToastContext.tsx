import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Toast } from "@/components/ui/Toast";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const VISIBLE_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((next: string) => {
    window.clearTimeout(timeoutRef.current);
    setMessage(next);
    setVisible(true);
    timeoutRef.current = window.setTimeout(() => setVisible(false), VISIBLE_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} visible={visible} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}