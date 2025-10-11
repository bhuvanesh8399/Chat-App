import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = Bearer 
  return config
})

export async function listRooms() {
  const { data } = await api.get('/api/rooms')
  return data
}

export async function history(roomId, limit = 50) {
  const { data } = await api.get('/api/messages', { params: { roomId, limit } })
  return data
}
