import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
let client = null, connected = false, jwtCached = null;
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

export const getClient = (jwt) => {
  if (client && connected) return client;
  jwtCached = jwt || jwtCached;
  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: jwtCached ? { Authorization: `Bearer ${jwtCached}` } : {},
    reconnectDelay: 3000,
    onConnect: () => { connected = true; },
    onWebSocketClose: () => { connected = false; },
    debug: () => {},
  });
  client.activate(); return client;
};

export const isConnected = () => connected;

export const subscribeRoom = (roomId, handler) => {
  if (!client || !connected) return () => {};
  const sub = client.subscribe(`/topic/rooms/${roomId}`, (msg) => {
    try { handler(JSON.parse(msg.body)); } catch {}
  });
  return () => sub?.unsubscribe();
};

export const publishRoom = (roomId, text) => {
  if (!client || !connected) return false;
  client.publish({ destination: "/app/chat", body: JSON.stringify({ roomId, content: text }) });
  return true;
};

export const disconnectClient = () => { try { client?.deactivate(); } catch {} connected = false; };
