import React, { useMemo } from 'react';
import { X, Trophy, Swords, TrendingUp, Users, Flame, Award, Shield, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer as RC2 } from 'recharts';
import { SKILL_LABELS, ACHIEVEMENTS } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

export default function PlayerProfile({ player, matches, allPlayers, onClose }) {
    if (!player) return null;

    const chartData = Object.entries(player.skills || {}).map(([key, value]) => ({
        subject: SKILL_LABELS[key]?.label || key,
        value: value,
        fullMark: 5
    }));

    // Compute detailed stats
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
            const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams).sort().map(k => m.teams[k]);
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

                // Track teammate wins
                if (playerTeam) {
                    playerTeam.forEach(tm => {
                        if (tm && tm.id !== player.id) {
                            teammateWins[tm.id] = (teammateWins[tm.id] || 0) + 1;
                        }
                    });
                }

                // Daily wins tracking
                const day = m.date?.split('T')[0];
                if (day) dailyWins[day] = (dailyWins[day] || 0) + 1;
            } else {
                currentStreak = 0;
                currentLoseStreak++;
                recentResults.push({ result: 'L', date: m.date });

                // Track rival losses
                if (winnerTeam) {
                    winnerTeam.forEach(rp => {
                        if (rp) rivalLosses[rp.id] = (rivalLosses[rp.id] || 0) + 1;
                    });
                }
            }
        });

        const hasDailyFive = Object.values(dailyWins).some(count => count >= 5);

        // Find best teammate
        const bestTeammateId = Object.entries(teammateWins).sort((a, b) => b[1] - a[1])[0];
        const bestTeammate = bestTeammateId ? allPlayers.find(p => p.id === bestTeammateId[0]) : null;

        // Find worst rival
        const worstRivalId = Object.entries(rivalLosses).sort((a, b) => b[1] - a[1])[0];
        const worstRival = worstRivalId ? allPlayers.find(p => p.id === worstRivalId[0]) : null;

        // Compute achievements
        const playerWithExtras = { ...player, bestStreak, hasPhoenix, hasDailyFive };
        const earned = ACHIEVEMENTS.filter(a => a.check(playerWithExtras));

        // Recent form (last 10)
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto"
        >
            <div className="max-w-lg mx-auto p-5 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                        球員 <span className="text-emerald-400">PROFILE</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Avatar & Name */}
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 mb-8"
                >
                    <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center shadow-2xl border border-white/10">
                        <PlayerIcon icon={player.icon} name={player.name} role={player.role} isHot={player.isHot} isGoat={player.isGoat} className="w-full h-full" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">{player.name}</h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                            {player.role ? player.role.toUpperCase() : 'ALL-ROUNDER'}
                        </p>
                    </div>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                        { label: '勝', value: player.wins || 0, color: 'text-emerald-400' },
                        { label: '負', value: player.losses || 0, color: 'text-red-400' },
                        { label: '勝率', value: `${detailedStats.winRate}%`, color: 'text-blue-400' },
                        { label: '連勝', value: detailedStats.currentStreak, color: 'text-yellow-400' },
                    ].map((s, i) => (
                        <div key={i} className="p-3 glass rounded-2xl border border-white/5 text-center">
                            <p className={`text-xl font-black italic ${s.color}`}>{s.value}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Win Rate Bar */}
                <div className="mb-6 p-4 glass rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">勝率</span>
                        <span className="text-sm font-black text-emerald-400">{detailedStats.winRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedStats.winRate}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                    </div>
                </div>

                {/* Recent Form */}
                <div className="mb-6 p-4 glass rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">近期表現 (LAST 10)</h4>
                    <div className="flex gap-1.5 justify-center">
                        {detailedStats.recent10.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                                    r.result === 'W'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                            >
                                {r.result}
                            </motion.div>
                        ))}
                        {detailedStats.recent10.length === 0 && (
                            <p className="text-[10px] text-gray-600 italic">暫無比賽紀錄</p>
                        )}
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="mb-6 p-4 glass rounded-[32px] border border-white/5">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">技能雷達 (RADAR)</h4>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                                <Radar name={player.name} dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Best Teammate & Worst Rival */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 glass rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" /> 最佳搭檔
                        </p>
                        {detailedStats.bestTeammate ? (
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={detailedStats.bestTeammate.icon} name={detailedStats.bestTeammate.name} className="w-8 h-8" />
                                <div>
                                    <p className="text-sm font-black truncate">{detailedStats.bestTeammate.name}</p>
                                    <p className="text-[8px] text-gray-500">{detailedStats.bestTeammateWins} 場同贏</p>
                                </div>
                            </div>
                        ) : <p className="text-[10px] text-gray-600 italic">暫無數據</p>}
                    </div>
                    <div className="p-4 glass rounded-2xl border border-red-500/20 bg-red-500/5">
                        <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Swords className="w-3 h-3" /> 最強對手
                        </p>
                        {detailedStats.worstRival ? (
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={detailedStats.worstRival.icon} name={detailedStats.worstRival.name} className="w-8 h-8" />
                                <div>
                                    <p className="text-sm font-black truncate">{detailedStats.worstRival.name}</p>
                                    <p className="text-[8px] text-gray-500">被打敗 {detailedStats.worstRivalLosses} 次</p>
                                </div>
                            </div>
                        ) : <p className="text-[10px] text-gray-600 italic">暫無數據</p>}
                    </div>
                </div>

                {/* Achievements */}
                <div className="mb-6 p-4 glass rounded-[32px] border border-white/5">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <Award className="w-3 h-3" /> 成就獎章 ({detailedStats.earnedAchievements.length}/{ACHIEVEMENTS.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {ACHIEVEMENTS.map(a => {
                            const earned = detailedStats.earnedAchievements.some(e => e.id === a.id);
                            return (
                                <motion.div
                                    key={a.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                                        earned
                                            ? 'bg-yellow-500/10 border-yellow-500/30'
                                            : 'bg-white/2 border-white/5 opacity-30 grayscale'
                                    }`}
                                >
                                    <span className="text-2xl">{a.icon}</span>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter">{a.name}</p>
                                        <p className="text-[8px] text-gray-500">{a.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Extra Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 glass rounded-2xl border border-white/5 text-center">
                        <p className="text-lg font-black italic text-yellow-400">{detailedStats.bestStreak}</p>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">最高連勝</p>
                    </div>
                    <div className="p-3 glass rounded-2xl border border-white/5 text-center">
                        <p className="text-lg font-black italic text-blue-400">{player.totalMatches || 0}</p>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">總出場</p>
                    </div>
                    <div className="p-3 glass rounded-2xl border border-white/5 text-center">
                        <p className={`text-lg font-black italic ${(player.drinks || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {(player.drinks || 0) >= 0 ? `+${player.drinks || 0}` : player.drinks}
                        </p>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">飲數</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
