import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, BookOpen,
  Loader2, FileText, ToggleLeft, ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as knowledgeBaseService from '../../../services/knowledgeBaseService';
import useWorkflowStore from '../../../store/workflowStore';

const CATEGORIES = ['general', 'faq', 'product', 'policy', 'technical', 'custom'];

const KnowledgeBaseField = ({ field }) => {
  const { workflowMeta } = useWorkflowStore();
  const workflowId = workflowMeta?.id;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
      // Silently fail — workflow may not be saved yet
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    if (expanded && workflowId) {
      fetchEntries();
    }
  }, [expanded, workflowId, fetchEntries]);

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
      await knowledgeBaseService.updateEntry(workflowId, entry.id, {
        isActive: !entry.isActive,
      });
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

  const handleCancel = () => {
    setForm({ title: '', content: '', category: 'general' });
    setShowForm(false);
    setEditingId(null);
  };

  if (!workflowId) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {field.label || 'Knowledge Base'}
        </label>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Save the workflow first to manage knowledge base entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {field.label || 'Knowledge Base'}
          </span>
          {entries.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
              {entries.filter((e) => e.isActive).length}/{entries.length}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        }
      </button>

      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Entry List */}
              {entries.length === 0 && !showForm && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center py-3">
                  No knowledge entries yet. Add documents to enhance AI responses.
                </p>
              )}

              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-lg border p-2.5 text-xs transition-colors ${
                    entry.isActive
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                          {entry.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                        {entry.content.slice(0, 120)}{entry.content.length > 120 ? '...' : ''}
                      </p>
                      <span className="inline-block text-[9px] mt-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        {entry.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(entry)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={entry.isActive ? 'Disable' : 'Enable'}
                      >
                        {entry.isActive
                          ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                          : <ToggleLeft className="w-3.5 h-3.5 text-gray-400" />
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1 rounded text-gray-400 hover:text-indigo-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add/Edit Form */}
              {showForm ? (
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20 p-2.5 space-y-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Return Policy)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                               rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400
                               focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <textarea
                    placeholder="Content — paste your knowledge document, FAQ answers, product info, etc."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={4}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                               rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400
                               focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                               rounded-md text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium
                                 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Save className="w-3 h-3" />
                      }
                      {editingId ? 'Update' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400
                                 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-1.5 w-full px-2.5 py-2 text-xs font-medium
                             text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30
                             border border-dashed border-indigo-300 dark:border-indigo-700
                             rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Knowledge Entry
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseField;
