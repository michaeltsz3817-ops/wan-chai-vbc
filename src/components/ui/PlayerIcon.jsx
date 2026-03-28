import React from 'react';
import { ROLES } from '../../lib/constants';

const PlayerIcon = ({ icon, name, role, isHot, isGoat, isCold, className = "w-6 h-6" }) => {
    return (
        <div className={`relative ${className}`}>
            {isGoat && <div className="absolute inset-0 bg-yellow-500/40 rounded-full blur-md animate-pulse" />}
            {isHot && <div className="absolute inset-0 bg-orange-500/40 rounded-full blur-md animate-pulse" />}
            {isCold && <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-md" />}
            
            <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center overflow-hidden border-2 ${isGoat ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : isHot ? 'border-orange-500' : 'border-white/10'}`}>
                {icon?.startsWith('data:image') ? (
                    <img src={icon} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[1.2em]">{icon || '🏐'}</span>
                )}
            </div>
            {isGoat && <div className="absolute -top-[15%] -right-[15%] z-20 text-[0.8em]">👑</div>}
            {/* Role Badge */}
            {role && role !== 'none' && ROLES[role] && (
                <div className="absolute -bottom-[5%] -right-[5%] w-[40%] h-[40%] bg-emerald-500 rounded-md flex items-center justify-center shadow-lg border border-black/20 z-20">
                    {React.createElement(ROLES[role].icon, { className: "w-[70%] h-[70%] text-white" })}
                </div>
            )}
        </div>
    );
};

export default PlayerIcon;
