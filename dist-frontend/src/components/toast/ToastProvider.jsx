// src/components/toast/ToastProvider.jsx
import { createContext, useContext, useMemo, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = crypto.randomUUID();
    const toast = { id, type, message };
    setToasts((prev) => [...prev, toast]);

    // Autocierre
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimeout(timeout);
    }, duration);

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider />");
  return ctx;
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div style={containerStyle} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} style={{ ...toastStyle, ...typeStyle[t.type] }}>
          <span>{t.message}</span>
          <button style={closeBtnStyle} onClick={() => onClose(t.id)} aria-label="Cerrar">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Estilos inline simples (puedes moverlos a CSS)
const containerStyle = {
  position: "fixed",
  top: 16,
  right: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 9999,
};
const toastStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  borderRadius: 8,
  color: "#0b0b0b",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  minWidth: 260,
  fontSize: 14,
};
const typeStyle = {
  info: { background: "#e7f0ff", borderLeft: "4px solid #3b82f6" },
  success: { background: "#eaffea", borderLeft: "4px solid #22c55e" },
  error: { background: "#ffecec", borderLeft: "4px solid #ef4444" },
  warning: { background: "#fff8e6", borderLeft: "4px solid #f59e0b" },
};
const closeBtnStyle = {
  marginLeft: "auto",
  background: "transparent",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  lineHeight: 1,
};
