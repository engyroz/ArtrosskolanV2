import React from 'react';
import { WorkoutLog } from '../types';
import { Play, CheckCircle, Clock, XCircle, Dumbbell, Activity, Check, Lock, Coffee, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DayDetailCardProps {
  date: Date;
  log?: WorkoutLog; 
  isToday: boolean;
  onStartRehab: () => void;
  onToggleActivity: () => void;
  isActivityDone: boolean;
  activityConfig: { title: string; desc: string }; // New Prop
  isFuture: boolean; // New Prop
}

const DayDetailCard = ({ date, log, isToday, onStartRehab, onToggleActivity, isActivityDone, activityConfig, isFuture }: DayDetailCardProps) => {
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('sv-SE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date);

  // --- RENDER LOGIC ---

  // 1. PAST / COMPLETED REHAB
  if (log && log.status === 'completed') {
    const painColor = (log.painScore || 0) <= 3 ? 'text-green-600 bg-green-50 border-green-100' : 
                      (log.painScore || 0) <= 5 ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : 
                      'text-red-600 bg-red-50 border-red-100';

    return (
      <div className="px-4 animate-slide-up">
        <h3 className="text-lg font-bold text-slate-900 capitalize mb-4 px-2">{formattedDate}</h3>
        
        {/* Result Card */}
        <div className={`rounded-2xl p-6 border ${painColor} mb-4 relative overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            <CheckCircle className="w-5 h-5 text-current" />
                        </div>
                        <span className="font-bold text-lg">Genomfört</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded">
                        {log.workoutType === 'rehab' ? 'Rehab' : 'Cirkulation'}
                    </span>
                </div>
                <div className="mt-4 flex gap-4">
                    <div>
                        <span className="block text-xs font-bold opacity-70 uppercase">Smärta</span>
                        <span className="text-2xl font-bold">{log.painScore}/10</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 2. PAST / MISSED
  if (log && log.status === 'missed') {
    return (
      <div className="px-4 animate-slide-up">
        <h3 className="text-lg font-bold text-slate-900 capitalize mb-4 px-2">{formattedDate}</h3>
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex items-center gap-4 opacity-75">
            <XCircle className="w-10 h-10 text-slate-400" />
            <div>
                <h4 className="text-lg font-bold text-slate-700">Missat pass</h4>
                <p className="text-slate-500 text-sm">Livet kommer emellan. Nya tag!</p>
            </div>
        </div>
      </div>
    );
  }

  // 3. FUTURE / TODAY (PLANNING)
  
  const hasRehabPlanned = log && log.status === 'planned';
  const canToggleActivity = !isFuture; // Only allow toggling if not in future

  return (
    <div className="px-4 pb-20 animate-slide-up">
      <h3 className="text-lg font-bold text-slate-900 capitalize mb-4 px-2">{formattedDate}</h3>
      
      {/* A. Rehab Card OR Recovery Card */}
      {hasRehabPlanned ? (
          <div className={`rounded-2xl p-6 mb-6 relative overflow-hidden shadow-sm transition-all border
              ${isToday 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'
              }
          `}>
            {/* Background Decor */}
            <div className="absolute -bottom-4 -right-4 opacity-10 transform rotate-12">
                <Dumbbell className="w-24 h-24" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg mb-2 inline-block ${isToday ? 'bg-blue-500 text-blue-50' : 'bg-slate-200 text-slate-500'}`}>
                            {isToday ? 'Dagens Pass' : 'Planerat'}
                        </span>
                        <h4 className={`text-xl font-extrabold ${isToday ? 'text-white' : 'text-slate-500'}`}>
                            Rehabstyrka
                        </h4>
                        <p className={`text-sm font-medium ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                            {log.focusText}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className={`text-xs font-bold flex items-center ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> 15 min
                    </div>

                    {isToday ? (
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg flex items-center"
                        >
                            Starta <Play className="w-3.5 h-3.5 ml-1.5 fill-current" />
                        </button>
                    ) : (
                        <div className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-400 flex items-center">
                            <Lock className="w-3 h-3 mr-1.5" /> Låst
                        </div>
                    )}
                </div>
            </div>
          </div>
      ) : (
          // Vilodag / Recovery Card
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-sm group">
              <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                      <Coffee className="w-3 h-3" /> Återhämtning
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-1">Vila & Lärande</h4>
                  <p className="text-slate-500 text-sm mb-4">Ingen tung rehab planerad idag.</p>
                  
                  <button 
                    onClick={() => navigate('/knowledge')}
                    className="inline-flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                  >
                      <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                      Gå till Kunskap
                  </button>
              </div>
              
              {/* Background Decor */}
              <div className="absolute -bottom-2 -right-2 opacity-5 transform rotate-12">
                  <Coffee className="w-24 h-24" />
              </div>
          </div>
      )}

      {/* B. Activity List (FaR) - No Header */}
      <div className="space-y-3 opacity-90">
        {/* Activity Item (FaR) */}
        <button 
            onClick={canToggleActivity ? onToggleActivity : undefined}
            disabled={!canToggleActivity}
            className={`w-full flex items-center p-4 rounded-xl border transition-all ${
                isActivityDone 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-slate-200'
            } ${!canToggleActivity ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 cursor-pointer'}`}
        >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                isActivityDone 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-slate-300 bg-white'
            }`}>
                {isActivityDone ? <Check className="w-3.5 h-3.5" /> : (isFuture ? null : <Activity className="w-3.5 h-3.5 text-slate-300"/>)}
            </div>
            <div className="text-left">
                <span className={`block font-bold ${isActivityDone ? 'text-green-900' : 'text-slate-900'}`}>
                    {activityConfig.title}
                </span>
                <span className="text-xs text-slate-500">{activityConfig.desc}</span>
            </div>
        </button>
      </div>

    </div>
  );
};

export default DayDetailCard;