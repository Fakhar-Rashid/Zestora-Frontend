import { useState } from 'react';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const statusConfig = {
  success: {
    label: 'Success',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  completed: {
    label: 'Success',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  },
  error: {
    label: 'Failed',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  },
  running: {
    label: 'Running',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  pending: {
    label: 'Pending',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  queued: {
    label: 'Queued',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const sortableColumns = [
  { key: 'workflowName', label: 'Workflow' },
  { key: 'status', label: 'Status' },
  { key: 'triggerType', label: 'Trigger' },
  { key: 'startedAt', label: 'Started At' },
  { key: 'duration', label: 'Duration' },
];

const ExecutionTable = ({ executions = [], onViewDetails }) => {
  const [sortKey, setSortKey] = useState('startedAt');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...executions].sort((a, b) => {
    let aVal, bVal;

    switch (sortKey) {
      case 'workflowName':
        aVal = (a.workflowId?.name || a.workflowName || '').toLowerCase();
        bVal = (b.workflowId?.name || b.workflowName || '').toLowerCase();
        break;
      case 'status':
        aVal = a.status || '';
        bVal = b.status || '';
        break;
      case 'triggerType':
        aVal = a.triggerType || '';
        bVal = b.triggerType || '';
        break;
      case 'startedAt':
        aVal = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        bVal = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        break;
      case 'duration': {
        const durA = a.startedAt
          ? (a.completedAt ? new Date(a.completedAt) : new Date()) - new Date(a.startedAt)
          : 0;
        const durB = b.startedAt
          ? (b.completedAt ? new Date(b.completedAt) : new Date()) - new Date(b.startedAt)
          : 0;
        aVal = durA;
        bVal = durB;
        break;
      }
      default:
        aVal = '';
        bVal = '';
    }

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (executions.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No executions found matching your filters.
        </p>
      </div>
    );
  }

  const SortIcon = ({ column }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary-500" />
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              {sortableColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {col.label}
                    <SortIcon column={col.key} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sorted.map((exec) => {
              const status = statusConfig[exec.status] || statusConfig.pending;
              const workflowName =
                exec.workflowId?.name || exec.workflowName || 'Unknown Workflow';

              return (
                <tr
                  key={exec._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workflowName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        status.badge
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {exec.triggerType || 'manual'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(exec.startedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {formatDuration(exec.startedAt, exec.completedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetails(exec)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg',
                        'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30',
                        'hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors duration-200'
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutionTable;
