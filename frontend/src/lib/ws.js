import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

export function createStompClient({ baseUrl = 'http://localhost:8080', token }) {
  const socketFactory = () => new SockJS(`${baseUrl}/ws`);

  const client = new Client({
    webSocketFactory: socketFactory,
    reconnectDelay: 3000,
    debug: (str) => {
      // console.debug(str);
    },
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return client;
}
