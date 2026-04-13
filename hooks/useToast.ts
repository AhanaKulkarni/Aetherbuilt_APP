import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);
