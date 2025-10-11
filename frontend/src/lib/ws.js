// src/lib/ws.js
import SockJS from "sockjs-client";
import { over } from "stompjs";

export function createStompClient(token) {
  // Use relative URL so Vite proxies it
  const sock = new SockJS(import.meta.env.VITE_WS_URL || "/ws");
  const client = over(sock);

  // connect with Authorization header
  const connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  return new Promise((resolve, reject) => {
    client.connect(connectHeaders, () => resolve(client), (err) => reject(err));
  });
}
