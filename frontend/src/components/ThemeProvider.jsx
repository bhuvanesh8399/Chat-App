// src/components/ThemeProvider.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  // On theme change, update a data attribute on the root <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="theme-provider">
      {children}
      {/* Floating theme toggle button */}
      <motion.button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md
                   border border-white/20 flex items-center justify-center text-white
                   shadow-lg z-50"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.span
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? '🌞' : '🌙'}
        </motion.span>
      </motion.button>
    </div>
  );
}

export default ThemeProvider;
