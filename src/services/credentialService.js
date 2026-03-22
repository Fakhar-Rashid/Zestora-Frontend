import api from './api';

/**
 * List credentials, optionally filtered by service name.
 * @param {string} [service] - Filter by service name
 * @returns {Promise<object>}
 */
export async function list(service) {
  const params = service ? { service } : {};
  const { data } = await api.get('/credentials', { params });
  return data;
}

/**
 * Create a new credential.
 * @param {object} credentialData - { name, service, data }
 * @returns {Promise<object>}
 */
export async function create(credentialData) {
  const { data } = await api.post('/credentials', credentialData);
  return data;
}

/**
 * Update an existing credential.
 * @param {string} id
 * @param {object} updateData - { name?, data? }
 * @returns {Promise<object>}
 */
export async function update(id, updateData) {
  const { data } = await api.put(`/credentials/${id}`, updateData);
  return data;
}

/**
 * Delete a credential.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function remove(id) {
  const { data } = await api.delete(`/credentials/${id}`);
  return data;
}
