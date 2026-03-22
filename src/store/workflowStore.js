import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import * as workflowService from '../services/workflowService';

const useWorkflowStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  selectedNode: null,
  workflowMeta: null,
  isSaving: false,
  isLoading: false,
  hasUnsavedChanges: false,

  // Node and edge setters
  setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
  setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),

  // ReactFlow change handlers
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      hasUnsavedChanges: true,
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      hasUnsavedChanges: true,
    }));
  },

  // On new connection
  onConnect: (connection) => {
    set((state) => ({
      edges: [
        ...state.edges,
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${Date.now()}`,
          type: 'smoothstep',
          animated: true,
        },
      ],
      hasUnsavedChanges: true,
    }));
  },

  // Select a node for the properties panel
  selectNode: (node) => set({ selectedNode: node }),

  // Update the selected node's data
  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      ),
      selectedNode:
        state.selectedNode?.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...newData } }
          : state.selectedNode,
      hasUnsavedChanges: true,
    }));
  },

  setNodeStatus: (nodeId, status) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
      ),
    }));
  },

  setAllNodesStatus: (status) => {
    set((state) => ({
      nodes: state.nodes.map((n) => ({ ...n, data: { ...n.data, status } })),
    }));
  },

  // Set workflow metadata
  setWorkflowMeta: (meta) => set({ workflowMeta: meta }),

  // Load a workflow from the API
  loadWorkflow: async (id) => {
    set({ isLoading: true });
    try {
      const response = await workflowService.getById(id);
      const workflow = response.data || response;
      const version = workflow.versions?.[0] || {};
      set({
        nodes: version.nodesJson || [],
        edges: version.edgesJson || [],
        workflowMeta: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          isActive: workflow.isActive,
          currentVersion: workflow.currentVersion,
        },
        isLoading: false,
        hasUnsavedChanges: false,
        selectedNode: null,
      });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || 'Failed to load workflow' };
    }
  },

  // Save the current workflow graph as a new version
  saveWorkflow: async () => {
    const { workflowMeta, nodes, edges } = get();
    if (!workflowMeta?.id) return { success: false, error: 'No workflow loaded' };

    set({ isSaving: true });
    try {
      await workflowService.saveVersion(workflowMeta.id, {
        nodesJson: nodes,
        edgesJson: edges,
      });
      set({ isSaving: false, hasUnsavedChanges: false });
      return { success: true };
    } catch (err) {
      set({ isSaving: false });
      return { success: false, error: err.response?.data?.message || 'Failed to save workflow' };
    }
  },

  // Add a new node at a given position
  addNode: (type, position, extraData = {}) => {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNode = {
      id,
      type,
      position: position || { x: 250, y: 150 },
      data: {
        label: type.replace(/([A-Z])/g, ' $1').trim(),
        type,
        config: {},
        ...extraData,
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      hasUnsavedChanges: true,
    }));
    return newNode;
  },

  // Remove a node and its connected edges
  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      hasUnsavedChanges: true,
    }));
  },

  // Reset the store
  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      workflowMeta: null,
      isSaving: false,
      isLoading: false,
      hasUnsavedChanges: false,
    }),
}));

export default useWorkflowStore;
