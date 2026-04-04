import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastNotification from "./ToastNotification";

const ToastContext = createContext({
  pushToast: () => undefined
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback(
    ({ title, description, tone = "info" }) => {
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [...currentToasts, { id, title, description, tone }]);

      window.setTimeout(() => {
        removeToast(id);
      }, 4200);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      pushToast
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastNotification toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
