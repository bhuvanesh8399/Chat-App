// src/services/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "", // empty in dev => relative => proxy handles it
  withCredentials: false, // set true only if you actually use cookies & proper backend CORS
});

let jwt = localStorage.getItem("token") || null;

instance.interceptors.request.use((config) => {
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

export const api = {
  setJwt(token) {
    jwt = token;
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  },
  async login(emailOrUsername, password) {
    const { data } = await instance.post("/api/auth/login", {
      email: emailOrUsername,
      username: emailOrUsername,
      password,
    });
    return data;
  },
  async me() { const { data } = await instance.get("/api/auth/me"); return data; },
  async rooms() { const { data } = await instance.get("/api/rooms"); return data; },
  async messages(roomId) { const { data } = await instance.get(`/api/rooms/${roomId}/messages`); return data; },
  async sendMessage(roomId, content) { const { data } = await instance.post(`/api/messages`, { roomId, content }); return data; },
};
