import React from 'react';
import { Trophy, GlassWater, TrendingUp, Medal, User } from 'lucide-react';

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

    return (
        <div className="space-y-6 pb-12 text-white">
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

            {/* Leaderboard Table */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Medal className="w-4 h-4" /> 龍虎榜
                </h3>
                <div className="glass rounded-[32px] overflow-hidden border border-white/5">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                <th className="px-5 py-4">成員</th>
                                <th className="px-5 py-4 text-center">勝</th>
                                <th className="px-5 py-4 text-right">飲數</th>
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
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center font-black text-emerald-400 text-base">{p.wins || 0}</td>
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
