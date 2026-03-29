import React, { useState, useRef } from 'react';
import { UserPlus, Trash2, UserCircle, Camera, Check, X, Edit2, Zap, Shield, Target, Hand, Layers, Dumbbell, Star, ChevronDown, ChevronUp, Plus, Minus, Search, Download, Upload, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarLine, ResponsiveContainer } from 'recharts';
import { EMOJIS, SKILL_LABELS, ROLES } from '../lib/constants';
import PlayerIcon from './ui/PlayerIcon';

function SkillCard({ player, onUpdate }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const chartData = Object.entries(player.skills || {}).map(([key, value]) => ({
        subject: SKILL_LABELS[key]?.label || key,
        value: value,
        fullMark: 5
    }));

    const handleSkillChange = (skillKey, delta) => {
        const currentScore = player.skills[skillKey];
        const newScore = currentScore + delta;

        if (newScore < 1 || newScore > 5) return;
        if (delta > 0 && player.availablePoints <= 0) return;

        const newSkills = { ...player.skills, [skillKey]: newScore };
        onUpdate(player.id, { skills: newSkills });
    };

    return (
        <div className="mt-4 border-t pt-4" style={{borderColor: '#1a1a1a'}}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#444] group-hover:text-white transition-colors">
                        PLAYER ATTRIBUTES (RADAR)
                    </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#333]" /> : <ChevronDown className="w-4 h-4 text-[#333]" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                            <div className="h-[200px] rounded-3xl p-2 relative" style={{background: '#0a0a0a', border: '1px solid #1a1a1a'}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="#222" />
                                        <PolarAngleAxis 
                                            dataKey="subject" 
                                            tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} 
                                        />
                                        <RadarLine
                                            name={player.name}
                                            dataKey="value"
                                            stroke="#FF4500"
                                            fill="#FF4500"
                                            fillOpacity={0.4}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-black uppercase text-[#555]">SKILL POINTS AVAILABLE</span>
                                    <span className={`font-display text-4xl leading-none ${player.availablePoints > 0 ? 'text-yellow-500 animate-pulse' : 'text-[#222]'}`} style={{fontFamily: "'Bebas Neue', sans-serif"}}>
                                        {player.availablePoints}
                                    </span>
                                </div>

                                 <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(SKILL_LABELS) || []).map(([key, { label, icon: Icon, color }]) => (
                                        <div key={key} className="p-3 flex flex-col gap-2 rounded-xl transition-all" style={{background: '#111', border: '1px solid #222'}}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-3 h-3 ${color}`} />
                                                    <span className="text-[9px] font-black text-[#555] uppercase">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-black italic">{player.skills?.[key] || 1}</span>
                                                    {ROLES[player.role || 'none']?.bonus === key && (
                                                        <span className="text-[8px] text-[#FF4500] font-bold">+1</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => handleSkillChange(key, -1)}
                                                    disabled={(player.skills?.[key] || 1) <= 1}
                                                    className="flex-1 h-8 bg-[#1a1a1a] rounded flex items-center justify-center hover:bg-red-500/20 disabled:opacity-20 transition-all border border-[#222]"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    onClick={() => handleSkillChange(key, 1)}
                                                    disabled={(player.skills?.[key] || 1) >= 5 || player.availablePoints <= 0}
                                                    className="flex-1 h-8 bg-[#1a1a1a] rounded flex items-center justify-center hover:bg-emerald-500/20 disabled:opacity-20 transition-all border border-[#222]"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 px-2 space-y-2">
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-[#444]">
                                <span>Level Progress</span>
                                <span>{player.totalMatches % 10} / 10 Matches</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(player.totalMatches % 10) * 10}%` }}
                                    className="h-full bg-[#FF4500]"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PlayerManager({ players, onAdd, onDelete, onUpdate, onResetAll, onExport, onImport, onPushToCloud, isAdmin }) {
    const [newName, setNewName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(EMOJIS[0]);
    const [editingId, setEditingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        if (editingId) {
            onUpdate(editingId, {
                name: newName.trim(),
                icon: selectedIcon
            });
            setEditingId(null);
        } else {
            onAdd({
                id: Date.now().toString(),
                name: newName.trim(),
                icon: selectedIcon,
                skill: 3,
                wins: 0,
                drinks: 0
            });
        }

        setNewName('');
        if (!selectedIcon.startsWith('data:image')) {
            setSelectedIcon(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
        }
        setShowAddForm(false);
    };

    const startEdit = (player) => {
        setEditingId(player.id);
        setNewName(player.name);
        setSelectedIcon(player.icon);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewName('');
        setSelectedIcon(EMOJIS[0]);
        setShowAddForm(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            try {
                // simple FileReader for dataUrl (compressing logic kept for utility)
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => setSelectedIcon(event.target.result);
            } catch (error) {
                console.error('Image processing failed:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 pb-24 text-white">
            <header className="flex items-center justify-between">
                <h2 className="font-display text-3xl tracking-wide uppercase" style={{fontFamily: "'Bebas Neue', sans-serif"}}>
                    {editingId ? 'EDIT' : 'PLAYER'} <span style={{color:'#FF4500'}}>{editingId ? 'ATHLETE' : 'ROSTER'}</span>
                </h2>
                {isAdmin && (
                    <button 
                        onClick={() => {
                            if(editingId) cancelEdit();
                            else setShowAddForm(!showAddForm);
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showAddForm ? 'bg-[#220000] text-red-500 border border-red-900/30' : 'bg-[#1a1a1a] text-white border border-[#222] hover:border-[#FF4500]'}`}
                    >
                        {showAddForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </button>
                )}
            </header>

            <AnimatePresence>
                {showAddForm && (
                    <motion.section 
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 rounded-3xl relative" style={{background: '#111', border: `1px solid ${editingId ? '#FF4500' : '#222'}`}}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{color: '#555'}}>1. CHOOSE ATHLETE ICON</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <button key="upload" type="button" onClick={() => fileInputRef.current?.click()} 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all active:scale-95 border-2 border-dashed relative overflow-hidden"
                                            style={{borderColor: '#222', background: '#050505'}}>
                                            {selectedIcon && selectedIcon.startsWith('data:image') ? <img src={selectedIcon} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-[#333]" />}
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        {EMOJIS.map(emoji => (
                                            <button key={emoji} type="button" onClick={() => setSelectedIcon(emoji)} 
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all active:scale-95 ${selectedIcon === emoji ? 'bg-[#FF4500] text-white' : 'bg-[#050505] text-[#333] hover:text-white'}`}
                                                style={{border: selectedIcon === emoji ? 'none' : '1px solid #1a1a1a'}}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{color: '#555'}}>2. ATHLETE NAME</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ENTER PLAYER NAME..." 
                                            className="flex-1 bg-[#050505] border border-[#222] rounded-xl px-4 py-3 outline-none focus:border-[#FF4500] transition-all font-black text-sm uppercase tracking-wide placeholder:text-[#222]" />
                                        <button type="submit" className="px-8 rounded-xl font-display text-xl transition-all active:scale-95" 
                                            style={{background: '#FF4500', color: '#fff'}}>
                                            {editingId ? 'UPDATE' : 'JOIN'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <section className="space-y-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333] group-focus-within:text-[#FF4500] transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="FILTER ATHLETES..."
                        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl pl-12 pr-6 py-4 outline-none focus:border-[#FF450033] transition-all font-black text-xs uppercase tracking-widest placeholder:text-[#222]"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {[...filteredPlayers].sort((a, b) => a.name.localeCompare(b.name, 'zh-HK')).map((p) => (
                            <motion.div layout key={p.id} className="p-5 rounded-2xl flex flex-col transition-all group overflow-hidden relative" 
                                style={{background: '#111', border: editingId === p.id ? '1px solid #FF4500' : '1px solid #222'}}>
                                
                                {/* Background Slash */}
                                <div className="absolute top-0 right-0 w-24 h-full transform translate-x-12 -skew-x-12 opacity-[0.03]" style={{background: '#FF4500'}} />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center relative" style={{background: '#050505', border: '1px solid #1a1a1a'}}>
                                            <PlayerIcon icon={p.icon} name={p.name} className="w-10 h-10" />
                                            {p.isHot && <div className="absolute top-0 right-0 p-1" style={{background: '#FF4500'}}><Flame className="w-3 h-3 text-white" /></div>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-display text-2xl tracking-wide uppercase leading-none" style={{fontFamily: "'Bebas Neue', sans-serif"}}>{p.name}</span>
                                                {p.availablePoints > 0 && <span className="bg-[#FF4500] text-white text-[7px] font-black px-1.5 py-0.5 rounded leading-none">PTS!</span>}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                {isAdmin ? (
                                                    <select 
                                                        value={p.role || 'none'} 
                                                        onChange={(e) => onUpdate(p.id, { role: e.target.value })}
                                                        className="bg-transparent text-[8px] font-black uppercase tracking-widest text-[#FF4500] border border-[#FF450033] rounded-full px-2 py-0.5 outline-none hover:bg-[#FF450011] cursor-pointer"
                                                    >
                                                        {Object.entries(ROLES).map(([key, { label }]) => (
                                                            <option key={key} value={key} className="bg-[#111]">{label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#FF450066] border border-[#FF450022] px-2 py-0.5 rounded-full">
                                                        {ROLES[p.role || 'none']?.label}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-tight" style={{color: '#444'}}>{p.wins || 0}W</span>
                                                    <span className="text-[9px] font-black uppercase tracking-tight" style={{color: '#444'}}>{p.totalMatches || 0}G</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(p)} className="p-3 text-[#333] hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(p.id)} className="p-3 text-[#333] hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                                <SkillCard player={p} onUpdate={onUpdate} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Admin Systems */}
            {isAdmin && (
                <section className="pt-12 pb-20 space-y-4 border-t" style={{borderColor: '#1a1a1a'}}>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#333]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{color: '#333'}}>DATA OPERATIONS</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onExport} className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all relative overflow-hidden group" style={{background: '#111', border: '1px solid #222'}}>
                            <Download className="w-5 h-5 text-emerald-500 transition-transform group-hover:-translate-y-1" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#555]">EXPORT DATA</span>
                        </button>
                        <label className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all cursor-pointer relative overflow-hidden group" style={{background: '#111', border: '1px solid #222'}}>
                            <Upload className="w-5 h-5 text-blue-500 transition-transform group-hover:-translate-y-1" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#555]">IMPORT DATA</span>
                            <input type="file" accept=".json" onChange={onImport} className="hidden" />
                        </label>
                    </div>

                    <button onClick={onPushToCloud} className="w-full py-5 rounded-xl font-display text-xl transition-all active:scale-95 shadow-2xl shadow-[#FF450022] mt-2" 
                        style={{background: 'linear-gradient(135deg, #FF4500, #FF6A00)', color: '#fff', fontFamily: "'Bebas Neue', sans-serif"}}>
                        SYNC ALL DATA TO CLOUD
                    </button>

                    <button onClick={onResetAll} className="w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:bg-red-950/20 active:opacity-50" 
                        style={{color: '#220000', border: '1px solid #1a0000'}}>
                        ERASE DATABASE
                    </button>
                </section>
            )}
        </div>
    );
}
