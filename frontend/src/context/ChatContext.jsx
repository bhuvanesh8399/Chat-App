// context/ChatContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket, onMessage, onEvent, sendMessage as wsSend } from '../services/websocket';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});  // e.g., { userId: true/false }

  useEffect(() => {
    if (!token) return;
    // Connect to WebSocket with JWT token for auth
    const socket = connectSocket(token);
    // Listen for incoming chat messages
    onMessage((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
    // Listen for user list updates (presence)
    onEvent('users', (userList) => {
      setOnlineUsers(userList);
    });
    // Listen for typing notifications
    onEvent('typing', ({ userId, isTyping }) => {
      setTypingStatus(prev => ({ ...prev, [userId]: isTyping }));
    });
    // Optionally, fetch initial chat history via REST API here if needed
    // return cleanup function to disconnect on unmount or when token changes
    return () => disconnectSocket();
  }, [token]);

  const sendMessage = (content) => {
    // send a message through WebSocket
    wsSend({ content });
  };

  const sendTyping = (isTyping = true) => {
    // send a typing indicator event (could be emitted to server)
    // e.g., socket.emit('typing', { userId: user.id, isTyping })
    // For simplicity, if using the service:
    // sendTypingStatus(isTyping) - a function you'd add to websocket service
  };

  return (
    <ChatContext.Provider value={{ messages, onlineUsers, typingStatus, sendMessage, sendTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

// hooks/useChat.js
import { ChatContext } from '../context/ChatContext';
import { useContext } from 'react';
export const useChat = () => useContext(ChatContext);
