import React, { useState } from 'react';
import { WorkoutLog } from '../types';
import { Play, CheckCircle, Clock, XCircle, Dumbbell, Activity, Check, Lock, Coffee, BookOpen, Edit2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ACTION_CARD_CONFIG } from '../utils/textConstants';

interface DayDetailCardProps {
  date: Date;
  log?: WorkoutLog; 
  isToday: boolean;
  onStartRehab: () => void;
  onToggleActivity: () => void;
  isActivityDone: boolean;
  activityConfig: { title: string; desc: string }; 
  isFuture: boolean; 
  onSaveNote?: (note: string) => void;
  level?: number; // New prop
}

const DayDetailCard = ({ date, log, isToday, onStartRehab, onToggleActivity, isActivityDone, activityConfig, isFuture, onSaveNote, level = 1 }: DayDetailCardProps) => {
  const navigate = useNavigate();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(log?.userNote || '');

  const canToggleActivity = !isFuture;

  const formattedDate = new Intl.DateTimeFormat('sv-SE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date);

  const handleSave = () => {
      if(onSaveNote) onSaveNote(noteText);
      setIsEditingNote(false);
  };

  const getRpeIcon = (rpe: string) => {
      if (rpe === 'light') return '🪶';
      if (rpe === 'heavy') return '🥵';
      return '👌';
  };

  // Get dynamic text for Recovery Card
  // Safe lookup for level config
  const levelConfig = ACTION_CARD_CONFIG[level as keyof typeof ACTION_CARD_CONFIG] || ACTION_CARD_CONFIG[1];
  const recoveryText = levelConfig.recoverySubtitle; // "Låt kroppen vila idag" etc.

  // --- RENDER LOGIC ---

  // 1. PAST / COMPLETED REHAB
  if (log && log.status === 'completed') {
    const painColor = (log.painScore || 0) <= 3 ? 'text-green-600 border-green-200 bg-green-50' : 
                      (log.painScore || 0) <= 5 ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 
                      'text-red-600 border-red-200 bg-red-50';
    
    const completedTime = log.completedAt ? new Date(log.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

    return (
      <div className="px-4 animate-slide-up">
        <div className="flex justify-between items-baseline mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-900 capitalize">{formattedDate}</h3>
            <span className="text-xs font-bold text-slate-400">Kl {completedTime}</span>
        </div>
        
        <div className={`rounded-2xl p-6 border mb-4 relative overflow-hidden bg-white shadow-sm`}>
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Genomfört</span>
                    <h4 className="text-xl font-extrabold text-slate-900 mt-1 capitalize">
                        {log.workoutType === 'rehab' ? 'Rehabstyrka' : 'Cirkulation'}
                    </h4>
                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold mt-2">
                        Nivå {log.level}
                    </span>
                </div>
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <CheckCircle className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${painColor} flex flex-col items-center justify-center text-center`}>
                    <span className="text-3xl font-black mb-1">{log.painScore}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Smärta (0-10)</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl mb-1">{getRpeIcon(log.exertion || 'perfect')}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Känsla</span>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Anteckning</span>
                    {!isEditingNote && (
                        <button onClick={() => setIsEditingNote(true)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                            <Edit2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                {isEditingNote ? (
                    <div className="flex gap-2">
                        <textarea 
                            className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={2}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        />
                        <button onClick={handleSave} className="self-end p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 italic">
                        "{log.userNote || 'Ingen anteckning'}"
                    </p>
                )}
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
          <div className={`border rounded-2xl p-6 mb-6 relative overflow-hidden shadow-sm group transition-all
              ${isFuture 
                 ? 'bg-slate-50 border-slate-200 opacity-70' 
                 : 'bg-white border-slate-200'
              }
          `}>
              <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider ${isFuture ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      <Coffee className="w-3 h-3" /> Återhämtning
                  </div>
                  <h4 className={`text-xl font-bold mb-1 ${isFuture ? 'text-slate-400' : 'text-slate-800'}`}>
                    Återhämtning
                  </h4>
                  <p className={`text-sm mb-4 ${isFuture ? 'text-slate-400' : 'text-slate-500'}`}>
                    {recoveryText}
                  </p>
                  
                  {isFuture ? (
                      <div className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">
                          <Lock className="w-4 h-4 mr-2" />
                          Planerat
                      </div>
                  ) : (
                      <button 
                        onClick={() => navigate('/knowledge')}
                        className="inline-flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                      >
                          <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                          Gå till Kunskap
                      </button>
                  )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 opacity-5 transform rotate-12">
                  <Coffee className="w-24 h-24" />
              </div>
          </div>
      )}

      {/* B. Activity List (FaR) */}
      <div className="space-y-3 opacity-90">
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