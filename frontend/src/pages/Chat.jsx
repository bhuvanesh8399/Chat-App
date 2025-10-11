// src/pages/Chat.jsx (or src/Chat.jsx)
import React, { useEffect, useMemo, useRef, useState } from "react";

// REST + custom WS services (your existing ones)
import { api } from "../services/api.js";
import { isConnected, subscribeRoom, publishRoom } from "../services/websocket.js";

// UI components (our polished versions)
import ChatHeader from "../components/ChatHeader.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import ChatInput from "../components/ChatInput.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";

/**
 * Props:
 * - transport: "rest+ws" | "stomp"  (default "rest+ws")
 * - fcmToken?: string                (optional, used in STOMP mode)
 */
export default function Chat({ transport = "rest+ws", fcmToken }) {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const listRef = useRef(null);
  const unsubRef = useRef(null);       // for REST+WS subscribe cleanup
  const stompRef = useRef(null);       // for STOMP client instance
  const typingTimeoutRef = useRef(null);

  // active room (fallback to General)
  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === roomId) || { id: 1, name: "General" },
    [rooms, roomId]
  );

  // Load rooms on mount (REST)
  useEffect(() => {
    (async () => {
      try {
        const rs = await api.rooms();
        setRooms(rs?.length ? rs : [{ id: 1, name: "General" }, { id: 2, name: "Random" }]);
        setRoomId(rs?.[0]?.id ?? 1);
      } catch {
        setRooms([{ id: 1, name: "General" }, { id: 2, name: "Random" }]);
        setRoomId(1);
      }
    })();
  }, []);

  // Fetch messages + wire transport per room change
  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    (async () => {
      try {
        const ms = await api.messages(roomId).catch(() => []);
        if (!cancelled) setMessages(Array.isArray(ms) ? ms : []);
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();

    // Clean up previous subscriptions/clients
    if (unsubRef.current) {
      try { unsubRef.current(); } catch {}
      unsubRef.current = null;
    }
    if (stompRef.current) {
      try { stompRef.current.deactivate(); } catch {}
      stompRef.current = null;
    }

    // Wire up based on transport
    if (transport === "rest+ws") {
      const unsubscribe = subscribeRoom(roomId, (msg) =>
        setMessages((prev) => [...prev, msg])
      );
      unsubRef.current = unsubscribe;
      setConnected(true);
    } else if (transport === "stomp") {
      setConnecting(true);
      setConnected(false);

      // dynamic import so builds don’t break if you don’t have this file
      import("@/lib/ws")
        .then(({ createStompClient }) => {
          // JWT from your auth (example)
          const jwt = localStorage.getItem("jwt") || "";
          const client = createStompClient({
            baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080",
            token: jwt,
          });
          stompRef.current = client;

          client.onConnect = () => {
            setConnecting(false);
            setConnected(true);

            // subscribe to the room topic
            client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
              try {
                const body = JSON.parse(frame.body);
                setMessages((prev) => [...prev, body]);
              } catch {
                // ignore bad payloads
              }
            });

            // optionally register FCM token
            if (fcmToken) {
              try {
                client.publish({
                  destination: "/app/register-token",
                  body: JSON.stringify({ token: fcmToken }),
                });
              } catch {}
            }
          };

          client.onStompError = () => {
            setConnecting(false);
            setConnected(false);
          };

          client.activate();
        })
        .catch(() => {
          setConnecting(false);
          setConnected(false);
        });

      // cleanup happens above when roomId changes/unmounts
    }

    return () => {
      cancelled = true;
    };
  }, [roomId, transport, fcmToken]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Typing indicator helper: show "Someone" for 2s after last typing=true
  const handleTyping = (isTyping) => {
    clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      setTypingUsers(["Someone"]);
      typingTimeoutRef.current = setTimeout(() => setTypingUsers([]), 2000);
    } else {
      typingTimeoutRef.current = setTimeout(() => setTypingUsers([]), 300);
    }
  };

  // Normalize -> MessageBubble props
  const shapeMessage = (m) => ({
    content: m.content ?? m.message ?? "",
    timestamp: m.timestamp ?? m.createdAt ?? Date.now(),
    user: { name: m.sender?.username ?? m.sender ?? "User" },
    reactions: m.reactions ?? [],
    isOwn: !!m.isOwn,
  });

  // Send message (handles both transports)
  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (transport === "stomp" && stompRef.current) {
      try {
        // optimistic UI
        setMessages((p) => [
          ...p,
          { content: trimmed, timestamp: Date.now(), sender: "You", isOwn: true },
        ]);
        stompRef.current.publish({
          destination: "/app/chat",
          body: JSON.stringify({ roomId, content: trimmed }),
        });
        return;
      } catch {
        // fall through to REST
      }
    }

    // REST + WS (or STOMP fallback)
    const ok = isConnected() && publishRoom(roomId, trimmed);
    if (!ok) {
      const saved =
        (await api
          .sendMessage(roomId, trimmed)
          .catch(() => ({ content: trimmed, timestamp: Date.now(), isOwn: true }))) || {};
      setMessages((p) => [...p, saved]);
    } else {
      // optimistic for custom ws too
      setMessages((p) => [
        ...p,
        { content: trimmed, timestamp: Date.now(), isOwn: true, sender: "You" },
      ]);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh text-white bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-3">
          <div className="flex items-center justify-between">
            <ChatHeader
              room={{
                name: `Room #${activeRoom.id} • ${activeRoom.name || "Chat"}`,
                isOnline: connected || transport === "rest+ws",
                lastSeen: Date.now() - 600000,
              }}
            />
            {/* Room selector */}
            <div className="hidden sm:flex items-center gap-2 -ml-2">
              <label className="text-xs text-white/60">Room</label>
              <select
                value={roomId || 1}
                onChange={(e) => setRoomId(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm outline-none focus:border-indigo-400"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || `Room ${r.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Connection hint (STOMP) */}
          {transport === "stomp" && (
            <div className="px-2 pb-2 text-xs text-white/60">
              {connecting ? "Connecting…" : connected ? "Live" : "Offline"}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="overflow-y-auto px-2 sm:px-0">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {messages.map((m, i) => {
            const shaped = shapeMessage(m);
            return (
              <MessageBubble
                key={i}
                message={shaped}
                isOwn={!!shaped.isOwn}
                onReaction={() => {}}
                onReply={() => {}}
              />
            );
          })}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto p-3">
          <ChatInput
            onSendMessage={handleSend}
            onTyping={handleTyping}
            placeholder="Type a message…"
          />
        </div>
      </div>
    </div>
  );
}
