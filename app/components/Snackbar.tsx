import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  show: boolean;
  onClose: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, type, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  const baseStyles = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-3 min-w-[300px] max-w-md';
  const typeStyles = type === 'success'
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={cn(baseStyles, typeStyles)}>
      <Icon className="w-5 h-5" />
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};