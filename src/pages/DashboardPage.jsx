import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Zap,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useExecutionStore from '../store/executionStore';
import * as workflowService from '../services/workflowService';
import StatsCard from '../components/ui/StatsCard';
import ActivityChart from '../components/ui/ActivityChart';
import Button from '../components/ui/Button';
import { formatDate, formatDuration } from '../utils/formatters';
import { cn } from '../utils/cn';

/** Generate mock chart data for the last 7 days. */
function generateChartData() {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const total = Math.floor(Math.random() * 30) + 5;
    const failed = Math.floor(Math.random() * Math.min(total, 6));
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      executions: total,
      successful: total - failed,
      failed,
    });
  }
  return data;
}

const statusConfig = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  running: {
    label: 'Running',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-400',
    icon: Activity,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-100 dark:bg-red-950/50',
    text: 'text-red-700 dark:text-red-400',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    icon: XCircle,
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { executions, stats, fetchExecutions, fetchStats } = useExecutionStore();

  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const chartData = useMemo(() => generateChartData(), []);

  useEffect(() => {
    fetchStats();
    fetchExecutions({ limit: 5 });

    const loadWorkflows = async () => {
      try {
        const res = await workflowService.list();
        const wfData = res.data || res.workflows || res;
        setWorkflows(Array.isArray(wfData) ? wfData : []);
      } catch {
        setWorkflows([]);
      } finally {
        setLoadingWorkflows(false);
      }
    };
    loadWorkflows();
  }, [fetchStats, fetchExecutions]);

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter((w) => w.isActive).length;
  const totalExecutions = stats?.total || stats?.totalExecutions || 0;
  const successRate =
    totalExecutions > 0
      ? Math.round(
          ((stats?.completed || stats?.successful || 0) / totalExecutions) * 100
        )
      : 0;

  const recentExecutions = Array.isArray(executions)
    ? executions.slice(0, 5)
    : [];

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {firstName}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your workflows today.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/workflows')}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Workflows"
          value={loadingWorkflows ? '...' : totalWorkflows}
          icon={GitBranch}
          color="indigo"
        />
        <StatsCard
          title="Active Workflows"
          value={loadingWorkflows ? '...' : activeWorkflows}
          icon={Zap}
          color="emerald"
        />
        <StatsCard
          title="Total Executions"
          value={totalExecutions}
          icon={Activity}
          color="violet"
        />
        <StatsCard
          title="Success Rate"
          value={totalExecutions > 0 ? `${successRate}%` : '--'}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Chart + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Execution Activity
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">Last 7 days</span>
          </div>
          <ActivityChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3 flex-1">
            <button
              onClick={() => navigate('/workflows')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/50 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Workflow
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Build a new automation
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/workflows')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View All Workflows
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your automations
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/executions')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-950/50 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Execution History
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Review past runs
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Executions
          </h2>
          <button
            onClick={() => navigate('/executions')}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExecutions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No executions yet. Run a workflow to see results here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950/50">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                    Workflow
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Trigger
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Started
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentExecutions.map((exec) => (
                  <tr
                    key={exec._id || exec.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-950/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {exec.workflowName ||
                          exec.workflow?.name ||
                          'Unnamed Workflow'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={exec.status} />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {exec.trigger || exec.triggerType || 'manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(exec.startedAt || exec.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(exec.duration || exec.executionTime)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
