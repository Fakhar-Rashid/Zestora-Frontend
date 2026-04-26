import { useState, useEffect, useCallback } from 'react';
import { Cpu, Brain, Wrench, BookOpen, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkflowStore from '../../../store/workflowStore';
import * as knowledgeBaseService from '../../../services/knowledgeBaseService';
import CredentialField from '../fields/CredentialField';
import {
  NodeSettingsModal,
  FormSelect,
  FormInput,
  FormTextarea,
  FormCheckbox,
} from './NodeSettingsModal';

/* ════════════════════════════════════════════
   Chat Model Panel
   ════════════════════════════════════════════ */

export const ChatModelPanel = ({ nodeId, config, onClose }) => {
  const { updateNodeData } = useWorkflowStore();
  const [local, setLocal] = useState({
    credentialId: config.credentialId || '',
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
    <NodeSettingsModal title="Chat Model" icon={Cpu} color="#3b82f6" onClose={onClose} onSave={handleSave}>
      <CredentialField
        field={{
          key: 'credentialId',
          label: 'AI Credential',
          type: 'credential',
          service: ['openai', 'gemini', 'groq', 'deepseek'],
          required: true,
        }}
        value={local.credentialId}
        onChange={(key, val) => set(key, val)}
      />

      <FormSelect
        label="Provider"
        value={local.provider}
        onChange={(v) => set('provider', v)}
        options={['openai', 'gemini', 'groq', 'deepseek']}
        description="Select your AI provider"
        required
      />

      <FormInput
        label="Model"
        value={local.model}
        onChange={(v) => set('model', v)}
        placeholder="e.g. gpt-4o, gemini-1.5-pro"
        description="Leave blank for default model"
      />

      <FormInput
        label="Temperature"
        type="number"
        value={local.temperature}
        onChange={(v) => set('temperature', v)}
        min={0} max={2} step={0.1}
        description="0 = deterministic, 2 = very creative"
      />

      <FormInput
        label="Max Tokens"
        type="number"
        value={local.maxTokens}
        onChange={(v) => set('maxTokens', v)}
        min={1} max={128000}
        description="Max response length. Leave empty for default."
      />

      <FormSelect
        label="Response Format"
        value={local.responseFormat}
        onChange={(v) => set('responseFormat', v)}
        options={[
          { value: 'text', label: 'Text (default)' },
          { value: 'json', label: 'JSON Object' },
        ]}
        description="Force JSON output (OpenAI / Groq / DeepSeek only)"
      />
    </NodeSettingsModal>
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
    <NodeSettingsModal title="Memory" icon={Brain} color="#f59e0b" onClose={onClose} onSave={handleSave}>
      <FormCheckbox
        label="Enable Conversation Memory"
        checked={local.memoryEnabled}
        onChange={(v) => set('memoryEnabled', v)}
        description="Remember previous messages in the session"
      />
      {local.memoryEnabled && (
        <>
          <FormInput
            label="Memory Window"
            type="number"
            value={local.memoryWindow}
            onChange={(v) => set('memoryWindow', v)}
            min={2} max={100}
            description="Number of recent messages to include"
          />
          <FormCheckbox
            label="Auto-Summarize Memory"
            checked={local.autoSummarize}
            onChange={(v) => set('autoSummarize', v)}
            description="When memory grows large, summarize old messages automatically"
          />
        </>
      )}
    </NodeSettingsModal>
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
    <NodeSettingsModal title="Tools" icon={Wrench} color="#10b981" onClose={onClose} onSave={handleSave}>
      <FormCheckbox
        label="Enable Tools"
        checked={local.enableTools}
        onChange={(v) => set('enableTools', v)}
        description="Allow the AI to use tools (calculator, web search, HTTP, etc.)"
      />
      {local.enableTools && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700/60 p-3 space-y-2 bg-gray-50/60 dark:bg-gray-800/30">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Available Tools
          </p>
          <div className="space-y-1">
            {['calculator', 'getCurrentTime', 'httpRequest', 'searchWeb', 'textExtract'].map((t) => (
              <div key={t} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </NodeSettingsModal>
  );
};

/* ════════════════════════════════════════════
   Knowledge Base Panel
   ════════════════════════════════════════════ */

const CATEGORIES = ['general', 'faq', 'product', 'policy', 'technical', 'custom'];

export const KnowledgeBasePanel = ({ onClose }) => {
  const { workflowMeta } = useWorkflowStore();
  const workflowId = workflowMeta?.id;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!workflowId) return;
    setLoading(true);
    try {
      const res = await knowledgeBaseService.listEntries(workflowId);
      setEntries(res.data || []);
    } catch {
      // Silently — workflow may not be saved yet
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await knowledgeBaseService.updateEntry(workflowId, editingId, form);
        toast.success('Entry updated');
      } else {
        await knowledgeBaseService.createEntry(workflowId, form);
        toast.success('Entry added');
      }
      setForm({ title: '', content: '', category: 'general' });
      setShowForm(false);
      setEditingId(null);
      await fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge entry?')) return;
    try {
      await knowledgeBaseService.deleteEntry(workflowId, id);
      toast.success('Entry deleted');
      await fetchEntries();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (entry) => {
    try {
      await knowledgeBaseService.updateEntry(workflowId, entry.id, { isActive: !entry.isActive });
      await fetchEntries();
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleEdit = (entry) => {
    setForm({ title: entry.title, content: entry.content, category: entry.category });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setForm({ title: '', content: '', category: 'general' });
    setShowForm(false);
    setEditingId(null);
  };

  if (!workflowId) {
    return (
      <NodeSettingsModal title="Knowledge Base" icon={BookOpen} color="#8b5cf6" onClose={onClose} showFooter={false}>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          Save the workflow first to manage knowledge base entries.
        </p>
      </NodeSettingsModal>
    );
  }

  return (
    <NodeSettingsModal
      title={`Knowledge Base${entries.length ? ` · ${entries.filter(e => e.isActive).length}/${entries.length} active` : ''}`}
      icon={BookOpen}
      color="#8b5cf6"
      onClose={onClose}
      showFooter={false}
      width={520}
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      ) : (
        <>
          {showForm ? (
            <div className="rounded-lg border border-violet-200 dark:border-violet-800/50 bg-violet-50/40 dark:bg-violet-950/20 p-4 space-y-3">
              <FormInput
                label="Title"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="e.g. Return Policy"
                required
              />
              <FormTextarea
                label="Content"
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
                placeholder="Paste your knowledge document, FAQ answers, product info, etc."
                rows={6}
                required
              />
              <FormSelect
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg
                             bg-indigo-600 text-white hover:bg-indigo-700 transition-colors
                             disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (editingId ? 'Update Entry' : 'Save Entry')}
                </button>
                <button
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-sm font-medium rounded-lg
                             text-gray-600 dark:text-gray-300
                             bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 text-sm font-medium
                         text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30
                         border border-dashed border-violet-300 dark:border-violet-700
                         rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Knowledge Entry
            </button>
          )}

          {entries.length === 0 && !showForm && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              No knowledge entries yet. Add documents to enhance AI responses.
            </p>
          )}

          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg border p-3 transition-colors ${
                entry.isActive
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {entry.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {entry.content.slice(0, 200)}{entry.content.length > 200 ? '...' : ''}
                  </p>
                  <span className="inline-block text-xs mt-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {entry.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(entry)}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={entry.isActive ? 'Disable' : 'Enable'}
                  >
                    {entry.isActive
                      ? <ToggleRight className="w-4 h-4 text-green-500" />
                      : <ToggleLeft className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </NodeSettingsModal>
  );
};
