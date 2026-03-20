import React, { useMemo } from 'react';
import { Trophy, GlassWater, TrendingUp, Medal, User, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

const PlayerIcon = ({ icon, name, className = "w-6 h-6" }) => {
    if (icon?.startsWith('data:image')) {
        return (
            <div className={`${className} rounded-full overflow-hidden border border-white/10 shadow-sm`}>
                <img src={icon} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <span className="text-xl" role="img" aria-label={name}>{icon || '🏐'}</span>
    );
};

export default function StatsHub({ players, matches }) {
    const sortedByWins = [...players].sort((a, b) => (b.wins || 0) - (a.wins || 0)).slice(0, 3);
    const sortedByDrinks = [...players].sort((a, b) => (b.drinks || 0) - (a.drinks || 0)).slice(0, 3);

    const chartData = useMemo(() => {
        if (matches.length === 0) return [];

        // Sort matches by date ascending
        const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Get top 5 players by absolute drink count to keep chart clean
        const topPlayerIds = [...players]
            .sort((a, b) => Math.abs(b.drinks || 0) - Math.abs(a.drinks || 0))
            .slice(0, 5)
            .map(p => p.id);

        const data = [];
        const playerCumulative = {}; // playerId -> currentTotal

        sortedMatches.forEach((m) => {
            const dateStr = format(parseISO(m.date), 'MM/dd HH:mm');
            const entry = { name: dateStr };

            players.forEach(p => {
                if (!topPlayerIds.includes(p.id)) return;
                if (playerCumulative[p.id] === undefined) playerCumulative[p.id] = 0;

                const wasInWinner = m.teams?.[m.winnerTeam]?.some(wp => wp.id === p.id);
                const wasInLoser = m.teams?.flat().some(lp => lp.id === p.id) && !wasInWinner;

                if (wasInWinner) playerCumulative[p.id] += 1;
                else if (wasInLoser) playerCumulative[p.id] -= 1;

                entry[p.name] = playerCumulative[p.id];
            });
            data.push(entry);
        });

        return data;
    }, [matches, players]);

    const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6 pb-24 text-white">
            {/* Top Performers Summary */}
            <section className="grid grid-cols-2 gap-4">
                <div className="p-4 glass rounded-3xl bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">勝場王</span>
                    </div>
                    {sortedByWins[0] ? (
                        <div>
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={sortedByWins[0].icon} name={sortedByWins[0].name} className="w-8 h-8" />
                                <p className="text-xl font-black truncate">{sortedByWins[0].name}</p>
                            </div>
                            <p className="text-[10px] text-gray-500">{sortedByWins[0].wins || 0} 場勝仗</p>
                        </div>
                    ) : <p className="text-sm text-gray-600">暫無數據</p>}
                </div>

                <div className="p-4 glass rounded-3xl bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <GlassWater className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">飲數王</span>
                    </div>
                    {sortedByDrinks[0] ? (
                        <div>
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={sortedByDrinks[0].icon} name={sortedByDrinks[0].name} className="w-8 h-8" />
                                <p className="text-xl font-black truncate">{sortedByDrinks[0].name}</p>
                            </div>
                            <p className="text-[10px] text-gray-500">{sortedByDrinks[0].drinks || 0} 飲</p>
                        </div>
                    ) : <p className="text-sm text-gray-600">暫無數據</p>}
                </div>
            </section>

            {/* Performance Trend Chart */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Activity className="w-4 h-4" /> 表現趨勢 (累計飲數)
                </h3>
                <div className="p-6 glass rounded-[32px] border border-white/5 bg-white/2 h-[300px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    fontSize={8}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={8}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => (val > 0 ? `+${val}` : val)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111',
                                        border: '1px solid #333',
                                        borderRadius: '16px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}
                                    itemStyle={{ padding: '2px 0' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', paddingTop: '0', paddingBottom: '20px' }}
                                />
                                {players.slice(0, 5).map((p, idx) => (
                                    <Line
                                        key={p.id}
                                        type="monotone"
                                        dataKey={p.name}
                                        stroke={chartColors[idx % chartColors.length]}
                                        strokeWidth={3}
                                        dot={{ r: 2, strokeWidth: 2 }}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 italic text-sm gap-2">
                            <TrendingUp className="w-8 h-8 opacity-20" />
                            數據不足以生成圖表
                        </div>
                    )}
                </div>
            </section>

            {/* Leaderboard Table */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Medal className="w-4 h-4" /> 龍虎榜
                </h3>
                <div className="glass rounded-[32px] overflow-hidden border border-white/5 bg-white/1">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                <th className="px-5 py-4 font-black">成員</th>
                                <th className="px-5 py-4 text-center font-black">勝</th>
                                <th className="px-5 py-4 text-center font-black">負</th>
                                <th className="px-5 py-4 text-right font-black">飲數</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {players.sort((a, b) => (b.wins || 0) - (a.wins || 0)).map((p, idx) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-5 py-4 flex items-center gap-3">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                            idx === 1 ? 'bg-gray-300 text-black' :
                                                idx === 2 ? 'bg-orange-600 text-black' : 'bg-white/10 text-gray-500'
                                            }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-bold flex items-center gap-2 text-base">
                                            <PlayerIcon icon={p.icon} name={p.name} className="w-7 h-7" />
                                            {p.name}
                                            <div className="flex gap-1">
                                                {idx === 0 && (
                                                    <span className="bg-yellow-500/20 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5 border border-yellow-500/30">
                                                        <Trophy className="w-2 h-2" /> MVP
                                                    </span>
                                                )}
                                                {p.isHot && (
                                                    <span className="bg-orange-500/20 text-orange-400 text-[8px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5 border border-orange-500/30">
                                                        <Zap className="w-2 h-2" /> HOT
                                                    </span>
                                                )}
                                            </div>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center font-black text-emerald-400 text-base">{p.wins || 0}</td>
                                    <td className="px-5 py-4 text-center font-black text-red-400 text-base">{p.losses || 0}</td>
                                    <td className={`px-5 py-4 text-right font-black text-base ${(p.drinks || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                        {(p.drinks || 0) >= 0 ? `+${(p.drinks || 0)}` : (p.drinks || 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

