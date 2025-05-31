import axios from 'axios'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add a request interceptor for handling errors
axiosInstance.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

export default axiosInstance
