import api from './api';

/**
 * List executions with optional query params.
 * @param {object} [params] - { workflowId?, status?, page?, limit? }
 * @returns {Promise<object>}
 */
export async function list(params) {
  const { data } = await api.get('/executions', { params });
  return data;
}

/**
 * Get a single execution by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const { data } = await api.get(`/executions/${id}`);
  return data;
}

/**
 * Cancel a running execution.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function cancel(id) {
  const { data } = await api.post(`/executions/${id}/cancel`);
  return data;
}

/**
 * Get execution statistics (counts by status, recent activity).
 * @returns {Promise<object>}
 */
export async function getStats() {
  const { data } = await api.get('/executions/stats');
  return data;
}
