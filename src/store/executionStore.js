import { create } from 'zustand';
import * as executionService from '../services/executionService';

const useExecutionStore = create((set) => ({
  // State
  executions: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  /**
   * Fetch executions with optional filters.
   * @param {object} [params] - { workflowId?, status?, page?, limit? }
   */
  fetchExecutions: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await executionService.list(params);
      const data = response.data || response;
      set({
        executions: data.executions || data,
        pagination: data.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch executions',
        loading: false,
      });
    }
  },

  /**
   * Fetch execution statistics.
   */
  fetchStats: async () => {
    try {
      const response = await executionService.getStats();
      const stats = response.data || response;
      set({ stats });
    } catch (err) {
      console.error('Failed to fetch execution stats:', err);
    }
  },

  /**
   * Clear executions state.
   */
  clear: () =>
    set({
      executions: [],
      stats: null,
      loading: false,
      error: null,
    }),
}));

export default useExecutionStore;
