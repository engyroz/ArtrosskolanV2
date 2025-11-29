import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { WorkoutSession, ExertionLevel } from '../types';
import { calculateSessionProgression } from '../utils/progressionEngine';
import { toLocalISOString } from '../utils/dateHelpers';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Play, Pause, CheckCircle, ChevronRight, Clock, Info } from 'lucide-react';

const WorkoutPlayer = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // Expecting { session: WorkoutSession }
  const { userProfile, refreshProfile } = useAuth();
  const { currentDate } = useTime(); // Use simulated date
  
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Timer State (for Level 1/Isometric)
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Feedback State
  const [painScore, setPainScore] = useState(2);
  const [exertion, setExertion] = useState<ExertionLevel>('perfect');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state && state.session) {
      setSession(state.session);
    } else {
      navigate('/dashboard'); // Fallback if no session passed
    }
  }, [state, navigate]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Optional: Play sound?
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  if (!session || !userProfile) return null;

  const currentExercise = session.exercises[currentIndex];
  const isLastExercise = currentIndex === session.exercises.length - 1;
  const progressPct = ((currentIndex) / session.exercises.length) * 100;

  // --- Handlers ---

  const handleNextExercise = () => {
    if (isLastExercise) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setTimerActive(false);
    }
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const handleFinishSession = async () => {
    setSaving(true);
    
    // 1. Calc Progression
    const exerciseIds = session.exercises.map(e => e.id);
    const result = calculateSessionProgression(
        userProfile, 
        exerciseIds, 
        exertion, 
        painScore
    );

    // 2. Update Firestore
    try {
        const userRef = doc(db, 'users', userProfile.uid);
        
        // Log Entry using SIMULATED DATE
        const newLog = {
            date: toLocalISOString(currentDate), // Correctly use the time travel date
            type: session.type,
            completedAt: new Date().toISOString(), // Keep timestamp real for audit
            painScore,
            exertion,
            feedbackMessage: result.message,
            xpEarned: result.xpEarned
        };

        await updateDoc(userRef, {
            activityHistory: arrayUnion(newLog),
            "progression.experiencePoints": (userProfile.progression?.experiencePoints || 0) + result.xpEarned,
            exerciseProgress: result.updatedProgress, // Save the new config/history
            "progression.levelMaxedOut": result.levelMaxedOut
        });

        await refreshProfile();
        navigate('/dashboard');

    } catch (e) {
        console.error("Error saving session:", e);
    } finally {
        setSaving(false);
    }
  };

  // --- Views ---

  if (isComplete) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-6 text-green-600">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bra jobbat!</h1>
                <p className="text-slate-500 mb-8">Passet är avklarat. Hur kändes det?</p>

                {/* Feedback Form */}
                <div className="text-left space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Smärta under passet (0-10)</label>
                        <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-blue-600 text-xl w-8">{painScore}</span>
                            <input 
                                type="range" min="0" max="10" 
                                value={painScore} 
                                onChange={(e) => setPainScore(parseInt(e.target.value))}
                                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ansträngning</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'light', label: 'Lätt', emoji: '🪶' },
                                { id: 'perfect', label: 'Lagom', emoji: '👌' },
                                { id: 'heavy', label: 'Tungt', emoji: '🥵' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setExertion(opt.id as any)}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${exertion === opt.id ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <span className="text-2xl">{opt.emoji}</span>
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleFinishSession}
                    disabled={saving}
                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                    {saving ? 'Sparar...' : 'Spara & Avsluta'}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* 1. Header & Progress */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Övning {currentIndex + 1} av {session.exercises.length}
        </span>
        <div className="w-6"></div> {/* Spacer */}
      </div>
      <div className="w-full bg-slate-100 h-1">
        <div className="bg-blue-600 h-1 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
      </div>

      {/* 2. Media Area */}
      <div className="flex-grow bg-slate-50 relative flex items-center justify-center overflow-hidden">
        {currentExercise.imageUrl && (
            <img 
                src={currentExercise.imageUrl} 
                className="w-full h-full object-contain max-h-[40vh]" 
                alt={currentExercise.title} 
            />
        )}
        
        {/* Timer Overlay (if active) */}
        {timerActive && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                <div className="text-center text-white">
                    <div className="text-8xl font-black font-mono mb-4">{timeLeft}</div>
                    <button 
                        onClick={() => setTimerActive(false)}
                        className="px-6 py-2 border border-white/30 rounded-full text-sm font-bold hover:bg-white/10"
                    >
                        Pausa
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* 3. Instructions & Controls */}
      <div className="p-6 pb-8 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] -mt-6 relative z-10">
        <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{currentExercise.title}</h2>
            <div className="flex items-center gap-3 text-slate-500 font-medium mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                    {currentExercise.config.sets} set
                </span>
                <span className="text-xl font-bold text-slate-900">
                    x {currentExercise.config.reps} {currentExercise.level === 1 ? 'sek' : 'reps'}
                </span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100">
                {Array.isArray(currentExercise.instructions) 
                    ? currentExercise.instructions.join(' ') 
                    : currentExercise.instructions}
            </div>
        </div>

        {/* Action Button */}
        {currentExercise.level === 1 && !timerActive ? (
            <button 
                onClick={() => startTimer(currentExercise.config.reps)} // Using reps as seconds for lvl 1
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 flex items-center justify-center transition-all active:scale-[0.98]"
            >
                <Clock className="w-6 h-6 mr-2" /> Starta Timer ({currentExercise.config.reps}s)
            </button>
        ) : (
            <button 
                onClick={handleNextExercise}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 flex items-center justify-center transition-all active:scale-[0.98]"
            >
                {isLastExercise ? 'Avsluta Passet' : 'Nästa Övning'} <ChevronRight className="w-6 h-6 ml-2" />
            </button>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlayer;