import axiosClient from './axiosClient'

/**
 * Contract upload API.
 *
 * Endpoints:
 *   POST /api/contracts/upload   → upload a contract file
 *   GET  /api/contracts/         → list user contracts
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
