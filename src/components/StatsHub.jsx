import React, { useMemo, useState } from 'react';
import { Trophy, GlassWater, TrendingUp, Medal, Activity, Zap, Award, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS } from '../lib/constants';

import PlayerIcon from './ui/PlayerIcon';

const SORT_MODES = [
    { key: 'wins', label: '勝場' },
    { key: 'winRate', label: '勝率' },
    { key: 'bestStreak', label: '連勝' },
    { key: 'drinks', label: '飲數' },
];

const CHART_MODES = [
    { key: 'drinks', label: '飲數趨勢' },
    { key: 'winRate', label: '勝率趨勢' },
];

export default function StatsHub({ players, matches, onSelectPlayer }) {
    const [sortMode, setSortMode] = useState('wins');
    const [chartMode, setChartMode] = useState('drinks');
    const [highlightedPlayer, setHighlightedPlayer] = useState(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            if (sortMode === 'wins') return (b.wins || 0) - (a.wins || 0);
            if (sortMode === 'winRate') {
                const rateA = a.totalMatches > 0 ? a.wins / a.totalMatches : 0;
                const rateB = b.totalMatches > 0 ? b.wins / b.totalMatches : 0;
                return rateB - rateA;
            }
            if (sortMode === 'bestStreak') return (b.bestStreak || 0) - (a.bestStreak || 0);
            if (sortMode === 'drinks') return (b.drinks || 0) - (a.drinks || 0);
            return 0;
        });
    }, [players, sortMode]);

    const top3ByWins = [...players].sort((a, b) => (b.wins || 0) - (a.wins || 0)).slice(0, 3);
    const top3ByDrinks = [...players].sort((a, b) => (b.drinks || 0) - (a.drinks || 0)).slice(0, 3);

    const chartData = useMemo(() => {
        if (matches.length === 0) return [];
        const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
        const topPlayerIds = [...players]
            .sort((a, b) => Math.abs(b.drinks || 0) - Math.abs(a.drinks || 0))
            .slice(0, 5).map(p => p.id);

        const data = [];
        const playerCumDrinks = {};
        const playerCumWins = {};
        const playerCumMatches = {};

        sortedMatches.forEach((m) => {
            if (!m.date) return;
            let dateStr;
            try { dateStr = format(parseISO(m.date), 'MM/dd'); } catch { dateStr = '?'; }
            const entry = { name: dateStr };
            const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => m.teams[k]);

            players.forEach(p => {
                if (!topPlayerIds.includes(p.id)) return;
                if (playerCumDrinks[p.id] === undefined) { playerCumDrinks[p.id] = 0; playerCumWins[p.id] = 0; playerCumMatches[p.id] = 0; }

                const wasInWinner = matchTeams[m.winnerTeam]?.some(wp => wp.id === p.id);
                const wasInLoser = matchTeams.flat().some(lp => lp.id === p.id) && !wasInWinner;

                if (wasInWinner) { playerCumDrinks[p.id] += 1; playerCumWins[p.id]++; playerCumMatches[p.id]++; }
                else if (wasInLoser) { playerCumDrinks[p.id] -= 1; playerCumMatches[p.id]++; }

                entry[`${p.name}_drinks`] = playerCumDrinks[p.id];
                entry[`${p.name}_winRate`] = playerCumMatches[p.id] > 0
                    ? Math.round((playerCumWins[p.id] / playerCumMatches[p.id]) * 100)
                    : 0;
            });
            data.push(entry);
        });
        return data;
    }, [matches, players]);

    const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const top5Players = [...players].sort((a, b) => Math.abs(b.drinks || 0) - Math.abs(a.drinks || 0)).slice(0, 5);

    return (
        <div className="space-y-6 pb-24 text-white">
            {/* Top Performers Summary */}
            <section className="grid grid-cols-2 gap-4">
                <div className="p-4 glass rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">勝場王</span>
                    </div>
                    {top3ByWins[0] ? (
                        <div>
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={top3ByWins[0].icon} name={top3ByWins[0].name} className="w-8 h-8" />
                                <p className="text-xl font-black truncate">{top3ByWins[0].name}</p>
                            </div>
                            <p className="text-[10px] text-gray-500">{top3ByWins[0].wins || 0} 場勝仗</p>
                        </div>
                    ) : <p className="text-sm text-gray-600">暫無數據</p>}
                </div>
                <div className="p-4 glass rounded-3xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <GlassWater className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">飲數王</span>
                    </div>
                    {top3ByDrinks[0] ? (
                        <div>
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={top3ByDrinks[0].icon} name={top3ByDrinks[0].name} className="w-8 h-8" />
                                <p className="text-xl font-black truncate">{top3ByDrinks[0].name}</p>
                            </div>
                            <p className="text-[10px] text-gray-500">{top3ByDrinks[0].drinks || 0} 飲</p>
                        </div>
                    ) : <p className="text-sm text-gray-600">暫無數據</p>}
                </div>
            </section>

            {/* Performance Trend Chart */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> 表現趨勢
                    </h3>
                    <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
                        {CHART_MODES.map(m => (
                            <button
                                key={m.key}
                                onClick={() => setChartMode(m.key)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${chartMode === m.key ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
                            >{m.label}</button>
                        ))}
                    </div>
                </div>
                <div className="p-4 glass rounded-[32px] border border-white/5 h-[260px]">
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    {top5Players.map((p, idx) => (
                                        <linearGradient key={p.id} id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColors[idx]} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={chartColors[idx]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis dataKey="name" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false}
                                    tickFormatter={(v) => chartMode === 'winRate' ? `${v}%` : (v > 0 ? `+${v}` : v)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                                    formatter={(v) => chartMode === 'winRate' ? `${v}%` : v}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle"
                                    wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', paddingBottom: '10px' }} />
                                {top5Players.map((p, idx) => {
                                    const key = `${p.name}_${chartMode}`;
                                    const isHL = highlightedPlayer === null || highlightedPlayer === p.id;
                                    return (
                                        <Area
                                            key={p.id}
                                            type="monotone"
                                            dataKey={key}
                                            name={p.name}
                                            stroke={chartColors[idx % chartColors.length]}
                                            fill={`url(#grad${idx})`}
                                            strokeWidth={isHL ? 2.5 : 0.5}
                                            strokeOpacity={isHL ? 1 : 0.2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                            animationDuration={1000}
                                        />
                                    );
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 italic text-sm gap-2">
                            <TrendingUp className="w-8 h-8 opacity-20" />
                            數據不足以生成圖表
                        </div>
                    )}
                </div>
                {/* Player filter buttons */}
                {players.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {top5Players.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => setHighlightedPlayer(highlightedPlayer === p.id ? null : p.id)}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${highlightedPlayer === p.id ? 'text-black' : 'bg-white/5 text-gray-400 border-white/10'}`}
                                style={highlightedPlayer === p.id ? { backgroundColor: chartColors[idx], borderColor: chartColors[idx] } : {}}
                            >{p.name}</button>
                        ))}
                    </div>
                )}
            </section>

            {/* Leaderboard Table */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Medal className="w-4 h-4" /> 龍虎榜
                    </h3>
                    {/* Sort tabs */}
                    <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
                        {SORT_MODES.map(m => (
                            <button
                                key={m.key}
                                onClick={() => setSortMode(m.key)}
                                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${sortMode === m.key ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
                            >{m.label}</button>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-[32px] overflow-hidden border border-white/5">
                    <AnimatePresence mode="popLayout">
                        {sortedPlayers.map((p, idx) => {
                            const winRate = p.totalMatches > 0 ? Math.round((p.wins / p.totalMatches) * 100) : 0;
                            const earnedCount = ACHIEVEMENTS.filter(a => a.check(p)).length;
                            return (
                                <motion.div
                                    layout
                                    key={p.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => onSelectPlayer?.(p)}
                                    className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer group"
                                >
                                    {/* Rank Badge */}
                                    <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-black ${
                                        idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' :
                                        idx === 1 ? 'bg-gray-300 text-black' :
                                        idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-500'
                                    }`}>{idx + 1}</span>

                                    {/* Avatar */}
                                    <PlayerIcon icon={p.icon} name={p.name} isHot={p.isHot} isGoat={p.isGoat} className="w-9 h-9 flex-shrink-0" />

                                    {/* Name + Badges */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-black text-sm tracking-tight">{p.name}</span>
                                            {idx === 0 && <span className="bg-yellow-500/20 text-yellow-500 text-[7px] px-1.5 py-0.5 rounded-full font-black border border-yellow-500/30 flex items-center gap-0.5"><Trophy className="w-2 h-2"/>MVP</span>}
                                            {p.isHot && <span className="bg-orange-500/20 text-orange-400 text-[7px] px-1.5 py-0.5 rounded-full font-black border border-orange-500/30"><Zap className="w-2 h-2 inline"/>HOT</span>}
                                            {earnedCount > 0 && <span className="bg-purple-500/20 text-purple-400 text-[7px] px-1.5 py-0.5 rounded-full font-black border border-purple-500/30"><Award className="w-2 h-2 inline"/> {earnedCount}</span>}
                                        </div>
                                        {/* Win Rate Bar */}
                                        <div className="mt-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${winRate}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                        <p className="text-[8px] text-gray-600 mt-0.5">{winRate}% 勝率 · {p.totalMatches || 0} 場</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-emerald-400 font-black text-base">{p.wins || 0}</p>
                                        <p className="text-[8px] text-gray-600 uppercase">勝場</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {players.length === 0 && (
                        <div className="p-16 text-center text-gray-500 italic text-sm">
                            尚無球員資料，快啲去成員頁面加入啦！
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
