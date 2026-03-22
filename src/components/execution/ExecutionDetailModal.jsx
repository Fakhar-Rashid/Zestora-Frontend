import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ChevronDown,
  ChevronRight,
  Zap,
  MessageCircle,
  Brain,
  FileText,
  Mail,
  Globe,
  GitBranch,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import * as executionService from '../../services/executionService';

// ── Helpers ───────────────────────────────────────────────────────────

const statusConfig = {
  success: {
    label: 'Success',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  completed: {
    label: 'Success',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    icon: XCircle,
    iconColor: 'text-red-500',
    dotColor: 'bg-red-500',
  },
  error: {
    label: 'Failed',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    icon: XCircle,
    iconColor: 'text-red-500',
    dotColor: 'bg-red-500',
  },
  running: {
    label: 'Running',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    icon: Loader2,
    iconColor: 'text-amber-500',
    dotColor: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: Circle,
    iconColor: 'text-gray-400',
    dotColor: 'bg-gray-400',
  },
  queued: {
    label: 'Queued',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: Circle,
    iconColor: 'text-gray-400',
    dotColor: 'bg-gray-400',
  },
};

const nodeTypeIcons = {
  trigger: Zap,
  whatsapp: MessageCircle,
  telegram: MessageCircle,
  ai: Brain,
  openai: Brain,
  gemini: Brain,
  groq: Brain,
  deepseek: Brain,
  email: Mail,
  smtp: Mail,
  imap: Mail,
  http: Globe,
  webhook: Globe,
  google_sheets: FileText,
  google_docs: FileText,
  condition: GitBranch,
};

const formatTimestamp = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDuration = (startedAt, completedAt) => {
  if (!startedAt) return '-';
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
};

const formatJson = (data) => {
  if (!data) return 'null';
  try {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

// ── Step Card ─────────────────────────────────────────────────────────

const StepCard = ({ step, index, isLast }) => {
  const [expandInput, setExpandInput] = useState(false);
  const [expandOutput, setExpandOutput] = useState(false);

  const cfg = statusConfig[step.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;
  const nodeType = (step.nodeType || step.type || '').toLowerCase();
  const NodeIcon = nodeTypeIcons[nodeType] || Zap;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2 z-10',
            'bg-white dark:bg-gray-900',
            step.status === 'failed' || step.status === 'error'
              ? 'border-red-300 dark:border-red-800'
              : step.status === 'success' || step.status === 'completed'
                ? 'border-emerald-300 dark:border-emerald-800'
                : step.status === 'running'
                  ? 'border-amber-300 dark:border-amber-800'
                  : 'border-gray-300 dark:border-gray-700'
          )}
        >
          <NodeIcon className={cn('w-3.5 h-3.5', cfg.iconColor)} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {step.nodeName || step.name || `Step ${index + 1}`}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {nodeType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {step.startedAt && step.completedAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(step.startedAt, step.completedAt)}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                cfg.badge
              )}
            >
              <StatusIcon
                className={cn(
                  'w-3 h-3',
                  step.status === 'running' && 'animate-spin'
                )}
              />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Error message */}
        {(step.status === 'failed' || step.status === 'error') && step.error && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">
              Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 font-mono whitespace-pre-wrap break-all">
              {typeof step.error === 'string' ? step.error : step.error?.message || JSON.stringify(step.error)}
            </p>
          </div>
        )}

        {/* Input */}
        {step.input != null && (
          <div className="mb-2">
            <button
              onClick={() => setExpandInput(!expandInput)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-1"
            >
              {expandInput ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              Input
            </button>
            {expandInput && (
              <pre className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
                {formatJson(step.input)}
              </pre>
            )}
          </div>
        )}

        {/* Output */}
        {step.output != null && (
          <div>
            <button
              onClick={() => setExpandOutput(!expandOutput)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-1"
            >
              {expandOutput ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              Output
            </button>
            {expandOutput && (
              <pre className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
                {formatJson(step.output)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal Component ───────────────────────────────────────────────────

const ExecutionDetailModal = ({ execution, open, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && execution?._id) {
      setLoading(true);
      setDetail(null);
      executionService
        .getById(execution._id)
        .then((response) => {
          const data = response.data || response;
          setDetail(data);
        })
        .catch(() => {
          // Fall back to the summary data we already have
          setDetail(execution);
        })
        .finally(() => setLoading(false));
    }
  }, [open, execution]);

  if (!open || !execution) return null;

  const exec = detail || execution;
  const overallStatus = statusConfig[exec.status] || statusConfig.pending;
  const OverallIcon = overallStatus.icon;
  const workflowName =
    exec.workflowId?.name || exec.workflowName || 'Unknown Workflow';
  const steps = exec.steps || exec.nodeResults || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {workflowName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                ID: {exec._id}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  overallStatus.badge
                )}
              >
                <OverallIcon
                  className={cn(
                    'w-3 h-3',
                    exec.status === 'running' && 'animate-spin'
                  )}
                />
                {overallStatus.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timestamps bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs shrink-0">
          <div>
            <span className="text-gray-400 dark:text-gray-500">Started</span>
            <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">
              {formatTimestamp(exec.startedAt)}
            </p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Completed</span>
            <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">
              {exec.completedAt ? formatTimestamp(exec.completedAt) : '-'}
            </p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Duration</span>
            <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5 font-mono">
              {formatDuration(exec.startedAt, exec.completedAt)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Loading execution details...
              </span>
            </div>
          ) : steps.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Step Timeline
              </h3>
              <div>
                {steps.map((step, i) => (
                  <StepCard
                    key={step._id || step.nodeId || i}
                    step={step}
                    index={i}
                    isLast={i === steps.length - 1}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No step details available for this execution.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetailModal;
