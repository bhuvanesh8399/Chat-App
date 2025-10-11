import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = Bearer 
  return config
})

export async function register({ username, password, displayName }) {
  const { data } = await api.post('/api/auth/register', { username, password, displayName })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({ username: data.username, displayName: data.displayName }))
  return data
}

export async function login({ username, password }) {
  const { data } = await api.post('/api/auth/login', { username, password })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({ username: data.username, displayName: data.displayName }))
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function currentUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}
