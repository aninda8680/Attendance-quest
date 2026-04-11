"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<{ id: number; username: string; name?: string; studentName?: string }[]>([]);
  const [fetching, setFetching] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animFrame = requestAnimationFrame(() => {
      setCursor(mousePos);
    });
    return () => cancelAnimationFrame(animFrame);
  }, [mousePos]);

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(() => console.error("Error fetching users"))
      .finally(() => setFetching(false));
  }, []);

  const handleLogin = async (username: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        window.location.assign('/dashboard');
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to connect to backend.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-300 ${
      isDark 
        ? 'bg-[#09090b]' 
        : 'bg-white'
    }`}>
      <motion.div 
        className={`fixed w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10' 
            : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
        }`}
        style={{ 
          left: cursor.x - 192, 
          top: cursor.y - 192,
          transition: 'left 0.2s ease-out, top 0.2s ease-out'
        }}
      />

      <div className={`absolute inset-0 bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] transition-colors duration-300 ${
        isDark 
          ? 'bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]' 
          : 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]'
      }`} />
      
      <div className={`absolute top-0 left-1/4 w-px h-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent' : 'bg-gradient-to-b from-cyan-500/30 via-transparent to-transparent'}`} />
      <div className={`absolute top-0 right-1/3 w-px h-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-purple-500/20 via-transparent to-transparent' : 'bg-gradient-to-b from-purple-500/30 via-transparent to-transparent'}`} />
      <div className={`absolute top-1/3 left-0 w-full h-px transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-transparent via-zinc-800 to-transparent' : 'bg-gradient-to-r from-transparent via-zinc-200 to-transparent'}`} />
      <div className={`absolute bottom-1/4 left-0 w-full h-px transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-transparent via-zinc-800 to-transparent' : 'bg-gradient-to-r from-transparent via-zinc-200 to-transparent'}`} />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 md:p-10"
      >
        <div className="absolute top-6 right-6 md:top-8 md:right-10">
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-12 rounded-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-900/80 border-zinc-800 hover:border-cyan-500/50' 
                : 'bg-zinc-100/80 border-zinc-200 hover:border-cyan-500'
            }`}
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'light' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center w-full h-full"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </motion.div>
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
                isDark ? 'shadow-cyan-500/25' : 'shadow-cyan-500/30'
              }`}>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isDark ? 'bg-emerald-500 border-zinc-900' : 'bg-emerald-500 border-white'
              }`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300 ${
              isDark 
                ? 'from-white via-zinc-300 to-white' 
                : 'from-zinc-900 via-zinc-700 to-zinc-900'
            }`}>SAASS</span>
            <span className="text-cyan-500">.</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-xs font-mono px-2 py-1 rounded transition-colors duration-300 ${
              isDark ? 'text-zinc-400 bg-zinc-800/50' : 'text-zinc-400 bg-zinc-100'
            }`}>v2.4.1</span>
            <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ONLINE</span>
          </div>
          <p className={`text-sm mt-4 font-medium transition-colors duration-300 ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>Select your profile to continue</p>
        </motion.div>
        
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <div className="relative w-12 h-12">
              <div className={`absolute inset-0 border-2 rounded-full transition-colors duration-300 ${
                isDark ? 'border-zinc-800' : 'border-zinc-200'
              }`} />
              <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full animate-spin" />
            </div>
            <p className={`text-sm font-medium mt-4 animate-pulse transition-colors duration-300 ${
              isDark ? 'text-zinc-400' : 'text-zinc-400'
            }`}>Loading profiles...</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl"
          >
            {users.map((u, idx) => (
              <motion.button
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={u.id}
                onClick={() => handleLogin(u.username)}
                className={`group relative rounded-2xl p-6 text-left transition-all duration-300 overflow-hidden ${
                  isDark
                    ? 'bg-zinc-900/80 border border-white/10 hover:border-cyan-500/50 hover:bg-zinc-900 shadow-lg hover:shadow-cyan-500/10'
                    : 'bg-white border-2 border-zinc-200 hover:border-cyan-500 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-inner ${
                      isDark
                        ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400 group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white'
                        : 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-600 group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white'
                    }`}>
                      {u.username.length >= 2 ? u.username.substring(u.username.length - 2).toUpperCase() : '?'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 group-hover:border-cyan-500'
                        : 'bg-white border-zinc-200 group-hover:border-cyan-500'
                    }`}>
                      <svg className={`w-2.5 h-2.5 transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:text-cyan-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded mb-2 inline-block dark:bg-cyan-500/10 dark:text-cyan-400">
                      ID:{String(u.id).padStart(4, '0')}
                    </span>
                    <h3 className={`font-semibold text-base mb-0.5 truncate transition-colors ${
                      isDark 
                        ? 'text-zinc-200 group-hover:text-cyan-400' 
                        : 'text-zinc-900 group-hover:text-cyan-700'
                    }`}>
                      {u.name || (u.studentName !== 'Guest User' && u.studentName ? u.studentName.split(' ')[0] : `User ${u.id}`)}
                    </h3>
                    <p className={`text-xs font-mono truncate transition-colors ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {u.username}
                    </p>
                  </div>
                </div>

                <div className={`mt-4 pt-4 flex items-center justify-between transition-colors ${
                  isDark ? 'border-t border-white/5' : 'border-t border-zinc-100'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>ACTIVE</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>PROFILE_{idx + 1}</span>
                </div>
              </motion.button>
            ))}
            
            {users.length === 0 && !fetching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`col-span-full flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-colors ${
                  isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <svg className={`w-12 h-12 mb-4 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No profiles found.</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>Contact administrator</p>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-16 flex items-center gap-6 text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SYSTEMS_NOMINAL
          </span>
          <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>|</span>
          <span>SECURE_CONNECTION</span>
          <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>|</span>
          <span>AUTH_PORTAL</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
