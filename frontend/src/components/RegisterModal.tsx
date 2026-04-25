"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
  isDark: boolean;
}

export function RegisterModal({ isOpen, onClose, onSuccess, isDark }: RegisterModalProps) {
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword, name: regName })
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.userId);
        setRegUsername('');
        setRegPassword('');
        setRegName('');
        onClose();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch {
      alert('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 ${
              isDark ? 'bg-[#121214] border border-white/5' : 'bg-white'
            }`}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Register New Profile</h3>
                  <p className={`text-xs font-mono mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>SECURE_GATEWAY // AUTH_ENROLLMENT</p>
                </div>
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-xs font-mono tracking-wider uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Display Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full px-5 py-4 rounded-2xl border transition-all focus:ring-2 focus:ring-cyan-500/20 outline-none text-base ${
                        isDark ? 'bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-xs font-mono tracking-wider uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Reg Number *</label>
                    <input 
                      required
                      type="text" 
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="2110010001"
                      className={`w-full px-5 py-4 rounded-2xl border transition-all focus:ring-2 focus:ring-cyan-500/20 outline-none text-base ${
                        isDark ? 'bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-mono tracking-wider uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Password *</label>
                    <input 
                      required
                      type="password" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-5 py-4 rounded-2xl border transition-all focus:ring-2 focus:ring-cyan-500/20 outline-none text-base ${
                        isDark ? 'bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={submitting}
                    type="submit"
                    className={`w-full py-4 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
                      submitting 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>CONNECTING_SYSTEM...</span>
                      </>
                    ) : (
                      <span>INITIALIZE_PROFILE</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className={`px-8 py-4 flex items-center justify-center gap-2 text-[10px] font-mono transition-colors ${
              isDark ? 'bg-white/5 text-zinc-500' : 'bg-zinc-50 text-zinc-400 border-t border-zinc-100'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>SECURE_ENCRYPTION_ACTIVE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
