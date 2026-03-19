import React from 'react';
import { DollarSign, Calendar, Clock } from 'lucide-react';

const PlayerIcon = ({ icon, name, className = "w-6 h-6" }) => {
    if (icon?.startsWith('data:image')) {
        return (
            <div className={`${className} rounded-full overflow-hidden border border-white/10`}>
                <img src={icon} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <span className="text-xl" role="img" aria-label={name}>{icon || '🏐'}</span>
    );
};

export default function DailyReport({ players, matches }) {
    // Only show results for "today" in HK Time
    const now = new Date();
    const todayStr = now.toLocaleDateString('zh-HK');

    const todaysMatches = matches.filter(m => new Date(m.date).toLocaleDateString('zh-HK') === todayStr);
    const totalStake = todaysMatches.reduce((acc, m) => acc + m.stake, 0);

    return (
        <div className="space-y-6 pb-24 text-white">
            <header className="text-center space-y-2">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">今日 <span className="text-emerald-400">結算</span></h2>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-widest uppercase">
                    <p className="text-blue-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {todayStr}
                    </p>
                    <span className="text-gray-800">|</span>
                    <p className="text-yellow-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 香港時間 HKT
                    </p>
                </div>
            </header>

            <div className="p-8 glass rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <DollarSign className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">總投注額 (POOL)</p>
                    <p className="text-5xl font-black italic tracking-tighter">${totalStake}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 relative z-10 rotate-3">
                    <DollarSign className="w-10 h-10" />
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">個人盈虧 (今日)</h3>
                <div className="space-y-3">
                    {players.map(p => {
                        // Calculate earnings for today
                        let earnings = 0;
                        todaysMatches.forEach(m => {
                            const wasInWinner = m.teams[m.winnerTeam].some(wp => wp.id === p.id);
                            const wasInLoser = m.teams.flat().some(lp => lp.id === p.id) && !wasInWinner;

                            if (wasInWinner) {
                                earnings += m.payout;
                            } else if (wasInLoser) {
                                earnings -= m.stake;
                            }
                        });

                        if (earnings === 0 && todaysMatches.length > 0) {
                            // Filter players who didn't play today from the summary
                            if (!todaysMatches.some(m => m.teams.flat().some(tp => tp.id === p.id))) return null;
                        }

                        return (
                            <div key={p.id} className="p-5 glass rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-12 h-12" />
                                    <span className="text-lg font-black italic tracking-tighter uppercase">{p.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black italic tracking-tighter ${earnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {earnings >= 0 ? `+$${earnings.toFixed(0)}` : `-$${Math.abs(earnings).toFixed(0)}`}
                                    </p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">今日淨額</p>
                                </div>
                            </div>
                        );
                    })}
                    {todaysMatches.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                            <p className="text-gray-600 font-bold italic">今日暫無比賽結算</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="p-6 glass rounded-2xl text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] text-center bg-white/5 leading-relaxed">
                請收錢人核對以上總數，確保金額正確。<br />
                所有數據均以 localStorage 儲存於此瀏覽器。
            </div>
        </div>
    );
}
