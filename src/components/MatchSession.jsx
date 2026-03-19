import React, { useState } from 'react';
import { DollarSign, Coffee, Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function MatchSession({ activeTeams, onComplete }) {
    const [stake, setStake] = useState(10);
    const [winnerIndex, setWinnerIndex] = useState(null);

    if (!activeTeams || activeTeams.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500 space-y-4 text-center">
                <AlertCircle className="w-12 h-12 opacity-20" />
                <p className="text-sm">請先在「分隊」頁面生成隊伍</p>
            </div>
        );
    }

    const handleFinish = () => {
        if (winnerIndex === null) return;

        const losers = activeTeams.filter((_, i) => i !== winnerIndex).flat();
        const winners = activeTeams[winnerIndex];

        // Logic: Losers pay $stake each.
        const totalLost = losers.length * stake;
        const winPerPerson = totalLost / winners.length;

        onComplete({
            date: new Date().toISOString(),
            stake,
            winnerTeam: winnerIndex,
            teams: activeTeams,
            payout: winPerPerson,
            drinks: 1 // Everyone on winning team gets 1 drink credit, losers lose 1
        });
    };

    return (
        <div className="space-y-8 text-white">
            <div className="flex justify-center gap-3">
                {[10, 20, 30].map(val => (
                    <button
                        key={val}
                        onClick={() => setStake(val)}
                        className={`px-5 py-3 rounded-2xl font-bold transition-all border ${stake === val
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 border-white/10 text-gray-500'
                            }`}
                    >
                        {val === 20 ? '起孖 $20' : val === 30 ? '起3 $30' : `$${val}`}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest text-center">選擇勝方 (WINNER)</h3>
                <div className="grid grid-cols-1 gap-4">
                    {activeTeams.map((team, idx) => (
                        <button
                            key={idx}
                            onClick={() => setWinnerIndex(idx)}
                            className={`p-6 rounded-[32px] transition-all border text-left flex items-center justify-between group ${winnerIndex === idx
                                ? 'bg-emerald-500/10 border-emerald-500 shadow-xl'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex-1">
                                <p className={`text-[10px] font-black uppercase mb-3 tracking-widest ${winnerIndex === idx ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    隊伍 {idx + 1} ({team.length}人)
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {team.map(p => (
                                        <div key={p.id} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                            <PlayerIcon icon={p.icon} name={p.name} className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {winnerIndex === idx && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 ml-4"
                                >
                                    <Check className="w-6 h-6" />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleFinish}
                disabled={winnerIndex === null}
                className="w-full py-5 bg-emerald-500 font-black italic text-xl tracking-tighter uppercase rounded-[32px] flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
                完成比賽並結算
            </button>

            <div className="p-5 glass rounded-2xl flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                    <Coffee className="w-5 h-5" />
                </div>
                <p>輸家每人輸出一支野飲，贏家記一數。<br /><span className="text-[8px] opacity-50">Settlement will be updated across all tabs.</span></p>
            </div>
        </div>
    );
}
