import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ToastProps {
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

interface ToastItem extends ToastProps {
  id: string;
}

// Toast container to manage multiple toasts
const toastItems: ToastItem[] = [];
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];

export const toast = {
  success: (message: string, duration = 5000) =>
    addToast({ message, type: "success", duration }),
  error: (message: string, duration = 5000) =>
    addToast({ message, type: "error", duration }),
  warning: (message: string, duration = 5000) =>
    addToast({ message, type: "warning", duration }),
  info: (message: string, duration = 5000) =>
    addToast({ message, type: "info", duration }),
};

const addToast = (toast: ToastProps) => {
  const id = Math.random().toString(36).substr(2, 9);
  const toastItem: ToastItem = { ...toast, id };
  toastItems.push(toastItem);
  notifyListeners();

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => removeToast(id), toast.duration);
  }
};

const removeToast = (id: string) => {
  const index = toastItems.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    toastItems.splice(index, 1);
    notifyListeners();
  }
};

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastItems]));
};

const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => setToasts(newToasts);
    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<ToastItem> = ({
  message,
  type = "info",
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "flex items-center p-4 mb-2 rounded-lg shadow-lg transition-all duration-300 transform";
    const visibilityStyles = isVisible
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

    switch (type) {
      case "success":
        return `${baseStyles} ${visibilityStyles} bg-green-100 text-green-800 border border-green-200`;
      case "error":
        return `${baseStyles} ${visibilityStyles} bg-red-100 text-red-800 border border-red-200`;
      case "warning":
        return `${baseStyles} ${visibilityStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-blue-100 text-blue-800 border border-blue-200`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 mr-3";
    switch (type) {
      case "success":
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case "error":
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case "warning":
        return (
          <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />
        );
      default:
        return <CheckCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={handleClose}
        className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
