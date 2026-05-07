"use client"
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://attendance-quest-backend.onrender.com' : 'http://localhost:5000');

interface GlobalStatsProps {
  currentUserId: string | null;
  onUserSwitch: (userId: string) => void;
  isDark: boolean;
}

export function GlobalStats({ currentUserId, onUserSwitch, isDark }: GlobalStatsProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('Overall');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/stats`);
        const data = await res.json();
        if (data.success) {
          // Sort by name for a stable X-axis across sessions
          const sorted = data.stats.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setData(sorted);
          
          // Extract unique subjects
          const subjectsSet = new Set<string>();
          sorted.forEach((user: any) => {
            if (user.subjects) {
              Object.keys(user.subjects).forEach(sub => subjectsSet.add(sub));
            }
          });
          setAvailableSubjects(Array.from(subjectsSet).sort());
        }
      } catch (error) {
        console.error("Error fetching stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
          isDark ? 'bg-[#121214]/90 border-white/10' : 'bg-white/90 border-zinc-200'
        }`}>
          <p className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{label}</p>
          <div className="space-y-3">
            {payload.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    {p.name.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-white">
                  {p.value === 0 ? 'N/A' : `${p.value}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Processing_Data_Matrix...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-3xl border transition-all duration-500 ${
        isDark ? 'bg-[#121214]/40 border-white/5 backdrop-blur-sm' : 'bg-white border-zinc-100 shadow-xl'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h3 className={`text-xl font-medium tracking-tight mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Who Leading ??
          </h3>
          
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border outline-none cursor-pointer transition-all ${
              isDark 
                ? 'bg-[#121214] border-white/10 text-white hover:border-white/20' 
                : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300'
            }`}
          >
            <option value="Overall">OVERALL ATTENDANCE</option>
            {availableSubjects.map(sub => (
              <option key={sub} value={sub}>{sub.toUpperCase()}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase">
              {selectedSubject === 'Overall' ? 'Overall View' : 'Subject View'}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.map(d => ({
              ...d,
              displayValue: selectedSubject === 'Overall' ? d.attendancePct : (d.subjects?.[selectedSubject] || 0)
            }))}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload) {
                onUserSwitch(state.activePayload[0].payload.id);
              }
            }}
          >
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              horizontal={true} 
              stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
            />
            <XAxis 
              dataKey="name" 
              stroke={isDark ? '#3f3f46' : '#d4d4d8'} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ dy: 10, fontWeight: 500 }}
            />
            <YAxis 
              domain={[0, 100]} 
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              stroke={isDark ? '#3f3f46' : '#d4d4d8'} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#52525b', strokeWidth: 1 }}
            />

            <Area 
              type="monotone" 
              dataKey="displayValue" 
              name={selectedSubject === 'Overall' ? 'Overall Attendance' : selectedSubject}
              stroke="#a855f7" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAttendance)" 
              dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: isDark ? '#121214' : '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      

    </motion.div>
  );
}
