// components/Snackbar.tsx
import React from 'react';
import { cn } from '../utils/cn';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  show: boolean;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, type, show }) => {
  if (!show) return null;

  const baseStyles = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg transition-all duration-300';
  const typeStyles = type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';

  return (
    <div className={cn(baseStyles, typeStyles)}>
      {message}
    </div>
  );
};
