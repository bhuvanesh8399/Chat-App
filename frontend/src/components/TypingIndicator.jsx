// src/components/TypingIndicator.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ users = [] }) {
  if (!users.length) return null;

  const displayName =
    users.length === 1 ? `${users[0]} is typing` : `${users.length} people are typing`;

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center gap-3 px-4 py-3 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        {/* Avatar bubble (based on first user) */}
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600
                     flex items-center justify-center text-white text-sm font-semibold shadow-md"
          whileHover={{ scale: 1.1 }}
        >
          {users[0][0].toUpperCase()}
        </motion.div>

        {/* Text bubble with dots animation */}
        <div
          className="bg-white/10 backdrop-blur-md border border-white/20
                     rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <span className="text-white/70 text-sm">{displayName}</span>

          {/* Typing animated dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
