import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

const Alert = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
    }
  };

  const style = alertStyles[type];

  return (
    <div className={`rounded-md ${style.bg} p-4 border ${style.border}`}>
      <div className="flex">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${style.text}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 ${style.bg} ${style.text} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-500`}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
