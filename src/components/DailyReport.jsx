import React, { useState } from 'react';
import { DollarSign, Calendar, Clock, ChevronLeft, ChevronRight, Filter, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
import { format, isToday, parseISO, isSameDay, isSameMonth, subDays, addDays } from 'date-fns';
import { zhHK } from 'date-fns/locale';
import PlayerIcon from './ui/PlayerIcon';

export default function DailyReport({ players, matches }) {
    const [viewMode, setViewMode] = useState('daily');
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
            if (viewMode === 'daily') return isSameDay(matchDate, selectedDate);
            return isSameMonth(matchDate, currentMonth);
        } catch (e) { return false; }
    });

    const totalStake = filteredMatches.reduce((acc, m) => {
        if (!m || !m.teams) return acc;
        const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => (m.teams || {})[k]);
        if (m.winnerTeam === undefined || !matchTeams[m.winnerTeam] || !Array.isArray(matchTeams[m.winnerTeam])) return acc;
        return acc + m.stake * (matchTeams.flat().length - matchTeams[m.winnerTeam].length);
    }, 0);

    const playersWithDailyStats = players.map(p => {
        let totalEarnings = 0;
        let dailyWins = 0;
        let dailyLosses = 0;
        filteredMatches.forEach(m => {
            if (!m || !m.teams) return;
            const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => (m.teams || {})[k]);
            if (m.winnerTeam === undefined || !matchTeams[m.winnerTeam] || !Array.isArray(matchTeams[m.winnerTeam])) return;
            const wasInWinner = matchTeams[m.winnerTeam]?.some(wp => wp.id === p.id);
            const wasInMatch = matchTeams.flat().some(tp => tp && tp.id === p.id);
            if (!wasInMatch) return;
            if (wasInWinner) { totalEarnings += m.payout; dailyWins += 1; }
            else { totalEarnings -= m.stake; dailyLosses += 1; }
        });
        const hasPlayed = filteredMatches.some(m => {
            const mt = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => m.teams[k]);
            return mt.flat().some(tp => tp && tp.id === p.id);
        });
        return hasPlayed ? { ...p, totalEarnings, dailyWins, dailyLosses } : null;
    }).filter(Boolean).sort((a, b) => b.totalEarnings - a.totalEarnings);

    const copyToWhatsApp = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const report = `🏐 *WAN CHAI VBC REPORT* (${dateStr})\n` +
            `💰 *POOL: $${totalStake}*\n` +
            `------------------\n` +
            playersWithDailyStats.map(p => {
                const signal = p.totalEarnings >= 0 ? '🟢' : '🔴';
                return `${signal} *${p.name}*: ${p.totalEarnings >= 0 ? '+' : ''}$${p.totalEarnings.toFixed(0)} (${p.dailyWins}W ${p.dailyLosses}L)`;
            }).join('\n') +
            `\n------------------\nVerified athlete performance record.`;

        navigator.clipboard.writeText(report).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-8 pb-32 text-white">
            <header className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-4xl tracking-wide uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                        OFFICIAL <span style={{color: '#FF4500'}}>REPORT</span>
                    </h2>
                    <div className="flex gap-1.5 p-1 rounded-xl" style={{background: '#111', border: '1px solid #222'}}>
                        {['daily', 'monthly'].map(m => (
                            <button key={m} onClick={() => setViewMode(m)} 
                                className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                style={viewMode === m ? {background: '#FF4500', color: '#fff'} : {color: '#555'}}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl relative overflow-hidden" 
                    style={{background: '#111', border: '1px solid #222'}}>
                    <div className="absolute top-0 right-0 w-32 h-full opacity-5 transform translate-x-10 -skew-x-12" style={{background: '#FF4500'}} />
                    <button onClick={() => viewMode === 'daily' ? navigateDay(-1) : navigateMonth(-1)} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#222]">
                        <ChevronLeft className="w-5 h-5 text-[#FF4500]" />
                    </button>
                    <div className="text-center relative z-10">
                        <p className="font-display text-2xl tracking-wide uppercase">
                            {viewMode === 'daily' 
                                ? (isToday(selectedDate) ? 'WATCH: TODAY' : format(selectedDate, 'MMM d, yyyy'))
                                : format(currentMonth, 'MMMM yyyy')}
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-[0.4em] mt-1" style={{color: '#444'}}>TIME-SERIES DATA</p>
                    </div>
                    <button onClick={() => viewMode === 'daily' ? navigateDay(1) : navigateMonth(1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#222]">
                        <ChevronRight className="w-5 h-5 text-[#FF4500]" />
                    </button>
                </div>
            </header>

            {/* Hero Stake Pool */}
            <div className="relative p-8 rounded-[40px] overflow-hidden flex flex-col items-center text-center group" 
                style={{background: 'linear-gradient(135deg, #111, #050505)', border: '1px solid #222'}}>
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{background: 'linear-gradient(90deg, #FF4500, transparent 80%)'}} />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-5" style={{background: '#FF4500', borderRadius: '50%', filter: 'blur(40px)'}} />
                
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{color: '#444'}}>
                    TOTAL {viewMode === 'daily' ? 'DAILY' : 'MONTHLY'} STAKE POOL
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                    <span className="font-display text-7xl leading-none" style={{color: '#FF4500'}}>${totalStake}</span>
                    <span className="text-xs font-black uppercase" style={{color: '#222'}}>HKD</span>
                </div>

                {viewMode === 'daily' && totalStake > 0 && (
                    <button onClick={copyToWhatsApp} 
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-display text-xl tracking-wide transition-all active:scale-95 ${isCopied ? 'bg-white text-black' : 'bg-[#FF4500] text-white shadow-2xl shadow-[#FF450044]'}`}>
                        {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {isCopied ? 'COPIED TO CLIPBOARD' : 'SEND TO WHATSAPP'}
                    </button>
                )}
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest" style={{color: '#555'}}>PERFORMANCE BREAKDOWN</h3>
                    <TrendingUp className="w-4 h-4 text-[#222]" />
                </div>
                <div className="space-y-3">
                    {playersWithDailyStats.map(p => (
                        <div key={p.id} className="p-5 rounded-2xl flex items-center justify-between transition-all relative overflow-hidden group" 
                            style={{background: '#111', border: '1px solid #1a1a1a'}}>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: '#050505', border: '1px solid #1a1a1a'}}>
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display text-2xl tracking-wide uppercase leading-none">{p.name}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex gap-[3px]">
                                            {Array.from({length: p.dailyWins}).map((_, i) => <div key={i} className="w-3 h-1 rounded-full" style={{background: '#FF4500'}} />)}
                                            {Array.from({length: p.dailyLosses}).map((_, i) => <div key={i} className="w-3 h-1 rounded-full" style={{background: '#222'}} />)}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest" style={{color: '#444'}}>RECORD</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="font-display text-3xl leading-none" style={{color: p.totalEarnings >= 0 ? '#10b981' : '#ef4444'}}>
                                    {p.totalEarnings >= 0 ? `+$${p.totalEarnings.toFixed(0)}` : `-$${Math.abs(p.totalEarnings).toFixed(0)}`}
                                </p>
                                <p className="text-[8px] font-black uppercase tracking-widest mt-1" style={{color: '#333'}}>NET CHANGE</p>
                            </div>
                        </div>
                    ))}
                    {filteredMatches.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-[#1a1a1a] rounded-[40px] opacity-40">
                             <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#111]" />
                             <p className="font-display text-2xl uppercase tracking-widest text-[#222]">NO RECORDS FOUND</p>
                        </div>
                    )}
                </div>
            </section>

            <footer className="pt-10 pb-10">
                <div className="p-6 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-center leading-relaxed" 
                    style={{background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#222'}}>
                    OFFICIAL WAN CHAI VBC LEDGER <br/>
                    <span style={{color: '#FF45001a'}}>VERIFIED DATA STREAM</span>
                </div>
            </footer>
        </div>
    );
}
