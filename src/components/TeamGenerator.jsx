import React, { useState } from 'react';
import { Users, Filter, RefreshCw, Trophy, Play, Trash2, GripVertical, Zap, Shield, Target, Hand, Layers, UserCircle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES, EXCLUSION_PAIRS } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

export default function TeamGenerator({ players, teams, restingPlayers, setTeams, onReset, onGenerateComplete, presentPlayerIds, onResetAttendance }) {
    const [numTeams, setNumTeams] = useState(2);
    const [activeAddTeam, setActiveAddTeam] = useState(null);

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
        // 實施排除規則 (Exclusion Pairs)
        (EXCLUSION_PAIRS || []).forEach(([id1, id2]) => {
            const t1Idx = newTeams.findIndex(t => t.some(p => String(p.id) === id1));
            const t2Idx = newTeams.findIndex(t => t.some(p => String(p.id) === id2));
            
            if (t1Idx !== -1 && t1Idx === t2Idx) {
                const targetIdx = (t1Idx + 1) % newTeams.length;
                const p2 = newTeams[t1Idx].find(p => String(p.id) === id2);
                
                if (newTeams[targetIdx].length > 0) {
                    const pSwap = newTeams[targetIdx][0];
                    newTeams[t1Idx] = newTeams[t1Idx].map(p => p.id === p2.id ? pSwap : p);
                    newTeams[targetIdx] = newTeams[targetIdx].map(p => p.id === pSwap.id ? p2 : p);
                } else {
                    newTeams[t1Idx] = newTeams[t1Idx].filter(p => p.id !== p2.id);
                    newTeams[targetIdx].push(p2);
                }
            }
        });

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

        const isExclusionConflict = (playerId, targetTeam) => {
            return (EXCLUSION_PAIRS || []).some(([id1, id2]) => {
                if (String(playerId) === id1) return (targetTeam || []).some(p => String(p.id) === id2);
                if (String(playerId) === id2) return (targetTeam || []).some(p => String(p.id) === id1);
                return false;
            });
        };

        if (isExclusionConflict(player.id, newTeams[toTeamIdx])) {
            alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
            setDraggedPlayer(null);
            return;
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
        const newResting = restingPlayers.filter(p => p.id !== player.id);
        const newTeams = [...teams];
        
        const isExclusionConflict = (playerId, targetTeam) => {
            return (EXCLUSION_PAIRS || []).some(([id1, id2]) => {
                if (String(playerId) === id1) return (targetTeam || []).some(p => String(p.id) === id2);
                if (String(playerId) === id2) return (targetTeam || []).some(p => String(p.id) === id1);
                return false;
            });
        };

        if (isExclusionConflict(player.id, newTeams[toTeamIdx])) {
            alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
            return;
        }

        newTeams[toTeamIdx] = [...newTeams[toTeamIdx], player];
        setTeams(newTeams, newResting);
    };

    const handleManualAdd = (player, toTeamIdx) => {
        const isInTeam = teams.some(t => t.some(p => p.id === player.id));
        if (isInTeam) {
            alert('該球員已經在其他隊伍中！');
            return;
        }

        const isExclusionConflict = (playerId, targetTeam) => {
            return (EXCLUSION_PAIRS || []).some(([id1, id2]) => {
                if (String(playerId) === id1) return (targetTeam || []).some(p => String(p.id) === id2);
                if (String(playerId) === id2) return (targetTeam || []).some(p => String(p.id) === id1);
                return false;
            });
        };

        const newTeams = [...teams];
        if (isExclusionConflict(player.id, newTeams[toTeamIdx])) {
            alert('🚨 隱藏規則：這兩位球員不能在同一隊！');
            return;
        }

        newTeams[toTeamIdx] = [...newTeams[toTeamIdx], player];
        
        // Update both teams and resting players
        const newResting = restingPlayers.filter(p => p.id !== player.id);
        setTeams(newTeams, newResting);
        setActiveAddTeam(null);
    };

    return (
        <div className="space-y-6 pb-24 text-white">
            <header className="flex items-center justify-between">
                <h2 className="font-display text-3xl tracking-wide" style={{fontFamily:"'Bebas Neue', sans-serif", letterSpacing:'0.05em'}}>
                    TEAM <span style={{color:'#FF4500'}}>PICKER</span>
                </h2>
                <div className="flex gap-1.5 p-1 rounded-xl" style={{background:'#111', border:'1px solid #222'}}>
                    {[2, 3].map(n => (
                        <button
                            key={n}
                            onClick={() => setNumTeams(n)}
                            className="px-4 py-1.5 rounded-lg text-xs font-black transition-all uppercase"
                            style={numTeams === n ? {background:'#FF4500', color:'#fff'} : {color:'#555'}}
                        >
                            {n} TEAMS
                        </button>
                    ))}
                </div>
            </header>

            {/* Selection Status */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest" style={{color:'#666'}}>
                        ATTENDANCE ({presentPlayerIds?.length || 0})
                    </h3>
                    <button
                        onClick={onResetAttendance}
                        className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-full transition-all"
                        style={{background:'#1a1a1a', border:'1px solid #333', color:'#888'}}
                    >
                        <RefreshCw className="w-3 h-3" /> MODIFY
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {players.filter(p => presentPlayerIds?.includes(p.id)).map(p => (
                        <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{background:'#111', border:'1px solid #333'}}>
                            <PlayerIcon icon={p.icon} name={p.name} role={p.role} isHot={p.isHot} className="w-7 h-7" />
                            <span className="text-xs font-black uppercase tracking-tighter">{p.name}</span>
                        </div>
                    ))}
                    {(!presentPlayerIds || presentPlayerIds.length === 0) && <p className="text-[10px] italic" style={{color:'#555'}}>Awaiting check-in...</p>}
                </div>
            </section>

            <div className="flex gap-2.5">
                <button
                    onClick={generateTeams}
                    disabled={!presentPlayerIds || presentPlayerIds.length < (numTeams * 2)}
                    className="flex-1 py-5 rounded-2xl font-display text-2xl tracking-wide uppercase transition-all disabled:opacity-30"
                    style={{
                        background: 'linear-gradient(135deg, #FF4500 0%, #FF6A00 100%)',
                        fontFamily: "'Bebas Neue', sans-serif"
                    }}
                >
                    {teams.length > 0 ? 'RESHUFFLE TEAMS' : 'GENERATE TEAMS'}
                </button>
                {teams.length > 0 && (
                    <button
                        onClick={onReset}
                        className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center transition-all active:scale-95"
                        style={{background:'#1a1a1a', border:'1px solid #333', color:'#888'}}
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Results Display */}
            {teams.length > 0 && (
                <div className="grid grid-cols-1 gap-5">
                    <div className="flex items-center justify-between px-1 pt-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest" style={{color:'#666'}}>MATCHUPS</h3>
                    </div>
                    <AnimatePresence>
                        {(Array.isArray(teams) ? teams : []).map((team, idx) => {
                            const teamColors = ['#1d4ed8', '#FF4500', '#7c3aed']; // Blue, Orange, Purple
                            const color = teamColors[idx % teamColors.length];
                            
                            return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                key={idx}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragLeave={() => setDragOverTeam(null)}
                                onDrop={(e) => handleDrop(e, idx)}
                                className="p-5 rounded-2xl relative overflow-hidden group transition-all"
                                style={{
                                    background: '#111',
                                    border: dragOverTeam === idx ? `1px solid ${color}` : '1px solid #222'
                                }}
                            >
                                {/* Diagonal Accent Slash */}
                                <div className="absolute top-0 right-0 w-32 h-full opacity-10 transform translate-x-10 -skew-x-12"
                                     style={{background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`}} />

                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-6 rounded-full" style={{background: color}} />
                                        <h4 className="font-display text-2xl tracking-wide" style={{fontFamily:"'Bebas Neue', sans-serif"}}>TEAM {idx + 1}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-20">
                                        <button 
                                            onClick={() => setActiveAddTeam(idx)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
                                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: color}}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                                             style={{background:'#1a1a1a', color:'#666'}}>
                                            <Users className="w-3 h-3" /> {team.length}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 min-h-[60px] relative z-10">
                                    {(team || []).map(p => (
                                        <motion.div 
                                            layout key={p.id} draggable
                                            onDragStart={(e) => handleDragStart(e, p, idx)}
                                            onDragEnd={handleDragEnd}
                                            className={`group/item relative flex items-center justify-between p-3 rounded-xl transition-all select-none ${(p.bestStreak || 0) >= 3 ? 'on-fire-glow' : ''}`}
                                            style={{background:'#1a1a1a', border:'1px solid #222'}}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    onClick={() => cycleTeam(p, idx)}
                                                    className="cursor-pointer active:scale-95 p-1 -ml-1 rounded-lg transition-all"
                                                    style={{color:'#555'}}
                                                    title="Tap to cycle / Drag to move"
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <PlayerIcon icon={p.icon} name={p.name} role={p.role} isHot={p.isHot} className="w-10 h-10" />
                                                <div className="flex flex-col">
                                                    <span className="font-black text-base tracking-tight uppercase">{p.name}</span>
                                                    {p.form !== 0 && (
                                                        <span className="text-[7px] font-black uppercase tracking-widest mt-0.5"
                                                              style={{color: p.form > 0 ? '#FF4500' : '#3b82f6'}}>
                                                            {p.form > 0 ? 'ON FIRE 🔥' : 'ICE COLD 🧊'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-[3px] opacity-40 group-hover/item:opacity-100 transition-opacity">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <div key={s} className="w-1.5 h-1.5 rounded-xs"
                                                             style={{background: s <= (p.skill || 3) ? '#fff' : '#222'}} />
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => handleRest(p, idx)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                                                    style={{background:'rgba(255,51,51,0.05)', color:'#ff3333', border:'1px solid rgba(255,51,51,0.2)'}}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {team.length === 0 && (
                                        <div className="h-12 flex items-center justify-center rounded-xl text-[8px] font-black uppercase tracking-widest"
                                             style={{border:'1px dashed #333', color:'#555'}}>
                                            DRAG PLAYERS HERE
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            )
                        })}

                            {/* Manual Add Modal Overlay */}
                            <AnimatePresence>
                                {activeAddTeam !== null && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                                        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                                    >
                                        <motion.div 
                                            initial={{ scale: 0.9, y: 20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="w-full max-w-md rounded-3xl overflow-hidden"
                                            style={{ background: '#111', border: '1px solid #222', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                        >
                                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                                <h4 className="font-display text-2xl tracking-wide uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                                                    ADD TO <span style={{color: ['#1d4ed8', '#FF4500', '#7c3aed'][activeAddTeam % 3]}}>TEAM {activeAddTeam + 1}</span>
                                                </h4>
                                                <button onClick={() => setActiveAddTeam(null)} className="p-2 rounded-xl bg-white/5 text-gray-400">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
                                                {/* Resting Section */}
                                                <div>
                                                    <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 px-2">Resting / Bench</p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {(restingPlayers || []).map(p => (
                                                            <button 
                                                                key={p.id}
                                                                onClick={() => handleManualAdd(p, activeAddTeam)}
                                                                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left"
                                                            >
                                                                <PlayerIcon icon={p.icon} name={p.name} role={p.role} className="w-10 h-10" />
                                                                <span className="font-black uppercase">{p.name}</span>
                                                                <div className="ml-auto text-[8px] font-black px-2 py-1 rounded-md bg-white/5 text-gray-500">BENCH</div>
                                                            </button>
                                                        ))}
                                                        {(!restingPlayers || restingPlayers.length === 0) && (
                                                            <p className="text-[10px] italic text-gray-600 px-2">No players on bench</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Others Section */}
                                                <div>
                                                    <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 px-2">Other Roster Members</p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {players.filter(p => 
                                                            !presentPlayerIds?.includes(p.id) && 
                                                            !teams.some(t => t.some(tp => tp.id === p.id)) &&
                                                            !restingPlayers?.some(rp => rp.id === p.id)
                                                        ).map(p => (
                                                            <button 
                                                                key={p.id}
                                                                onClick={() => handleManualAdd(p, activeAddTeam)}
                                                                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left opacity-60"
                                                            >
                                                                <PlayerIcon icon={p.icon} name={p.name} role={p.role} className="w-10 h-10" />
                                                                <span className="font-black uppercase">{p.name}</span>
                                                                <div className="ml-auto text-[8px] font-black px-2 py-1 rounded-md bg-white/5 text-gray-500 text-center leading-none">NOT<br/>PRESENT</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        {/* Resting Players */}
                        {restingPlayers && restingPlayers.length > 0 && (
                            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-2xl" style={{background:'#111', border:'1px solid #222'}}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-display text-xl tracking-wide" style={{fontFamily:"'Bebas Neue', sans-serif", color:'#666'}}>RESTING</h4>
                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                                         style={{background:'#1a1a1a', color:'#666'}}>
                                        <Users className="w-3 h-3" /> {restingPlayers.length}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {restingPlayers.map(p => (
                                        <div key={p.id} className="group/resting relative p-2 pr-4 flex items-center gap-2.5 rounded-xl transition-all"
                                             style={{background:'#1a1a1a', border:'1px solid #222'}}>
                                            <PlayerIcon icon={p.icon} name={p.name} role={p.role} className="w-8 h-8" />
                                            <span className="text-sm font-black uppercase">{p.name}</span>
                                            
                                            <div className="flex gap-1 ml-2 opacity-0 group-hover/resting:opacity-100 transition-all">
                                                {teams.map((_, tIdx) => (
                                                    <button key={tIdx} onClick={() => handleJoin(p, tIdx)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-black transition-all"
                                                        style={{
                                                            background: tIdx===0 ? 'rgba(29,78,216,0.1)' : tIdx===1 ? 'rgba(255,69,0,0.1)' : 'rgba(124,58,237,0.1)',
                                                            color: tIdx===0 ? '#3b82f6' : tIdx===1 ? '#FF4500' : '#a78bfa',
                                                            border: `1px solid ${tIdx===0 ? 'rgba(59,130,246,0.3)' : tIdx===1 ? 'rgba(255,69,0,0.3)' : 'rgba(167,139,250,0.3)'}`
                                                        }}>
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
