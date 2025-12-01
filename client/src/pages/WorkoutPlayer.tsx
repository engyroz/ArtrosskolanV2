import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { WorkoutSession, ExertionLevel } from '../types';
import { calculateSessionProgression } from '../utils/progressionEngine';
import { toLocalISOString } from '../utils/dateHelpers';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { X, CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';

const WorkoutPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any; 
  const { userProfile, refreshProfile } = useAuth();
  const { currentDate } = useTime(); 
  
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const [painScore, setPainScore] = useState(2);
  const [exertion, setExertion] = useState<ExertionLevel>('perfect');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state && state.session) {
      setSession(state.session);
    } else {
      console.warn("No session state found, redirecting to dashboard");
      navigate('/dashboard'); 
    }
  }, [state, navigate]);

  if (!userProfile) return null;

  // --- ERROR STATE: Empty Session ---
  if (session && session.exercises.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Inga övningar hittades</h2>
                <p className="text-slate-600 mb-6">
                    Kunde inte ladda övningar för {session.type === 'circulation' ? 'cirkulation' : 'rehab'}. 
                    Detta kan bero på att inga matchande övningar finns i databasen för din led.
                </p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Tillbaka till Dashboard
                </button>
            </div>
        </div>
      );
  }

  if (!session) return <div className="min-h-screen bg-slate-50"></div>; 

  const currentExercise = session.exercises[currentIndex];
  if (!currentExercise) return null; 

  const isLastExercise = currentIndex === session.exercises.length - 1;
  const progressPct = ((currentIndex) / session.exercises.length) * 100;

  // --- Handlers ---

  const handleNextExercise = () => {
    if (isLastExercise) {
      // If it's circulation, skip feedback and finish immediately
      if (session.type === 'circulation') {
          handleFinishSession(true); 
      } else {
          setIsComplete(true);
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinishSession = async (skipFeedback = false) => {
    setSaving(true);
    
    const finalPain = skipFeedback ? 0 : painScore;
    const finalExertion = skipFeedback ? 'perfect' : exertion;

    const exerciseIds = session.exercises.map(e => e.id);
    const result = calculateSessionProgression(
        userProfile, 
        exerciseIds, 
        finalExertion, 
        finalPain
    );

    const earnedXP = session.type === 'circulation' ? 30 : result.xpEarned;

    try {
        const userRef = db.collection('users').doc(userProfile.uid);
        
        const newLog = {
            date: toLocalISOString(currentDate), 
            type: session.type,
            completedAt: new Date().toISOString(), 
            painScore: finalPain,
            exertion: finalExertion,
            feedbackMessage: result.message,
            xpEarned: earnedXP
        };

        const updatePayload: any = {
            activityHistory: firebase.firestore.FieldValue.arrayUnion(newLog),
            "progression.experiencePoints": (userProfile.progression?.experiencePoints || 0) + earnedXP,
        };

        if (session.type === 'rehab') {
            updatePayload.exerciseProgress = result.updatedProgress;
            updatePayload["progression.levelMaxedOut"] = result.levelMaxedOut;
        }

        await userRef.update(updatePayload);
        await refreshProfile();
        
        navigate('/dashboard', { state: { xpEarned: earnedXP } });

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
                    onClick={() => handleFinishSession(false)}
                    disabled={saving}
                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                    {saving ? 'Sparar...' : 'Spara & Avsluta'}
                </button>
            </div>
        </div>
    );
  }

  // Display 'sek' for Level 1 or Circulation, otherwise 'reps'
  const unit = (currentExercise.level === 1 || session.type === 'circulation') ? 'sek' : 'reps';

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* 1. Header & Progress */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {session.type === 'circulation' ? 'Daglig Medicin' : `Övning ${currentIndex + 1} av ${session.exercises.length}`}
        </span>
        <div className="w-6"></div> 
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
                    x {currentExercise.config.reps} {unit}
                </span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100">
                {Array.isArray(currentExercise.instructions) 
                    ? currentExercise.instructions.join(' ') 
                    : currentExercise.instructions}
            </div>
        </div>

        {/* Action Button: Always 'Next' now, no Timer */}
        <button 
            onClick={handleNextExercise}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 flex items-center justify-center transition-all active:scale-[0.98]"
        >
            {isLastExercise ? (session.type === 'circulation' ? 'Avsluta Passet' : 'Gå till utvärdering') : 'Nästa Övning'} <ChevronRight className="w-6 h-6 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlayer;