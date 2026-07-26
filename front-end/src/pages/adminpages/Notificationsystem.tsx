import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface NotificationContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  confirm: (options: ConfirmOptions) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// ─── Toast Component ──────────────────────────────────────────────────────

const ToastItem: React.FC<{
  toast: Toast;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-500',
      title: 'text-emerald-900',
      message: 'text-emerald-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-900',
      message: 'text-red-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      title: 'text-amber-900',
      message: 'text-amber-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl shadow-lg p-4 mb-3 min-w-[320px] max-w-md animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.title}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-sm ${style.message} mt-1`}>{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="p-1 hover:bg-white/50 rounded-lg transition flex-shrink-0"
        >
          <X className={`w-4 h-4 ${style.icon}`} />
        </button>
      </div>
    </div>
  );
};

// ─── Confirm Modal Component ──────────────────────────────────────────────

const ConfirmModal: React.FC<{
  options: ConfirmOptions;
  onClose: () => void;
}> = ({ options, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await options.onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    onClose();
  };

  const typeStyles = {
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700',
      Icon: XCircle,
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      iconBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
      Icon: Info,
    },
  };

  const type = options.type || 'info';
  const style = typeStyles[type];
  const Icon = style.Icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Icon */}
        <div className="p-6 pb-4">
          <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mx-auto`}>
            <Icon className={`w-6 h-6 ${style.icon}`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {options.title}
          </h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {options.message}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {options.cancelText || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {loading ? 'Processing...' : (options.confirmText || 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Provider Component ───────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast('error', title, message, 7000); // Errors stay longer
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOptions(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        confirm,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOptions && (
        <ConfirmModal options={confirmOptions} onClose={closeConfirm} />
      )}
    </NotificationContext.Provider>
  );
};

// ─── CSS Animations (add to your global CSS or Tailwind config) ──────────

/*
Add these to your tailwind.config.js:

module.exports = {
  theme: {
    extend: {
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
}

OR add to your global CSS:

@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes scale-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
*/