import React from 'react';
import { Trophy } from 'lucide-react';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  maxXP: number;
}

const LevelProgressBar = ({ level, currentXP, maxXP }: LevelProgressBarProps) => {
  const progress = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
        <span>Nivå {level}: Grundstyrka</span>
        <span>{currentXP} / {maxXP} XP</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out rounded-full relative"
          style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressBar;