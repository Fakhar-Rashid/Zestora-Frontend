import { useRef } from 'react';

const TextareaField = ({ field, value, onChange }) => {
  const textareaRef = useRef(null);

  const insertVariable = (varName) => {
    const el = textareaRef.current;
    if (!el) return;
    const tag = `{{${varName}}}`;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = value || '';
    const newVal = current.substring(0, start) + tag + current.substring(end);
    onChange(field.key, newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tag.length;
    }, 0);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {field.label || field.key}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder || ''}
        rows={field.rows || 4}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                   resize-y min-h-[80px] font-mono"
      />
      {field.variables?.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Available variables — click to insert
          </p>
          <div className="flex flex-wrap gap-1">
            {field.variables.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => insertVariable(v.name)}
                title={v.hint}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px]
                           bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400
                           border border-indigo-200 dark:border-indigo-800/50
                           hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
              >
                <span className="opacity-50">{'{{'}</span>
                {v.name}
                <span className="opacity-50">{'}}'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

export default TextareaField;
