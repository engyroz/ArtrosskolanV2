import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { WorkoutSession, ExertionLevel } from '../types';
import { calculateProgressionUpdate } from '../utils/progressionEngine';
import { toLocalISOString } from '../utils/dateHelpers';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { X, CheckCircle, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';

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

  // Visual State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  useEffect(() => {
    if (state && state.session) {
      setSession(state.session);
    } else {
      console.warn("No session state found, redirecting to dashboard");
      navigate('/dashboard'); 
    }
  }, [state, navigate]);

  const currentExercise = session?.exercises[currentIndex];

  // Image Slideshow Logic
  useEffect(() => {
    if (!currentExercise) return;
    
    // Reset state on exercise change
    setActiveImageIndex(0);
    setInstructionsExpanded(false);

    const images = currentExercise.imageUrls || (currentExercise.imageUrl ? [currentExercise.imageUrl] : []);
    
    if (images.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % images.length);
      }, 3000); // 3 seconds per image
      return () => clearInterval(interval);
    }
  }, [currentExercise]);

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
  if (!currentExercise) return null; 

  const isLastExercise = currentIndex === session.exercises.length - 1;
  const progressPct = ((currentIndex + 1) / session.exercises.length) * 100;

  // --- Handlers ---

  const handleNextExercise = () => {
    if (isLastExercise) {
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

    const activityType = session.type === 'rehab' ? 'REHAB_SESSION' : 'DAILY_MEDICINE';
    const result = calculateProgressionUpdate(userProfile, activityType);
    
    // New total sessions count for logic
    const currentSessions = userProfile.progression?.lifetimeSessions || 0;
    const newSessionCount = session.type === 'rehab' ? currentSessions + 1 : currentSessions;

    try {
        const userRef = db.collection('users').doc(userProfile.uid);
        
        const newLog = {
            date: toLocalISOString(currentDate), 
            type: session.type,
            completedAt: new Date().toISOString(), 
            painScore: finalPain,
            exertion: finalExertion,
            feedbackMessage: result.message,
            xpEarned: result.xpEarned
        };

        const updatePayload: any = {
            activityHistory: firebase.firestore.FieldValue.arrayUnion(newLog),
            "progression.experiencePoints": result.newTotalXP,
            "progression.currentStage": result.newStage,
            "progression.levelMaxedOut": result.levelMaxedOut
        };

        if (session.type === 'rehab') {
            updatePayload["progression.lifetimeSessions"] = firebase.firestore.FieldValue.increment(1);
        }

        await userRef.update(updatePayload);
        await refreshProfile();
        
        // Navigate to Summary instead of Dashboard
        navigate('/summary', { 
            state: {
                xpEarned: result.xpEarned,
                newTotalXP: result.newTotalXP,
                levelMaxedOut: result.levelMaxedOut,
                sessionType: session.type,
                painScore: finalPain,
                exertion: finalExertion,
                lifetimeSessions: newSessionCount,
                stageUp: result.stageUp, 
                newStage: result.newStage
            }
        });

    } catch (e) {
        console.error("Error saving session:", e);
    } finally {
        setSaving(false);
    }
  };

  // --- Complete View ---
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

  // --- Active Player View ---
  
  const unit = (currentExercise.level === 1 || session.type === 'circulation') ? 'sek' : 'reps';
  const displayImages = currentExercise.imageUrls || (currentExercise.imageUrl ? [currentExercise.imageUrl] : []);
  const currentImage = displayImages[activeImageIndex];
  const instructionsText = Array.isArray(currentExercise.instructions) 
      ? currentExercise.instructions.join(' ') 
      : currentExercise.instructions;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. Header & Progress */}
      <div className="flex-none bg-white z-20">
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {session.type === 'circulation' ? 'Cirkulation' : 'Rehabstyrka'}
            </span>
            <div className="w-6 text-right text-xs font-bold text-slate-900">
                {currentIndex + 1}/{session.exercises.length}
            </div> 
        </div>
        <div className="w-full bg-slate-100 h-1">
            <div className="bg-blue-600 h-1 transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      {/* 2. Image Area (The Star) */}
      <div className="flex-1 relative bg-slate-100 flex items-center justify-center overflow-hidden w-full max-h-[55vh]">
        {currentImage && (
            <div className="w-full h-full relative">
                {displayImages.map((img, idx) => (
                    <img 
                        key={idx}
                        src={img} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        alt={currentExercise.title} 
                    />
                ))}
                
                {/* Image Dots Indicator */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {displayImages.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'bg-blue-600 w-3' : 'bg-slate-300'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 3. Controls & Info (Bottom Sheet Style) */}
      <div className="flex-none bg-white rounded-t-3xl -mt-6 relative z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex flex-col">
        
        {/* Content Scroll Container */}
        <div className="p-6 pb-2 overflow-y-auto max-h-[35vh]">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-slate-900 leading-tight max-w-[70%]">
                    {currentExercise.title}
                </h2>
                <div className="flex flex-col items-end">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold uppercase mb-1">
                        {currentExercise.config.sets} x {currentExercise.config.reps}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {unit === 'sek' ? 'Sekunder' : 'Repetitioner'}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all">
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-3 h-3" /> Instruktioner
                </div>
                <p className={`text-slate-600 text-sm leading-relaxed ${instructionsExpanded ? '' : 'line-clamp-2'}`}>
                    {instructionsText}
                </p>
                
                <button 
                    onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                    className="mt-2 text-blue-600 text-xs font-bold flex items-center hover:underline"
                >
                    {instructionsExpanded ? (
                        <>Visa mindre <ChevronUp className="w-3 h-3 ml-1" /></>
                    ) : (
                        <>Läs hela <ChevronDown className="w-3 h-3 ml-1" /></>
                    )}
                </button>
            </div>
        </div>

        {/* Fixed Bottom Action */}
        <div className="p-4 bg-white border-t border-slate-50">
            <button 
                onClick={handleNextExercise}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 flex items-center justify-center transition-all active:scale-[0.98]"
            >
                {isLastExercise ? (session.type === 'circulation' ? 'Avsluta' : 'Klar') : 'Nästa'} 
                <ChevronRight className="w-6 h-6 ml-2" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default WorkoutPlayer;