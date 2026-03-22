import api from './api';

/**
 * Get the full node registry (all available node types with metadata and schemas).
 * @returns {Promise<object>}
 */
export async function getRegistry() {
  const { data } = await api.get('/nodes/registry');
  return data;
}
