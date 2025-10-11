import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../lib/AuthContext';

const NavBar = () => {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    // Sync data-theme attribute with dark mode state
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    // data-theme will update via useEffect
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-xl font-bold">{import.meta.env.VITE_APP_NAME || 'ChatApp'}</h1>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={clsx(
              'w-10 h-10 rounded-full border flex items-center justify-center transition-colors',
              darkMode
                ? 'bg-white/20 text-black border-white/30 hover:bg-white/30'
                : 'bg-black/20 text-white border-black/30 hover:bg-black/30'
            )}
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
