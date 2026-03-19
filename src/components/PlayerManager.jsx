import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Trash2, UserCircle, Camera, Check, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🏐', '🔥', '⭐️', '👑', '🦁', '🦅', '⚡️', '😎', '💪', '🧤', '🎯', '🚀'];

export default function PlayerManager({ players, onAdd, onDelete, onUpdate }) {
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
        // Auto-select a new random emoji for variety (unless they just uploaded)
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedIcon(reader.result);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 pb-24 text-white">
            <header className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                    {editingId ? '修改' : '成員'} <span className="text-emerald-400">{editingId ? 'PROFILE' : 'JOIN'}</span>
                </h2>
                <p className="text-gray-500 text-sm font-bold">
                    {editingId ? '正在修改成員資料，完成後點擊勾號保存。' : '同事請在此輸入名字並上傳相片或揀選 Icon 加入。'}
                </p>
            </header>

            {/* Self-Registration / Edit Form */}
            <section className={`p-6 glass rounded-[40px] border transition-all duration-500 relative overflow-hidden ${editingId ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-emerald-500/20 bg-emerald-500/5'
                }`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UserCircle className="w-12 h-12" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>
                            1. {editingId ? '更換' : '選擇'} ICON 或上傳相片
                        </label>

                        <div className="flex flex-wrap gap-2.5">
                            {/* Upload Button */}
                            <button
                                key="upload"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 border-2 border-dashed ${selectedIcon && selectedIcon.startsWith('data:image')
                                        ? 'border-emerald-500 bg-emerald-500/20'
                                        : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {selectedIcon && selectedIcon.startsWith('data:image') ? (
                                    <img src={selectedIcon} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            {/* Emoji Options */}
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setSelectedIcon(emoji)}
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 ${selectedIcon === emoji
                                            ? (editingId ? 'bg-yellow-500 shadow-yellow-500/30' : 'bg-emerald-500 shadow-emerald-500/30') + ' text-white shadow-xl ring-2 ring-offset-4 ring-offset-background'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${editingId ? 'text-yellow-500' : 'text-emerald-400'}`}>
                            2. {editingId ? '修正' : '輸入'}你的大名
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="在此輸入..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-black text-lg placeholder:text-gray-700"
                            />
                            {editingId ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
                                    >
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newName.trim() || isUploading}
                                        className="px-8 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/20 active:scale-95 transition-all text-black"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!newName.trim() || isUploading}
                                    className="px-8 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    <UserPlus className="w-6 h-6 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            {/* Current Team Display */}
            <section className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">現有成員 ({players.length})</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {players.map((p) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                key={p.id}
                                className={`p-5 glass rounded-3xl flex items-center justify-between border transition-all group ${editingId === p.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                        {p.icon && p.icon.startsWith('data:image') ? (
                                            <img src={p.icon} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl">{p.icon || '🏐'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xl font-black italic tracking-tighter uppercase">{p.name}</span>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{p.wins || 0} 勝仗</span>
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{p.drinks || 0} 飲數</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(p)}
                                        className="p-3 text-gray-700 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(p.id)}
                                        className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
