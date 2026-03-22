import { ChevronDown } from 'lucide-react';

const SelectField = ({ field, value, onChange }) => {
  const options = field.options || [];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {field.label || field.key}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     rounded-md text-gray-900 dark:text-gray-100 appearance-none
                     focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                     pr-8"
        >
          <option value="">{field.placeholder || 'Select...'}</option>
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

export default SelectField;
