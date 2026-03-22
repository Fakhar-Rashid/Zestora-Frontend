import { useState, useEffect } from 'react';

const JsonField = ({ field, value, onChange }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  // Sync incoming value to text
  useEffect(() => {
    if (value !== undefined && value !== null) {
      try {
        const formatted = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        setText(formatted);
        setError('');
      } catch {
        setText(String(value));
      }
    } else {
      setText('');
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);

    if (!raw.trim()) {
      setError('');
      onChange(field.key, '');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setError('');
      onChange(field.key, parsed);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {field.label || field.key}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={field.placeholder || '{\n  "key": "value"\n}'}
        rows={field.rows || 6}
        className={`w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border rounded-md
                   text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-1 transition-colors resize-y min-h-[100px]
                   ${
                     error
                       ? 'border-red-400 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                       : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                   }`}
      />
      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
      {!error && field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

export default JsonField;
