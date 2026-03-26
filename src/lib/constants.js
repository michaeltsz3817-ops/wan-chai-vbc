import { UserCircle, Zap, Shield, Target, Hand, Layers, Dumbbell } from 'lucide-react';

export const EMOJIS = ['🏐', '🔥', '⭐️', '👑', '🦁', '🦅', '⚡️', '😎', '💪', '🧤', '🎯', '🚀'];

export const DEFAULT_SKILLS = { atk: 1, def: 1, srv: 1, set: 1, blk: 1, pwr: 1 };

export const SKILL_LABELS = {
    atk: { label: '進攻', icon: Zap, color: 'text-orange-400' },
    def: { label: '防守', icon: Shield, color: 'text-blue-400' },
    srv: { label: '發球', icon: Target, color: 'text-red-400' },
    set: { label: '舉球', icon: Hand, color: 'text-emerald-400' },
    blk: { label: '攔網', icon: Layers, color: 'text-purple-400' },
    pwr: { label: '體力', icon: Dumbbell, color: 'text-yellow-400' }
};

export const ROLES = {
    none: { label: '自由人', icon: UserCircle, bonus: null, desc: '均衡發展' },
    cannon: { label: '大炮 (Cannon)', icon: Zap, bonus: 'atk', desc: '進攻 +1' },
    wall: { label: '長城 (Wall)', icon: Layers, bonus: 'blk', desc: '攔網 +1' },
    maestro: { label: '指揮官 (Maestro)', icon: Hand, bonus: 'set', desc: '舉球 +1' },
    guardian: { label: '守護者 (Guardian)', icon: Shield, bonus: 'def', desc: '防守 +1' },
    server: { label: '發球機器 (Server)', icon: Target, bonus: 'srv', desc: '發球 +1' }
};
