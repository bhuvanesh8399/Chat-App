// src/components/ChatHeader.jsx
import React from "react";
import { motion } from "framer-motion";

export default function ChatHeader({
  room = {},
  onMenuClick,
  onVideoCall,
  onVoiceCall,
  onSettings,
}) {
  const { name = "Chat", isOnline = true, lastSeen = null } = room || {};

  // Safe helpers (kept local to avoid external deps)
  const initials = (name?.trim()?.charAt(0) || "C").toUpperCase();
  const formatTime = (d) => {
    if (!d) return "a while ago";
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "a while ago";
    const diffMs = Date.now() - date.getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const actions = [
    { icon: "📞", onClick: onVoiceCall, label: "Voice Call" },
    { icon: "📹", onClick: onVideoCall, label: "Video Call" },
    { icon: "⚙️", onClick: onSettings, label: "Settings" },
  ];

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/10">
      <motion.div
        className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Left: menu (mobile) + room info */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <motion.button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:text-white"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          {/* Avatar + room name/status */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold grid place-items-center"
              whileHover={{ scale: 1.08 }}
            >
              {initials}
              {isOnline && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-gray-900" />
              )}
            </motion.div>

            <div>
              <div className="text-base sm:text-lg font-semibold text-white">{name}</div>
              <div className="text-xs text-white/70">
                {isOnline ? "Online • glass mode" : `Last seen ${formatTime(lastSeen)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {actions.map(({ icon, onClick, label }, idx) => (
            <motion.button
              key={idx}
              onClick={onClick}
              title={label}
              aria-label={label}
              className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="text-sm">{icon}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
