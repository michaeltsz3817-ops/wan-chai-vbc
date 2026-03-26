import React, { useState } from 'react';
import { Users, Filter, RefreshCw, Trophy, Play, Trash2, GripVertical, Zap, Shield, Target, Hand, Layers, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

export default function TeamGenerator({ players, teams, restingPlayers, setTeams, onReset, onGenerateComplete, presentPlayerIds, onResetAttendance }) {
    const [numTeams, setNumTeams] = useState(2);

    const generateTeams = () => {
        if (!presentPlayerIds || presentPlayerIds.length < 2) return;

        const activePlayers = players.filter(p => presentPlayerIds.includes(p.id));
        
        // Purely random shuffle (ignored skill balance as requested)
        const sorted = [...activePlayers].sort(() => Math.random() - 0.5);

        // 6-player cap per team
        const limit = numTeams * 6;
        const playingPlayers = sorted.slice(0, limit);
        const nextResting = sorted.slice(limit);

        const newTeams = Array.from({ length: numTeams }, () => []);

        // Snake draft for balance
        playingPlayers.forEach((player, index) => {
            const turn = Math.floor(index / numTeams);
            const isForward = turn % 2 === 0;
            const teamIdx = isForward ? (index % numTeams) : (numTeams - 1 - (index % numTeams));
            newTeams[teamIdx].push(player);
        });

        // 🚨 Hidden Exclusion Rule: ex1 and ex2 never together
        const ex1 = '13868';
        const ex2 = '17890';
        const teamWithEx1 = newTeams.findIndex(t => t.some(p => String(p.id) === ex1));
        const teamWithEx2 = newTeams.findIndex(t => t.some(p => String(p.id) === ex2));

        if (teamWithEx1 !== -1 && teamWithEx1 === teamWithEx2) {
            const targetTeamIdx = (teamWithEx1 + 1) % newTeams.length;
            const p2 = newTeams[teamWithEx1].find(p => String(p.id) === ex2);
            
            if (p2) {
                if (newTeams[targetTeamIdx].length > 0) {
                    const pSwap = newTeams[targetTeamIdx][0];
                    newTeams[teamWithEx1] = newTeams[teamWithEx1].map(p => p.id === p2.id ? pSwap : p);
                    newTeams[targetTeamIdx] = newTeams[targetTeamIdx].map(p => p.id === pSwap.id ? p2 : p);
                } else {
                    newTeams[teamWithEx1] = newTeams[teamWithEx1].filter(p => p.id !== p2.id);
                    newTeams[targetTeamIdx].push(p2);
                }
            }
        }

        setTeams(newTeams, nextResting);
        // Automatically switch to match page
        if (onGenerateComplete) onGenerateComplete();
    };

    const [draggedPlayer, setDraggedPlayer] = useState(null);
    const [dragOverTeam, setDragOverTeam] = useState(null);

    const handleDragStart = (e, player, fromTeamIdx) => {
        setDraggedPlayer({ player, fromTeamIdx });
        e.dataTransfer.effectAllowed = "move";
        // Mobile browsers sometimes need a little help
        e.dataTransfer.setData('text/plain', player.id);
    };

    const handleDragEnd = () => {
        setDraggedPlayer(null);
        setDragOverTeam(null);
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (dragOverTeam !== idx) {
            setDragOverTeam(idx);
        }
    };

    const handleDrop = (e, toTeamIdx) => {
        e.preventDefault();
        setDragOverTeam(null);
        if (!draggedPlayer || draggedPlayer.fromTeamIdx === toTeamIdx) {
            setDraggedPlayer(null);
            return;
        }

        const { player, fromTeamIdx } = draggedPlayer;
        const newTeams = [...teams];
        
        // Enforce 6-player cap: if target team already has 6, block or swap
        if (newTeams[toTeamIdx].length >= 6) {
            alert('隊伍人數已滿 (上限 6 人)！請先將人移出或進行交換。');
            setDraggedPlayer(null);
            return;
        }

        // 🚨 Hidden Exclusion Rule Check
        const ex1 = '13868';
        const ex2 = '17890';
        const isEx1 = String(player.id) === ex1;
        const isEx2 = String(player.id) === ex2;
        if (isEx1 || isEx2) {
            const other = isEx1 ? ex2 : ex1;
            if (newTeams[toTeamIdx].some(p => String(p.id) === other)) {
                alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
                setDraggedPlayer(null);
                return;
            }
        }

        // Remove from source team
        newTeams[fromTeamIdx] = newTeams[fromTeamIdx].filter(p => p.id !== player.id);
        // Add to target team
        newTeams[toTeamIdx] = [...newTeams[toTeamIdx], player];
        
        setTeams(newTeams, restingPlayers);
        setDraggedPlayer(null);
    };

    const cycleTeam = (player, fromTeamIdx) => {
        const newTeams = [...teams];
        const nextTeamIdx = (fromTeamIdx + 1) % teams.length;
        
        if (newTeams[nextTeamIdx].length >= 6) {
            alert('下一隊人數已滿 (上限 6 人)！');
            return;
        }

        // 🚨 Hidden Exclusion Rule Check
        const ex1 = '13868';
        const ex2 = '17890';
        const isEx1 = String(player.id) === ex1;
        const isEx2 = String(player.id) === ex2;
        if (isEx1 || isEx2) {
            const other = isEx1 ? ex2 : ex1;
            if (newTeams[nextTeamIdx].some(p => String(p.id) === other)) {
                alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
                return;
            }
        }

        // Remove from source team
        newTeams[fromTeamIdx] = newTeams[fromTeamIdx].filter(p => p.id !== player.id);
        // Add to target team
        newTeams[nextTeamIdx] = [...newTeams[nextTeamIdx], player];
        
        setTeams(newTeams, restingPlayers);
    };

    const handleRest = (player, fromTeamIdx) => {
        const newTeams = [...teams];
        newTeams[fromTeamIdx] = newTeams[fromTeamIdx].filter(p => p.id !== player.id);
        const newResting = [...restingPlayers, player];
        setTeams(newTeams, newResting);
    };

    const handleJoin = (player, toTeamIdx) => {
        if (teams[toTeamIdx].length >= 6) {
            alert('該隊伍人數已滿 (上限 6 人)！');
            return;
        }
        const newResting = restingPlayers.filter(p => p.id !== player.id);
        const newTeams = [...teams];
        
        // 🚨 Hidden Exclusion Rule Check
        const ex1 = '13868';
        const ex2 = '17890';
        const isEx1 = String(player.id) === ex1;
        const isEx2 = String(player.id) === ex2;
        if (isEx1 || isEx2) {
            const other = isEx1 ? ex2 : ex1;
            if (newTeams[toTeamIdx].some(p => String(p.id) === other)) {
                alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
                return;
            }
        }

        newTeams[toTeamIdx] = [...newTeams[toTeamIdx], player];
        setTeams(newTeams, newResting);
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
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${numTeams === n ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {n} 隊
                        </button>
                    ))}
                </div>
            </header>

            {/* Selection Status */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">今日出場 ({presentPlayerIds?.length || 0})</h3>
                    <button
                        onClick={onResetAttendance}
                        className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 flex items-center gap-1 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20"
                    >
                        <RefreshCw className="w-3 h-3" /> 修改名單
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {players.filter(p => presentPlayerIds?.includes(p.id)).map(p => (
                        <div key={p.id} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                            <PlayerIcon icon={p.icon} name={p.name} role={p.role} isHot={p.isHot} isGoat={p.isGoat} className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{p.name}</span>
                        </div>
                    ))}
                    {(!presentPlayerIds || presentPlayerIds.length === 0) && <p className="text-[10px] text-gray-600 italic">尚未點名...</p>}
                </div>
            </section>

            <div className="flex gap-3">
                <button
                    onClick={generateTeams}
                    disabled={!presentPlayerIds || presentPlayerIds.length < (numTeams * 2)}
                    className="flex-1 py-5 bg-emerald-500 rounded-[32px] font-black italic text-xl tracking-tighter uppercase shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {teams.length > 0 ? '重新隨機分隊' : '自動隨機分隊'}
                </button>
                {teams.length > 0 && (
                    <button
                        onClick={onReset}
                        className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-[28px] flex items-center justify-center text-red-500 shadow-xl active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                    >
                        <Trash2 className="w-7 h-7" />
                    </button>
                )}
            </div>

            {/* Results Display */}
            {teams.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between px-2 pt-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">分隊結果</h3>
                    </div>
                    <AnimatePresence>
                        {teams.map((team, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                key={idx}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragLeave={() => setDragOverTeam(null)}
                                onDrop={(e) => handleDrop(e, idx)}
                                className={`p-6 glass rounded-[32px] border transition-all relative overflow-hidden group ${dragOverTeam === idx ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-emerald-500/5' : 'border-white/5'}`}
                            >
                                <div className={`absolute top-0 left-0 w-2 h-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'
                                    }`} />

                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-black italic tracking-tighter uppercase">隊伍 {idx + 1}</h4>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                                        <Users className="w-3 h-3" /> {team.length} 人
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 min-h-[60px]">
                                    {team.map(p => (
                                        <motion.div 
                                            layout
                                            key={p.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, p, idx)}
                                            onDragEnd={handleDragEnd}
                                            className="group/item relative flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    onClick={() => cycleTeam(p, idx)}
                                                    className="cursor-pointer active:scale-95 p-1 -ml-1 text-gray-600 hover:text-emerald-400 transition-all rounded-md hover:bg-emerald-500/10"
                                                    title="點擊切換隊伍 / 按住拖拉"
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <PlayerIcon icon={p.icon} name={p.name} role={p.role} isHot={p.isHot} isGoat={p.isGoat} className="w-7 h-7" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{p.name}</span>
                                                    {p.form !== 0 && (
                                                        <span className={`text-[8px] font-bold uppercase tracking-widest ${p.form > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {p.form > 0 ? 'HOT FORM 🔥' : 'COLD FORM 🧊'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5 opacity-50 group-hover/item:opacity-100 transition-opacity">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <div key={s} className={`w-1 h-1 rounded-full ${s <= (p.skill || 3) ? 'bg-emerald-400' : 'bg-white/10'}`} />
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => handleRest(p, idx)}
                                                    className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100"
                                                    title="移動到休息區"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {team.length === 0 && (
                                        <div className="h-12 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                                            拖放成員到此隊伍
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Resting Players Section */}
                        {restingPlayers && restingPlayers.length > 0 && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="p-6 glass rounded-[32px] border border-white/5 bg-white/1 overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-black italic tracking-tighter uppercase text-gray-500">休息中 (RESTING)</h4>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                                        <Users className="w-3 h-3" /> {restingPlayers.length} 人
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {restingPlayers.map(p => (
                                        <div key={p.id} className="group/resting relative bg-white/5 border border-white/5 rounded-2xl p-2 pr-4 flex items-center gap-3 hover:bg-white/10 transition-all">
                                            <PlayerIcon icon={p.icon} name={p.name} role={p.role} isHot={p.isHot} isGoat={p.isGoat} className="w-6 h-6" />
                                            <span className="text-xs font-bold whitespace-nowrap">{p.name}</span>
                                            
                                            {/* Action Menu for joining a team */}
                                            <div className="flex gap-1 ml-2 opacity-0 group-hover/resting:opacity-100 transition-all">
                                                {teams.map((_, tIdx) => (
                                                    <button
                                                        key={tIdx}
                                                        onClick={() => handleJoin(p, tIdx)}
                                                        className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-black border transition-all ${
                                                            tIdx === 0 ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500' :
                                                            tIdx === 1 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500' :
                                                            'bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500'
                                                        } hover:text-white`}
                                                        title={`加入隊伍 ${tIdx + 1}`}
                                                    >
                                                        {tIdx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
