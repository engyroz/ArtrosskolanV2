import React from 'react';
import { Play, CheckCircle, BookOpen, Dumbbell, Coffee, Zap, ChevronRight } from 'lucide-react';

interface ActionCardProps {
  mode: 'active' | 'recovery' | 'completed' | 'boss_fight';
  title: string;
  subtitle: string;
  meta?: {
    time?: string;
    xp?: number;
  };
  onClick: () => void;
}

const ActionCard = ({ mode, title, subtitle, meta, onClick }: ActionCardProps) => {
  
  // --- COMPLETED STATE ---
  if (mode === 'completed') {
    return (
      <div className="w-full bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-32 h-32 text-green-600" />
        </div>
        <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg text-white z-10">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-extrabold text-green-900 mb-1 z-10">Bra jobbat!</h3>
        <p className="text-green-700 font-medium z-10">Dagens rehab är avklarad.</p>
        <button className="mt-6 text-green-800 text-sm font-bold flex items-center hover:underline z-10">
            Se statistik <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }

  // --- RECOVERY STATE ---
  if (mode === 'recovery') {
    return (
      <button 
        onClick={onClick}
        className="w-full text-left bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden group hover:shadow-md transition-all duration-300"
      >
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <Coffee className="w-3 h-3" /> Återhämtning
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 font-medium mb-6 max-w-[80%]">{subtitle}</p>
            
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 group-hover:border-slate-400 transition-colors">
                    <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                    Läs dagens tips
                </span>
                {meta?.xp && (
                    <span className="text-xs font-bold text-slate-400">+{meta.xp} XP</span>
                )}
            </div>
        </div>
        
        {/* Background Icon */}
        <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
            <BookOpen className="w-40 h-40" />
        </div>
      </button>
    );
  }

  // --- ACTIVE / BOSS FIGHT STATE ---
  const isBoss = mode === 'boss_fight';
  const bgColor = isBoss ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-blue-600';
  const textColor = isBoss ? 'text-yellow-900' : 'text-white';
  const subTextColor = isBoss ? 'text-yellow-900/80' : 'text-blue-100';
  const btnBg = isBoss ? 'bg-black text-yellow-400' : 'bg-white text-blue-600';
  const icon = isBoss ? <Zap className="w-40 h-40" /> : <Dumbbell className="w-40 h-40" />;

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left ${bgColor} rounded-3xl p-8 relative overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group`}
    >
      <div className="relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider ${isBoss ? 'bg-yellow-300/50 text-yellow-900' : 'bg-blue-500/50 text-blue-50 border border-blue-400/30'}`}>
            {isBoss ? 'Nivåtest' : 'Dagens Pass'}
        </div>
        
        <h2 className={`text-3xl font-extrabold mb-2 leading-tight ${textColor}`}>
          {title}
        </h2>
        <p className={`font-medium text-lg mb-8 ${subTextColor}`}>
          {subtitle}
        </p>

        <div className="flex items-center justify-between">
            <div className={`inline-flex items-center px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${btnBg}`}>
                {isBoss ? 'Starta Testet' : 'Starta Passet'} 
                <Play className="w-5 h-5 ml-2 fill-current" />
            </div>
            
            {meta && !isBoss && (
                <div className="flex flex-col items-end text-right">
                    <span className={`text-sm font-bold ${textColor}`}>{meta.time}</span>
                    {meta.xp && <span className={`text-xs font-bold ${subTextColor}`}>+{meta.xp} XP</span>}
                </div>
            )}
        </div>
      </div>

      {/* Background Graphic */}
      <div className={`absolute -bottom-6 -right-6 opacity-10 transform rotate-12 group-hover:rotate-6 transition-transform duration-500 ${isBoss ? 'text-black' : 'text-white'}`}>
        {icon}
      </div>
    </button>
  );
};

export default ActionCard;