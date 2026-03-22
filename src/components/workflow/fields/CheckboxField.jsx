const CheckboxField = ({ field, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.key, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600
                     bg-white dark:bg-gray-800
                     focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
          {field.label || field.key}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </label>
      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 ml-6">{field.description}</p>
      )}
    </div>
  );
};

export default CheckboxField;
