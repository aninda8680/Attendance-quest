"use client"
import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { RegisterModal } from '@/components/RegisterModal';
import { GlobalStats } from '@/components/GlobalStats';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'leaderboard'>('dashboard');
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [syncingAll, setSyncingAll] = useState(false);
  const [isSyncingSubject, setIsSyncingSubject] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { data: usersData, mutate: mutateUsers } = useSWR(`${API_BASE}/api/users`, fetcher);
  const availableUsers = usersData?.success ? usersData.users : [];

  const { data: dashResp, isLoading: isDashLoading, mutate: mutateDash } = useSWR(
    userId ? `${API_BASE}/api/attendance/${userId}?type=dashboard` : null,
    fetcher
  );
  
  const { data: attResp, isLoading: isAttLoading, mutate: mutateAtt } = useSWR(
    userId ? `${API_BASE}/api/attendance/${userId}?type=attendance` : null,
    fetcher
  );
  
  const dashboardData = dashResp?.success ? dashResp.data : null;
  const attendanceData = attResp?.success ? attResp.data : null;

  const currentData = activeTab === 'dashboard' ? dashboardData : activeTab === 'attendance' ? attendanceData : null;
  const isLoading = activeTab === 'dashboard' ? isDashLoading : activeTab === 'attendance' ? isAttLoading : false;

  const mutateAttendance = (data?: any, shouldRevalidate?: boolean) => {
    if (activeTab === 'dashboard') mutateDash(data, shouldRevalidate);
    if (activeTab === 'attendance') mutateAtt(data, shouldRevalidate);
  };

  const handleSyncAll = async () => {
    if (!userId) return;
    setSyncingAll(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance/refresh-all/${userId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully synced ${data.successful} out of ${data.total} records.`);
        mutateAttendance();
      } else {
        alert(`Sync failed: ${data.message}`);
      }
    } catch (e) {
      alert("Failed to sync all records.");
    } finally {
      setSyncingAll(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  const onRegisterSuccess = (newUserId: string) => {
    mutateUsers();
    setIsAddingProfile(false);
  };

  const handleManualSync = async () => {
    if (!userId || activeTab === 'leaderboard') return;
    setIsSyncingSubject(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance/${userId}/sync?type=${activeTab}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        mutateAttendance(data, false);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Failed to sync data.");
    } finally {
      setIsSyncingSubject(false);
    }
  };

  const handleTabSwitch = (tab: 'dashboard' | 'attendance' | 'leaderboard') => {
    setActiveTab(tab);
    setExpandedSubject(null);
  };

  const handleUserSwitch = (newUserId: string) => {
    setDropdownOpen(false);
    localStorage.setItem('userId', newUserId);
    setUserId(newUserId);
    if (activeTab === 'leaderboard') {
      setActiveTab('dashboard');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const currentUser = availableUsers.find((u: any) => u.id === userId);
  
  const displayStudentName = (currentData?.studentName && currentData.studentName !== "Unknown Student") 
    ? currentData.studentName 
    : (currentUser?.name || currentUser?.studentName || `User ${userId || ''}`);
    
  const displayRegInfo = currentData?.regInfo || currentUser?.username || 'Loading Info...';

  return (
    <div className="min-h-screen bg-[#09090b] p-4 md:p-8 font-sans text-zinc-300">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-6 md:mb-8 flex flex-col gap-4 md:gap-6 z-50 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-medium tracking-tight text-white flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-white text-[#09090b] flex items-center justify-center font-bold text-xs shrink-0">
                M
              </div>
              <span className="truncate">SAASS Portal</span>
            </h1>
            
            <div className="flex items-center gap-2 md:gap-3">
              {userId && activeTab !== 'leaderboard' && (
                <button 
                  onClick={handleSyncAll}
                  disabled={syncingAll}
                  className={`flex items-center justify-center gap-2 w-9 h-9 md:w-auto md:px-4 md:py-1.5 ${syncingAll ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400'} text-sm rounded-lg transition-all font-medium border`}
                  title="Sync All Biometric"
                >
                  {syncingAll ? (
                    <svg className="w-4 h-4 animate-spin text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span className="hidden md:inline whitespace-nowrap">Sync All Biometric</span>
                </button>
              )}

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => setIsAddingProfile(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 text-sm rounded-lg transition-all font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Profile
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#121214] border border-white/5 hover:border-white/10 text-zinc-300 text-sm rounded-lg transition-all whitespace-nowrap"
                  >
                    Select Profile <span className="text-[10px] text-zinc-500">▼</span>
                  </button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-[#121214] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
                      >
                        <div className="p-1 flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                          {availableUsers.filter((u: any) => u.id !== userId).map((u: any) => {
                            const displayName = u.name || (u.studentName !== 'Guest User' && u.studentName ? u.studentName.split(' ')[0] : `User ${u.id}`);
                            return (
                              <button
                                key={u.id}
                                onClick={() => handleUserSwitch(u.id)}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                              >
                                <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-[10px]">
                                  {u.username.substring(u.username.length - 2)}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-sm font-medium text-zinc-300 truncate">{displayName}</span>
                                  <span className="text-[11px] text-zinc-600 truncate">{u.username}</span>
                                </div>
                              </button>
                            );
                          })}
                          {availableUsers.filter((u: any) => u.id !== userId).length === 0 && (
                            <div className="px-3 py-3 text-center text-sm text-zinc-600">No other users</div>
                          )}
                        </div>
                        <div className="border-t border-white/5"></div>
                        <div className="p-1">
                          <button 
                            onClick={() => { localStorage.removeItem('userId'); router.push('/'); }} 
                            className="w-full text-left px-3 py-2 text-sm text-[#e5484d] hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile Hamburger */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-[#121214] text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden bg-[#121214] border border-white/5 rounded-xl mt-2"
              >
                <div className="p-2 flex flex-col gap-1">
                  <button 
                    onClick={() => { setIsAddingProfile(true); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-sm rounded-lg transition-all font-medium"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Profile
                  </button>
                  <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-2">Switch Profile</div>
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                    {availableUsers.filter((u: any) => u.id !== userId).map((u: any) => {
                      const displayName = u.name || (u.studentName !== 'Guest User' && u.studentName ? u.studentName.split(' ')[0] : `User ${u.id}`);
                      return (
                        <button
                          key={u.id}
                          onClick={() => { handleUserSwitch(u.id); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                          <div className="w-7 h-7 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-[10px]">
                            {u.username.substring(u.username.length - 2)}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-zinc-300 truncate">{displayName}</span>
                            <span className="text-xs text-zinc-500 truncate">{u.username}</span>
                          </div>
                        </button>
                      );
                    })}
                    {availableUsers.filter((u: any) => u.id !== userId).length === 0 && (
                      <div className="px-3 py-3 text-sm text-zinc-600">No other users</div>
                    )}
                  </div>
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => { localStorage.removeItem('userId'); router.push('/'); }} 
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#e5484d] hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Tabs (Below Header) */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full">
            <div className="flex flex-1 md:flex-none p-1 rounded-lg border bg-[#121214] border-white/5">
              <button 
                onClick={() => handleTabSwitch('dashboard')}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleTabSwitch('attendance')}
                className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Attendance
              </button>
            </div>

            <button 
              onClick={() => handleTabSwitch('leaderboard')}
              className={`flex-1 md:flex-none justify-center flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm transition-all border group whitespace-nowrap ${
                activeTab === 'leaderboard' 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                : 'bg-[#121214] border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
              }`}
            >
              <svg 
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors shrink-0 ${activeTab === 'leaderboard' ? 'text-cyan-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Leaderboard
            </button>
          </div>
        </div>

        <RegisterModal 
          isOpen={isAddingProfile}
          onClose={() => setIsAddingProfile(false)}
          onSuccess={onRegisterSuccess}
          isDark={true}
        />

        {/* Minimalist Profile Header - Hidden on Leaderboard */}
        {activeTab !== 'leaderboard' && (
          <div className="mb-8 pb-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-medium text-zinc-400 shrink-0">
                {displayStudentName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-medium tracking-tight text-white mb-1">{displayStudentName}</h2>
                <div className="text-zinc-500 text-sm font-mono tracking-tight">
                  {displayRegInfo}
                </div>
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
            {(() => {
              const getPercentage = (data: any) => {
                if (!data?.results) return null;
                
                // First check if the college provided a TOTAL SUMMARY row
                const summaryRow = data.results.find((r: any) => r.subject && r.subject.toUpperCase().includes('TOTAL SUMMARY'));
                if (summaryRow && summaryRow.percentage) {
                  return summaryRow.percentage.replace('%', '');
                }

                // Otherwise, calculate using the college's official formula:
                // (Total Present + Total Leave - Total Marked Absent) / Total Classes * 100
                let total = 0;
                let present = 0;
                let leave = 0;
                let markedAbsent = 0;
                
                // Exclude any stray summary rows just in case
                const validResults = data.results.filter((r: any) => !r.subject || !r.subject.toUpperCase().includes('TOTAL SUMMARY'));
                
                validResults.forEach((r: any) => {
                  total += parseInt(r.total) || 0;
                  present += parseInt(r.present) || 0;
                  leave += parseInt(r.leave) || 0;
                  markedAbsent += parseInt(r.markedAbsent) || 0;
                });
                
                return total > 0 ? (((present + leave - markedAbsent) / total) * 100).toFixed(2) : null;
              };

              const dashboardPct = getPercentage(dashboardData);
              const attendancePct = getPercentage(attendanceData);

              const renderBox = (label: string, percentage: string | null, active: boolean) => {
                if (!percentage && !active) return (
                  <div className={`flex flex-col items-end px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] shrink-0 opacity-50`}>
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-50 mb-0.5">{label}</span>
                    <span className="text-xl font-bold font-mono text-zinc-600 whitespace-nowrap">--.--%</span>
                  </div>
                );
                if (!percentage && active && isLoading) return (
                  <div className={`flex flex-col items-end px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] shrink-0 opacity-80`}>
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-50 mb-0.5">{label}</span>
                    <div className="h-6 w-16 bg-white/10 rounded animate-pulse mt-1" />
                  </div>
                );
                
                const val = parseFloat(percentage);
                const isHigh = val >= 75;
                const isLow = val < 60;
                const colorClass = isHigh ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : isLow ? "text-[#e5484d] border-[#e5484d]/20 bg-[#e5484d]/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5";
                
                return (
                  <div className={`flex flex-col items-end px-4 py-2 rounded-xl border ${colorClass} shadow-lg shadow-black/20 shrink-0 ${!active ? 'opacity-60 scale-95' : 'scale-100'} transition-all`}>
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80 mb-0.5 whitespace-nowrap">{label}</span>
                    <span className="text-2xl font-bold font-mono tracking-tighter leading-none whitespace-nowrap">
                      {percentage}<span className="text-sm opacity-70 ml-0.5">%</span>
                    </span>
                  </div>
                );
              };

              return (
                <div className="flex items-center gap-3">
                  {renderBox("Dashboard", dashboardPct, activeTab === 'dashboard')}
                  {renderBox("Attendance", attendancePct, activeTab === 'attendance')}
                  
                  <button 
                    onClick={handleManualSync}
                    disabled={isSyncingSubject || isLoading}
                    className={`ml-2 flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-[#121214] text-zinc-400 hover:text-white hover:bg-white/10 transition-all ${isSyncingSubject || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    title="Refresh Data"
                  >
                    <svg 
                      className={`w-4 h-4 ${isSyncingSubject ? 'animate-spin text-cyan-400' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              );
            })()}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'leaderboard' ? (
            <GlobalStats 
              key="leaderboard"
              currentUserId={userId}
              onUserSwitch={handleUserSwitch}
              isDark={true}
            />
          ) : isLoading && !currentData ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 text-sm">Syncing records...</p>
            </motion.div>
          ) : currentData ? (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="rounded-xl overflow-hidden">
                
                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                  {(() => {
                    const validResults = currentData.results.filter((r: any) => !r.subject || !r.subject.toUpperCase().includes('TOTAL SUMMARY'));
                    
                    if (validResults.length === 0) {
                      return <div className="p-8 text-center text-zinc-600 border border-white/5 bg-[#121214] rounded-xl">No records found.</div>;
                    }

                    return validResults.map((rec: any, i: number) => {
                      const val = parseFloat(rec.percentage);
                      const isHigh = val >= 75;
                      const isLow = val < 60;
                      
                      let percentageColor = isHigh ? "text-emerald-500" : isLow ? "text-[#e5484d]" : "text-amber-500";
                      let percentageBg = isHigh ? "bg-emerald-500/10 border-emerald-500/20" : isLow ? "bg-[#e5484d]/10 border-[#e5484d]/20" : "bg-amber-500/10 border-amber-500/20";
                      const subjName = rec.subject ? rec.subject.replace('Click for details', '').replace(/&nbsp;/g, '').trim() : '';

                      return (
                        <div key={i} className="flex flex-col bg-[#121214] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                          <div 
                            className={`p-4 flex flex-col gap-3 transition-colors ${activeTab === 'dashboard' ? 'active:bg-white/[0.02]' : ''}`}
                            onClick={() => activeTab === 'dashboard' ? setExpandedSubject(expandedSubject === rec.subject ? null : rec.subject) : null}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {activeTab === 'dashboard' && (
                                  <span className="text-zinc-600 text-[10px] w-3 flex justify-center transition-transform shrink-0" style={{ transform: expandedSubject === rec.subject ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                    ▶
                                  </span>
                                )}
                                <h4 className="text-sm text-zinc-300 font-medium truncate" title={subjName}>{subjName}</h4>
                              </div>
                              <div className={`shrink-0 flex items-center justify-center px-2 py-1 rounded-md ${percentageBg} border`}>
                                <span className={`font-mono font-bold text-xs ${percentageColor}`}>{rec.percentage}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col items-center justify-center py-1.5 rounded bg-white/[0.02] border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-500 mb-0.5">Total</span>
                                <span className="text-xs font-mono font-medium text-zinc-300">{rec.total}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                                <span className="text-[9px] uppercase tracking-wider text-emerald-500/70 mb-0.5">Present</span>
                                <span className="text-xs font-mono font-medium text-emerald-500">{rec.present}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center py-1.5 rounded bg-[#e5484d]/5 border border-[#e5484d]/10">
                                <span className="text-[9px] uppercase tracking-wider text-[#e5484d]/70 mb-0.5">Absent</span>
                                <span className="text-xs font-mono font-medium text-[#e5484d]">{rec.absent}</span>
                              </div>
                            </div>

                            {activeTab === 'dashboard' && (
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-white/[0.01]">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">Bio Present</span>
                                  <span className="text-[11px] font-mono text-zinc-400">{rec.bioPresent}</span>
                                </div>
                                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-white/[0.01]">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">Bio Absent</span>
                                  <span className="text-[11px] font-mono text-zinc-400">{rec.bioAbsent}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <AnimatePresence>
                            {expandedSubject === rec.subject && rec.details && rec.details.length > 0 && activeTab === 'dashboard' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[#0c0c0e] border-t border-white/5"
                              >
                                <div className="p-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Timeline</div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleManualSync(); }}
                                      className="flex items-center gap-1.5 px-2 py-1 bg-[#121214] border border-white/10 text-zinc-300 rounded text-[9px] font-medium"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      Sync
                                    </button>
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    {rec.details.map((detail: any, j: number) => (
                                      <div key={j} className="flex flex-col p-2.5 rounded bg-white/[0.02] border border-white/5">
                                        <div className="flex justify-between items-start mb-1.5">
                                          <div className="flex flex-col gap-0.5">
                                            <span className="font-mono text-xs text-zinc-300 leading-none">{detail.date}</span>
                                            <span className="font-mono text-[9px] text-zinc-500 leading-none">{detail.time}</span>
                                          </div>
                                          <div className="text-right flex flex-col items-end">
                                            {detail.status.finalStatus === 'present' ? <span className="text-emerald-500 font-bold font-mono text-xs">P</span> : detail.status.finalStatus === 'absent' ? <span className="text-[#e5484d] font-bold font-mono text-xs">A</span> : <span className="text-amber-500 font-bold font-mono text-xs">W</span>}
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                          <span className="text-[10px] text-zinc-400 truncate w-full" title={detail.faculty}>{detail.faculty}</span>
                                          <div className="flex items-center gap-3 text-[9px] text-zinc-500 uppercase tracking-wide">
                                            <span className="flex items-center gap-1">Class {detail.status.classStatus === 'present' ? <span className="text-emerald-500/80">✓</span> : <span className="text-[#e5484d]/80">✕</span>}</span>
                                            <span className="flex items-center gap-1">Bio {detail.status.bioStatus === 'present' ? <span className="text-emerald-500/80">✓</span> : <span className="text-[#e5484d]/80">✕</span>}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto border border-white/5 bg-[#121214] rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#121214] text-zinc-400">
                        <th className="px-5 py-3 font-medium whitespace-nowrap">{activeTab === 'dashboard' ? 'Subject' : 'Course'}</th>
                        <th className="px-5 py-3 text-center font-medium">Total</th>
                        <th className="px-5 py-3 text-center font-medium">Attended</th>
                        <th className="px-5 py-3 text-center font-medium">Missed</th>
                        {activeTab === 'dashboard' && (
                          <>
                            <th className="px-5 py-3 text-center font-medium whitespace-nowrap">Bio Present</th>
                            <th className="px-5 py-3 text-center font-medium whitespace-nowrap">Bio Absent</th>
                          </>
                        )}
                        <th className="px-5 py-3 text-right font-medium">Rate</th>
                      </tr>
                    </thead>
                    <motion.tbody 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="divide-y divide-white/5 bg-[#09090b]"
                    >
                      {(() => {
                        const validResults = currentData.results.filter((r: any) => !r.subject || !r.subject.toUpperCase().includes('TOTAL SUMMARY'));
                        
                        if (validResults.length === 0) {
                          return <tr><td colSpan={10} className="p-8 text-center text-zinc-600">No records found.</td></tr>;
                        }

                        return validResults.map((rec: any, i: number) => {
                          const val = parseFloat(rec.percentage);
                          const isHigh = val >= 75;
                          const isLow = val < 60;
                          
                          let percentageColor = isHigh ? "text-emerald-500" : isLow ? "text-[#e5484d]" : "text-amber-500";
                          const subjName = rec.subject ? rec.subject.replace('Click for details', '').replace(/&nbsp;/g, '').trim() : '';
                          
                          return (
                            <Fragment key={i}>
                              <motion.tr 
                                variants={itemVariants}
                                onClick={() => activeTab === 'dashboard' ? setExpandedSubject(expandedSubject === rec.subject ? null : rec.subject) : null}
                                className={`transition-colors ${activeTab === 'dashboard' ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'} ${expandedSubject === rec.subject ? 'bg-white/[0.02]' : ''}`}
                              >
                                <td className="px-5 py-3.5 text-zinc-300">
                                  <div className="flex items-center gap-2">
                                    {activeTab === 'dashboard' && (
                                      <span className="text-zinc-600 text-[10px] w-3 flex justify-center transition-transform" style={{ transform: expandedSubject === rec.subject ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                        ▶
                                      </span>
                                    )}
                                    <div className="truncate max-w-[180px] md:max-w-[380px]" title={subjName}>
                                      {subjName}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className="inline-block min-w-[32px] py-1 px-2.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-xs font-semibold">
                                    {rec.total}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className="inline-block min-w-[32px] py-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs font-semibold">
                                    {rec.present}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className="inline-block min-w-[32px] py-1 px-2.5 rounded-full bg-[#e5484d]/10 text-[#e5484d] font-mono text-xs font-semibold">
                                    {rec.absent}
                                  </span>
                                </td>
                                
                                {activeTab === 'dashboard' && (
                                  <>
                                    <td className="px-5 py-3.5 text-center text-zinc-500 font-mono">{rec.bioPresent}</td>
                                    <td className="px-5 py-3.5 text-center text-zinc-500 font-mono">{rec.bioAbsent}</td>
                                  </>
                                )}
                                
                                <td className={`px-5 py-3.5 text-right font-mono font-medium ${percentageColor}`}>
                                  {rec.percentage}
                                </td>
                              </motion.tr>
                              <AnimatePresence>
                                {expandedSubject === rec.subject && rec.details && rec.details.length > 0 && activeTab === 'dashboard' && (
                                  <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-[#0c0c0e]"
                                  >
                                    <td colSpan={10} className="p-0 border-b border-white/5">
                                      <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 md:px-8 md:py-6 overflow-x-auto border-t border-white/5 shadow-inner"
                                      >
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Attendance Timeline</div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleManualSync(); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121214] hover:bg-white/10 border border-white/10 shadow-sm text-zinc-300 rounded-md text-[10px] font-medium transition-colors"
                                          >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Sync Subject
                                          </button>
                                        </div>
                                        <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                                          <thead>
                                            <tr className="text-zinc-500 border-b border-white/5">
                                              <th className="pb-2 font-medium whitespace-nowrap">Date</th>
                                              <th className="pb-2 font-medium whitespace-nowrap">Time</th>
                                              <th className="pb-2 font-medium">Faculty</th>
                                              <th className="pb-2 text-center font-medium">Class</th>
                                              <th className="pb-2 text-center font-medium">Biometric</th>
                                              <th className="pb-2 text-center font-medium">Final</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-white/5">
                                            {rec.details.map((detail: any, j: number) => (
                                              <tr key={j} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 font-mono text-zinc-300 whitespace-nowrap">{detail.date}</td>
                                                <td className="py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">{detail.time}</td>
                                                <td className="py-3 truncate max-w-[120px] text-zinc-400" title={detail.faculty}>{detail.faculty}</td>
                                                <td className="py-3 text-center">
                                                  {detail.status.classStatus === 'present' ? <span className="text-emerald-500/80 font-mono">✓</span> : <span className="text-[#e5484d]/80 font-mono">✕</span>}
                                                </td>
                                                <td className="py-3 text-center">
                                                  {detail.status.bioStatus === 'present' ? <span className="text-emerald-500/80 font-mono">✓</span> : <span className="text-[#e5484d]/80 font-mono">✕</span>}
                                                </td>
                                                <td className="py-3 text-center">
                                                  {detail.status.finalStatus === 'present' ? <span className="text-emerald-500 font-bold font-mono">P</span> : detail.status.finalStatus === 'absent' ? <span className="text-[#e5484d] font-bold font-mono">A</span> : <span className="text-amber-500 font-bold font-mono">W</span>}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </motion.div>
                                    </td>
                                  </motion.tr>
                                )}
                              </AnimatePresence>
                            </Fragment>
                          );
                        })
                      })()}
                    </motion.tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}