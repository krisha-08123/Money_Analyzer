import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 18px", borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            minWidth: 260,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            animation: "toastIn 0.3s ease",
            fontFamily: "inherit",
            ...(t.type === "success" ? {
              background: "#0d1f16",
              border: "1.5px solid rgba(34,212,123,0.3)",
              color: "#22d47b",
            } : t.type === "error" ? {
              background: "#1f0d12",
              border: "1.5px solid rgba(255,92,122,0.3)",
              color: "#ff5c7a",
            } : {
              background: "#0d1525",
              border: "1.5px solid rgba(77,158,255,0.3)",
              color: "#4d9eff",
            }),
          }}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);