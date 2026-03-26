import React, { useState } from 'react';
import { Users, Check, X, Trophy, DollarSign, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerIcon from './ui/PlayerIcon';

export default function ManualMatchEntry({ players, onComplete, onCancel }) {
    const [teamA, setTeamA] = useState([]);
    const [teamB, setTeamB] = useState([]);
    const [winner, setWinner] = useState(null); // 'A' or 'B'
    const [stake, setStake] = useState(10);
    const [search, setSearch] = useState('');

    const filteredPlayers = players.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        !teamA.find(tp => tp.id === p.id) &&
        !teamB.find(tp => tp.id === p.id)
    );

    const handleAddA = (p) => {
        if (teamA.length >= 6) return;
        setTeamA([...teamA, p]);
    };

    const handleAddB = (p) => {
        if (teamB.length >= 6) return;
        setTeamB([...teamB, p]);
    };

    const handleRemoveA = (id) => setTeamA(teamA.filter(p => p.id !== id));
    const handleRemoveB = (id) => setTeamB(teamB.filter(p => p.id !== id));

    const handleSubmit = () => {
        if (teamA.length === 0 || teamB.length === 0 || !winner) {
            alert('請完整填寫隊伍及勝方');
            return;
        }

        const totalLost = (winner === 'A' ? teamB.length : teamA.length) * stake;
        const winners = winner === 'A' ? teamA : teamB;
        const payout = winners.length > 0 ? totalLost / winners.length : 0;

        onComplete({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            stake,
            scores: [0, 0],
            winnerTeam: winner === 'A' ? 0 : 1,
            teams: {
                0: teamA,
                1: teamB
            },
            payout,
            roundName: 'Manual Entry',
            isRotationMatch: false,
            isManual: true
        });
    };

    return (
        <div className="space-y-6 pb-24">
            <header className="flex items-center justify-between">
                <h2 className="text-xl font-black italic tracking-tighter uppercase">補入 <span className="text-emerald-400">戰績</span></h2>
                <button onClick={onCancel} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {/* Team A Picker */}
                <div className={`p-4 rounded-3xl border transition-all ${winner === 'A' ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">TEAM A ({teamA.length}/6)</h3>
                        <button onClick={() => setWinner('A')} className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${winner === 'A' ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/10 text-gray-600'}`}>
                            <Trophy className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                        {teamA.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">{p.name}</span>
                                </div>
                                <button onClick={() => handleRemoveA(p.id)} className="text-gray-600 hover:text-red-400">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team B Picker */}
                <div className={`p-4 rounded-3xl border transition-all ${winner === 'B' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">TEAM B ({teamB.length}/6)</h3>
                        <button onClick={() => setWinner('B')} className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${winner === 'B' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-gray-600'}`}>
                            <Trophy className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                        {teamB.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">{p.name}</span>
                                </div>
                                <button onClick={() => handleRemoveB(p.id)} className="text-gray-600 hover:text-red-400">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stake Selection */}
            <div className="flex justify-center gap-2">
                {[10, 20, 30].map(val => (
                    <button key={val} onClick={() => setStake(val)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${stake === val ? 'bg-white text-black' : 'text-gray-500 border-white/10 hover:border-white/20'}`}>
                        ${val}
                    </button>
                ))}
            </div>

            {/* Player Search & Selection */}
            <div className="space-y-4">
                <input 
                    type="text" 
                    placeholder="搜尋隊員..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl text-[10px] font-black focus:border-emerald-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto no-scrollbar">
                    {filteredPlayers.map(p => (
                        <div key={p.id} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <PlayerIcon icon={p.icon} name={p.name} className="w-6 h-6" />
                                <span className="text-[10px] font-black">{p.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleAddA(p)} className="p-1 px-2 bg-blue-500 rounded-lg text-[8px] font-black uppercase">A</button>
                                <button onClick={() => handleAddB(p)} className="p-1 px-2 bg-emerald-500 rounded-lg text-[8px] font-black uppercase">B</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={teamA.length === 0 || teamB.length === 0 || !winner}
                className="w-full py-5 bg-emerald-500 font-black italic text-xl tracking-tighter uppercase rounded-[30px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30"
            >
                確 認 補 入 戰 績
            </button>
        </div>
    );
}
