// components/ThemeToggle.tsx
"use client";

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded flex items-center space-x-2 z-50"
    >
      {theme === 'dark' ? (
        <>
          <SunIcon className="h-6 w-6" />
        </>
      ) : (
        <>
          <MoonIcon className="h-6 w-6" />
        </>
      )}
    </button>
  );
}
