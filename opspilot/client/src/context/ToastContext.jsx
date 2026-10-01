import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    dismiss: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container (Specification 4.5) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className="animate-slide-up"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: isSuccess
                  ? 'rgba(6, 78, 59, 0.95)'
                  : isError
                  ? 'rgba(136, 19, 55, 0.95)'
                  : isWarning
                  ? 'rgba(120, 53, 15, 0.95)'
                  : 'rgba(15, 23, 42, 0.95)',
                border: isSuccess
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : isError
                  ? '1px solid rgba(251, 113, 133, 0.4)'
                  : isWarning
                  ? '1px solid rgba(251, 191, 36, 0.4)'
                  : '1px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSuccess && <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />}
                {isError && <AlertCircle size={18} color="#fb7185" style={{ flexShrink: 0 }} />}
                {isWarning && <AlertCircle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />}
                {!isSuccess && !isError && !isWarning && <Info size={18} color="#38bdf8" style={{ flexShrink: 0 }} />}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
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
