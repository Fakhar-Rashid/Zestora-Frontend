import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Play,
  Power,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkflowStore from '../../store/workflowStore';
import * as workflowService from '../../services/workflowService';

const EditorToolbar = () => {
  const navigate = useNavigate();
  const {
    workflowMeta,
    setWorkflowMeta,
    saveWorkflow,
    isSaving,
    hasUnsavedChanges,
  } = useWorkflowStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  const workflowName = workflowMeta?.name || 'Untitled Workflow';
  const isActive = workflowMeta?.isActive || false;
  const workflowId = workflowMeta?.id;

  const handleNameClick = () => {
    setNameValue(workflowName);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    setIsEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflowName) {
      setWorkflowMeta({ ...workflowMeta, name: trimmed });
      if (workflowId) {
        try {
          await workflowService.update(workflowId, { name: trimmed });
        } catch {
          toast.error('Failed to update workflow name');
        }
      }
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  const handleSave = async () => {
    const result = await saveWorkflow();
    if (result.success) {
      toast.success('Workflow saved');
    } else {
      toast.error(result.error || 'Failed to save');
    }
  };

  const handleRun = async () => {
    if (!workflowId) return;
    setIsRunning(true);
    const { default: runExec } = await import('../../utils/executeWorkflow');
    await runExec();
    setIsRunning(false);
  };

  const handleToggleActive = async () => {
    if (!workflowId) return;
    setIsToggling(true);
    try {
      if (isActive) {
        await workflowService.deactivate(workflowId);
        setWorkflowMeta({ ...workflowMeta, isActive: false });
        toast.success('Workflow deactivated');
      } else {
        await workflowService.activate(workflowId);
        setWorkflowMeta({ ...workflowMeta, isActive: true });
        toast.success('Workflow activated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle workflow');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="h-14 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 z-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/workflows')}
        className="flex items-center justify-center w-8 h-8 rounded-md
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                   text-gray-500 dark:text-gray-400"
        title="Back to workflows"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      {/* Workflow name */}
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="text-sm font-semibold bg-transparent border border-indigo-500 rounded px-2 py-1
                       text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500
                       w-full max-w-xs"
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400
                       transition-colors truncate block max-w-xs"
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        {isSaving && (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {!isSaving && hasUnsavedChanges && (
          <>
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="text-amber-500">Unsaved changes</span>
          </>
        )}
        {!isSaving && !hasUnsavedChanges && (
          <>
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Saved</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      {/* Active toggle */}
      <button
        onClick={handleToggleActive}
        disabled={isToggling || !workflowId}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
          ${
            isActive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isActive ? 'Deactivate workflow' : 'Activate workflow'}
      >
        {isToggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Power className="w-3.5 h-3.5" />
        )}
        {isActive ? 'Active' : 'Inactive'}
      </button>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !workflowId}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                   bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                   hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title="Save workflow (Ctrl+S)"
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        Save
      </button>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isRunning || !workflowId}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                   bg-indigo-600 text-white hover:bg-indigo-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title="Execute workflow"
      >
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
        Run
      </button>
    </div>
  );
};

export default EditorToolbar;
