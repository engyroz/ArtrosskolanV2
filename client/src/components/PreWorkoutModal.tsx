import React from 'react';
import { X, Play, AlertCircle } from 'lucide-react';
import { PRE_FLIGHT_MESSAGES } from '../utils/textConstants';

interface PreWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  level: number;
  type: 'rehab' | 'circulation';
}

const PreWorkoutModal = ({ isOpen, onClose, onStart, level, type }: PreWorkoutModalProps) => {
  if (!isOpen) return null;

  // Get dynamic text safely
  const levelKey = `level_${level}` as keyof typeof PRE_FLIGHT_MESSAGES;
  const messages = PRE_FLIGHT_MESSAGES[levelKey] || PRE_FLIGHT_MESSAGES['level_1'];
  const content = messages[type];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Innan vi börjar...</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          
          <div className="mb-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
            {content.title}
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            {content.body}
          </p>
        </div>

        <div className="bg-slate-50 px-8 py-6 border-y border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Smärtmodellen</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 rounded-full bg-green-500 mt-1 shadow-sm flex-shrink-0"></div>
              <div>
                <span className="block font-bold text-slate-800 text-sm">0-2: Ingen fara</span>
                <span className="text-xs text-slate-500">Kör på som vanligt.</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 rounded-full bg-yellow-400 mt-1 shadow-sm flex-shrink-0"></div>
              <div>
                <span className="block font-bold text-slate-800 text-sm">3-5: Acceptabelt</span>
                <span className="text-xs text-slate-500">Det är okej, så länge det lägger sig efteråt.</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 rounded-full bg-red-500 mt-1 shadow-sm flex-shrink-0"></div>
              <div>
                <span className="block font-bold text-slate-800 text-sm">6-10: Stopp</span>
                <span className="text-xs text-slate-500">Avbryt eller vila om smärtan stiger hit.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white">
          <button 
            onClick={onStart}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center"
          >
            Jag förstår – Nu kör vi! <Play className="h-5 w-5 ml-2 fill-current" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreWorkoutModal;