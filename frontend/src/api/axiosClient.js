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
    const payload = error?.response?.data || error
    return Promise.reject(payload)
  },
)

export default axiosClient
