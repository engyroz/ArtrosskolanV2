import React from 'react';
import { Play, CheckCircle, Lock } from 'lucide-react';

interface ActionCardProps {
  state: 'todo' | 'completed' | 'rest' | 'locked';
  title: string;
  subtitle: string;
  duration?: string;
  onClick: () => void;
}

const ActionCard = ({ state, title, subtitle, duration, onClick }: ActionCardProps) => {
  
  if (state === 'completed') {
    return (
      <div className="bg-green-100 border border-green-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg text-white">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-green-800">Bra jobbat!</h3>
        <p className="text-green-700 opacity-90">Dagens pass är avklarat.</p>
      </div>
    );
  }

  if (state === 'rest') {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="text-xl font-bold text-slate-700">Vilodag</h3>
        <p className="text-slate-500">Njut av ledigheten och rör på dig som vanligt.</p>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="w-full group relative bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left"
    >
      {/* Background Image / Gradient */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>
      
      <div className="relative p-8 z-10 flex flex-col h-full min-h-[220px] justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
            Dagens Pass
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 max-w-[80%]">
            {title}
          </h2>
          <p className="text-slate-500 font-medium text-lg">{subtitle}</p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center text-slate-400 font-medium">
            <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm">{duration}</span>
          </div>
          
          <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
            <Play className="h-6 w-6 text-white ml-1 fill-current" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;