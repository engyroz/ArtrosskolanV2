import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Lock, Trophy, Map } from 'lucide-react';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import { getMaxXP } from '../utils/progressionEngine';

const MyJourney = () => {
  const { userProfile } = useAuth();
  
  const currentLevel = userProfile?.currentLevel || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  
  const currentXP = userProfile?.progression?.experiencePoints || 0;
  const maxXP = getMaxXP(currentLevel);
  
  const progressPercentage = Math.min(100, Math.round((currentXP / maxXP) * 100));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Header & Timeline */}
      <div className="bg-white px-6 pt-8 pb-8 shadow-sm rounded-b-3xl mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Min Resa</h1>
        <p className="text-slate-500 mb-8">
            Mot målet: <span className="font-semibold text-slate-900 capitalize">{userGoal.replace(/_/g, ' ')}</span>
        </p>
        
        {/* Timeline Visual */}
        <div className="relative flex justify-between items-center px-2">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10 transform -translate-y-1/2 mx-4"></div>
            
            {[1, 2, 3, 4].map((level) => {
                const isCompleted = level < currentLevel;
                const isCurrent = level === currentLevel;
                const isLocked = level > currentLevel;

                return (
                    <div key={level} className="flex flex-col items-center gap-2">
                        <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all z-10
                                ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' : ''}
                                ${isCurrent ? 'bg-blue-600 border-blue-200 shadow-lg shadow-blue-200 text-white scale-110' : ''}
                                ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : ''}
                            `}
                        >
                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : 
                             isLocked ? <Lock className="w-5 h-5" /> : 
                             <span className="font-bold text-lg">{level}</span>}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                            Fas {level}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        
        {/* 2. Current Status & Progress (Boss Fight Tracker) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Fas {currentLevel}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
                    </p>
                </div>
                {progressPercentage >= 100 && (
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 animate-pulse">
                        <Trophy className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Framsteg mot nästa nivå</span>
                    <span className="text-blue-600">{progressPercentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-400 text-right">
                    {currentXP} / {maxXP} XP
                </p>
            </div>

            {progressPercentage >= 100 ? (
                <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Gör Nivåtestet (Boss Fight)
                </button>
            ) : (
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex gap-2 items-center">
                    <Lock className="w-4 h-4" />
                    Slutför träningspassen för att låsa upp nivåtestet.
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default MyJourney;