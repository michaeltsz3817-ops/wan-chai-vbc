import React, { useState, useEffect } from 'react';
import { DollarSign, Coffee, Check, X, AlertCircle, RefreshCw, Trophy, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerIcon = ({ icon, name, className = "w-6 h-6" }) => {
    if (icon?.startsWith('data:image')) {
        return (
            <div className={`${className} rounded-full overflow-hidden border border-white/10`}>
                <img src={icon} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <span className="text-sm" role="img" aria-label={name}>{icon || '🏐'}</span>
    );
};

export default function MatchSession({ activeTeams, onComplete, onResetTeams }) {
    const [stake, setStake] = useState(10);
    const [winnerIndex, setWinnerIndex] = useState(null);

    // Rotation State (Only for 3 teams)
    const [gameStep, setGameStep] = useState(0); // 0, 1, 2
    const [g1WinnerIdx, setG1WinnerIdx] = useState(null);

    // Reset rotation if teams change length
    useEffect(() => {
        setGameStep(0);
        setG1WinnerIdx(null);
        setWinnerIndex(null);
    }, [activeTeams.length]);

    if (!activeTeams || activeTeams.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-500 space-y-6 text-center glass rounded-[40px] border border-white/5 bg-white/2">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                    <Users className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <p className="font-black italic text-xl tracking-tighter uppercase text-white">尚未準備就緒</p>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">請先在「組隊」頁面生成隊伍，<br />然後回來開始比賽。</p>
                </div>
            </div>
        );
    }

    const isThreeTeam = activeTeams.length === 3;

    // Determine which teams are playing in the current step
    let currentMatchSubindices = [0, 1]; // Default for 2 teams
    if (isThreeTeam) {
        if (gameStep === 0) currentMatchSubindices = [0, 1]; // A vs B
        if (gameStep === 1) currentMatchSubindices = [g1WinnerIdx === 0 ? 1 : 0, 2]; // Loser(G1) vs C
        if (gameStep === 2) currentMatchSubindices = [2, g1WinnerIdx]; // C vs Winner(G1)
    }

    const handleFinish = () => {
        if (winnerIndex === null) return;

        // Current playing teams
        const playingTeams = currentMatchSubindices.map(idx => activeTeams[idx]);
        const winners = activeTeams[winnerIndex];
        const losers = playingTeams.filter(t => t !== winners).flat();

        const totalLost = losers.length * stake;
        const winPerPerson = winners.length > 0 ? totalLost / winners.length : 0;

        // Record the actual match result
        onComplete({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            stake,
            winnerTeam: winnerIndex,
            teams: playingTeams, // Only record those who played in this match
            payout: winPerPerson,
            roundName: isThreeTeam ? `Round ${gameStep + 1}` : 'Friendly'
        });

        // Advance rotation if 3 teams
        if (isThreeTeam) {
            if (gameStep === 0) setG1WinnerIdx(winnerIndex);

            if (gameStep < 2) {
                setGameStep(gameStep + 1);
                setWinnerIndex(null);
            } else {
                // End of session, prompt reset or start over
                if (window.confirm('三場循環賽已結束！是否重新開始新一輪循環？')) {
                    setGameStep(0);
                    setG1WinnerIdx(null);
                    setWinnerIndex(null);
                }
            }
        } else {
            setWinnerIndex(null);
        }
    };

    return (
        <div className="space-y-8 text-white pb-32">
            <header className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">比賽 <span className="text-emerald-400">ON AIR</span></h2>
                    {isThreeTeam && (
                        <div className="flex gap-2">
                            {[0, 1, 2].map(s => (
                                <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= gameStep ? 'bg-emerald-500' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={onResetTeams}
                    className="p-3 bg-red-400/10 text-red-400 rounded-2xl hover:bg-red-400 hover:text-white transition-all active:scale-95"
                    title="解散隊伍"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            {isThreeTeam && (
                <div className="p-4 glass rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 text-center animate-in fade-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                        Wan Chai C 特色循環制 - 第 {gameStep + 1} 場
                    </p>
                    <h4 className="text-xl font-black italic tracking-tighter uppercase">
                        {gameStep === 0 ? 'TEAM 1 vs TEAM 2' :
                            gameStep === 1 ? '第一場輸家 vs TEAM 3' :
                                'TEAM 3 vs 第一場贏家'}
                    </h4>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1 italic">TEAM {activeTeams.findIndex((_, i) => !currentMatchSubindices.includes(i)) + 1} 休息中</p>
                </div>
            )}

            <div className="flex justify-center gap-3">
                {[10, 20, 30].map(val => (
                    <button
                        key={val}
                        onClick={() => setStake(val)}
                        className={`px-6 py-4 rounded-[28px] font-black text-sm tracking-tighter transition-all border ${stake === val
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/30 -translate-y-1'
                            : 'bg-white/5 border-white/10 text-gray-600 hover:text-gray-400'
                            }`}
                    >
                        {val === 20 ? '起孖 $20' : val === 30 ? '起3 $30' : `$${val}`}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center italic">選擇本場勝方 (PICK WINNER)</h3>
                <div className="grid grid-cols-1 gap-4">
                    {currentMatchSubindices.map((idx) => {
                        const team = activeTeams[idx];
                        const isSelected = winnerIndex === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => setWinnerIndex(idx)}
                                className={`p-6 rounded-[32px] transition-all border text-left flex items-center justify-between group relative overflow-hidden ${isSelected
                                    ? 'bg-emerald-500/20 border-emerald-500 shadow-2xl scale-[1.02] z-10'
                                    : 'bg-white/2 border-white/5 grayscale saturate-50 hover:grayscale-0 hover:border-white/20'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                )}

                                <div className="flex-1 relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            隊伍 {idx + 1} ({team.length}人)
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {team.map(p => (
                                            <div key={p.id} className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-2xl border border-white/5 shadow-inner">
                                                <PlayerIcon icon={p.icon} name={p.name} className="w-5 h-5" />
                                                <span className="text-[10px] font-black uppercase italic tracking-tighter">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="w-14 h-14 rounded-[20px] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 ml-4 relative z-10"
                                    >
                                        <Check className="w-8 h-8" />
                                    </motion.div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={handleFinish}
                disabled={winnerIndex === null}
                className="w-full py-6 bg-emerald-500 font-black italic text-2xl tracking-tighter uppercase rounded-[40px] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">{isThreeTeam && gameStep < 2 ? '完成第 ' + (gameStep + 1) + ' 場' : '正式結算賽事'}</span>
                <ArrowRight className="w-7 h-7 relative z-10" />
            </button>

            <div className="p-6 glass rounded-[36px] flex items-center gap-5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/2 border border-white/5 leading-snug">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                    <Coffee className="w-6 h-6" />
                </div>
                <p>規則：贏家獲 +1 飲數；輸家獲 -1 飲數。<br />
                    <span className="text-emerald-400/50">結算數據即時同步至總覽及數據表。</span>
                </p>
            </div>
        </div>
    );
}
