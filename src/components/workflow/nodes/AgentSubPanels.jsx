import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Brain, Wrench, X, Save, ChevronDown } from 'lucide-react';
import useWorkflowStore from '../../../store/workflowStore';
import toast from 'react-hot-toast';

/* ── Reusable mini form fields ── */

const MiniSelect = ({ label, value, options, onChange, description }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                   text-gray-800 dark:text-gray-200 appearance-none cursor-pointer
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <option value="">Select...</option>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
    {description && <p className="text-[9px] text-gray-400 dark:text-gray-500">{description}</p>}
  </div>
);

const MiniInput = ({ label, value, onChange, placeholder, description, type = 'text', ...rest }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600
                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      {...rest}
    />
    {description && <p className="text-[9px] text-gray-400 dark:text-gray-500">{description}</p>}
  </div>
);

const MiniTextarea = ({ label, value, onChange, placeholder, description, rows = 3 }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 resize-none
                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    />
    {description && <p className="text-[9px] text-gray-400 dark:text-gray-500">{description}</p>}
  </div>
);

const MiniCheckbox = ({ label, checked, onChange, description }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all cursor-pointer
          ${checked
            ? 'bg-indigo-500 border-indigo-500'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </label>
    {description && <p className="text-[9px] text-gray-400 dark:text-gray-500 ml-6">{description}</p>}
  </div>
);

/* ── Panel wrapper (floating card) ── */

const SubPanel = ({ title, icon: Icon, color, onClose, onSave, children }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Check if click is on a + button (don't close)
        if (e.target.closest('[data-agent-btn]')) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute z-[100] w-[280px] rounded-xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-[#1a1a2e] shadow-2xl shadow-black/10 dark:shadow-black/40
                 animate-in fade-in slide-in-from-top-2 overflow-hidden"
      style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/60"
        style={{ background: `${color}08` }}>
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 flex-1">{title}</span>
        <button onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
        {children}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700/60">
        <button onClick={onSave}
          className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-[11px] font-semibold
                     bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm">
          <Save className="w-3 h-3" />
          Save
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   Chat Model Panel
   ════════════════════════════════════════════ */

export const ChatModelPanel = ({ nodeId, config, onClose }) => {
  const { updateNodeData } = useWorkflowStore();
  const [local, setLocal] = useState({
    provider: config.provider || '',
    model: config.model || '',
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? '',
    responseFormat: config.responseFormat || 'text',
  });

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    updateNodeData(nodeId, { config: { ...config, ...local } });
    toast.success('Chat Model saved');
    onClose();
  };

  return (
    <SubPanel title="Chat Model" icon={Cpu} color="#3b82f6" onClose={onClose} onSave={handleSave}>
      <MiniSelect label="Provider" value={local.provider} onChange={(v) => set('provider', v)}
        options={['openai', 'gemini', 'groq', 'deepseek']} description="Select your AI provider" />
      <MiniInput label="Model" value={local.model} onChange={(v) => set('model', v)}
        placeholder="e.g. gpt-4o, gemini-1.5-pro" description="Leave blank for default model" />
      <MiniInput label="Temperature" type="number" value={local.temperature}
        onChange={(v) => set('temperature', v)} min={0} max={2} step={0.1}
        description="0 = deterministic, 2 = very creative" />
      <MiniInput label="Max Tokens" type="number" value={local.maxTokens}
        onChange={(v) => set('maxTokens', v)} min={1} max={128000}
        description="Max response length. Leave empty for default." />
      <MiniSelect label="Response Format" value={local.responseFormat}
        onChange={(v) => set('responseFormat', v)}
        options={[{ value: 'text', label: 'Text (default)' }, { value: 'json', label: 'JSON Object' }]}
        description="Force JSON output (OpenAI/Groq/DeepSeek only)" />
    </SubPanel>
  );
};

/* ════════════════════════════════════════════
   Memory Panel
   ════════════════════════════════════════════ */

export const MemoryPanel = ({ nodeId, config, onClose }) => {
  const { updateNodeData } = useWorkflowStore();
  const [local, setLocal] = useState({
    memoryEnabled: config.memoryEnabled !== false,
    memoryWindow: config.memoryWindow ?? 20,
    autoSummarize: config.autoSummarize !== false,
  });

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    updateNodeData(nodeId, { config: { ...config, ...local } });
    toast.success('Memory settings saved');
    onClose();
  };

  return (
    <SubPanel title="Memory" icon={Brain} color="#f59e0b" onClose={onClose} onSave={handleSave}>
      <MiniCheckbox label="Enable Conversation Memory" checked={local.memoryEnabled}
        onChange={(v) => set('memoryEnabled', v)}
        description="Remember previous messages in the session" />
      {local.memoryEnabled && (
        <>
          <MiniInput label="Memory Window" type="number" value={local.memoryWindow}
            onChange={(v) => set('memoryWindow', v)} min={2} max={100}
            description="Number of recent messages to include" />
          <MiniCheckbox label="Auto-Summarize Memory" checked={local.autoSummarize}
            onChange={(v) => set('autoSummarize', v)}
            description="When memory grows large, summarize old messages automatically" />
        </>
      )}
    </SubPanel>
  );
};

/* ════════════════════════════════════════════
   Tool Panel
   ════════════════════════════════════════════ */

export const ToolPanel = ({ nodeId, config, onClose }) => {
  const { updateNodeData } = useWorkflowStore();
  const [local, setLocal] = useState({
    enableTools: config.enableTools !== false,
  });

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    updateNodeData(nodeId, { config: { ...config, ...local } });
    toast.success('Tool settings saved');
    onClose();
  };

  return (
    <SubPanel title="Tools" icon={Wrench} color="#10b981" onClose={onClose} onSave={handleSave}>
      <MiniCheckbox label="Enable Tools" checked={local.enableTools}
        onChange={(v) => set('enableTools', v)}
        description="Allow the AI to use tools (calculator, web search, HTTP, etc.)" />
      {local.enableTools && (
        <div className="rounded-lg border border-gray-100 dark:border-gray-700/50 p-2.5 space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available Tools</p>
          {['calculator', 'getCurrentTime', 'httpRequest', 'searchWeb', 'textExtract'].map((t) => (
            <div key={t} className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{t}</span>
            </div>
          ))}
        </div>
      )}
    </SubPanel>
  );
};
