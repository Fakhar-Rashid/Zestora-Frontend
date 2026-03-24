/**
 * Node categories for the workflow editor sidebar.
 */
export const NODE_CATEGORIES = [
  {
    key: 'triggers',
    label: 'Triggers',
    description: 'Start your workflow',
    color: '#10b981',
  },
  {
    key: 'actions',
    label: 'Actions',
    description: 'Perform operations',
    color: '#6366f1',
  },
  {
    key: 'logic',
    label: 'Logic',
    description: 'Control flow',
    color: '#f59e0b',
  },
  {
    key: 'ai',
    label: 'AI',
    description: 'AI-powered nodes',
    color: '#8b5cf6',
  },
  {
    key: 'data',
    label: 'Data',
    description: 'Transform and store data',
    color: '#06b6d4',
  },
  {
    key: 'output',
    label: 'Output',
    description: 'Display and export data',
    color: '#10b981',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'Third-party services',
    color: '#ec4899',
  },
];

/**
 * Execution status values.
 */
export const EXECUTION_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

/**
 * Status color mappings for badges and indicators.
 */
export const STATUS_COLORS = {
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  running: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    border: 'border-green-200 dark:border-green-800',
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
  },
  cancelled: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
    border: 'border-gray-200 dark:border-gray-800',
  },
};

/**
 * Workflow active status colors.
 */
export const WORKFLOW_STATUS_COLORS = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
  },
  inactive: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
};
