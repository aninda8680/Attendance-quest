"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { RegisterModal } from '@/components/RegisterModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<{ id: number; username: string; name?: string; studentName?: string }[]>([]);
  const [fetching, setFetching] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          // Next.js uses caching by default. We want to force it to refetch for testing.
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (username: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        cache: 'no-store'
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

  const onRegisterSuccess = async () => {
    // Refresh users
    const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) setUsers(data.users);
    setIsRegistering(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
          left: mousePos.x - 192, 
          top: mousePos.y - 192
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
        <div className="absolute top-6 right-6 md:top-8 md:right-10 flex items-center gap-3">
          <button
            onClick={() => setIsRegistering(true)}
            className={`h-12 px-5 rounded-xl border transition-all duration-300 flex items-center gap-2 group font-medium text-sm ${
              isDark 
                ? 'bg-zinc-900/80 border-zinc-800 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-400' 
                : 'bg-zinc-100/80 border-zinc-200 hover:border-cyan-500 text-zinc-600 hover:text-cyan-600'
            }`}
            aria-label="Add new profile"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Profile</span>
          </button>

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
          <p className={`text-sm mt-4 font-medium transition-colors duration-300 ${
            isDark ? 'text-zinc-500' : 'text-zinc-600'
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
      
      {/* Registration Modal */}
      <RegisterModal 
        isOpen={isRegistering}
        onClose={() => setIsRegistering(false)}
        onSuccess={onRegisterSuccess}
        isDark={isDark}
      />
    </div>
  );
}
