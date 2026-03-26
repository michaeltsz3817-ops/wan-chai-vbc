import React, { useMemo, useState } from 'react';
import { Trophy, GlassWater, TrendingUp, Medal, Activity, Zap, Award, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    { key: 'drinks', label: '飲數' },
    { key: 'winRate', label: '勝率%' },
];

const RANK_STYLES = [
    { bg: '#F59E0B', text: '#000' },
    { bg: '#9CA3AF', text: '#000' },
    { bg: '#B45309', text: '#fff' },
];

const chartColors = ['#FF4500', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

export default function StatsHub({ players, matches, onSelectPlayer }) {
    const [sortMode, setSortMode] = useState('wins');
    const [chartMode, setChartMode] = useState('drinks');
    const [highlightedPlayer, setHighlightedPlayer] = useState(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            if (sortMode === 'wins') return (b.wins || 0) - (a.wins || 0);
            if (sortMode === 'winRate') {
                const rA = a.totalMatches > 0 ? a.wins / a.totalMatches : 0;
                const rB = b.totalMatches > 0 ? b.wins / b.totalMatches : 0;
                return rB - rA;
            }
            if (sortMode === 'bestStreak') return (b.bestStreak || 0) - (a.bestStreak || 0);
            if (sortMode === 'drinks') return (b.drinks || 0) - (a.drinks || 0);
            return 0;
        });
    }, [players, sortMode]);

    const top3ByWins = [...players].sort((a, b) => (b.wins || 0) - (a.wins || 0)).slice(0, 3);
    const top3ByDrinks = [...players].sort((a, b) => (b.drinks || 0) - (a.drinks || 0)).slice(0, 3);
    const top5Players = [...players].sort((a, b) => Math.abs(b.drinks || 0) - Math.abs(a.drinks || 0)).slice(0, 5);

    const chartData = useMemo(() => {
        if (matches.length < 2) return [];
        const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
        const topIds = top5Players.map(p => p.id);
        const cumDrinks = {}, cumWins = {}, cumMatches = {};
        return sorted.map(m => {
            if (!m.date) return null;
            let dateStr;
            try { dateStr = format(parseISO(m.date), 'MM/dd'); } catch { dateStr = '?'; }
            const entry = { name: dateStr };
            const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => m.teams[k]);
            players.forEach(p => {
                if (!topIds.includes(p.id)) return;
                if (cumDrinks[p.id] === undefined) { cumDrinks[p.id] = 0; cumWins[p.id] = 0; cumMatches[p.id] = 0; }
                const wasInWinner = matchTeams[m.winnerTeam]?.some(wp => wp.id === p.id);
                const wasInLoser = matchTeams.flat().some(lp => lp.id === p.id) && !wasInWinner;
                if (wasInWinner) { cumDrinks[p.id]++; cumWins[p.id]++; cumMatches[p.id]++; }
                else if (wasInLoser) { cumDrinks[p.id]--; cumMatches[p.id]++; }
                entry[`${p.name}_drinks`] = cumDrinks[p.id];
                entry[`${p.name}_winRate`] = cumMatches[p.id] > 0 ? Math.round((cumWins[p.id] / cumMatches[p.id]) * 100) : 0;
            });
            return entry;
        }).filter(Boolean);
    }, [matches, players]);

    return (
        <div className="space-y-6 pb-28 text-white">

            {/* Hero Top Performers */}
            <section className="grid grid-cols-2 gap-3">
                {[
                    { title: '勝場王', icon: Trophy, player: top3ByWins[0], stat: `${top3ByWins[0]?.wins || 0} WINS`, color: '#FF4500' },
                    { title: '飲數王', icon: GlassWater, player: top3ByDrinks[0], stat: `+${top3ByDrinks[0]?.drinks || 0} 飲`, color: '#3b82f6' },
                ].map(({ title, icon: Icon, player, stat, color }) => (
                    <div key={title} className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                        <div className="h-1 w-full" style={{ background: color }} />
                        <div className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Icon className="w-3 h-3" style={{ color }} />
                                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>{title}</span>
                            </div>
                            {player ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <PlayerIcon icon={player.icon} name={player.name} className="w-9 h-9" />
                                        <p className="text-base font-black uppercase tracking-tight truncate">{player.name}</p>
                                    </div>
                                    <p className="text-[9px] font-bold mt-1" style={{ color: '#555' }}>{stat}</p>
                                </>
                            ) : <p className="text-xs text-[#333] italic">暫無數據</p>}
                        </div>
                    </div>
                ))}
            </section>

            {/* Trend Chart */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#555' }}>
                        <Activity className="w-3.5 h-3.5" style={{ color: '#FF4500' }} /> 表現趨勢
                    </h3>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #222' }}>
                        {CHART_MODES.map(m => (
                            <button key={m.key} onClick={() => setChartMode(m.key)}
                                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all"
                                style={chartMode === m.key ? { background: '#FF4500', color: '#fff' } : { background: '#111', color: '#555' }}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222', height: 220 }}>
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    {top5Players.map((p, i) => (
                                        <linearGradient key={p.id} id={`cg${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColors[i]} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={chartColors[i]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis dataKey="name" stroke="#333" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#333" fontSize={8} tickLine={false} axisLine={false}
                                    tickFormatter={v => chartMode === 'winRate' ? `${v}%` : (v > 0 ? `+${v}` : v)} />
                                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 12, fontSize: 10, fontWeight: 700 }}
                                    formatter={v => chartMode === 'winRate' ? `${v}%` : v} />
                                {top5Players.map((p, i) => {
                                    const isHL = !highlightedPlayer || highlightedPlayer === p.id;
                                    return (
                                        <Area key={p.id} type="monotone"
                                            dataKey={`${p.name}_${chartMode}`} name={p.name}
                                            stroke={chartColors[i]} fill={`url(#cg${i})`}
                                            strokeWidth={isHL ? 2 : 0.5} strokeOpacity={isHL ? 1 : 0.15}
                                            dot={false} activeDot={{ r: 3 }} />
                                    );
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: '#333' }}>
                            <TrendingUp className="w-8 h-8 opacity-30" />
                            <span className="text-xs font-bold">數據不足</span>
                        </div>
                    )}
                </div>
                {top5Players.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {top5Players.map((p, i) => (
                            <button key={p.id} onClick={() => setHighlightedPlayer(highlightedPlayer === p.id ? null : p.id)}
                                className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase transition-all"
                                style={highlightedPlayer === p.id
                                    ? { background: chartColors[i], color: '#fff' }
                                    : { background: '#111', border: '1px solid #222', color: '#555' }}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Leaderboard */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#fff', letterSpacing: '0.05em' }}>
                        LEADERBOARD
                    </h3>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #222' }}>
                        {SORT_MODES.map(m => (
                            <button key={m.key} onClick={() => setSortMode(m.key)}
                                className="px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all"
                                style={sortMode === m.key ? { background: '#FF4500', color: '#fff' } : { background: '#111', color: '#555' }}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                    <AnimatePresence mode="popLayout">
                        {sortedPlayers.map((p, idx) => {
                            const winRate = p.totalMatches > 0 ? Math.round((p.wins / p.totalMatches) * 100) : 0;
                            const earnedCount = ACHIEVEMENTS.filter(a => a.check(p)).length;
                            const rankStyle = RANK_STYLES[idx] || null;
                            return (
                                <motion.div layout key={p.id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => onSelectPlayer?.(p)}
                                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors active:opacity-70"
                                    style={{ borderBottom: '1px solid #1a1a1a' }}>

                                    {/* Rank */}
                                    <span className="text-[11px] font-black w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={rankStyle ? { background: rankStyle.bg, color: rankStyle.text } : { background: '#1a1a1a', color: '#555' }}>
                                        {idx + 1}
                                    </span>

                                    <PlayerIcon icon={p.icon} name={p.name} isHot={p.isHot} isGoat={p.isGoat} className="w-10 h-10 flex-shrink-0" />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="font-black text-sm tracking-tight">{p.name}</span>
                                            {idx === 0 && <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,69,0,0.15)', color: '#FF4500', border: '1px solid rgba(255,69,0,0.3)' }}>MVP</span>}
                                            {p.isHot && <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>🔥HOT</span>}
                                            {earnedCount > 0 && <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#666' }}>🏅{earnedCount}</span>}
                                        </div>
                                        {/* Win rate bar */}
                                        <div className="h-[3px] w-full rounded-full" style={{ background: '#1a1a1a' }}>
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: `${winRate}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.04 }}
                                                className="h-full rounded-full"
                                                style={{ background: idx === 0 ? '#FF4500' : '#333' }} />
                                        </div>
                                        <p className="text-[8px] mt-0.5" style={{ color: '#444' }}>{winRate}% 勝率 · {p.totalMatches || 0} 場</p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="font-black text-lg" style={{ color: '#FF4500' }}>{p.wins || 0}</p>
                                        <p className="text-[8px]" style={{ color: '#444' }}>勝</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#333' }} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {players.length === 0 && (
                        <div className="py-16 text-center text-[#333] italic text-sm">暫無球員資料</div>
                    )}
                </div>
            </section>
        </div>
    );
}
