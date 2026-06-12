import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Network errors, CORS failures and timeouts won't have a response
    if (!error || !error.response) {
      const message =
        error?.message === 'Network Error'
          ? 'Unable to reach API. Check server, network, or VITE_API_BASE_URL.'
          : error?.message || 'Network Error'

      return Promise.reject({ message, code: error?.code || 'ERR_NETWORK' })
    }

    // If the server returned a structured error payload, pass it through
    if (error.response.data && typeof error.response.data === 'object') {
      return Promise.reject(error.response.data)
    }

    // Fallback: normalize common fields
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Request failed',
      status: error.response?.status,
    })
  },
)

export default axiosClient
