import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs' // browser build

export function connectWS({ url = '/ws', onConnect, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(url),
    reconnectDelay: 3000,
    onConnect: () => onConnect && onConnect(client),
    onStompError: (frame) => {
      console.error('Broker error', frame.headers['message'], frame.body)
      onError && onError(frame)
    }
  })
  client.activate()
  return client
}
