import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import useExecutionStore from '../store/executionStore';
import ExecutionTable from '../components/execution/ExecutionTable';
import ExecutionDetailModal from '../components/execution/ExecutionDetailModal';
import { cn } from '../utils/cn';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
];

const ExecutionHistoryPage = () => {
  const { executions, pagination, loading, error, fetchExecutions } =
    useExecutionStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pageSize = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Fetch executions when filters/page change
  const loadExecutions = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (statusFilter) params.status = statusFilter;
    if (debouncedSearch.trim()) params.workflowName = debouncedSearch.trim();
    fetchExecutions(params);
  }, [currentPage, statusFilter, debouncedSearch, fetchExecutions]);

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  const handleViewDetails = (execution) => {
    setSelectedExecution(execution);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedExecution(null);
  };

  const totalPages = pagination.totalPages || Math.ceil((pagination.total || 0) / pageSize) || 1;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Execution History
          </h1>
        </div>
        <button
          onClick={loadExecutions}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by workflow name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(
            'input-field text-sm w-full sm:w-48',
            !statusFilter && 'text-gray-400 dark:text-gray-500'
          )}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
            Loading executions...
          </span>
        </div>
      ) : (
        <>
          {/* Table */}
          <ExecutionTable
            executions={executions}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {executions.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
                {pagination.total > 0 && (
                  <span className="ml-2">
                    ({pagination.total} total execution{pagination.total !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg',
                    'border border-gray-200 dark:border-gray-800',
                    'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg',
                    'border border-gray-200 dark:border-gray-800',
                    'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <ExecutionDetailModal
        execution={selectedExecution}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ExecutionHistoryPage;
