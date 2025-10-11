import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import illustration (e.g., signup.svg) if available
// import signupIllustration from '../assets/signup.svg';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter a username and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg || 'Registration failed');
      } else {
        // Redirect to login page with success flag
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      console.error(err);
      setError('Network error - please try again');
    }
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 dark:from-gray-800 dark:to-gray-900">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl w-full p-4">
        <div className="md:w-1/2 mb-8 md:mb-0">
          {/* Illustration Image */}
          {/* <img src={signupIllustration} alt="Sign Up" className="w-3/4 mx-auto" /> */}
        </div>
        <motion.div 
          className="md:w-1/2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-xl p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
          {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              className="w-full mb-4 p-3 rounded-lg bg-white/70 dark:bg-gray-700 placeholder-gray-500 focus:outline-none" 
              placeholder="Username" 
              value={username} 
              onChange={handleChangeUsername}
            />
            <input 
              type="password" 
              className="w-full mb-6 p-3 rounded-lg bg-white/70 dark:bg-gray-700 placeholder-gray-500 focus:outline-none" 
              placeholder="Password" 
              value={password} 
              onChange={handleChangePassword}
            />
            <button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg mb-4"
            >
              Create Account
            </button>
          </form>
          <p className="text-center text-sm">
            Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
