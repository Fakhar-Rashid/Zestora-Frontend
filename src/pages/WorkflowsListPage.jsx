import { useEffect, useState, useCallback } from 'react';
import {
  GitBranch,
  Plus,
  Search,
  Loader2,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import * as workflowService from '../services/workflowService';
import WorkflowCard from '../components/workflow/WorkflowCard';
import CreateWorkflowDialog from '../components/workflow/CreateWorkflowDialog';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const WorkflowsListPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workflowService.list();
      const data = res.data || res.workflows || res;
      setWorkflows(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load workflows');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowService.remove(id);
      setWorkflows((prev) => prev.filter((w) => (w._id || w.id) !== id));
      toast.success('Workflow deleted');
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      if (currentlyActive) {
        await workflowService.deactivate(id);
      } else {
        await workflowService.activate(id);
      }
      setWorkflows((prev) =>
        prev.map((w) =>
          (w._id || w.id) === id ? { ...w, isActive: !currentlyActive } : w
        )
      );
      toast.success(currentlyActive ? 'Workflow deactivated' : 'Workflow activated');
    } catch {
      toast.error('Failed to update workflow status');
    }
  };

  const filtered = workflows.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.name?.toLowerCase().includes(q) ||
      w.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50">
            <GitBranch className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workflows
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWorkflows}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
            'bg-white dark:bg-gray-900',
            'border border-gray-200 dark:border-gray-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-200'
          )}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading workflows...
          </p>
        </div>
      ) : filtered.length === 0 && workflows.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No workflows yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
            Create your first workflow to start automating your tasks. Connect
            different nodes to build powerful pipelines.
          </p>
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Your First Workflow
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        /* No search results */
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workflows match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        /* Workflow Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Create New Card */}
          <button
            onClick={() => setDialogOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-3',
              'min-h-[200px] rounded-xl',
              'border-2 border-dashed border-gray-200 dark:border-gray-800',
              'hover:border-primary-300 dark:hover:border-primary-700',
              'hover:bg-primary-50/50 dark:hover:bg-primary-950/10',
              'transition-all duration-200 group cursor-pointer'
            )}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-950/50 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Create New Workflow
            </span>
          </button>

          {/* Workflow Cards */}
          {filtered.map((wf) => (
            <WorkflowCard
              key={wf._id || wf.id}
              workflow={wf}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateWorkflowDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={fetchWorkflows}
      />
    </div>
  );
};

export default WorkflowsListPage;
