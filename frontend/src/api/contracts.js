import axiosClient from './axiosClient'

/**
 * Contract API service.
 *
 * Endpoints:
 *   POST /api/contracts/upload   → upload a contract file
 *   GET  /api/contracts/         → list user contracts
 *   GET  /api/contracts/stats    → dashboard KPI aggregates
 */

/**
 * Upload a contract file to the backend.
 *
 * @param {File}     file        The file object from the input/drop event
 * @param {Function} onProgress  Callback receiving progress percentage (0–100)
 * @returns {Promise<object>}    The server response with contract metadata
 */
export async function uploadContract(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  return axiosClient.post('/contracts/upload', formData, {
    headers: {
      // Let the browser set the correct Content-Type with boundary
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60s for large files
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        onProgress(percent)
      }
    },
  })
}

/**
 * Fetch all contracts for the authenticated user.
 * @returns {Promise<{ contracts: object[], total: number }>}
 */
export async function listContracts() {
  return axiosClient.get('/contracts/')
}

/**
 * Fetch pre-aggregated dashboard KPI stats.
 *
 * @returns {Promise<{
 *   total_contracts:  number,
 *   analyzed_count:   number,
 *   avg_risk_score:   number | null,
 *   high_risk_count:  number,
 *   recent_activity:  Array<{
 *     id: number,
 *     original_filename: string,
 *     upload_date: string | null,
 *     status: string,
 *     risk_score: number | null
 *   }>
 * }>}
 */
export async function fetchDashboardStats() {
  return axiosClient.get('/contracts/stats')
}

/**
 * Delete a contract by its ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function deleteContract(id) {
  return axiosClient.delete(`/contracts/${id}`)
}

/**
 * Trigger a simulated analysis on a contract.
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function analyzeContract(id) {
  return axiosClient.post(`/contracts/${id}/analyze`)
}

/**
 * Fetch detailed contract information, including clauses, entities, and risk report.
 * @param {number} id
 * @returns {Promise<{ contract: object, clauses: object[], risk_report: object | null, entities: object[] }>}
 */
export async function getContractDetails(id) {
  return axiosClient.get(`/contracts/${id}`)
}


