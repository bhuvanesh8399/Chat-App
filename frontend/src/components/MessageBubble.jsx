// src/components/MessageBubble.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageBubble({
  message = {},
  isOwn = false,
  showAvatar = true,
  onReaction = () => {},
  onReply = () => {},
}) {
  const [showActions, setShowActions] = useState(false);

  const userName = message?.user?.name || (isOwn ? "You" : "Guest");
  const avatarInitial = (userName?.trim()?.charAt(0) || "U").toUpperCase();
  const content = message?.content ?? "";
  const reactions = message?.reactions ?? [];
  const ts = message?.timestamp ?? null;

  const formatAgo = (d) => {
    if (!d) return "now";
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    if (Number.isNaN(date?.getTime?.())) return "now";
    const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <motion.div
      className={`flex gap-3 group ${isOwn ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Avatar (other user) */}
      {!isOwn && showAvatar && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 grid place-items-center text-white text-sm font-semibold shadow-lg"
          whileHover={{ scale: 1.08, rotate: 4 }}
          aria-hidden
        >
          {avatarInitial}
        </motion.div>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (others) */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-white/60 mb-1 ml-3">{userName}</span>
        )}

        {/* Bubble */}
        <motion.div
          className={`relative max-w-md px-4 py-3 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300
            ${isOwn
              ? "bg-gradient-to-r from-blue-500/80 to-purple-600/80 border-white/20 text-white ml-auto"
              : "bg-white/10 border-white/20 text-white/90"
            }`}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
          role="group"
          aria-label={`${isOwn ? "Your" : `${userName}'s`} message`}
        >
          <p className="text-sm leading-relaxed break-words">{content}</p>

          {/* Meta (time + sent badge for own) */}
          <div
            className={`flex items-center gap-2 mt-2 text-xs ${
              isOwn ? "text-white/70" : "text-white/60"
            }`}
          >
            <span>{formatAgo(ts)}</span>
            {isOwn && (
              <motion.span
                className="inline-flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                aria-label="Sent"
                title="Sent"
              >
                <span className="w-3 h-3 rounded-full bg-green-400" />
                {/* Simple checkmark */}
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 01.0 1.414l-8 8a1 1 0 01-1.414 0l-4-4A1 1 0 014.707 9.293L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            )}
          </div>

          {/* Tail */}
          <span
            className={`pointer-events-none absolute top-3 w-0 h-0 border-8 border-transparent
              ${
                isOwn
                  ? "right-[-15px] border-l-purple-600/80"
                  : "left-[-15px] border-r-white/10"
              }`}
            aria-hidden
          />

          {/* Hover actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                className={`absolute -top-12 flex gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 border border-white/20 ${
                  isOwn ? "right-0" : "left-0"
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {[
                  { e: "❤️", label: "React with heart" },
                  { e: "👍", label: "React with thumbs up" },
                ].map((r) => (
                  <button
                    key={r.e}
                    onClick={() => onReaction?.(r.e)}
                    className="hover:scale-125 transition-transform"
                    aria-label={r.label}
                    title={r.label}
                  >
                    {r.e}
                  </button>
                ))}

                <button
                  onClick={() => onReply?.(message)}
                  className="hover:scale-125 transition-transform text-white/70"
                  aria-label="Reply"
                  title="Reply"
                >
                  ↩️
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Reactions row */}
        {reactions.length > 0 && (
          <motion.div
            className="flex gap-1 mt-1 ml-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            aria-label="Reactions"
          >
            {reactions.map((r, i) => (
              <motion.span
                key={`${r.emoji}-${i}`}
                className="text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
              >
                {r.emoji} {r.count ?? 1}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Avatar (own message, optional) */}
      {isOwn && showAvatar && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 grid place-items-center text-white text-xs font-semibold shadow-lg"
          whileHover={{ scale: 1.08, rotate: -4 }}
          aria-hidden
        >
          You
        </motion.div>
      )}
    </motion.div>
  );
}
