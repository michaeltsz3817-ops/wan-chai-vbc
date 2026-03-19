import React, { useState } from 'react';
import { Users, Filter, RefreshCw, Trophy } from 'lucide-react';
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
        <span className="text-lg" role="img" aria-label={name}>{icon || '🏐'}</span>
    );
};

export default function TeamGenerator({ players, teams, setTeams }) {
    const [numTeams, setNumTeams] = useState(2);
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const togglePlayer = (id) => {
        setSelectedPlayers(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedPlayers.length === players.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(players.map(p => p.id));
        }
    };

    const generateTeams = () => {
        if (selectedPlayers.length < 2) return;

        const activePlayers = players.filter(p => selectedPlayers.includes(p.id));
        const sorted = [...activePlayers].sort((a, b) => b.skill - a.skill);

        const newTeams = Array.from({ length: numTeams }, () => []);

        // Snake draft for balance
        sorted.forEach((player, index) => {
            const turn = Math.floor(index / numTeams);
            const isForward = turn % 2 === 0;
            const teamIdx = isForward ? (index % numTeams) : (numTeams - 1 - (index % numTeams));
            newTeams[teamIdx].push(player);
        });

        setTeams(newTeams);
    };

    return (
        <div className="space-y-6 pb-24 text-white">
            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">組隊 <span className="text-emerald-400">PICKER</span></h2>
                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                    {[2, 3].map(n => (
                        <button
                            key={n}
                            onClick={() => setNumTeams(n)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${numTeams === n ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500'
                                }`}
                        >
                            {n} 隊
                        </button>
                    ))}
                </div>
            </header>

            {/* Player Selection Grid */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">選擇出場成員 ({selectedPlayers.length})</h3>
                    <button
                        onClick={selectAll}
                        className="text-[10px] font-black text-emerald-400 uppercase tracking-widest"
                    >
                        {selectedPlayers.length === players.length ? '取消全部' : '全部選擇'}
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {players.map(p => (
                        <button
                            key={p.id}
                            onClick={() => togglePlayer(p.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 border ${selectedPlayers.includes(p.id)
                                    ? 'bg-emerald-500/10 border-emerald-500/50'
                                    : 'bg-white/5 border-transparent grayscale brightness-50'
                                }`}
                        >
                            <PlayerIcon icon={p.icon} name={p.name} className="w-10 h-10" />
                            <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tighter">{p.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            <button
                onClick={generateTeams}
                disabled={selectedPlayers.length < 4}
                className="w-full py-5 bg-emerald-500 rounded-[32px] font-black italic text-xl tracking-tighter uppercase shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale mb-8"
            >
                自動平衡分隊
            </button>

            {/* Results Display */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {teams.map((team, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={idx}
                            className="p-6 glass rounded-[32px] border border-white/5 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-2 h-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'
                                }`} />

                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-black italic tracking-tighter uppercase">隊伍 {idx + 1}</h4>
                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <Users className="w-3 h-3" /> {team.length} 人
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {team.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <PlayerIcon icon={p.icon} name={p.name} className="w-6 h-6" />
                                            <span className="font-bold text-sm">{p.name}</span>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= p.skill ? 'bg-emerald-400' : 'bg-white/5'}`} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
