import React, { useMemo } from 'react';
import { X, Trophy, Swords, TrendingUp, Users, Flame, Award, Shield, Target, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarLine, ResponsiveContainer } from 'recharts';
import { SKILL_LABELS, ACHIEVEMENTS } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

export default function PlayerProfile({ player, matches, allPlayers, onClose }) {
    if (!player) return null;

    const chartData = Object.entries(player.skills || {}).map(([key, value]) => ({
        subject: SKILL_LABELS[key]?.label || key,
        value: value,
        fullMark: 5
    }));

    const detailedStats = useMemo(() => {
        const sortedMatches = [...(matches || [])]
            .filter(m => m && m.date)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let bestStreak = 0;
        let currentStreak = 0;
        let currentLoseStreak = 0;
        let hasPhoenix = false;
        const teammateWins = {};
        const rivalLosses = {};
        const recentResults = [];
        const dailyWins = {};

        sortedMatches.forEach(m => {
            if (!m.teams) return;
            const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => (m.teams || {})[k]);
            if (m.winnerTeam === undefined || !matchTeams[m.winnerTeam] || !Array.isArray(matchTeams[m.winnerTeam])) return;
            const winnerIdx = m.absoluteWinnerIdx !== undefined ? m.absoluteWinnerIdx : m.winnerTeam;
            const winnerTeam = matchTeams[winnerIdx];
            if (!winnerTeam) return;

            const wasInMatch = matchTeams.flat().some(p => p && p.id === player.id);
            if (!wasInMatch) return;

            const wasInWinner = winnerTeam.some(wp => wp && wp.id === player.id);
            const playerTeamIdx = matchTeams.findIndex(t => t.some(p => p && p.id === player.id));
            const playerTeam = matchTeams[playerTeamIdx];

            if (wasInWinner) {
                if (currentLoseStreak >= 3) hasPhoenix = true;
                currentStreak++;
                currentLoseStreak = 0;
                if (currentStreak > bestStreak) bestStreak = currentStreak;
                recentResults.push({ result: 'W', date: m.date });

                if (playerTeam) {
                    playerTeam.forEach(tm => {
                        if (tm && tm.id !== player.id) {
                            teammateWins[tm.id] = (teammateWins[tm.id] || 0) + 1;
                        }
                    });
                }

                const day = m.date?.split('T')[0];
                if (day) dailyWins[day] = (dailyWins[day] || 0) + 1;
            } else {
                currentStreak = 0;
                currentLoseStreak++;
                recentResults.push({ result: 'L', date: m.date });

                if (winnerTeam) {
                    winnerTeam.forEach(rp => {
                        if (rp) rivalLosses[rp.id] = (rivalLosses[rp.id] || 0) + 1;
                    });
                }
            }
        });

        const hasDailyFive = Object.values(dailyWins).some(count => count >= 5);
        const bestTeammateId = Object.entries(teammateWins).sort((a, b) => b[1] - a[1])[0];
        const bestTeammate = bestTeammateId ? allPlayers.find(p => p.id === bestTeammateId[0]) : null;
        const worstRivalId = Object.entries(rivalLosses).sort((a, b) => b[1] - a[1])[0];
        const worstRival = worstRivalId ? allPlayers.find(p => p.id === worstRivalId[0]) : null;

        const playerWithExtras = { ...player, bestStreak, hasPhoenix, hasDailyFive };
        const earned = ACHIEVEMENTS.filter(a => a.check(playerWithExtras));
        const recent10 = recentResults.slice(-10);

        return {
            bestStreak,
            currentStreak,
            hasPhoenix,
            hasDailyFive,
            bestTeammate,
            bestTeammateWins: bestTeammateId?.[1] || 0,
            worstRival,
            worstRivalLosses: worstRivalId?.[1] || 0,
            earnedAchievements: earned,
            recent10,
            winRate: player.totalMatches > 0 ? ((player.wins / player.totalMatches) * 100).toFixed(0) : 0
        };
    }, [player, matches, allPlayers]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[#050505] overflow-y-auto grid-bg"
        >
            <div className="max-w-lg mx-auto p-5 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-3xl tracking-wide uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                        PLAYER <span style={{color:'#FF4500'}}>PROFILE</span>
                    </h2>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all" style={{background:'#111', border:'1px solid #222'}}>
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Hero section */}
                <div className="relative mb-10 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-10 rounded-full blur-3xl" style={{background:'#FF4500'}} />
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
                        <div className="w-32 h-32 mx-auto rounded-[40px] flex items-center justify-center relative group overflow-hidden" style={{background:'#111', border:'2px solid #222'}}>
                            <PlayerIcon icon={player.icon} name={player.name} className="w-20 h-20" />
                            {/* Accent line */}
                            <div className="absolute top-0 right-0 w-8 h-8 opacity-20 transform translate-x-4 -translate-y-4 rotate-45" style={{background:'#FF4500'}} />
                        </div>
                        <h3 className="font-display text-5xl mt-6 tracking-wide leading-none" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                            {player.name}
                        </h3>
                        <div className="inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]" style={{background:'#FF45001a', color:'#FF4500', border:'1px solid #FF450033'}}>
                            {player.role ? player.role.toUpperCase() : 'PRO ATHLETE'}
                        </div>
                    </motion.div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-5 rounded-2xl flex flex-col items-center justify-center" style={{background:'#111', border:'1px solid #222'}}>
                        <p className="font-display text-4xl leading-none" style={{color:'#FF4500'}}>{detailedStats.winRate}%</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{color:'#555'}}>Win Rate</p>
                    </div>
                    <div className="p-5 rounded-2xl flex flex-col items-center justify-center" style={{background:'#111', border:'1px solid #222'}}>
                        <p className="font-display text-4xl leading-none text-white">{player.totalMatches || 0}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{color:'#555'}}>Matches</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'WINS', value: player.wins || 0, color: '#FF4500' },
                        { label: 'RECORD', value: (player.drinks || 0) >= 0 ? `+${player.drinks}` : player.drinks, color: '#3b82f6' },
                        { label: 'STREAK', value: detailedStats.currentStreak, color: '#facc15' },
                    ].map((s, i) => (
                        <div key={i} className="p-4 rounded-2xl text-center" style={{background:'#111', border:'1px solid #222'}}>
                            <p className="font-display text-2xl leading-none" style={{color: s.color}}>{s.value}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest mt-1" style={{color:'#444'}}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Form & Radar Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Recent Form */}
                    <div className="p-6 rounded-3xl" style={{background:'#111', border:'1px solid #222'}}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{color:'#555'}}>RECENT FORM</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {detailedStats.recent10.map((r, i) => (
                                <div key={i} className="w-8 h-10 rounded flex items-center justify-center font-display text-xl"
                                    style={{
                                        background: r.result === 'W' ? '#FF4500' : '#1a1a1a',
                                        color: r.result === 'W' ? '#fff' : '#444',
                                        border: r.result === 'W' ? 'none' : '1px solid #222'
                                    }}>
                                    {r.result}
                                </div>
                            ))}
                            {detailedStats.recent10.length === 0 && <p className="text-[10px] italic text-[#333]">NO DATA</p>}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="p-6 rounded-3xl" style={{background:'#111', border:'1px solid #222'}}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:'#555'}}>ATTRIBUTES</h4>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid stroke="#222" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#444', fontSize: 8, fontWeight: 900 }} />
                                    <RadarLine name={player.name} dataKey="value" stroke="#FF4500" fill="#FF4500" fillOpacity={0.4} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Synergy */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-5 rounded-2xl" style={{background:'#111', border:'1px solid #10b98122'}}>
                        <p className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{color:'#10b981'}}>
                           <Users className="w-3 h-3" /> BEST TEAMMATE
                        </p>
                        {detailedStats.bestTeammate ? (
                            <div className="flex items-center gap-3">
                                <PlayerIcon icon={detailedStats.bestTeammate.icon} name={detailedStats.bestTeammate.name} className="w-10 h-10" />
                                <div>
                                    <p className="text-xs font-black uppercase">{detailedStats.bestTeammate.name}</p>
                                    <p className="text-[8px] font-bold mt-0.5" style={{color:'#444'}}>{detailedStats.bestTeammateWins} SHARED WINS</p>
                                </div>
                            </div>
                        ) : <p className="text-[9px] italic text-[#333]">NO DATA</p>}
                    </div>
                    <div className="p-5 rounded-2xl" style={{background:'#111', border:'1px solid #ef444422'}}>
                        <p className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{color:'#ef4444'}}>
                           <Swords className="w-3 h-3" /> WORST RIVAL
                        </p>
                        {detailedStats.worstRival ? (
                            <div className="flex items-center gap-3">
                                <PlayerIcon icon={detailedStats.worstRival.icon} name={detailedStats.worstRival.name} className="w-10 h-10" />
                                <div>
                                    <p className="text-xs font-black uppercase">{detailedStats.worstRival.name}</p>
                                    <p className="text-[8px] font-bold mt-0.5" style={{color:'#444'}}>{detailedStats.worstRivalLosses} DEFEATS</p>
                                </div>
                            </div>
                        ) : <p className="text-[9px] italic text-[#333]">NO DATA</p>}
                    </div>
                </div>

                {/* Achievements */}
                <div className="p-6 rounded-[32px] mb-8" style={{background:'#111', border:'1px solid #222'}}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2" style={{color:'#555'}}>
                        <Award className="w-4 h-4" style={{color:'#FF4500'}} /> 
                        REWARDS ({detailedStats.earnedAchievements.length}/{ACHIEVEMENTS.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                        {ACHIEVEMENTS.map(a => {
                            const earned = detailedStats.earnedAchievements.some(e => e.id === a.id);
                            return (
                                <div key={a.id} className="p-3.5 rounded-xl border flex items-center gap-3 transition-all"
                                    style={{
                                        background: earned ? '#FF45000d' : '#050505',
                                        borderColor: earned ? '#FF450033' : '#1a1a1a',
                                        opacity: earned ? 1 : 0.2
                                    }}>
                                    <span className="text-2xl">{a.icon}</span>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-tight leading-tight">{a.name}</p>
                                        <p className="text-[7px] font-bold mt-0.5 uppercase tracking-wide" style={{color:'#555'}}>{a.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-center">
                    <div className="h-[1px] w-20 mx-auto" style={{background:'#222'}} />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-6" style={{color:'#333'}}>official athlete record</p>
                </div>
            </div>
        </motion.div>
    );
}
