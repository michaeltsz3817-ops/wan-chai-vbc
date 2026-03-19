import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, History, DollarSign, Plus, LayoutDashboard, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PlayerManager from './components/PlayerManager';
import TeamGenerator from './components/TeamGenerator';
import MatchSession from './components/MatchSession';
import StatsHub from './components/StatsHub';
import DailyReport from './components/DailyReport';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAdmin, setIsAdmin] = useState(false);
    const [players, setPlayers] = useState(() => {
        const saved = localStorage.getItem('vbc-players');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: '阿強', icon: '🔥', skill: 5, wins: 0, drinks: 0 },
            { id: '2', name: '小明', icon: '🦁', skill: 2, wins: 0, drinks: 0 },
            { id: '3', name: '大師兄', icon: '⚡️', skill: 4, wins: 0, drinks: 0 },
            { id: '4', name: '波子', icon: '🧤', skill: 3, wins: 0, drinks: 0 },
            { id: '5', name: '阿飛', icon: '🦅', skill: 4, wins: 0, drinks: 0 },
        ];
    });

    const [matches, setMatches] = useState(() => {
        const saved = localStorage.getItem('vbc-matches');
        return saved ? JSON.parse(saved) : [];
    });

    const [teams, setTeams] = useState([]);

    // Session State (Persistent between tab switches)
    const [gameStep, setGameStep] = useState(0);
    const [g1WinnerIdx, setG1WinnerIdx] = useState(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem('vbc-players', JSON.stringify(players));
        localStorage.setItem('vbc-matches', JSON.stringify(matches));
    }, [players, matches]);

    // Data Migration: Strip legacy wins/drinks AND ensure all matches have IDs
    useEffect(() => {
        const hasLegacyData = players.some(p => p.hasOwnProperty('wins') || p.hasOwnProperty('drinks'));
        const hasMatchesWithoutId = matches.some(m => !m.id);
        
        if (hasLegacyData || hasMatchesWithoutId) {
            console.log('Migrating data...');
            if (hasLegacyData) {
                setPlayers(prev => prev.map(({ wins, drinks, ...p }) => p));
            }
            if (hasMatchesWithoutId) {
                setMatches(prev => prev.map(m => m.id ? m : { ...m, id: Date.now() + Math.random().toString(36).substr(2, 9) }));
            }
        }
    }, [players, matches]);

    const addPlayer = (player) => {
        // Remove initial wins/drinks from new players to keep data clean
        const { wins, drinks, ...purePlayer } = player;
        setPlayers([...players, purePlayer]);
    };
    const deletePlayer = (id) => setPlayers(players.filter(p => p.id !== id));
    const updatePlayer = (id, updates) => {
        setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    // --- Computed Stats Logic ---
    const playersWithStats = useMemo(() => {
        return players.map(p => {
            let wins = 0;
            let losses = 0;
            let drinks = 0;
            matches.forEach(m => {
                if (!m.teams || m.winnerTeam === undefined) return;
                const wasInWinner = m.teams[m.winnerTeam]?.some(wp => wp.id === p.id);
                const wasInLoser = m.teams.flat().some(lp => lp.id === p.id) && !wasInWinner;
                
                if (wasInWinner) {
                    wins += 1;
                    drinks += 1; // Win is always +1 drink
                } else if (wasInLoser) {
                    losses += 1;
                    drinks -= 1; // Lose is always -1 drink
                }
            });
            return { ...p, wins, losses, drinks };
        });
    }, [players, matches]);

    const deleteMatch = (id) => {
        if (!window.confirm('確定要刪除這場賽事紀錄嗎？')) return;
        setMatches(prev => prev.filter(m => m.id !== id));
    };

    const handleMatchComplete = (matchData) => {
        const matchWithId = {
            ...matchData,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            date: matchData.date || new Date().toISOString()
        };
        setMatches([matchWithId, ...matches]);

        // Only switch to dashboard if not a rotation match OR if it's the last match of rotation
        const isLastOfRotation = matchData.isRotationMatch && matchData.gameStep === 2;
        const isFriendly = !matchData.isRotationMatch;

        if (isLastOfRotation || isFriendly) {
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

    const resetAllStats = () => {
        if (window.confirm('🚨 警告：這將會刪除所有內容（包括隊員和紀錄），重歸零點。確定嗎？')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Background Orbs */}
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
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter leading-none">WAN CHAI <span className="text-emerald-400">VBC</span></h1>
                            <p className="text-[8px] font-bold text-gray-500 tracking-[0.3em] uppercase ml-0.5">Volleyball Management System</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest transition-all ${isAdmin ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 text-gray-500'
                            }`}
                    >
                        <ShieldCheck className={`w-3 h-3 ${isAdmin ? 'animate-pulse' : ''}`} />
                        {isAdmin ? 'ADMIN ON' : 'ADMIN OFF'}
                    </button>
                </div>
            </header>

            <main className="max-w-lg p-5 mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <StatsHub players={playersWithStats} matches={matches} />
                        </motion.div>
                    )}

                    {activeTab === 'teaming' && (
                        <motion.div key="teaming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <TeamGenerator players={playersWithStats} teams={teams} setTeams={setTeams} onReset={resetTeams} />
                        </motion.div>
                    )}

                    {activeTab === 'play' && (
                        <motion.div key="play" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                            <MatchSession
                                activeTeams={teams}
                                onComplete={handleMatchComplete}
                                onResetTeams={resetTeams}
                                gameStep={gameStep}
                                setGameStep={setGameStep}
                                g1WinnerIdx={g1WinnerIdx}
                                setG1WinnerIdx={setG1WinnerIdx}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'settlement' && (
                        <motion.div key="settlement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <DailyReport players={playersWithStats} matches={matches} />
                        </motion.div>
                    )}

                    {activeTab === 'players' && (
                        <motion.div key="players" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <PlayerManager
                                players={playersWithStats}
                                onAdd={addPlayer}
                                onDelete={deletePlayer}
                                onUpdate={updatePlayer}
                                onResetAll={resetAllStats}
                                isAdmin={isAdmin}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-20">
                            <header className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">歷史對仗 (詳細名單)</h3>
                                <div className="text-[8px] bg-white/5 px-2 py-1 rounded-full text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <HelpCircle className="w-2 h-2" /> HKT Support
                                </div>
                            </header>

                            <div className="space-y-4">
                                {matches.map((m) => (
                                    <motion.div
                                        layout
                                        key={m.id}
                                        className="p-6 glass rounded-[32px] flex flex-col gap-4 group relative border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase italic tracking-wider">
                                                        {m.isRotationMatch && m.absoluteWinnerIdx !== undefined ? `Team ${m.absoluteWinnerIdx + 1}` : `Team ${(m.winnerTeam ?? 0) + 1}`} WINNER
                                                    </span>
                                                </div>
                                                <span className="text-xl font-black italic tracking-tighter uppercase text-white">
                                                    ${m.stake} <span className="text-[10px] text-gray-500 not-italic">{m.isRotationMatch ? (m.roundName || 'Rotation') : 'Friendly'}</span>
                                                </span>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteMatch(m.id);
                                                    }}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 z-20 relative"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {m.teams && m.teams[m.winnerTeam] && m.teams[m.winnerTeam].map(p => (
                                                    <div key={p.id} className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                                        <span className="text-xs">{p.icon && p.icon.startsWith('data:image') ? '🖼️' : (p.icon || '🏐')}</span>
                                                        <span className="text-[10px] font-black uppercase text-emerald-400">{p.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-[1px] bg-white/5 w-full" />
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest pl-1">
                                                {new Date(m.date).toLocaleString('zh-HK', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} 香港時間
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {matches.length === 0 && (
                                <div className="p-20 text-center space-y-3">
                                    <p className="text-gray-600 font-bold italic">暫無比賽紀錄，快啲開場打啦！</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 glass rounded-[40px] border border-white/10 shadow-2xl flex items-center gap-6 md:gap-8 backdrop-blur-3xl scale-[0.9] origin-bottom md:scale-100">
                <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="總覽" />
                <NavButton active={activeTab === 'teaming'} onClick={() => setActiveTab('teaming')} icon={<Users />} label="組隊" />

                <button
                    onClick={() => setActiveTab('play')}
                    className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center shadow-2xl shadow-emerald-500/40 -mt-16 active:scale-90 transition-all hover:rotate-12 group"
                >
                    <Plus className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                </button>

                <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="紀錄" />
                <NavButton active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')} icon={<DollarSign />} label="結算" />
                <NavButton active={activeTab === 'players'} onClick={() => setActiveTab('players')} icon={<Trophy />} label="成員" />
            </nav>
        </div >
    );
}

function NavButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 px-2 rounded-xl ${active ? 'text-emerald-400 scale-110' : 'text-gray-500 hover:text-gray-300'
                }`}
        >
            <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-emerald-500/10' : ''}`}>
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
            {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5" />}
        </button>
    );
}

export default App;
