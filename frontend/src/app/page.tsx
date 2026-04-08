"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

export default function LoginPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(err => console.error("Error fetching users:", err))
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
        router.push('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to connect to backend.');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-4xl flex flex-col items-center"
      >
        <h1 className="text-3xl font-medium tracking-tight mb-12 text-center text-zinc-100">
          Select Profile
        </h1>
        
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading users...</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap justify-center gap-4 w-full"
          >
            {users.map((u) => (
              <motion.button
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={u.id}
                onClick={() => handleLogin(u.username)}
                className="group flex flex-col items-start px-6 py-5 bg-[#121214] hover:bg-[#18181b] border border-white/5 hover:border-white/10 rounded-xl transition-all w-56 text-left"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-sm font-medium mb-4 group-hover:bg-zinc-700 transition-colors">
                  {u.username.length >= 2 ? u.username.substring(u.username.length - 2) : '?'}
                </div>
                <div className="flex flex-col w-full">
                  <span className="font-medium text-zinc-200 text-base mb-0.5 truncate w-full">
                    {u.name || (u.studentName !== 'Guest User' && u.studentName ? u.studentName.split(' ')[0] : `User ${u.id}`)}
                  </span>
                  <span className="text-xs text-zinc-500 truncate w-full">
                    {u.username}
                  </span>
                </div>
              </motion.button>
            ))}
            
            {users.length === 0 && !fetching && (
              <div className="flex flex-col items-center justify-center p-12 bg-[#121214] rounded-xl border border-white/5 w-full max-w-sm">
                <p className="text-zinc-500 text-sm">No users found.</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}