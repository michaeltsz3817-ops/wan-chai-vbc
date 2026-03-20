import React, { useState, useRef } from 'react';
import { UserPlus, Trash2, UserCircle, Camera, Check, X, Edit2, Zap, Shield, Target, Hand, Layers, Dumbbell, Star, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const EMOJIS = ['🏐', '🔥', '⭐️', '👑', '🦁', '🦅', '⚡️', '😎', '💪', '🧤', '🎯', '🚀'];

const SKILL_LABELS = {
    atk: { label: '進攻', icon: Zap, color: 'text-orange-400' },
    def: { label: '防守', icon: Shield, color: 'text-blue-400' },
    srv: { label: '發球', icon: Target, color: 'text-red-400' },
    set: { label: '舉球', icon: Hand, color: 'text-emerald-400' },
    blk: { label: '攔網', icon: Layers, color: 'text-purple-400' },
    pwr: { label: '體力', icon: Dumbbell, color: 'text-yellow-400' }
};

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

        // Validation
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
                            {/* Radar Chart */}
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
                                <div className="absolute top-2 right-4 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Live Stats</span>
                                </div>
                            </div>

                            {/* Point Allocation */}
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
                                                <span className="text-sm font-black italic">{player.skills?.[key] || 1}</span>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PlayerManager({ players, onAdd, onDelete, onUpdate, onResetAll, isAdmin }) {
    const [newName, setNewName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(EMOJIS[0]);
    const [editingId, setEditingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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

    return (
        <div className="space-y-8 pb-24 text-white">
            <header className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                    {editingId ? '修改' : '成員'} <span className="text-emerald-400">{editingId ? 'PROFILE' : 'JOIN'}</span>
                </h2>
                <p className="text-gray-500 text-sm font-bold">
                    {editingId ? '正在修改成員資料，完成後點擊勾號保存。' : '同事請在此輸入名字並上傳相片或揀選 Icon 加入。每打 10 場會獲贈 1 點技能點！'}
                </p>
            </header>

            <section className={`p-6 glass rounded-[40px] border transition-all duration-500 relative overflow-hidden ${editingId ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10"><UserCircle className="w-12 h-12" /></div>
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>1. 選擇 ICON</label>
                        <div className="flex flex-wrap gap-2.5">
                            <button key="upload" type="button" onClick={() => fileInputRef.current?.click()} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 border-2 border-dashed ${selectedIcon && selectedIcon.startsWith('data:image') ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                {selectedIcon && selectedIcon.startsWith('data:image') ? <img src={selectedIcon} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <Camera className="w-5 h-5" />}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            {EMOJIS.map(emoji => (
                                <button key={emoji} type="button" onClick={() => setSelectedIcon(emoji)} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 ${selectedIcon === emoji ? (editingId ? 'bg-yellow-500 shadow-yellow-500/30' : 'bg-emerald-500 shadow-emerald-500/30') + ' text-white shadow-xl ring-2 ring-offset-4 ring-offset-background' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>2. 名稱</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="在此輸入..." className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-black text-lg placeholder:text-gray-700" />
                            {editingId ? (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button type="button" onClick={cancelEdit} className="flex-1 sm:px-6 bg-white/5 rounded-2xl py-4 flex items-center justify-center border border-white/10 active:scale-95 transition-all"><X className="w-6 h-6 text-gray-400" /></button>
                                    <button type="submit" className="flex-[2] sm:px-10 bg-yellow-500 rounded-2xl py-4 flex items-center justify-center shadow-xl shadow-yellow-500/20 active:scale-95 transition-all text-black"><Check className="w-6 h-6" /></button>
                                </div>
                            ) : (
                                <button type="submit" disabled={!newName.trim() || isUploading} className="w-full sm:w-auto sm:px-8 bg-emerald-500 rounded-2xl py-4 flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">現有成員 ({players.length})</h3>
                    {isAdmin && <button onClick={onResetAll} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">重設所有數據</button>}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {players.map((p) => (
                            <motion.div layout key={p.id} className={`p-5 glass rounded-[32px] flex flex-col border transition-all group ${editingId === p.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                            {p.icon && p.icon.startsWith('data:image') ? <img src={p.icon} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{p.icon || '🏐'}</span>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black italic tracking-tighter uppercase">{p.name}</span>
                                                {p.availablePoints > 0 && <span className="text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black animate-bounce">POINTS!</span>}
                                            </div>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{p.wins || 0} 勝仗</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${p.totalMatches >= 10 ? 'text-yellow-500' : 'text-gray-500'}`}>{p.totalMatches || 0} 場經驗</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(p)} className="p-3 text-gray-700 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(p.id)} className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <SkillCard player={p} onUpdate={onUpdate} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
