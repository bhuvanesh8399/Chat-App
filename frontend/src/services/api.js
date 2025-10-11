import axios from "axios";
const instance = axios.create({ baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080" });
let jwt = null;
instance.interceptors.request.use((c) => { if (jwt) c.headers.Authorization = `Bearer ${jwt}`; return c; });

export const api = {
  setJwt(t) { jwt = t; },
  async login(email, password) {
    const { data } = await instance.post("/api/auth/login", { email, password });
    return data; // { token, user }
  },
  async me() { const { data } = await instance.get("/api/auth/me"); return data; },
  async rooms() { const { data } = await instance.get("/api/rooms"); return data; },
  async messages(roomId) { const { data } = await instance.get(`/api/rooms/${roomId}/messages`); return data; },
  async sendMessage(roomId, content) {
    const { data } = await instance.post(`/api/messages`, { roomId, content });
    return data;
  },
};
