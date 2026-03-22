import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Select = forwardRef(
  ({ label, options = [], error, className, id, placeholder, ...selectProps }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm appearance-none',
            'bg-white dark:bg-gray-950',
            'border border-gray-300 dark:border-gray-700',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27/%3E%3C/svg%3E")] bg-[length:20px_20px] bg-[right_8px_center] bg-no-repeat pr-10',
            error && 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
