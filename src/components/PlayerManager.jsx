import React, { useState, useRef } from 'react';
import { UserPlus, Trash2, UserCircle, Camera, Check, X, Edit2, Zap, Shield, Target, Hand, Layers, Dumbbell, Star, ChevronDown, ChevronUp, Plus, Minus, Search, Download, Upload, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
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
        <div className="mt-4 border-t border-white/5 pt-4">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        技能系統 (Radar Stats)
                    </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
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
                            <div className="h-[200px] bg-white/2 rounded-3xl p-2 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="#ffffff10" />
                                        <PolarAngleAxis 
                                            dataKey="subject" 
                                            tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                                        />
                                        <Radar
                                            name={player.name}
                                            dataKey="value"
                                            stroke="#10b981"
                                            fill="#10b981"
                                            fillOpacity={0.4}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-black uppercase text-gray-500">可用點數 (Matches / 10)</span>
                                    <span className={`text-xl font-black italic ${player.availablePoints > 0 ? 'text-yellow-500 animate-bounce' : 'text-gray-700'}`}>
                                        {player.availablePoints}
                                    </span>
                                </div>

                                 <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(SKILL_LABELS).map(([key, { label, icon: Icon, color }]) => (
                                        <div key={key} className="bg-white/5 rounded-2xl p-3 flex flex-col gap-2 border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-3 h-3 ${color}`} />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-black italic">{player.skills?.[key] || 1}</span>
                                                    {ROLES[player.role || 'none']?.bonus === key && (
                                                        <span className="text-[8px] text-emerald-400 font-bold">+1</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => handleSkillChange(key, -1)}
                                                    disabled={(player.skills?.[key] || 1) <= 1}
                                                    className="flex-1 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-500/20 disabled:opacity-20 transition-all"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    onClick={() => handleSkillChange(key, 1)}
                                                    disabled={(player.skills?.[key] || 1) >= 5 || player.availablePoints <= 0}
                                                    className="flex-1 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 disabled:opacity-20 transition-all"
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
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
                                <span>Level Progress</span>
                                <span>{player.totalMatches % 10} / 10 Matches</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(player.totalMatches % 10) * 10}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
    };

    const startEdit = (player) => {
        setEditingId(player.id);
        setNewName(player.name);
        setSelectedIcon(player.icon);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewName('');
        setSelectedIcon(EMOJIS[0]);
    };

    const compressImage = (file, maxWidth = 128, maxHeight = 128) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            try {
                const compressed = await compressImage(file);
                setSelectedIcon(compressed);
            } catch (error) {
                console.error('Image processing failed:', error);
                alert('相片處理失敗，請試下細啲嘅相。');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 pb-24 text-white">
            <header className="space-y-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                        {editingId ? '修改' : '成員'} <span className="text-emerald-400">{editingId ? 'PROFILE' : 'JOIN'}</span>
                    </h2>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`p-3 rounded-2xl transition-all ${showAddForm ? 'bg-red-500/10 text-red-500 rotate-45' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {(showAddForm || editingId) && (
                    <motion.section 
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`p-6 glass rounded-[40px] border transition-all duration-500 relative ${editingId ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>1. 選擇 ICON</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <button key="upload" type="button" onClick={() => fileInputRef.current?.click()} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 border-2 border-dashed ${selectedIcon && selectedIcon.startsWith('data:image') ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                            {selectedIcon && selectedIcon.startsWith('data:image') ? <img src={selectedIcon} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <Camera className="w-5 h-5" />}
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        {EMOJIS.map(emoji => (
                                            <button key={emoji} type="button" onClick={() => setSelectedIcon(emoji)} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 ${selectedIcon === emoji ? (editingId ? 'bg-yellow-500' : 'bg-emerald-500') + ' text-white shadow-xl ring-2 ring-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>2. 名稱</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="在此輸入..." className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all font-black text-lg" />
                                        <div className="flex gap-2">
                                            {editingId && <button type="button" onClick={cancelEdit} className="px-6 bg-white/5 rounded-2xl py-4 border border-white/10 active:scale-95 transition-all"><X className="w-6 h-6" /></button>}
                                            <button type="submit" className={`flex-1 sm:px-10 rounded-2xl py-4 shadow-xl active:scale-95 transition-all ${editingId ? 'bg-yellow-500 text-black' : 'bg-emerald-500 text-white'}`}>
                                                {editingId ? <Check className="w-6 h-6 mx-auto" /> : <Plus className="w-6 h-6 mx-auto" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <section className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜尋隊員..."
                        className="w-full bg-white/5 border border-white/10 rounded-[30px] pl-14 pr-6 py-5 outline-none focus:border-emerald-500/30 transition-all font-bold text-sm"
                    />
                </div>

                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">現有成員 ({filteredPlayers.length})</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {[...filteredPlayers].sort((a, b) => a.name.localeCompare(b.name, 'zh-HK')).map((p) => (
                            <motion.div layout key={p.id} className={`p-5 glass rounded-[32px] flex flex-col border transition-all group ${editingId === p.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            <PlayerIcon 
                                                icon={p.icon} 
                                                name={p.name} 
                                                role={p.role} 
                                                isHot={p.isHot} 
                                                isGoat={p.isGoat} 
                                                className="w-full h-full" 
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black italic tracking-tighter uppercase">{p.name}</span>
                                                {p.availablePoints > 0 && <span className="text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black animate-bounce">POINTS!</span>}
                                                {ROLES[p.role]?.icon && (
                                                    <div className="bg-white/10 p-1 rounded-lg border border-white/10" title={ROLES[p.role].label}>
                                                        {React.createElement(ROLES[p.role].icon, { className: "w-3 h-3 text-emerald-400" })}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-1">
                                                <div className="flex items-center gap-2">
                                                    {isAdmin ? (
                                                        <select 
                                                            value={p.role || 'none'} 
                                                            onChange={(e) => onUpdate(p.id, { role: e.target.value })}
                                                            className="bg-transparent text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 outline-none hover:bg-emerald-500/10 cursor-pointer"
                                                        >
                                                            {Object.entries(ROLES).map(([key, { label }]) => (
                                                                <option key={key} value={key} className="bg-[#111]">{label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                                            {ROLES[p.role || 'none']?.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{p.wins || 0} 勝仗</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${p.totalMatches >= 10 ? 'text-yellow-500' : 'text-gray-500'}`}>{p.totalMatches || 0} 場經驗</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(p)} className="p-3 text-gray-700 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-5 h-5" /></button>
                                            <button onClick={() => onDelete(p.id)} className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </div>
                                <SkillCard player={p} onUpdate={onUpdate} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Admin Controls */}
            {isAdmin && (
                <section className="pt-10 pb-20 space-y-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <ShieldCheck className="w-4 h-4 text-gray-600" />
                        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">數據管理 (Admin Only)</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onExport}
                            className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            <Download className="w-4 h-4" /> 下載數據
                        </button>
                        <label className="flex items-center justify-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer">
                            <Upload className="w-4 h-4" /> 匯入數據
                            <input type="file" accept=".json" onChange={onImport} className="hidden" />
                        </label>
                    </div>

                    <button 
                        onClick={onPushToCloud}
                        className="w-full p-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        ☁️ 將此機數據上傳至雲端 (Manual Push)
                    </button>

                    <button 
                        onClick={onResetAll}
                        className="w-full p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        重設所有數據 (Danger Room)
                    </button>
                </section>
            )}
        </div>
    );
}
