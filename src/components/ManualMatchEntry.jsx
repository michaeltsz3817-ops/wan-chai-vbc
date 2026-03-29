import React, { useState } from 'react';
import { Users, Check, X, Trophy, DollarSign, Plus, Trash2, Search } from 'lucide-react';
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
        <div className="space-y-8 pb-32">
            <header className="flex items-center justify-between">
                <h2 className="font-display text-3xl tracking-wide uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                    MANUAL <span style={{color: '#FF4500'}}>ENTRY</span>
                </h2>
                <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#222]">
                    <X className="w-5 h-5 text-[#444]" />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {/* Team A Picker */}
                <div className="p-5 rounded-2xl flex flex-col transition-all relative overflow-hidden" 
                    style={{background: '#111', border: winner === 'A' ? '1px solid #3b82f6' : '1px solid #222'}}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[9px] font-black uppercase tracking-widest" style={{color: winner === 'A' ? '#3b82f6' : '#444'}}>TEAM A ({teamA.length})</h3>
                        <button onClick={() => setWinner('A')} 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${winner === 'A' ? 'bg-[#3b82f6] text-white' : 'bg-[#050505] text-[#222]'}`}>
                            <Trophy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2 min-h-[120px]">
                        {(teamA || []).map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-[#050505] p-2.5 rounded-xl border border-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase">{p.name}</span>
                                </div>
                                <button onClick={() => handleRemoveA(p.id)} className="text-[#333] hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team B Picker */}
                <div className="p-5 rounded-2xl flex flex-col transition-all relative overflow-hidden" 
                    style={{background: '#111', border: winner === 'B' ? '1px solid #FF4500' : '1px solid #222'}}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[9px] font-black uppercase tracking-widest" style={{color: winner === 'B' ? '#FF4500' : '#444'}}>TEAM B ({teamB.length})</h3>
                        <button onClick={() => setWinner('B')} 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${winner === 'B' ? 'bg-[#FF4500] text-white' : 'bg-[#050505] text-[#222]'}`}>
                            <Trophy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2 min-h-[120px]">
                        {teamB.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-[#050505] p-2.5 rounded-xl border border-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                    <PlayerIcon icon={p.icon} name={p.name} className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase">{p.name}</span>
                                </div>
                                <button onClick={() => handleRemoveB(p.id)} className="text-[#333] hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stake Selection */}
            <div className="flex justify-center gap-3">
                {[10, 20, 30].map(val => (
                    <button key={val} onClick={() => setStake(val)} 
                        className="px-6 py-3 rounded-xl font-display text-xl transition-all active:scale-95"
                        style={stake === val 
                            ? {background: '#FF4500', color: '#fff'} 
                            : {background: '#111', color: '#444', border: '1px solid #222'}}>
                        ${val}
                    </button>
                ))}
            </div>

            {/* Selection */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
                    <input 
                        type="text" 
                        placeholder="SEARCH ATHLETE..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] p-4 pl-12 rounded-xl text-[10px] font-black uppercase tracking-widest placeholder:text-[#222] outline-none focus:border-[#FF450033]"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 h-56 overflow-y-auto no-scrollbar pb-10">
                    {filteredPlayers.map(p => (
                        <div key={p.id} className="p-4 rounded-xl flex items-center justify-between group" style={{background: '#111', border: '1px solid #1a1a1a'}}>
                            <div className="flex items-center gap-3">
                                <PlayerIcon icon={p.icon} name={p.name} className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase">{p.name}</span>
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleAddA(p)} className="px-3 py-1 bg-[#3b82f6] text-white text-[9px] font-black rounded-lg">A</button>
                                <button onClick={() => handleAddB(p)} className="px-3 py-1 bg-[#FF4500] text-white text-[9px] font-black rounded-lg">B</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={teamA.length === 0 || teamB.length === 0 || !winner}
                className="w-full py-6 font-display text-3xl tracking-wider uppercase rounded-[40px] shadow-2xl transition-all active:scale-95 disabled:opacity-20"
                style={{background: '#FF4500', color: '#fff', fontFamily: "'Bebas Neue', sans-serif"}}
            >
                VERIFY & COMMIT
            </button>
        </div>
    );
}
