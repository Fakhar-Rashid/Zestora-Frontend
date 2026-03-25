import api from './api';

/**
 * List all workflows for the current user.
 * @returns {Promise<object>}
 */
export async function list() {
  const { data } = await api.get('/workflows');
  return data;
}

/**
 * Create a new workflow.
 * @param {object} workflowData - { name, description?, tags? }
 * @returns {Promise<object>}
 */
export async function create(workflowData) {
  const { data } = await api.post('/workflows', workflowData);
  return data;
}

/**
 * Get a single workflow by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const { data } = await api.get(`/workflows/${id}`);
  return data;
}

/**
 * Update a workflow.
 * @param {string} id
 * @param {object} updateData - { name?, description?, nodes?, edges?, settings? }
 * @returns {Promise<object>}
 */
export async function update(id, updateData) {
  const { data } = await api.put(`/workflows/${id}`, updateData);
  return data;
}

/**
 * Delete a workflow.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function remove(id) {
  const { data } = await api.delete(`/workflows/${id}`);
  return data;
}

/**
 * Save a new version of a workflow.
 * @param {string} id
 * @param {object} versionData - { nodes, edges, description? }
 * @returns {Promise<object>}
 */
export async function saveVersion(id, versionData) {
  const { data } = await api.post(`/workflows/${id}/versions`, versionData);
  return data;
}

/**
 * List all versions of a workflow.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function listVersions(id) {
  const { data } = await api.get(`/workflows/${id}/versions`);
  return data;
}

/**
 * Execute a workflow.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function execute(id) {
  const { data } = await api.post(`/workflows/${id}/execute`);
  return data;
}

/**
 * Activate a workflow (enable triggers).
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function activate(id) {
  const { data } = await api.put(`/workflows/${id}/activate`);
  return data;
}

/**
 * Deactivate a workflow (disable triggers).
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deactivate(id) {
  const { data } = await api.put(`/workflows/${id}/deactivate`);
  return data;
}

/**
 * Send a test chat message to a workflow with an AI Agent.
 * @param {string} id - Workflow ID
 * @param {string} message - The chat message to send
 * @param {string} [sessionId] - Optional session ID for conversation memory
 * @returns {Promise<object>}
 */
export async function chat(id, message, sessionId) {
  const { data } = await api.post(`/workflows/${id}/chat`, { message, sessionId });
  return data;
}
