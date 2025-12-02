
import React from 'react';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  maxXP: number;
  currentStage: number; // 1, 2, or 3
}

const LevelProgressBar = ({ level, currentXP, maxXP, currentStage }: LevelProgressBarProps) => {
  const progress = Math.min((currentXP / maxXP) * 100, 100);

  // Markers for stage thresholds (33% and 66%)
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
        <span>Nivå {level} - Etapp {currentStage}</span>
        <span>{currentXP} / {maxXP} XP</span>
      </div>
      
      <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
        {/* Progress Fill */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        ></div>

        {/* Stage Markers (White lines at 33% and 66%) */}
        <div className="absolute left-[33%] top-0 bottom-0 w-0.5 bg-white opacity-50"></div>
        <div className="absolute left-[66%] top-0 bottom-0 w-0.5 bg-white opacity-50"></div>
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium px-1">
          <span>Start</span>
          <span className={currentStage >= 2 ? 'text-blue-500 font-bold' : ''}>Etapp 2</span>
          <span className={currentStage >= 3 ? 'text-blue-500 font-bold' : ''}>Etapp 3</span>
          <span className={progress >= 100 ? 'text-blue-500 font-bold' : ''}>Mål</span>
      </div>
    </div>
  );
};

export default LevelProgressBar;
