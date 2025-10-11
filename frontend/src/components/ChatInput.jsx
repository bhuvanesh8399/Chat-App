// src/components/ChatInput.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInput({
  onSendMessage,
  onTyping,
  onAttach,                 // optional: (files) => void
  placeholder = "Type a message...",
  allowNewlines = true,     // shift+Enter for newline; Enter alone sends
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  // --- Helpers ---------------------------------------------------------------
  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000); // stop typing indicator 1s after last keystroke
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    onSendMessage?.(text);
    setMessage("");
    setIsTyping(false);
    onTyping?.(false);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !allowNewlines) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Enter" && !e.shiftKey && allowNewlines) {
      // default behavior: Enter sends, Shift+Enter makes newline
      e.preventDefault();
      handleSend();
    }
  };

  const onChange = (e) => {
    setMessage(e.target.value);
    startTyping();
    // autosize basic (optional): grow up to 6 rows
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 6 * 24 + 24) + "px";
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
    startTyping();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFilesPicked = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAttach?.(files);
    // reset so picking the same file again still triggers change
    e.target.value = "";
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeout.current);
  }, []);

  // disable all inputs when disabled is true
  const isDisabled = !!disabled;

  return (
    <motion.div
      className="p-4 border-t border-white/10"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <div className="flex items-end gap-3">
        {/* Attachment */}
        <motion.button
          type="button"
          onClick={openFilePicker}
          disabled={isDisabled}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white/70 hover:text-white
                     disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={{ scale: isDisabled ? 1 : 1.1 }}
          whileTap={{ scale: isDisabled ? 1 : 0.92 }}
          title="Attach file"
          aria-label="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={onFilesPicked}
        />

        {/* Input */}
        <div className="flex-1 relative">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl
                          overflow-hidden focus-within:border-blue-400/50 transition-all duration-200">
            <div className="flex items-end min-h-[48px]">
              <textarea
                ref={inputRef}
                value={message}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={isDisabled}
                className="flex-1 bg-transparent text-white placeholder-white/50 px-4 py-3
                           resize-none outline-none max-h-40 min-h-[48px] leading-relaxed"
                rows={1}
                aria-label="Message input"
              />

              {/* Emoji toggle */}
              <button
                type="button"
                onClick={() => setShowEmoji((s) => !s)}
                disabled={isDisabled}
                className="p-3 text-white/60 hover:text-white transition-colors disabled:opacity-40"
                title="Insert emoji"
                aria-label="Insert emoji"
              >
                😀
              </button>
            </div>
          </div>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && !isDisabled && (
              <motion.div
                className="absolute bottom-full mb-2 right-0 bg-black/80 backdrop-blur-xl
                           border border-white/20 rounded-2xl p-4 w-64 shadow-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "😀","😂","❤️","👍","🎉","🔥","💯","👏",
                    "😍","🤔","😎","🙌","💪","✨","🎯","🚀",
                    "😇","🥳","🤝","📌","🧠","📝","🔒","🕒",
                  ].map((e) => (
                    <motion.button
                      key={e}
                      type="button"
                      onClick={() => addEmoji(e)}
                      className="text-xl hover:bg-white/10 rounded p-1 transition-colors"
                      whileHover={{ scale: 1.18 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {e}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={isDisabled || !message.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600
                     flex items-center justify-center text-white shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: !isDisabled && message.trim() ? 1.1 : 1 }}
          whileTap={{ scale: !isDisabled && message.trim() ? 0.92 : 1 }}
          title="Send message"
          aria-label="Send message"
        >
          {/* Paper plane */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
