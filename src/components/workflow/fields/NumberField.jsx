const NumberField = ({ field, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {field.label || field.key}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(field.key, val === '' ? '' : Number(val));
        }}
        placeholder={field.placeholder || ''}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

export default NumberField;
