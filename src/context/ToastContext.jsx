import React, { createContext, useContext, useState, useCallback } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning, IoClose } from 'react-icons/io5';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircle className="text-emerald-500" size={20} />;
      case 'error':
        return <IoCloseCircle className="text-red-500" size={20} />;
      case 'warning':
        return <IoWarning className="text-amber-500" size={20} />;
      default:
        return <IoInformationCircle className="text-blue-500" size={20} />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-950 text-slate-800 dark:text-slate-100';
      case 'error':
        return 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-950 text-slate-800 dark:text-slate-100';
      case 'warning':
        return 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-950 text-slate-800 dark:text-slate-100';
      default:
        return 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-950 text-slate-800 dark:text-slate-100';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto ${getColors(toast.type)}`}
            role="alert"
          >
            <div className="flex-shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1 text-sm font-semibold">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <IoClose size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
