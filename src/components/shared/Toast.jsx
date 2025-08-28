import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';

const Toast = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${getToastColor(toast.type)}20`,
        marginBottom: '12px',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <span style={{ fontSize: '20px' }}>{getToastIcon(toast.type)}</span>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: '600', 
          color: '#111827',
          fontSize: '14px',
          marginBottom: '2px'
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ 
            color: '#6b7280',
            fontSize: '13px'
          }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px',
          lineHeight: '1'
        }}
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useSelector((state) => state.ui);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
