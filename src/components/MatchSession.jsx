import React, { useState, useEffect } from 'react';
import { DollarSign, Coffee, Check, X, AlertCircle, RefreshCw, Trophy, Users, ArrowRight, Minus, Plus, Zap, Shield, Target, Hand, Layers, UserCircle, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

export default function MatchSession({
    activeTeams,
    restingPlayers = [],
    onComplete,
    onResetTeams,
    gameStep,
    setGameStep,
    g1WinnerIdx,
    setG1WinnerIdx,
    onManualEntry
}) {
    const [stake, setStake] = useState(10);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    useEffect(() => {
        if (activeTeams.length !== 3) {
            setGameStep(0);
            setG1WinnerIdx(null);
        }
        setWinnerIndex(null);
        setScore1(0);
        setScore2(0);
    }, [activeTeams.length, gameStep]);

    if (!activeTeams || activeTeams.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center rounded-[40px] border relative overflow-hidden" 
                style={{background:'#111', borderColor:'#1a1a1a'}}>
                <div className="absolute top-0 right-0 w-32 h-full bg-[#FF450005] -skew-x-12 transform translate-x-16" />
                <div className="w-20 h-20 bg-[#050505] rounded-full flex items-center justify-center mb-6 border border-[#1a1a1a]">
                    <Users className="w-10 h-10 text-[#222]" />
                </div>
                <div className="space-y-2 relative z-10">
                    <p className="font-display text-4xl leading-none uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>NOT READY</p>
                    <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em] max-w-[200px] mx-auto">BUILD YOUR TEAMS IN THE GENERATOR TO BEGIN BROADCAST.</p>
                </div>
                <button
                    onClick={onResetTeams}
                    className="mt-8 px-10 py-4 font-display text-xl uppercase tracking-wide rounded-2xl transition-all active:scale-95"
                    style={{background: '#1a1a1a', border: '1px solid #222', color: '#fff'}}
                >
                    GO TO GENERATOR
                </button>
            </div>
        );
    }

    const isThreeTeam = activeTeams.length === 3;
    let currentMatchSubindices = [0, 1];
    if (isThreeTeam) {
        if (gameStep === 1) currentMatchSubindices = [1, 2]; // B vs C
        else if (gameStep === 2) currentMatchSubindices = [0, 2]; // A vs C
        else currentMatchSubindices = [0, 1]; // A vs B
    }

    const [isRecording, setIsRecording] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleFinish = async () => {
        if (winnerIndex === null) return;
        setIsRecording(true);
        const playingTeams = currentMatchSubindices.map(idx => activeTeams[idx]);
        const winners = activeTeams[winnerIndex];
        const losers = playingTeams.filter(t => t && t !== winners).filter(Boolean).flat().filter(Boolean);
        const totalLost = losers.length * stake;
        const winPerPerson = winners.length > 0 ? totalLost / winners.length : 0;
        const absoluteWinnerIdx = winnerIndex;
        const relativeWinnerIdx = playingTeams.findIndex(t => t === winners);
        const teamsObj = {};
        playingTeams.forEach((t, idx) => { teamsObj[idx] = t; });

        onComplete({
            id: Date.now().toString(), date: new Date().toISOString(), stake, scores: [score1, score2],
            winnerTeam: relativeWinnerIdx, absoluteWinnerIdx, teams: teamsObj, payout: winPerPerson,
            roundName: isThreeTeam ? `Round ${gameStep + 1}` : 'Friendly', isRotationMatch: isThreeTeam, gameStep: isThreeTeam ? gameStep : null
        });

        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        if (!isThreeTeam || gameStep < 2) await new Promise(resolve => setTimeout(resolve, 800));

        if (isThreeTeam) {
            if (gameStep === 0) { setG1WinnerIdx(winnerIndex); setGameStep(1); }
            else if (gameStep === 1) { setGameStep(2); }
            else { setGameStep(0); setG1WinnerIdx(null); }
        }
        setWinnerIndex(null);
        setIsRecording(false);
    };

    return (
        <div className="space-y-8 text-white pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="font-display text-4xl tracking-wide uppercase" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                        MATCH <span style={{color: '#FF4500'}}>ON AIR</span>
                    </h2>
                    {isThreeTeam && (
                        <div className="flex gap-2.5 mt-2">
                            {[0, 1, 2].map(s => (
                                <div key={s} className="h-1.5 w-10 rounded-full transition-all" style={{background: s <= gameStep ? '#FF4500' : '#111', border: s <= gameStep ? 'none' : '1px solid #222'}} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={onManualEntry} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-[#222] text-[#444] hover:text-[#FF4500] transition-all">
                        <Plus className="w-5 h-5" />
                    </button>
                    <button onClick={onResetTeams} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-[#222] text-[#444] hover:text-red-500 transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {isThreeTeam && (
                <div className="p-8 rounded-[40px] text-center relative overflow-hidden" style={{background: '#111', border: '1px solid #1a1a1a'}}>
                    <div className="absolute top-0 right-0 w-24 h-full bg-[#FF450005] -skew-x-12 transform translate-x-10" />
                    <p className="text-[9px] font-black text-[#FF4500] uppercase tracking-[0.3em] mb-2">CYCLIC ROTATION - ROUND {gameStep + 1}</p>
                    <h4 className="font-display text-5xl tracking-wide uppercase leading-none" style={{fontFamily:"'Bebas Neue', sans-serif"}}>
                        {gameStep === 0 ? 'T1 VS T2' : gameStep === 1 ? 'LOSER VS T3' : 'T3 VS CHAMP'}
                    </h4>
                    <div className="mt-4 inline-block px-3 py-1 rounded bg-[#050505] font-black text-[8px] uppercase tracking-widest text-[#222] border border-[#1a1a1a]">
                        OFF-COURT: TEAM {activeTeams.findIndex((_, i) => !currentMatchSubindices.includes(i)) + 1}
                    </div>
                </div>
            )}

            {!isThreeTeam && restingPlayers && restingPlayers.length > 0 && (
                <div className="p-6 rounded-[32px] text-center border" style={{background: '#111', borderColor: '#1a1a1a'}}>
                    <p className="text-[9px] font-black text-[#444] uppercase tracking-widest mb-4">RESTING ATHLETES</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {restingPlayers.map(p => (
                            <div key={p.id} className="flex items-center gap-2 bg-[#050505] px-3 py-2 rounded-xl border border-[#1a1a1a] opacity-40">
                                <PlayerIcon icon={p.icon} name={p.name} className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center gap-3">
                {[10, 20, 30].map(val => (
                    <button key={val} onClick={() => setStake(val)} 
                        className="px-8 py-4 rounded-2xl font-display text-2xl transition-all"
                        style={stake === val ? {background: '#FF4500', color: '#fff'} : {background: '#111', color: '#333', border: '1px solid #222'}}>
                        ${val}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <p className="text-[9px] font-black text-[#333] uppercase tracking-[0.3em] text-center italic">OFFICIAL VERDICT: SELECT WINNING UNIT</p>
                <div className="grid grid-cols-1 gap-4">
                    {currentMatchSubindices.map((idx) => {
                        const team = activeTeams[idx];
                        const isSelected = winnerIndex === idx;
                        return (
                            <button key={idx} onClick={() => setWinnerIndex(idx)}
                                className="p-8 rounded-[40px] transition-all border text-left flex items-center justify-between group relative overflow-hidden"
                                style={{background: isSelected ? '#111' : '#050505', borderColor: isSelected ? '#FF4500' : '#1a1a1a'}}>
                                
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF45000d] rounded-full blur-3xl -mr-16 -mt-16" />
                                )}

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1 h-4" style={{background: idx === 0 ? '#3b82f6' : '#FF4500'}} />
                                        <p className="font-display text-2xl tracking-wide uppercase leading-none">TEAM {idx + 1}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(team || []).map(p => (
                                            <div key={p.id} className="flex items-center gap-2 bg-[#0a0a0a] px-3 py-2 rounded-xl border border-[#1a1a1a]">
                                                <PlayerIcon icon={p.icon} name={p.name} className="w-6 h-6" />
                                                <span className="text-[10px] font-black uppercase">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {isSelected && (
                                    <div className="w-16 h-16 rounded-[24px] bg-[#FF4500] flex items-center justify-center text-white shadow-2xl shadow-[#FF450044] relative z-10 ml-6">
                                        <Check className="w-10 h-10" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button onClick={handleFinish} disabled={winnerIndex === null || isRecording}
                className="w-full py-8 font-display text-4xl tracking-widest uppercase rounded-[50px] shadow-2xl transition-all active:scale-95 disabled:opacity-10 relative overflow-hidden group"
                style={{background: '#FF4500', color: '#fff', fontFamily: "'Bebas Neue', sans-serif"}}>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">{isRecording ? 'PROCESSING...' : 'CONFIRM RESULTS'}</span>
            </button>

            <div className="p-8 rounded-[40px] text-[9px] font-black text-[#222] uppercase tracking-[0.4em] text-center border border-[#111] leading-relaxed">
                WAN CHAI VBC OFFICIAL SYSTEM <br/>
                <span style={{color: '#FF45001a'}}>DATA INTEGRITY SECURED</span>
            </div>
        </div>
    );
}
