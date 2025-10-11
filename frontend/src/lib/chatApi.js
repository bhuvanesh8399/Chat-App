import api from './api.js'

export async function listRooms() {
  const { data } = await api.get('/api/rooms')
  return data
}
export async function history(roomId, limit = 50) {
  const { data } = await api.get('/api/messages', { params: { roomId, limit } })
  return data
}
