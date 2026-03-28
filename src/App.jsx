import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, History, DollarSign, Plus, LayoutDashboard, Trash2, ShieldCheck, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PlayerManager from './components/PlayerManager';
import TeamGenerator from './components/TeamGenerator';
import MatchSession from './components/MatchSession';
import ManualMatchEntry from './components/ManualMatchEntry';
import StatsHub from './components/StatsHub';
import DailyReport from './components/DailyReport';
import PlayerProfile from './components/PlayerProfile';
import { Dock } from './components/ui/dock-two';
import { db, doc, onSnapshot, setDoc } from './lib/firebase';
import { DEFAULT_SKILLS } from './lib/constants';

// â”€â”€â”€ PAGE TRANSITION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.4,0,0.2,1] } },
  exit:    { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

function App() {
  useEffect(() => { console.log('App Mounted'); }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

              useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [activeTab]);
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('vbc-players') || localStorage.getItem('vbc_players');
      const parsed = saved ? JSON.parse(saved) : null;
      return (Array.isArray(parsed) ? parsed.filter(Boolean) : null) || [
        { id: '1', name: 'é˜¿å¼·', icon: 'ðŸ”¥', skill: 5, skills: { ...DEFAULT_SKILLS, atk: 5, pwr: 4 } },
        { id: '2', name: 'å°æ˜Ž', icon: 'ðŸ¦', skill: 2, skills: { ...DEFAULT_SKILLS, def: 3 } },
        { id: '3', name: 'å¤§å¸«å…„', icon: 'âš¡ï¸', skill: 4, skills: { ...DEFAULT_SKILLS, atk: 4, srv: 4 } },
        { id: '4', name: 'æ³¢å­', icon: 'ðŸ§¤', skill: 3, skills: { ...DEFAULT_SKILLS, set: 4 } },
        { id: '5', name: 'é˜¿é£›', icon: 'ðŸ¦…', skill: 4, skills: { ...DEFAULT_SKILLS, blk: 4 } },
      ];
    } catch (e) { return []; }
  });

  const [matches, setMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('vbc-matches') || localStorage.getItem('vbc_matches');
      const parsed = saved ? JSON.parse(saved) : null;
      return (Array.isArray(parsed) ? parsed.filter(Boolean) : null) || [];
    } catch (e) { return []; }
  });

  const [teams, setTeams] = useState([]);
  const [restingPlayers, setRestingPlayers] = useState([]);
  const [gameStep, setGameStep] = useState(0);
  const [g1WinnerIdx, setG1WinnerIdx] = useState(null);
  const [presentPlayerIds, setPresentPlayerIds] = useState(() => {
    try { const s = localStorage.getItem('vbc-present'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(() => {
    try { return localStorage.getItem('vbc-attendance-confirmed') === 'true'; } catch { return false; }
  });
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState(null);

  // â”€â”€â”€ FIREBASE SYNC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    setSyncStatus('syncing');
    const unsubPlayers = onSnapshot(doc(db, 'vbc', 'players'), (snap) => {
      if (snap.exists()) { const d = snap.data().list; if (Array.isArray(d)) { setPlayers(d.filter(Boolean)); setSyncStatus('success'); } }
      else setSyncStatus('success');
    }, (err) => { setSyncStatus('error'); setSyncError(err.message); });

    const unsubMatches = onSnapshot(doc(db, 'vbc', 'matches'), (snap) => {
      if (snap.exists()) { const d = snap.data().list; if (Array.isArray(d)) setMatches(d.filter(Boolean)); }
    }, () => {});

    const unsubAttendance = onSnapshot(doc(db, 'vbc', 'attendance'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.presentPlayerIds) setPresentPlayerIds(d.presentPlayerIds);
        if (d.isAttendanceConfirmed !== undefined) setIsAttendanceConfirmed(d.isAttendanceConfirmed);
      }
    }, () => {});

    const unsubGameState = onSnapshot(doc(db, 'vbc', 'gamestate'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.teamsObj) {
          setTeams(Object.keys(d.teamsObj).sort().map(k => d.teamsObj[k]));
        } else if (d.teams && Array.isArray(d.teams)) setTeams(d.teams);
        if (d.resting) setRestingPlayers(d.resting);
        if (d.gameStep !== undefined) setGameStep(d.gameStep);
        if (d.g1WinnerIdx !== undefined) setG1WinnerIdx(d.g1WinnerIdx);
      }
    }, () => {});

    return () => { unsubPlayers(); unsubMatches(); unsubAttendance(); unsubGameState(); };
  }, []);

  useEffect(() => {
    localStorage.setItem('vbc-players', JSON.stringify(players));
    localStorage.setItem('vbc-matches', JSON.stringify(matches));
    localStorage.setItem('vbc-present', JSON.stringify(presentPlayerIds));
    localStorage.setItem('vbc-attendance-confirmed', isAttendanceConfirmed.toString());
  }, [players, matches, presentPlayerIds, isAttendanceConfirmed]);

  useEffect(() => {
    if (!Array.isArray(players) || !Array.isArray(matches)) return;
    const needsSkills = players.some(p => p && !p.skills);
    const hasMatchesWithoutId = matches.some(m => m && (!m.id || !m.date));
    if (needsSkills) setPlayers(prev => (prev || []).map(p => !p ? p : (p.skills ? p : { ...p, skills: { ...DEFAULT_SKILLS } })));
    if (hasMatchesWithoutId) setMatches(prev => (prev || []).map(m => {
      if (!m) return m;
      let u = { ...m };
      if (!m.id) u.id = Date.now() + Math.random().toString(36).substr(2, 9);
      if (!m.date) u.date = new Date().toISOString();
      return u;
    }));
  }, [players, matches]);

  const syncToFirebase = async (col, data) => {
    setSyncStatus('syncing');
    try {
      await setDoc(doc(db, 'vbc', col), data);
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error'); setSyncError(error.message);
      if (error.code === 'permission-denied') alert('Firebase æ¬Šé™ä¸è¶³ï¼è«‹ç¢ºä¿æ•¸æ“šåº«è¦å‰‡å·²è¨­ç½®ç‚ºå…è¨±è®€å¯«ã€‚');
    }
  };

  const updatePlayersFirebase    = (list) => syncToFirebase('players', { list });
  const updateMatchesFirebase    = (list) => syncToFirebase('matches', { list });
  const updateAttendanceFirebase = (ids, confirmed) => syncToFirebase('attendance', { presentPlayerIds: ids, isAttendanceConfirmed: confirmed });
  const updateGameStateFirebase  = (newTeams, newStep, newWinner, newResting) => {
    const teamsObj = {};
    if (Array.isArray(newTeams)) newTeams.forEach((t, i) => { teamsObj[`team${i}`] = t; });
    syncToFirebase('gamestate', {
      teamsObj,
      resting: newResting !== undefined ? newResting : restingPlayers,
      gameStep: newStep !== undefined ? newStep : gameStep,
      g1WinnerIdx: newWinner !== undefined ? newWinner : g1WinnerIdx,
    });
  };

  const addPlayer    = (p)         => { const l = [...players, { ...p, skills: { ...DEFAULT_SKILLS } }]; setPlayers(l); updatePlayersFirebase(l); };
  const deletePlayer = (id)        => { const l = players.filter(p => p.id !== id); setPlayers(l); updatePlayersFirebase(l); };
  const updatePlayer = (id, upd)   => { const l = players.map(p => p.id === id ? { ...p, ...upd } : p); setPlayers(l); updatePlayersFirebase(l); };
  const deleteMatch  = (id)        => {
    if (window.confirm('ç¢ºå®šè¦åˆªé™¤é€™å ´æ¯”è³½ç´€éŒ„å—Žï¼Ÿ')) {
      const l = matches.filter(m => m.id !== id); setMatches(l); updateMatchesFirebase(l);
    }
  };

  const playersWithStats = useMemo(() => {
    const processed = (players || []).map(p => {
      if (!p) return null;
      let wins = 0, losses = 0, drinks = 0, currentStreak = 0, bestStreak = 0, currentLoseStreak = 0, hasPhoenix = false;
      const dailyWins = {};
      const sortedMatches = [...(matches || [])].filter(m => m && m.date).sort((a, b) => new Date(a.date) - new Date(b.date));
      sortedMatches.forEach(m => {
        if (!m || !m.teams) return;
        const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams).sort().map(k => m.teams[k]);
        const winnerIdx = m.absoluteWinnerIdx !== undefined ? m.absoluteWinnerIdx : m.winnerTeam;
        const winnerTeam = matchTeams[winnerIdx];
        if (!winnerTeam) return;
        const wasInWinner = winnerTeam.some(wp => wp && wp.id === p.id);
        const wasInLoser  = matchTeams.flat().some(lp => lp && lp.id === p.id) && !wasInWinner;
        if (wasInWinner) {
          if (currentLoseStreak >= 3) hasPhoenix = true;
          wins++; drinks++; currentStreak++; currentLoseStreak = 0;
          if (currentStreak > bestStreak) bestStreak = currentStreak;
          const day = m.date?.split('T')[0];
          if (day) dailyWins[day] = (dailyWins[day] || 0) + 1;
        } else if (wasInLoser) { losses++; drinks--; currentStreak = 0; currentLoseStreak++; }
      });
      const hasDailyFive    = Object.values(dailyWins).some(c => c >= 5);
      const totalMatches    = wins + losses;
      const earnedPoints    = Math.floor(totalMatches / 10);
      const spentPoints     = Object.values(p.skills || DEFAULT_SKILLS).reduce((a, b) => a + b, 0) - Object.keys(DEFAULT_SKILLS).length;
      const availablePoints = Math.max(0, earnedPoints - spentPoints);
      const roleBonus = { atk: 0, def: 0, srv: 0, set: 0, blk: 0, pwr: 0 };
      if (p.role === 'cannon') roleBonus.atk = 1;
      else if (p.role === 'wall') roleBonus.blk = 1;
      else if (p.role === 'maestro') roleBonus.set = 1;
      else if (p.role === 'guardian') roleBonus.def = 1;
      else if (p.role === 'server') roleBonus.srv = 1;
      const finalSkills = {};
      Object.keys(DEFAULT_SKILLS).forEach(k => { finalSkills[k] = (p.skills?.[k] || 1) + (roleBonus[k] || 0); });
      const effectiveSkill = Object.values(finalSkills).reduce((a, b) => a + b, 0) / Object.keys(DEFAULT_SKILLS).length;
      return { ...p, wins, losses, drinks, totalMatches, availablePoints, effectiveSkill, bestStreak, hasPhoenix, hasDailyFive, isHot: currentStreak >= 3 };
    }).filter(Boolean);
    const maxWins = Math.max(0, ...processed.map(p => p.wins));
    return processed.map(p => ({ ...p, isGoat: maxWins > 0 && p.wins === maxWins }));
  }, [players, matches]);

  const handleMatchComplete = (matchData) => {
    const m = { ...matchData, id: Date.now() + Math.random().toString(36).substr(2, 9), date: matchData.date || new Date().toISOString() };
    const newList = [m, ...matches];
    setMatches(newList);
    updateMatchesFirebase(newList);
    if (matchData.isRotationMatch && matchData.gameStep === 2) setActiveTab('dashboard');
  };

  const resetTeams = () => {
    if (window.confirm('ç¢ºå®šè¦è§£æ•£ç›®å‰çš„éšŠä¼ä¸¦é‡æ–°æŠ½ç±¤å—Žï¼Ÿ')) {
      setTeams([]); setGameStep(0); setG1WinnerIdx(null);
      updateGameStateFirebase([], 0, null); setActiveTab('teaming');
    }
  };

  const togglePresence = (id) => {
    const newIds = presentPlayerIds.includes(id) ? presentPlayerIds.filter(pid => pid !== id) : [...presentPlayerIds, id];
    setPresentPlayerIds(newIds); updateAttendanceFirebase(newIds, isAttendanceConfirmed);
  };
  const resetAttendance   = ()  => { setPresentPlayerIds([]); setIsAttendanceConfirmed(false); updateAttendanceFirebase([], false); };
  const confirmAttendance = ()  => { if (presentPlayerIds.length >= 2) { setIsAttendanceConfirmed(true); updateAttendanceFirebase(presentPlayerIds, true); } };
  const resetAllStats     = ()  => { if (window.confirm('ðŸš¨ è­¦å‘Šï¼šé€™å°‡æœƒåˆªé™¤æ‰€æœ‰å…§å®¹ï¼ˆåŒ…æ‹¬éšŠå“¡å’Œç´€éŒ„ï¼‰ï¼Œé‡æ­¸é›¶é»žã€‚ç¢ºå®šå—Žï¼Ÿ')) { localStorage.clear(); window.location.reload(); } };

  const exportData = () => {
    const data = { players, matches, presentPlayerIds, version: '1.0', timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `vbc_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.players && Array.isArray(data.players)) {
          if (window.confirm('ç¢ºå®šè¦åŒ¯å…¥æ•¸æ“šå—Žï¼Ÿé€™å°‡æœƒè¦†è“‹ç›®å‰çš„é€²åº¦ã€‚')) {
            setPlayers(data.players);
            if (data.matches) setMatches(data.matches);
            if (data.presentPlayerIds) setPresentPlayerIds(data.presentPlayerIds);
            alert('æ•¸æ“šåŒ¯å…¥æˆåŠŸï¼');
          }
        } else alert('ç„¡æ•ˆçš„æ•¸æ“šæ ¼å¼');
      } catch (err) { alert('åŒ¯å…¥å¤±æ•—ï¼š' + err.message); }
    };
    reader.readAsText(file);
  };

  // â”€â”€â”€ SYNC BADGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SyncBadge = () => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
      syncStatus === 'syncing' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
      syncStatus === 'error'   ? 'border-red-500/30 text-red-400 bg-red-500/5' :
      'border-[rgba(255,69,0,0.3)] text-[#FF4500] bg-[rgba(255,69,0,0.05)]'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        syncStatus === 'syncing' ? 'bg-blue-400 animate-pulse' :
        syncStatus === 'error'   ? 'bg-red-400' : 'bg-[#FF4500] live-dot'
      }`} />
      {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'error' ? 'Error' : 'Live'}
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-32 overflow-x-hidden grid-bg">

      {/* â”€â”€â”€ AMBIENT GLOWS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-24 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* â”€â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="sticky top-0 z-[60]" style={{ background: 'rgba(7,7,9,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #FF4500 0%, #FF6B00 30%, rgba(255,107,0,0.2) 70%, transparent 100%)' }} />

        <div className="flex items-center justify-between max-w-lg mx-auto px-5 py-3">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FF4500, #FF6B00)', boxShadow: '0 4px 20px rgba(255,69,0,0.4)' }}>
              <Trophy className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
            </div>
            <div>
              <h1 className="font-display text-[26px] leading-none tracking-widest">
                WAN CHAI <span style={{ color: '#FF4500' }}>VBC</span>
              </h1>
              <p className="section-label" style={{ letterSpacing: '0.25em' }}>Volleyball Club Â· ç£ä»”æŽ’çƒ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncBadge />
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${isAdmin ? 'text-white' : 'text-[#555]'}`}
              style={isAdmin
                ? { background: 'linear-gradient(135deg,#FF4500,#FF6B00)', boxShadow: '0 4px 16px rgba(255,69,0,0.3)' }
                : { background: '#111', border: '1px solid #222' }}>
              <ShieldCheck className="w-3 h-3" />
              {isAdmin ? 'ADMIN' : 'OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* â”€â”€â”€ SYNC ERROR BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {syncStatus === 'error' && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto mx-4 mt-4 p-4 rounded-2xl text-[10px] font-bold text-red-200 uppercase tracking-wider text-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          âš ï¸ Firebase Sync Error: {syncError || 'Check Database Rules'}
        </motion.div>
      )}

      {/* â”€â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="max-w-lg p-4 mx-auto relative z-10">
        <AnimatePresence mode="wait">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div className="flex justify-end mb-5">
                <button
                  onClick={() => { setIsManualEntry(true); setActiveTab('play'); }}
                  className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  <Plus className="w-3.5 h-3.5" />è£œå…¥æˆ°ç¸¾
                </button>
              </div>
              <StatsHub players={playersWithStats || []} matches={matches || []} onSelectPlayer={setSelectedProfile} />
            </motion.div>
          )}

          {/* CHECK-IN / TEAM GENERATOR */}
          {activeTab === 'teaming' && (
            <motion.div key="teaming" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {!isAttendanceConfirmed ? (
                <section className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-4xl tracking-widest">
                      ä»Šæ—¥ <span style={{ color: '#10B981' }}>CHECK-IN</span>
                    </h2>
                    <p className="section-label">è«‹é¸æ“‡ä»Šæ—¥åˆ°å ´æˆå“¡</p>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[...playersWithStats].sort((a, b) => a.name.localeCompare(b.name, 'zh-HK')).map(p => (
                      <motion.button key={p.id} whileTap={{ scale: 0.93 }}
                        onClick={() => togglePresence(p.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${presentPlayerIds.includes(p.id) ? 'checkin-active' : 'checkin-inactive'}`}>
                        <div className="w-10 h-10 flex items-center justify-center">
                          {p.icon?.startsWith('data:image')
                            ? <img src={p.icon} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                            : <span className="text-2xl">{p.icon || 'ðŸ'}</span>}
                        </div>
                        <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight">{p.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={presentPlayerIds.length < 2}
                    onClick={confirmAttendance}
                    className="w-full py-5 rounded-[28px] font-black text-xl tracking-tight uppercase disabled:opacity-30 transition-all"
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
                    ç¢ºèªåå–® ({presentPlayerIds.length})
                  </motion.button>
                </section>
              ) : (
                <TeamGenerator
                  players={playersWithStats || []}
                  teams={teams || []}
                  restingPlayers={restingPlayers || []}
                  setTeams={(newTeams, newResting = restingPlayers) => {
                    setTeams(newTeams); setRestingPlayers(newResting);
                    updateGameStateFirebase(newTeams, gameStep, g1WinnerIdx, newResting);
                  }}
                  onReset={resetTeams}
                  onGenerateComplete={() => setActiveTab('play')}
                  presentPlayerIds={presentPlayerIds}
                  onResetAttendance={resetAttendance}
                />
              )}
            </motion.div>
          )}

          {/* PLAY / MATCH */}
          {activeTab === 'play' && (
            <motion.div key="play" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {isManualEntry ? (
                <ManualMatchEntry
                  players={players}
                  onComplete={(matchData) => { handleMatchComplete(matchData); setIsManualEntry(false); setActiveTab('dashboard'); }}
                  onCancel={() => setIsManualEntry(false)}
                />
              ) : teams && teams.length > 0 ? (
                <MatchSession
                  activeTeams={teams || []}
                  restingPlayers={restingPlayers || []}
                  onComplete={handleMatchComplete}
                  onResetTeams={resetTeams}
                  gameStep={gameStep}
                  setGameStep={(s) => { setGameStep(s); updateGameStateFirebase(teams, s); }}
                  g1WinnerIdx={g1WinnerIdx}
                  setG1WinnerIdx={(w) => { setG1WinnerIdx(w); updateGameStateFirebase(teams, gameStep, w); }}
                  onManualEntry={() => setIsManualEntry(true)}
                />
              ) : (
                <motion.div className="text-center py-24 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-[40px] opacity-20 animate-pulse"
                      style={{ background: 'radial-gradient(circle, #FF4500, transparent)' }} />
                    <div className="w-24 h-24 rounded-[40px] flex items-center justify-center border relative"
                      style={{ background: '#111', borderColor: '#222' }}>
                      <Trophy className="w-10 h-10" style={{ color: '#333' }} />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-2xl tracking-widest text-gray-600">å°šæœªç”ŸæˆéšŠä¼</p>
                    <p className="section-label mt-1">è«‹å…ˆå®Œæˆé»žåä¸¦åˆ†é…éšŠä¼</p>
                  </div>
                  <div className="flex flex-col gap-3 max-w[220px] mx-auto">
                    <button onClick={() => setActiveTab('teaming')} className="btn-primary px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest">
                      å‰å¾€çµ„éšŠë§é 
                    </button>
                    <button onClick={() => setIsManualEntry(true)} className="btn-ghost px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest">
                      æ‰‹å‹•è£œå…¥æˆ°ç¸¾
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SETTLEMENT */}
          {activeTab === 'settlement' && (
            <motion.div key="settlement" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <DailyReport players={playersWithStats || []} matches={matches || []} />
            </motion.div>
          )}

          {/* PLAYERS */}
          {activeTab === 'players' && (
            <motion.div key="players" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PlayerManager
                players={playersWithStats || []}
                onAdd={addPlayer} onDelete={deletePlayer} onUpdate={updatePlayer}
                onResetAll={resetAllStats} onExport={exportData} onImport={importData}
                onPushToCloud={() => {
                  if (window.confirm('ç¡ºåºšè¦åƒ³å……å¥¸é“šå‡³ç®¡çš„æ‰€æœŸæ•¸æ“šä¸ªå‚³åb,ç²îéœè¡Œå·æ‰€æ“šå¤¸åˆ¶è¡Œå·çŽ©çš„æ•¸æ“šã€‚')) {
                    updatePlayersFirebase(players); updateMatchesFirebase(matches);
                    updateAttendanceFirebase(presentPlayerIds, isAttendanceConfirmed);
                    updateGameStateFirebase(teams, gameStep, g1WinnerIdx, restingPlayers);
                    alert('æ•¸æ“šå·²ä¸Šå‚³å·²ä¸Šç›´ç´©ï¼');
                  }
                }}
                isAdmin={isAdmin}
              />
            </motion.div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 pb-20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-display text-4xl tracking-widest">æ­·é² <span style={{ color: '#FF4500' }}>å°ä»—</span></h2>
                  <p className="section-label mt-0.5">{matches.length} å ´æ¯”è³½ç´€éŒ„</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl" style={{ color: '#FF4500' }}>
                    {matches.filter(m => m).length}
                  </div>
                  <p className="section-label">TOTAL</p>
                </div>
              </div>

              <div className="accent-divider mb-6" />

              <div className="space-y-3">
                {(matches || []).map((m, i) => m && (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="match-card rounded-[24px] overflow-hidden group">

                    {/* Win stripe */}
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #10B981, rgba(16,185,129,0.2), transparent)' }} />

                    <div className="p-5 space-y-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Winner badge */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <Trophy className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                              {m.isRotationMatch && m.absoluteWinnerIdx !== undefined
                                ? `Team ${m.absoluteWinnerIdx + 1}` : `Team ${(m.winnerTeam ?? 0) + 1}`} WIN
                            </span>
                          </div>

                          {/* Score */}
                          {m.scores && (
                            <div className="px-3 py-1.5 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <span className="font-display text-lg tracking-widest text-white">
                                {m.scores[0]}<span className="text-gray-600 mx-1">â€”</span>{m.scores[1]}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stake */}
                          <div className="text-right">
                            <div className="font-display text-xl tracking-wide" style={{ color: '#FF4500' }}>
                              ${m.stake || 0}
                            </div>
                            <div className="section-label text-[7px]">{m.isRotationMatch ? (m.roundName || 'Rotation') : 'Friendly'}</div>
                          </div>
                          {isAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); deleteMatch(m.id); }}
                              className="p-2.5 rounded-xl transition-all active:scale-90"
                              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Winner players */}
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const matchTeams = Array.isArray(m.teams) ? m.teams : Object.keys(m.teams || {}).sort().map(k => m.teams[k]);
                          const winners = matchTeams[m.winnerTeam ?? 0];
                          return winners?.map(p => p && (
                            <span key={p.id} className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg"
                              style={{ background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.15)' }}>
                              {p.icon && !p.icon.startsWith('data:') ? p.icon : ''} {p.name}
                            </span>
                          ));
                        })()}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <p className="font-mono text-[9px] text-gray-600">
                          {m.date ? new Date(m.date).toLocaleString('zh-HK', {
                            hour12: false, year: 'numeric', month: '2-digit',
                            day: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : 'Unknown'} HKT
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {matches.length === 0 && (
                  <div className="text-center py-16 space-y-3">
                    <History className="w-10 h-10 mx-auto" style={{ color: '#2a2a2a' }} />
                    <p className="section-label">æš¿ç„¡æ¯”è³¿ç´€è!„</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* â”€â”€â”€ PLAYER PROFILE MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {selectedProfile && (
          <PlayerProfile
            player={selectedProfile}
            matches={matches || []}
            allPlayers={playersWithStats || []}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>

      {/* â”€â”€â”€ DOCK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dock
        items={[
          { active: activeTab === 'dashboard',   onClick: () => setActiveTab('dashboard'),   icon: LayoutDashboard, label: 'ç¸½è¦½' },
          { active: activeTab === 'teaming',     onClick: () => setActiveTab('teaming'),     icon: Users,           label: 'çµ„éªŠ' },
          { type: 'special',                     onClick: () => setActiveTab('play'),         icon: Plus,            label: 'æ¯”è³½' },
          { active: activeTab === 'history',     onClick: () => setActiveTab('history'),     icon: History,         label: 'ç´€è!„' },
          { active: activeTab === 'settlement',  onClick: () => setActiveTab('settlement'),  icon: DollarSign,      label: 'çµç®—' },
          { active: activeTab === 'players',     onClick: () => setActiveTab('players'),     icon: Trophy,          label: 'æˆå“¡' },
        ]}
      />
    </div>
  );
}

export default App;
