import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cr_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body.code === 'number') {
      if (body.code === 0) {
        return body.data
      }
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body
  },
  (error) => {
    const status = error.response?.status
    const body = error.response?.data
    const message = (body && body.message) || error.message || '网络错误'
    if (status === 401) {
      localStorage.removeItem('cr_admin_token')
      localStorage.removeItem('cr_admin_name')
      localStorage.removeItem('cr_admin_username')
      ElMessage.error('登录已过期，请重新登录')
      window.location.hash = '#/login'
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(new Error(message))
  },
)

export default http