import api from './api';

/**
 * List all knowledge entries for a workflow.
 */
export async function listEntries(workflowId) {
  const { data } = await api.get(`/workflows/${workflowId}/knowledge`);
  return data;
}

/**
 * Create a new knowledge entry.
 */
export async function createEntry(workflowId, entryData) {
  const { data } = await api.post(`/workflows/${workflowId}/knowledge`, entryData);
  return data;
}

/**
 * Update a knowledge entry.
 */
export async function updateEntry(workflowId, entryId, entryData) {
  const { data } = await api.put(`/workflows/${workflowId}/knowledge/${entryId}`, entryData);
  return data;
}

/**
 * Delete a knowledge entry.
 */
export async function deleteEntry(workflowId, entryId) {
  const { data } = await api.delete(`/workflows/${workflowId}/knowledge/${entryId}`);
  return data;
}
