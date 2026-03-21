import React, { useState } from 'react';
import { DollarSign, Calendar, Clock, ChevronLeft, ChevronRight, Filter, Copy, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, parseISO, isSameDay, subDays, addDays } from 'date-fns';
import { zhHK } from 'date-fns/locale';

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

export default function DailyReport({ players, matches }) {
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCopied, setIsCopied] = useState(false);

    const navigateMonth = (direction) => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(next);
    };

    const navigateDay = (direction) => {
        setSelectedDate(prev => direction > 0 ? addDays(prev, 1) : subDays(prev, 1));
    };

    const filteredMatches = matches.filter(m => {
        if (!m || !m.date) return false;
        try {
            const matchDate = parseISO(m.date);
            if (viewMode === 'daily') {
                return isSameDay(matchDate, selectedDate);
            } else {
                return isSameMonth(matchDate, currentMonth);
            }
        } catch (e) {
            return false;
        }
    });

    // Total Stake = total amount losers lose (money changing hands)
    const totalStake = filteredMatches.reduce((acc, m) => {
        if (!m.teams || m.winnerTeam === undefined || !m.teams[m.winnerTeam]) return acc;
        return acc + m.stake * (m.teams.flat().length - m.teams[m.winnerTeam].length);
    }, 0);

    const playersWithDailyStats = players.map(p => {
        let totalEarnings = 0;
        let dailyWins = 0;
        let dailyLosses = 0;
        filteredMatches.forEach(m => {
            if (!m.teams || m.winnerTeam === undefined || !m.teams[m.winnerTeam]) return;
            const teamsFlat = m.teams.flat();
            const wasInWinner = m.teams[m.winnerTeam]?.some(wp => wp.id === p.id) || false;
            const wasInLoser = (teamsFlat.some(lp => lp.id === p.id) && !wasInWinner) || false;

            if (wasInWinner) {
                totalEarnings += m.payout;
                dailyWins += 1;
            } else if (wasInLoser) {
                totalEarnings -= m.stake;
                dailyLosses += 1;
            }
        });

        const hasPlayed = filteredMatches.some(m => m.teams.flat().some(tp => tp.id === p.id));
        return hasPlayed ? { ...p, totalEarnings, dailyWins, dailyLosses } : null;
    }).filter(Boolean);

    const copyToWhatsApp = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const title = `🏐 *Wan Chai VBC 結算報告* (${dateStr})`;
        const total = `💰 *總結算金額: $${totalStake}*`;
        const playerStats = playersWithDailyStats.map(p => {
            const signal = p.totalEarnings >= 0 ? '🟢' : '🔴';
            return `${signal} *${p.name}*: ${p.totalEarnings >= 0 ? '+' : ''}$${p.totalEarnings.toFixed(0)} (${p.dailyWins}勝 ${p.dailyLosses}負)`;
        }).join('\n');

        const matchDetails = filteredMatches.map(m => {
            const scoreStr = m.scores ? ` (${m.scores[0]}-${m.scores[1]})` : '';
            return `• $${m.stake}${scoreStr} - Team ${(m.winnerTeam ?? 0) + 1} 勝`;
        }).join('\n');

        const report = `${title}\n${total}\n------------------\n*個人盈虧:*\n${playerStats}\n------------------\n*比賽詳情:*\n${matchDetails}\n------------------\n請收錢人核對，多謝合作！`;

        navigator.clipboard.writeText(report).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-6 pb-24 text-white">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">數據 <span className="text-emerald-400">結算</span></h2>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'daily' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            按日
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            按月
                        </button>
                    </div>
                </div>

                {viewMode === 'daily' && (
                    <div className="flex items-center justify-between p-4 glass rounded-[32px] border border-white/5 bg-white/2">
                        <button onClick={() => navigateDay(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-emerald-400" />
                        </button>
                        <div className="text-center">
                            <p className="text-sm font-black italic tracking-tighter uppercase text-white">
                                {isToday(selectedDate) ? '今日 ' : ''}{format(selectedDate, 'yyyy年 M月 d日', { locale: zhHK })}
                            </p>
                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-0.5">歷史紀錄瀏覽</p>
                        </div>
                        <button onClick={() => navigateDay(1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-emerald-400" />
                        </button>
                    </div>
                )}

                {viewMode === 'monthly' && (
                    <div className="flex items-center justify-between p-4 glass rounded-[32px] border border-white/5 bg-white/2">
                        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-emerald-400" />
                        </button>
                        <div className="text-center">
                            <p className="text-sm font-black italic tracking-tighter uppercase text-white">
                                {format(currentMonth, 'yyyy年 MMMM', { locale: zhHK })}
                            </p>
                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-0.5">歷史紀錄瀏覽</p>
                        </div>
                        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-emerald-400" />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-widest uppercase">
                    <p className="text-blue-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {viewMode === 'daily' ? 'Daily View' : 'Monthly View'}
                    </p>
                    <span className="text-gray-800">|</span>
                    <p className="text-yellow-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 香港時間 HKT
                    </p>
                </div>
            </header>

            {/* Main Stats Card */}
            <div className="p-8 glass rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <DollarSign className="w-20 h-20" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                            {viewMode === 'daily' ? '今日' : '本月'}總結算金額 (POOL)
                        </p>
                        <p className="text-5xl font-black italic tracking-tighter">${totalStake}</p>
                    </div>
                    {viewMode === 'daily' && totalStake > 0 && (
                        <button
                            onClick={copyToWhatsApp}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                        >
                            {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {isCopied ? '已複製' : 'WhatsApp 結算'}
                        </button>
                    )}
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 relative z-10 rotate-3 group-hover:rotate-6 transition-transform mt-4">
                    <DollarSign className="w-10 h-10" />
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    {viewMode === 'daily' ? '今日個人盈虧' : '月度累計盈虧'}
                </h3>
                <div className="space-y-3">
                    {playersWithDailyStats.map(p => (
                        <div key={p.id} className="p-5 glass rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all hover:bg-white/2 group">
                            <div className="flex items-center gap-4">
                                <PlayerIcon icon={p.icon} name={p.name} className="w-12 h-12" />
                                <div>
                                    <span className="text-lg font-black italic tracking-tighter uppercase">{p.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                                            {p.dailyWins}勝 {p.dailyLosses}負
                                        </p>
                                        <span className="text-gray-800 text-[8px]">•</span>
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                                            {filteredMatches.filter(m => m.teams.flat().some(tp => tp.id === p.id)).length} games
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-2xl font-black italic tracking-tighter ${p.totalEarnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {p.totalEarnings >= 0 ? `+$${p.totalEarnings.toFixed(0)}` : `-$${Math.abs(p.totalEarnings).toFixed(0)}`}
                                </p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                    {viewMode === 'daily' ? '今日淨額' : '月度總額'}
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredMatches.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/2">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-800">
                                <Filter className="w-8 h-8" />
                            </div>
                            <p className="text-gray-600 font-bold italic">此時段暫無比賽紀錄</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="p-6 glass rounded-[32px] text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] text-center bg-white/5 leading-relaxed border border-white/5">
                請收錢人核對以上總數，確保金額正確。<br />
                所有數據均以 localStorage 儲存於此瀏覽器。
            </div>
        </div>
    );
}

