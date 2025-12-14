
import React from 'react';
import { useTime } from '../contexts/TimeContext';
import { Clock, Rewind, FastForward, RotateCcw } from 'lucide-react';

const TimeTravelDebug = () => {
  // Only show in development environment (optional, but good practice)
  // const isDev = import.meta.env.DEV;
  // if (!isDev) return null;

  const { currentDate, addDays, subDays, reset, isDebugVisible } = useTime();

  if (!isDebugVisible) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  const isSimulating = new Date().toDateString() !== currentDate.toDateString();

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-fade-in">
      <div className={`bg-slate-900/90 backdrop-blur-md text-slate-200 p-4 rounded-xl border ${isSimulating ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-slate-700 shadow-xl'}`}>
        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clock className="w-3 h-3" />
            Time Travel Debug
          </div>
          {isSimulating && (
            <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">
              ACTIVE
            </span>
          )}
        </div>

        <div className="text-center mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Simulating</div>
          <div className="text-xl font-bold font-mono text-white">
            {formatDate(currentDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => subDays(1)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Previous Day"
          >
            <Rewind className="w-4 h-4" />
          </button>
          
          <button 
            onClick={reset}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
            title="Reset to Real Time"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>

          <button 
            onClick={() => addDays(1)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Next Day"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelDebug;
