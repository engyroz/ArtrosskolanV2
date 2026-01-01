
import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, AlertTriangle, ShieldCheck, Play, Award, RotateCcw } from 'lucide-react';
import { BOSS_FIGHT_DATA, BOSS_FIGHT_TITLES, BossQuestion } from '../utils/textConstants';
import BunnyPlayer from './BunnyPlayer';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';
import { GENERIC_VICTORY_VIDEO_ID } from '../utils/contentConfig';

interface BossFightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  level: number;
  joint: string;
  introVideoId?: string;
}

type Phase = 'INTRO' | 'TESTING' | 'SUCCESS' | 'FAILURE';

const BossFightModal = ({ isOpen, onClose, onSuccess, level, joint, introVideoId }: BossFightModalProps) => {
  const { user, refreshProfile } = useAuth();
  
  const [phase, setPhase] = useState<Phase>('INTRO');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<BossQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize joint string to match data keys
  const normalizedJoint = (joint || 'knee').toLowerCase().replace('ä', 'a').replace('ö', 'o');
  // Fallback to knee if data missing
  const jointData = BOSS_FIGHT_DATA[normalizedJoint] || BOSS_FIGHT_DATA['knee'];
  const questions = jointData[level] || [];

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPhase('INTRO');
      setCurrentQuestionIndex(0);
      setFailedQuestions([]);
    }
  }, [isOpen]);

  // Persist state (basic)
  useEffect(() => {
    if (isOpen && user && phase === 'TESTING') {
       // Ideally save to DB here, but for simplicity we keep local
       // If strict persistence required: db.collection('users').doc(user.uid).update({ bossFightIndex: currentQuestionIndex })
    }
  }, [currentQuestionIndex, phase, isOpen, user]);

  if (!isOpen) return null;

  // --- ACTIONS ---

  const handleStart = () => {
    setPhase('TESTING');
  };

  const handleAnswer = (success: boolean) => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);

    if (!success) {
      setFailedQuestions(prev => [...prev, questions[currentQuestionIndex]]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      // Next Question
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 200);
    } else {
      // Finish Test
      const hasFailures = !success || failedQuestions.length > 0;
      if (hasFailures) {
        setPhase('FAILURE');
      } else {
        handleVictory();
      }
    }
  };

  const handleVictory = async () => {
    setPhase('SUCCESS');
    triggerConfetti();
    
    // DB Update
    if (user && !isSaving) {
        setIsSaving(true);
        try {
            const nextLevel = level + 1;
            await db.collection('users').doc(user.uid).update({
                currentLevel: nextLevel,
                "progression.experiencePoints": 0,
                "progression.currentStage": 1,
                "progression.levelMaxedOut": false,
                "progression.currentPhase": 1
            });
            await refreshProfile();
        } catch (e) {
            console.error("Level up failed", e);
        } finally {
            setIsSaving(false);
        }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  // --- RENDERERS ---

  const renderIntro = () => (
    <div className="flex flex-col h-full bg-white">
        <div className="w-full aspect-video bg-black sticky top-0 z-10">
            {introVideoId ? (
                <BunnyPlayer videoId={introVideoId} title="Boss Fight Intro" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Play className="w-12 h-12 mb-2 opacity-50" />
                    <p>Intro Video</p>
                </div>
            )}
        </div>
        
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShieldCheck className="w-8 h-8 text-yellow-600" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                Nivåtest {level}
             </h2>
             <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">
                Är du redo för nästa nivå? Se videon ovan och svara ärligt på frågorna för att säkerställa att kroppen håller.
             </p>
             <button 
                onClick={handleStart}
                className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
             >
                Starta Testet <ArrowRight className="w-5 h-5" />
             </button>
        </div>
    </div>
  );

  const renderTesting = () => {
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Video Header (Small) */}
            <div className="w-full aspect-[21/9] bg-black opacity-90 pointer-events-none">
                 {/* Re-use video but smaller/background feel */}
                 {introVideoId && <BunnyPlayer videoId={introVideoId} title="Boss Context" />}
            </div>

            {/* Question Card */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center -mt-8 relative z-10">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 min-h-[400px] flex flex-col">
                    
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Fråga {currentQuestionIndex + 1} av {questions.length}
                        </span>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xl">
                            {currentQuestionIndex + 1}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-auto leading-tight">
                        {question.text}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button 
                            onClick={() => handleAnswer(false)}
                            className="py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                            Nej / Osäker
                        </button>
                        <button 
                            onClick={() => handleAnswer(true)}
                            className="py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-transform active:scale-95"
                        >
                            Ja, absolut
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-200">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
  };

  const renderSuccess = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden">
         {/* Victory Video */}
         <div className="w-full aspect-video bg-black z-10">
            <BunnyPlayer videoId={GENERIC_VICTORY_VIDEO_ID} title="Victory!" />
         </div>

         <div className="flex-1 p-8 flex flex-col items-center text-center z-10 overflow-y-auto">
             <div className="mb-6 animate-bounce-subtle">
                <span className="inline-block px-3 py-1 bg-yellow-500 text-yellow-950 text-xs font-black rounded-full uppercase tracking-widest mb-2">
                    Level Up
                </span>
             </div>
             
             <h1 className="text-4xl font-black mb-2 leading-none text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200">
                {BOSS_FIGHT_TITLES[level as keyof typeof BOSS_FIGHT_TITLES] || "Mästare"}
             </h1>
             <p className="text-slate-400 font-medium mb-8">
                Du har bemästrat nivå {level} och är nu redo för nya utmaningar.
             </p>

             {/* Unlocks */}
             <div className="w-full max-w-sm bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8 backdrop-blur-sm">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Upplåst innehåll
                </h4>
                <ul className="space-y-3 text-left">
                    <li className="flex items-center gap-3 text-sm font-bold">
                        <div className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center">
                            <Check className="w-3 h-3" />
                        </div>
                        Nya, tyngre övningar
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Check className="w-3 h-3" />
                        </div>
                        Fas {level + 1} Utbildning
                    </li>
                </ul>
             </div>

             <button 
                onClick={onSuccess}
                disabled={isSaving}
                className="w-full max-w-xs py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-transform"
             >
                {isSaving ? 'Sparar...' : 'Fortsätt resan'}
             </button>
         </div>

         {/* Bg FX */}
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900 pointer-events-none"></div>
    </div>
  );

  const renderFailure = () => (
    <div className="flex flex-col h-full bg-slate-50 relative">
        <div className="p-4 bg-white shadow-sm z-10 flex justify-between items-center sticky top-0">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Resultat
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                    <RotateCcw className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Inte riktigt där än</h3>
                <p className="text-slate-600 text-sm">
                    Du behöver lite mer tid för att bygga upp tåligheten. Det är helt normalt och en del av processen.
                </p>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
                Dina fokusområden
            </h4>
            
            <div className="space-y-4">
                {failedQuestions.map(q => (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border-l-4 border-orange-400 shadow-sm">
                        <p className="font-bold text-slate-900 text-sm mb-2 opacity-80">"{q.text}"</p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {q.failFeedback}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 z-10 sticky bottom-0">
            <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800"
            >
                Jag förstår, jag tränar vidare
            </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-fade-in sm:rounded-3xl sm:inset-4 sm:shadow-2xl sm:overflow-hidden max-w-md sm:mx-auto">
        {phase === 'INTRO' && renderIntro()}
        {phase === 'TESTING' && renderTesting()}
        {phase === 'SUCCESS' && renderSuccess()}
        {phase === 'FAILURE' && renderFailure()}
    </div>
  );
};

export default BossFightModal;
