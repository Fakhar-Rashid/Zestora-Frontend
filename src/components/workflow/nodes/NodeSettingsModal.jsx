import { createPortal } from 'react-dom';
import { X, Save, ChevronDown, Loader2 } from 'lucide-react';

/* ── Shared Modal Wrapper ── */

export const NodeSettingsModal = ({
  title,
  icon: Icon,
  color = '#6366f1',
  onClose,
  onSave,
  saving = false,
  children,
  width = 460,
  showFooter = true,
  saveLabel = 'Save',
}) => {
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative z-10 rounded-xl border border-gray-200 dark:border-gray-700
                   bg-white dark:bg-[#1a1a2e] shadow-2xl shadow-black/30
                   animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[80vh]"
        style={{ width: `${width}px`, maxWidth: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/60"
          style={{ background: `${color}0A` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}1F` }}
          >
            {Icon && <Icon className="w-4 h-4" style={{ color }} />}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-sm font-medium
                         text-gray-600 dark:text-gray-300
                         bg-gray-100 dark:bg-gray-800
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]
                         transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

/* ── Shared Form Fields (consistent typography) ── */

export const FormLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export const FormHelp = ({ children }) =>
  children ? <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{children}</p> : null;

export const FormSelect = ({ label, value, options, onChange, description, required }) => (
  <div>
    <FormLabel required={required}>{label}</FormLabel>
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                   text-gray-900 dark:text-gray-100 appearance-none cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
      >
        <option value="">Select...</option>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    <FormHelp>{description}</FormHelp>
  </div>
);

export const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  type = 'text',
  required,
  ...rest
}) => (
  <div>
    <FormLabel required={required}>{label}</FormLabel>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) =>
        onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
      }
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
      {...rest}
    />
    <FormHelp>{description}</FormHelp>
  </div>
);

export const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  rows = 4,
  required,
}) => (
  <div>
    <FormLabel required={required}>{label}</FormLabel>
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-y
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
    />
    <FormHelp>{description}</FormHelp>
  </div>
);

export const FormCheckbox = ({ label, checked, onChange, description }) => (
  <div>
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all flex-shrink-0
          ${checked
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
    </label>
    {description && <p className="mt-1 ml-[26px] text-xs text-gray-400 dark:text-gray-500">{description}</p>}
  </div>
);
