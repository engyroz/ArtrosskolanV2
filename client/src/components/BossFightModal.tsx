import React, { useState } from 'react';
import { X, Swords, Check, AlertCircle } from 'lucide-react';
import { BOSS_FIGHT_QUESTIONS } from '../utils/textConstants';

interface BossFightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  level: number;
}

const BossFightModal = ({ isOpen, onClose, onSuccess, level }: BossFightModalProps) => {
  if (!isOpen) return null;

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showFailure, setShowFailure] = useState(false);

  // Get questions for the CURRENT level (to leave it)
  // e.g. Level 1 questions determine if you can go to Level 2
  const questions = BOSS_FIGHT_QUESTIONS[level as keyof typeof BOSS_FIGHT_QUESTIONS] || [];

  const handleToggle = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setShowFailure(false);
  };

  const handleSubmit = () => {
    const allChecked = questions.every(q => answers[q.id]);
    
    if (allChecked) {
      onSuccess();
    } else {
      setShowFailure(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400">
        
        {/* Header */}
        <div className="bg-yellow-400 p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-yellow-900/70 hover:text-yellow-900">
            <X className="w-6 h-6" />
          </button>
          <div className="inline-flex items-center justify-center h-16 w-16 bg-white rounded-full mb-3 shadow-lg">
            <Swords className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-black text-yellow-900 uppercase tracking-wider mb-1">
            Boss Fight
          </h2>
          <p className="text-yellow-800 font-bold text-sm uppercase tracking-wide">
            Test för att lämna Nivå {level}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-center text-slate-600 mb-8 font-medium">
            För att gå vidare till nästa nivå måste din kropp klara följande krav. Var ärlig mot dig själv!
          </p>

          <div className="space-y-4 mb-8">
            {questions.map((q) => {
              const isChecked = !!answers[q.id];
              return (
                <div 
                  key={q.id} 
                  onClick={() => handleToggle(q.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isChecked 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-4 h-4" />}
                  </div>
                  <span className={`font-medium ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                    {q.text}
                  </span>
                </div>
              );
            })}
          </div>

          {showFailure && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex gap-3 text-orange-800 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>
                    Du är nära, men inte riktigt där än! Fortsätt träna på nuvarande nivå i 2 veckor till så testar vi igen.
                </p>
            </div>
          )}

          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 hover:scale-[1.02] transition-all"
          >
            Jag klarar alla krav
          </button>
        </div>

      </div>
    </div>
  );
};

export default BossFightModal;