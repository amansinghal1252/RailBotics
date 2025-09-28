import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200 
          dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
          ${
            error
              ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
              : 'border-gray-300'
          } 
          ${className}`
        }
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};