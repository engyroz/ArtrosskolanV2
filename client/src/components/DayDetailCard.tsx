import React from 'react';
import { WorkoutLog } from '../types';
import { Play, CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DayDetailCardProps {
  date: Date;
  log?: WorkoutLog; // If undefined, nothing scheduled or planned
  isToday: boolean;
}

const DayDetailCard = ({ date, log, isToday }: DayDetailCardProps) => {
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('sv-SE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date);

  // --- RENDER LOGIC ---

  // 1. Completed Session
  if (log && log.status === 'completed') {
    const painColor = (log.painScore || 0) <= 3 ? 'text-green-600 bg-green-50' : 
                      (log.painScore || 0) <= 5 ? 'text-yellow-600 bg-yellow-50' : 
                      'text-red-600 bg-red-50';

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 capitalize">{formattedDate}</h3>
            <span className="inline-flex items-center text-green-600 font-bold text-sm mt-1">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Genomfört
            </span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${painColor}`}>
            Smärta: {log.painScore}/10
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Typ av pass</div>
          <div className="font-bold text-slate-800 capitalize">{log.workoutType === 'rehab' ? 'Rehabstyrka' : 'Cirkulation'}</div>
        </div>

        {log.userNote && (
          <div className="text-sm text-slate-500 italic">
            "{log.userNote}"
          </div>
        )}
      </div>
    );
  }

  // 2. Planned Session (Future or Today)
  if (log && log.status === 'planned') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
        <h3 className="text-xl font-bold text-slate-900 capitalize mb-4">{formattedDate}</h3>
        
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Planerat</span>
            <div className="flex items-center text-blue-600 text-xs font-bold">
              <Clock className="w-3 h-3 mr-1" /> 15 min
            </div>
          </div>
          <h4 className="text-lg font-bold text-blue-900 mb-1">Rehabpass Nivå {log.level}</h4>
          <p className="text-blue-700 text-sm">{log.focusText}</p>
        </div>

        {isToday ? (
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
          >
            <Play className="w-4 h-4 mr-2 fill-current" /> Gå till Dashboard
          </button>
        ) : (
          <div className="flex gap-3">
             <button className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">
               Flytta pass
             </button>
             {/* If future, maybe "Sneak Peek"? */}
          </div>
        )}
      </div>
    );
  }

  // 3. Rest Day / Empty
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up text-center">
      <h3 className="text-xl font-bold text-slate-900 capitalize mb-2">{formattedDate}</h3>
      <div className="py-8 flex flex-col items-center">
        <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
          <Calendar className="w-6 h-6" />
        </div>
        <p className="text-slate-500 font-medium">Inget planerat denna dag.</p>
        <button className="mt-4 text-blue-600 font-bold text-sm hover:underline">
          + Lägg till aktivitet
        </button>
      </div>
    </div>
  );
};

export default DayDetailCard;