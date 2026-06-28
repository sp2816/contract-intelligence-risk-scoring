import axiosClient from './axiosClient'

/**
 * Chat API service.
 *
 * Endpoints:
 *   GET    /api/chat/sessions         → list user chat sessions (supports ?q= query)
 *   GET    /api/chat/sessions/:id/messages → retrieve messages in a session
 *   POST   /api/chat/sessions         → create a new chat session
 *   PUT    /api/chat/sessions/:id     → rename/update a chat session
 *   DELETE /api/chat/sessions/:id     → delete a chat session
 */

/**
 * Fetch all chat sessions for the authenticated user.
 * @param {string} [searchQuery] - Optional search filter
 * @returns {Promise<object[]>}
 */
export async function getSessions(searchQuery = '') {
  const url = searchQuery ? `/chat/sessions?q=${encodeURIComponent(searchQuery)}` : '/chat/sessions'
  return axiosClient.get(url)
}

/**
 * Fetch all messages for a specific session.
 * @param {number|string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getSessionMessages(sessionId) {
  return axiosClient.get(`/chat/sessions/${sessionId}/messages`)
}

/**
 * Create a new chat session.
 * @param {string} title
 * @param {number|string} [contractId]
 * @returns {Promise<object>}
 */
export async function createSession(title, contractId = null) {
  return axiosClient.post('/chat/sessions', { title, contract_id: contractId })
}

/**
 * Rename a chat session.
 * @param {number|string} sessionId
 * @param {string} title
 * @returns {Promise<object>}
 */
export async function renameSession(sessionId, title) {
  return axiosClient.put(`/chat/sessions/${sessionId}`, { title })
}

/**
 * Delete a chat session.
 * @param {number|string} sessionId
 * @returns {Promise<object>}
 */
export async function deleteSession(sessionId) {
  return axiosClient.delete(`/chat/sessions/${sessionId}`)
}
