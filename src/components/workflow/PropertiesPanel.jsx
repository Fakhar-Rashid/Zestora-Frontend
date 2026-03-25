import { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import {
  Play,
  MessageCircle,
  Send,
  Mail,
  Bot,
  FileText,
  Smile,
  Youtube,
  MapPin,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Scissors,
  FileSpreadsheet,
  Table,
  Globe,
  Clock,
  Webhook,
  Zap,
  Database,
  Filter,
  Code,
  Settings,
  Bell,
  Phone,
  Image,
  Link,
  Search,
  Hash,
  Key,
  Shield,
  Cpu,
  Brain,
  Wand2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkflowStore from '../../store/workflowStore';
import DynamicForm from './DynamicForm';

const ICON_MAP = {
  Play,
  MessageCircle,
  Send,
  Mail,
  Bot,
  FileText,
  Smile,
  Youtube,
  MapPin,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Scissors,
  FileSpreadsheet,
  Table,
  Globe,
  Clock,
  Webhook,
  Zap,
  Database,
  Filter,
  Code,
  Settings,
  Bell,
  Phone,
  Image,
  Link,
  Search,
  Hash,
  Key,
  Shield,
  Cpu,
  Brain,
  Wand2,
  Sparkles,
};

function getIcon(iconName) {
  if (!iconName) return Zap;
  return ICON_MAP[iconName] || Zap;
}

const PropertiesPanel = () => {
  const { selectedNode, updateNodeData, removeNode, selectNode } = useWorkflowStore();
  const [configValues, setConfigValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync config from selected node
  useEffect(() => {
    if (selectedNode) {
      setConfigValues(selectedNode.data?.config || {});
      setHasChanges(false);
    }
  }, [selectedNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = useCallback((key, value) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSaveConfig = () => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, { config: configValues });
    setHasChanges(false);
    toast.success('Node configuration saved');
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    const name = selectedNode.data?.label || 'this node';
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      removeNode(selectedNode.id);
      toast.success('Node deleted');
    }
  };

  const handleClose = () => {
    selectNode(null);
  };

  if (!selectedNode) return null;

  const nodeData = selectedNode.data || {};
  const nodeType = nodeData.nodeType || {};
  const rawSchema = nodeType.schema || nodeType.configSchema || {};
  const allFields = rawSchema.fields || rawSchema || [];
  const color = nodeType.color || '#6366f1';
  const Icon = getIcon(nodeType.icon);

  // For AI Agent nodes, filter out fields now managed by the + buttons on the node
  const AGENT_BUTTON_KEYS = new Set([
    'provider', 'model', 'temperature', 'maxTokens', 'responseFormat',
    'memoryEnabled', 'memoryWindow', 'autoSummarize',
    'enableTools',
  ]);
  const registryType = nodeData.registryType || nodeType.type || '';
  const schema = registryType === 'ai-agent'
    ? allFields.filter((f) => !AGENT_BUTTON_KEYS.has(f.key))
    : allFields;

  return (
    <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {nodeData.label || 'Node'}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {nodeType.type || nodeData.registryType || 'custom'}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-7 h-7 rounded-md
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Config form */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <DynamicForm
          schema={schema}
          values={configValues}
          onChange={handleFieldChange}
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={handleSaveConfig}
          disabled={!hasChanges}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium
                     bg-indigo-600 text-white hover:bg-indigo-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          Save Configuration
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium
                     bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                     hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors
                     border border-red-200 dark:border-red-800/50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
