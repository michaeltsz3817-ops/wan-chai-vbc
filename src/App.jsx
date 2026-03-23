import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, History, DollarSign, Plus, LayoutDashboard, Trash2, ShieldCheck, HelpCircle, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PlayerManager from './components/PlayerManager';
import TeamGenerator from './components/TeamGenerator';
import MatchSession from './components/MatchSession';
import StatsHub from './components/StatsHub';
import DailyReport from './components/DailyReport';
import { Dock } from './components/ui/dock-two';

const DEFAULT_SKILLS = { atk: 1, def: 1, srv: 1, set: 1, blk: 1, pwr: 1 };

function App() {
    useEffect(() => {
        console.log('App Mounted');
    }, []);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAdmin, setIsAdmin] = useState(false);
    
    // ... rest of the states ...
    const [players, setPlayers] = useState(() => {
        try {
            const saved = localStorage.getItem('vbc-players') || localStorage.getItem('vbc_players');
            const parsed = saved ? JSON.parse(saved) : null;
            return (Array.isArray(parsed) ? parsed.filter(Boolean) : null) || [
                { id: '1', name: '阿強', icon: '🔥', skill: 5, skills: { ...DEFAULT_SKILLS, atk: 5, pwr: 4 } },
                { id: '2', name: '小明', icon: '🦁', skill: 2, skills: { ...DEFAULT_SKILLS, def: 3 } },
                { id: '3', name: '大師兄', icon: '⚡️', skill: 4, skills: { ...DEFAULT_SKILLS, atk: 4, srv: 4 } },
                { id: '4', name: '波子', icon: '🧤', skill: 3, skills: { ...DEFAULT_SKILLS, set: 4 } },
                { id: '5', name: '阿飛', icon: '🦅', skill: 4, skills: { ...DEFAULT_SKILLS, blk: 4 } },
            ];
        } catch (e) {
            console.error('Failed to parse players:', e);
            return [];
        }
    });

    const [matches, setMatches] = useState(() => {
        try {
            const saved = localStorage.getItem('vbc-matches') || localStorage.getItem('vbc_matches');
            const parsed = saved ? JSON.parse(saved) : null;
            return (Array.isArray(parsed) ? parsed.filter(Boolean) : null) || [];
        } catch (e) {
            console.error('Failed to parse matches:', e);
            return [];
        }
    });

    const [teams, setTeams] = useState([]);
    const [gameStep, setGameStep] = useState(0);
    const [g1WinnerIdx, setG1WinnerIdx] = useState(null);
    const [presentPlayerIds, setPresentPlayerIds] = useState(() => {
        try {
            const saved = localStorage.getItem('vbc-present');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(() => {
        try {
            const saved = localStorage.getItem('vbc-attendance-confirmed');
            return saved === 'true';
        } catch (e) {
            return false;
        }
    });

    // Persistence
    useEffect(() => {
        try {
            localStorage.setItem('vbc-players', JSON.stringify(players));
            localStorage.setItem('vbc-matches', JSON.stringify(matches));
            localStorage.setItem('vbc-present', JSON.stringify(presentPlayerIds));
            localStorage.setItem('vbc-attendance-confirmed', isAttendanceConfirmed.toString());
        } catch (error) {
            console.error('Persistence failed:', error);
        }
    }, [players, matches, presentPlayerIds, isAttendanceConfirmed]);

    // Data Migration: Ensure all players have skills object
    useEffect(() => {
        if (!Array.isArray(players) || !Array.isArray(matches)) return;
        
        const needsSkills = players.some(p => p && !p.skills);
        const hasMatchesWithoutId = matches.some(m => m && (!m.id || !m.date));
        
        if (needsSkills || hasMatchesWithoutId) {
            if (needsSkills) {
                setPlayers(prev => (prev || []).map(p => !p ? p : (p.skills ? p : { ...p, skills: { ...DEFAULT_SKILLS } })));
            }
            if (hasMatchesWithoutId) {
                setMatches(prev => (prev || []).map(m => {
                    if (!m) return m;
                    let updated = { ...m };
                    if (!m.id) updated.id = Date.now() + Math.random().toString(36).substr(2, 9);
                    if (!m.date) updated.date = new Date().toISOString();
                    return updated;
                }));
            }
        }
    }, [players, matches]);

    const addPlayer = (player) => {
        setPlayers([...players, { ...player, skills: { ...DEFAULT_SKILLS } }]);
    };
    const deletePlayer = (id) => setPlayers(players.filter(p => p.id !== id));
    const updatePlayer = (id, updates) => {
        setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteMatch = (id) => {
        if (window.confirm('確定要刪除這場比賽紀錄嗎？')) {
            setMatches(matches.filter(m => m.id !== id));
        }
    };

    const playersWithStats = useMemo(() => {
        const processed = (players || []).map(p => {
            if (!p) return null;
            let wins = 0;
            let losses = 0;
            let drinks = 0;
            let currentStreak = 0;
            
            const sortedMatches = [...(matches || [])]
                .filter(m => m && m.date)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            sortedMatches.forEach(m => {
                const winnerTeamIndex = m.absoluteWinnerIdx !== undefined ? m.absoluteWinnerIdx : m.winnerTeam;
                const winnerTeam = m.teams[winnerTeamIndex];
                if (!winnerTeam) return;

                const wasInWinner = winnerTeam.some(wp => wp && wp.id === p.id);
                const wasInLoser = m.teams.flat().some(lp => lp && lp.id === p.id) && !wasInWinner;
                
                if (wasInWinner) {
                    wins += 1;
                    drinks += 1;
                    currentStreak += 1;
                } else if (wasInLoser) {
                    losses += 1;
                    drinks -= 1;
                    currentStreak = 0;
                }
            });

            const totalMatches = wins + losses;
            const earnedPoints = Math.floor(totalMatches / 10);
            const spentPoints = Object.values(p.skills || DEFAULT_SKILLS).reduce((a, b) => a + b, 0) - Object.keys(DEFAULT_SKILLS).length;
            const availablePoints = Math.max(0, earnedPoints - spentPoints);

            // Role Bonus Logic
            const roleBonus = { atk: 0, def: 0, srv: 0, set: 0, blk: 0, pwr: 0 };
            if (p.role === 'cannon') roleBonus.atk = 1;
            else if (p.role === 'wall') roleBonus.blk = 1;
            else if (p.role === 'maestro') roleBonus.set = 1;
            else if (p.role === 'guardian') roleBonus.def = 1;
            else if (p.role === 'server') roleBonus.srv = 1;

            const finalSkills = {};
            Object.keys(DEFAULT_SKILLS).forEach(k => {
                finalSkills[k] = (p.skills?.[k] || 1) + (roleBonus[k] || 0);
            });

            const effectiveSkill = Object.values(finalSkills).reduce((a, b) => a + b, 0) / Object.keys(DEFAULT_SKILLS).length;

            return { 
                ...p, 
                wins, 
                losses, 
                drinks, 
                totalMatches,
                availablePoints,
                effectiveSkill,
                isHot: currentStreak >= 3
            };
        }).filter(Boolean);

        const maxWins = Math.max(0, ...processed.map(p => p.wins));
        return processed.map(p => ({
            ...p,
            isGoat: maxWins > 0 && p.wins === maxWins
        }));
    }, [players, matches]);

    const handleMatchComplete = (matchData) => {
        const matchWithId = {
            ...matchData,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            date: matchData.date || new Date().toISOString()
        };
        setMatches([matchWithId, ...matches]);
        if (matchData.isRotationMatch && matchData.gameStep === 2) {
            setActiveTab('dashboard');
        }
    };

    const resetTeams = () => {
        if (window.confirm('確定要解散目前的隊伍並重新抽籤嗎？')) {
            setTeams([]);
            setGameStep(0);
            setG1WinnerIdx(null);
            setActiveTab('teaming');
        }
    };

    const togglePresence = (id) => {
        setPresentPlayerIds(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const resetAttendance = () => {
        setPresentPlayerIds([]);
        setIsAttendanceConfirmed(false);
    };
    
    const confirmAttendance = () => {
        if (presentPlayerIds.length >= 2) {
            setIsAttendanceConfirmed(true);
        }
    };

    const exportData = () => {
        const data = {
            players,
            matches,
            presentPlayerIds,
            version: '1.0',
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vbc_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.players && Array.isArray(data.players)) {
                    if (window.confirm('確定要匯入數據嗎？這將會覆蓋目前的進度。')) {
                        setPlayers(data.players);
                        if (data.matches) setMatches(data.matches);
                        if (data.presentPlayerIds) setPresentPlayerIds(data.presentPlayerIds);
                        alert('數據匯入成功！');
                    }
                } else {
                    alert('無效的數據格式');
                }
            } catch (err) {
                alert('匯入失敗：' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const resetAllStats = () => {
        if (window.confirm('🚨 警告：這將會刪除所有內容（包括隊員和紀錄），重歸零點。確定嗎？')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <header className="sticky top-0 z-[60] p-5 glass border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 transition-transform hover:rotate-0">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div onClick={() => console.log('State Debug:', { activeTab, playersCount: players?.length, matchesCount: matches?.length })}>
                            <h1 className="text-2xl font-black italic tracking-tighter leading-none">WAN CHAI <span className="text-emerald-400">VBC</span></h1>
                            <p className="text-[8px] font-bold text-gray-500 tracking-[0.3em] uppercase ml-0.5">Volleyball Management System</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAdmin(!isAdmin)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest transition-all ${isAdmin ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 text-gray-500'}`}>
                        <ShieldCheck className={`w-3 h-3 ${isAdmin ? 'animate-pulse' : ''}`} />
                        {isAdmin ? 'ADMIN ON' : 'ADMIN OFF'}
                    </button>
                </div>
            </header>

            <main className="max-w-lg p-5 mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><StatsHub players={playersWithStats || []} matches={matches || []} /></motion.div>}
                    {activeTab === 'teaming' && (
                        <motion.div key="teaming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {!isAttendanceConfirmed ? (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">今日 <span className="text-emerald-400">CHECK-IN</span></h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">請先選擇今日到場成員</p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[...playersWithStats].sort((a, b) => a.name.localeCompare(b.name, 'zh-HK')).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => togglePresence(p.id)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 border ${presentPlayerIds.includes(p.id)
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-white/5 border-transparent grayscale brightness-50 opacity-40'
                                                    }`}
                                            >
                                                <span className="text-2xl">{p.icon || '🏐'}</span>
                                                <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tighter">{p.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        disabled={presentPlayerIds.length < 2}
                                        onClick={confirmAttendance} 
                                        className="w-full py-5 bg-emerald-500 rounded-[32px] font-black italic text-xl tracking-tighter uppercase shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-30"
                                    >
                                        確認名單 ({presentPlayerIds.length})
                                    </button>
                                </section>
                            ) : (
                                <TeamGenerator players={playersWithStats || []} teams={teams || []} setTeams={setTeams} onReset={resetTeams} onGenerateComplete={() => setActiveTab('play')} presentPlayerIds={presentPlayerIds} onResetAttendance={resetAttendance} />
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'play' && <motion.div key="play" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}><MatchSession activeTeams={teams || []} onComplete={handleMatchComplete} onResetTeams={resetTeams} gameStep={gameStep} setGameStep={setGameStep} g1WinnerIdx={g1WinnerIdx} setG1WinnerIdx={setG1WinnerIdx} /></motion.div>}
                    {activeTab === 'settlement' && <motion.div key="settlement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><DailyReport players={playersWithStats || []} matches={matches || []} /></motion.div>}
                    {activeTab === 'players' && (
                        <motion.div key="players" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <PlayerManager 
                                players={playersWithStats || []} 
                                onAdd={addPlayer} 
                                onDelete={deletePlayer} 
                                onUpdate={updatePlayer} 
                                onResetAll={resetAllStats} 
                                onExport={exportData}
                                onImport={importData}
                                isAdmin={isAdmin} 
                            />
                        </motion.div>
                    )}
                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-20">
                            <header className="flex items-center justify-between"><h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">歷史對仗</h3></header>
                            <div className="space-y-4">
                                {(matches || []).map((m) => (
                                    m && (
                                        <motion.div layout key={m.id} className="p-6 glass rounded-[32px] flex flex-col gap-4 group relative border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase italic tracking-wider">{m.isRotationMatch && m.absoluteWinnerIdx !== undefined ? `Team ${m.absoluteWinnerIdx + 1}` : `Team ${(m.winnerTeam ?? 0) + 1}`} WINNER</span>
                                                        {m.scores && (
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                                                                ({m.scores[0]}-{m.scores[1]})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xl font-black italic tracking-tighter uppercase text-white">${m.stake || 0} <span className="text-[10px] text-gray-500 not-italic">{m.isRotationMatch ? (m.roundName || 'Rotation') : 'Friendly'}</span></span>
                                                </div>
                                                {isAdmin && <button onClick={(e) => { e.stopPropagation(); deleteMatch(m.id); }} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 z-20 relative"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap gap-2">{m.teams && m.teams[m.winnerTeam] && m.teams[m.winnerTeam].map(p => p && (<div key={p.id} className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"><span className="text-[10px] font-black uppercase text-emerald-400">{p.name}</span></div>))}</div>
                                                <div className="h-[1px] bg-white/5 w-full" /><p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest pl-1">{m.date ? new Date(m.date).toLocaleString('zh-HK', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date'} HKT</p>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Dock 
                items={[
                    { active: activeTab === 'dashboard', onClick: () => setActiveTab('dashboard'), icon: LayoutDashboard, label: "總覽" },
                    { active: activeTab === 'teaming', onClick: () => setActiveTab('teaming'), icon: Users, label: "組隊" },
                    { type: 'special', onClick: () => setActiveTab('play'), icon: Plus, label: "比賽" },
                    { active: activeTab === 'history', onClick: () => setActiveTab('history'), icon: History, label: "紀錄" },
                    { active: activeTab === 'settlement', onClick: () => setActiveTab('settlement'), icon: DollarSign, label: "結算" },
                    { active: activeTab === 'players', onClick: () => setActiveTab('players'), icon: Trophy, label: "成員" },
                ]}
            />
        </div>
    );
}

export default App;
