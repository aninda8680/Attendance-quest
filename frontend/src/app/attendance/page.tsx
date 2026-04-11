"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

export default function AttendancePage() {
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  const stats = [
    { label: 'TOTAL_CLASSES', value: '156', color: 'cyan' },
    { label: 'ATTENDED', value: '142', color: 'emerald' },
    { label: 'ABSENT', value: '14', color: 'rose' },
    { label: 'ATTENDANCE_RATE', value: '91.02%', color: 'amber' },
  ];

  const recentSessions = [
    { id: 1, course: 'Machine Learning', date: '2026-04-11', status: 'present', type: 'LAB' },
    { id: 2, course: 'Database Systems', date: '2026-04-11', status: 'present', type: 'LEC' },
    { id: 3, course: 'Software Engineering', date: '2026-04-10', status: 'absent', type: 'LEC' },
    { id: 4, course: 'Computer Networks', date: '2026-04-10', status: 'present', type: 'LEC' },
    { id: 5, course: 'Web Development', date: '2026-04-09', status: 'present', type: 'LAB' },
  ];

  const getStatusColor = (status: string) => {
    return status === 'present' 
      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
      : isDark ? 'text-rose-400' : 'text-rose-600';
  };

  const getTypeColor = (type: string) => {
    return type === 'LAB' 
      ? isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
      : isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700';
  };

  return (
    <div className={`min-h-screen font-sans overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-[#09090b] text-zinc-300' 
        : 'bg-zinc-50 text-zinc-700'
    }`}>
      <div className={`fixed inset-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-[linear-gradient(rgba(15,15,15,0.95),rgba(9,9,11,0.98)),linear-gradient(90deg,transparent_49.5%,rgba(0,212,255,0.03)_50%,transparent_50.5%),linear-gradient(0deg,transparent_49.5%,rgba(0,212,255,0.03)_50%,transparent_50.5%)] [background-size:100%_100%,60px_60px,60px_60px]'
          : 'bg-[linear-gradient(rgba(255,255,255,0.95),rgba(250,250,250,0.98)),linear-gradient(90deg,transparent_49.5%,rgba(0,212,255,0.05)_50%,transparent_50.5%),linear-gradient(0deg,transparent_49.5%,rgba(0,212,255,0.05)_50%,transparent_50.5%)] [background-size:100%_100%,60px_60px,60px_60px]'
      }`} />
      <div className={`fixed inset-0 transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5' : 'bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10'
      }`} />
      
      <div className={`fixed top-0 left-0 w-full h-px transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent'
      }`} />
      <div className={`fixed bottom-0 left-0 w-full h-px transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-400/50 to-transparent'
      }`} />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto"
      >
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30' 
                  : 'bg-gradient-to-br from-cyan-100 to-purple-100 border-cyan-300'
              }`}>
                <svg className={`w-6 h-6 transition-colors ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className={`text-xl font-medium tracking-tight transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>ATTENDANCE_TRACKER</h1>
              <p className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>v2.4.1 // LIVE</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>System Time</p>
              <p className={`text-2xl font-mono font-bold tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{time}</p>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <div className="text-right">
              <p className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Current Date</p>
              <p className={`text-sm font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{date}</p>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <button
              onClick={toggleTheme}
              className={`relative w-10 h-10 rounded-lg border transition-all duration-300 ${
                isDark 
                  ? 'bg-zinc-900/80 border-zinc-800 hover:border-cyan-500/50' 
                  : 'bg-white border-zinc-200 hover:border-cyan-500'
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
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`relative rounded-xl border backdrop-blur-sm transition-colors duration-300 ${
                isDark 
                  ? 'bg-[#121214]/80 border-white/5' 
                  : 'bg-white/80 border-zinc-200'
              } p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{stat.label}</span>
                  <div className={`w-2 h-2 rounded-full bg-${stat.color}-500 animate-pulse`} />
                </div>
                <p className={`text-3xl font-mono font-bold ${
                  stat.color === 'cyan' ? (isDark ? 'text-cyan-400' : 'text-cyan-600') : 
                  stat.color === 'emerald' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : 
                  stat.color === 'rose' ? (isDark ? 'text-rose-400' : 'text-rose-600') : 
                  (isDark ? 'text-amber-400' : 'text-amber-600')
                }`}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`lg:col-span-2 rounded-xl overflow-hidden backdrop-blur-sm transition-colors duration-300 ${
              isDark 
                ? 'bg-[#121214]/80 border border-white/5' 
                : 'bg-white/80 border border-zinc-200'
            }`}
          >
            <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
              isDark ? 'border-white/5' : 'border-zinc-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-rose-500/80' : 'bg-rose-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-amber-500/80' : 'bg-amber-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-emerald-500/80' : 'bg-emerald-500'}`} />
                </div>
                <span className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Recent Sessions</span>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>LIVE_FEED</span>
            </div>
            <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-zinc-100'}`}>
              {recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className={`px-5 py-4 flex items-center justify-between transition-colors ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-2 py-1 rounded text-[10px] font-mono font-medium ${getTypeColor(session.type)}`}>
                      {session.type}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{session.course}</p>
                      <p className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-medium uppercase ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      session.status === 'present' 
                        ? (isDark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50')
                        : (isDark ? 'border-rose-500/30 bg-rose-500/10' : 'border-rose-300 bg-rose-50')
                    }`}>
                      {session.status === 'present' ? (
                        <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-xl overflow-hidden backdrop-blur-sm transition-colors duration-300 ${
              isDark 
                ? 'bg-[#121214]/80 border border-white/5' 
                : 'bg-white/80 border border-zinc-200'
            }`}
          >
            <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
              <span className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Weekly Overview</span>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between h-32 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [70, 100, 85, 60, 90, 40, 0];
                  const isToday = i === 2;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t-md transition-all ${
                          isToday 
                            ? (isDark ? 'bg-gradient-to-t from-cyan-500 to-cyan-400/50' : 'bg-gradient-to-t from-cyan-500 to-cyan-400/50')
                            : (isDark ? 'bg-zinc-800' : 'bg-zinc-200')
                        }`}
                        style={{ height: `${heights[i]}%` }}
                      />
                      <span className={`text-[10px] font-mono ${isToday ? (isDark ? 'text-cyan-400' : 'text-cyan-600') : (isDark ? 'text-zinc-500' : 'text-zinc-400')}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>This Week</span>
                  <span className={`font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>5/5 Present</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div className={`h-full w-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full`} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`flex items-center justify-between text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM_ONLINE
            </span>
            <span>SESSION_ID: A7X9K2M4</span>
          </div>
          <span>BUILD: 2026.04.12</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
