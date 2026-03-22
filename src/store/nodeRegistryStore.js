import { create } from 'zustand';
import * as nodeRegistryService from '../services/nodeRegistryService';

const useNodeRegistryStore = create((set) => ({
  // State
  nodeTypes: [],
  loaded: false,
  loading: false,
  error: null,

  /**
   * Fetch the node registry from the API.
   * Contains all available node types with their metadata and configuration schemas.
   */
  fetchRegistry: async (force = false) => {
    const state = useNodeRegistryStore.getState();
    if (!force && state.loaded && state.nodeTypes.length > 0) return;

    set({ loading: true, error: null });
    try {
      const response = await nodeRegistryService.getRegistry();
      const nodeTypes = response.data || response.nodeTypes || response;
      set({
        nodeTypes: Array.isArray(nodeTypes) ? nodeTypes : [],
        loaded: true,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load node registry',
        loading: false,
      });
    }
  },

  /**
   * Get node types filtered by category.
   * @param {string} category
   * @returns {Array}
   */
  getByCategory: (category) => {
    const { nodeTypes } = useNodeRegistryStore.getState();
    return nodeTypes.filter((n) => n.category === category);
  },

  /**
   * Find a specific node type by its type key.
   * @param {string} type
   * @returns {object|undefined}
   */
  getNodeType: (type) => {
    const { nodeTypes } = useNodeRegistryStore.getState();
    return nodeTypes.find((n) => n.type === type);
  },
}));

export default useNodeRegistryStore;
