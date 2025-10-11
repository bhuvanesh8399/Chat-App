// src/components/RoomCard.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../lib/utils';

function RoomCard({ room, isActive, onClick, unreadCount = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-200 
        backdrop-blur-md border group
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 border-blue-400/50 shadow-lg' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }
      `}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Room/Contact Avatar */}
        <div className="relative">
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 
                       flex items-center justify-center text-white font-semibold shadow-lg"
            whileHover={{ rotate: 5 }}
          >
            {room.name[0]}
          </motion.div>
          {/* Online status indicator (green dot) */}
          {room.isOnline && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-gray-900 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </div>

        {/* Room name and last message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-sm truncate ${
              isActive ? 'text-white' : 'text-white/90'
            }`}>
              {room.name}
            </h3>
            {room.lastMessage && (
              <span className={`text-xs ${
                isActive ? 'text-white/70' : 'text-white/50'
              }`}>
                {formatTime(room.lastMessage.timestamp)}
              </span>
            )}
          </div>
          {room.lastMessage && (
            <p className={`text-xs truncate mt-1 ${
              isActive ? 'text-white/70' : 'text-white/60'
            }`}>
              {room.lastMessage.content}
            </p>
          )}
        </div>

        {/* Unread messages badge */}
        {unreadCount > 0 && (
          <motion.div
            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full 
                       min-w-[20px] text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </div>

      {/* Hover overlay effect (blue/purple glow) */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 
                       border border-blue-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RoomCard;
