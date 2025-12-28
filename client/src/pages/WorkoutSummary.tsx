
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Lock, Map, Video, Zap, Star, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { getMaxXP } from '../utils/progressionEngine';

interface LocationState {
  xpEarned: number;
  newTotalXP: number;
  levelMaxedOut: boolean;
  sessionType: 'rehab' | 'circulation';
  painScore: number;
  exertion: string;
  lifetimeSessions: number;
  stageUp?: boolean; // New
  newStage?: number; // New
}

const WorkoutSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const state = location.state as LocationState;

  // --- STATE ---
  const [displayedXP, setDisplayedXP] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [animationsDone, setAnimationsDone] = useState(false);

  // Safety check: redirect if no state (direct access)
  useEffect(() => {
    if (!state) {
      navigate('/dashboard');
    }
  }, [state, navigate]);

  if (!state || !userProfile) return null;

  // --- AUDIO & HAPTICS ---
  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const triggerHaptics = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // --- MOUNT EFFECT ---
  useEffect(() => {
    // 1. Confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#fbbf24']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // 2. Audio & Haptics
    playSuccessSound();
    triggerHaptics();

    // 3. XP Animation
    const targetXP = state.xpEarned;
    const durationXP = 1500; // ms
    const startTime = performance.now();

    const animateXP = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationXP, 1);
      
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayedXP(Math.floor(targetXP * ease));

      if (progress < 1) {
        requestAnimationFrame(animateXP);
      } else {
        setShowBonus(true);
        setTimeout(() => setAnimationsDone(true), 500);
      }
    };
    requestAnimationFrame(animateXP);

  }, []);

  // --- COPY LOGIC ---
  const getFeedbackCopy = () => {
    if (state.stageUp) {
      return {
          title: "Etapp Avklarad!",
          subtitle: "En belöning väntar på kartan."
      };
    }
    if (state.painScore >= 6) {
      return {
        title: "Klokt beslut.",
        subtitle: "Du lyssnade på kroppen. Det är den viktigaste delen av rehab."
      };
    }
    if (state.exertion === 'heavy') {
      return {
        title: "Starkt jobbat!",
        subtitle: "Det var tufft, men du tog dig igenom det. Det bygger pannben."
      };
    }
    if (state.exertion === 'light') {
      return {
        title: "Bra flyt!",
        subtitle: "Ett lättare pass är perfekt för kontinuitet och cirkulation."
      };
    }
    return {
      title: "Snyggt jobbat!",
      subtitle: "Ytterligare ett steg mot en starkare kropp."
    };
  };

  const copy = getFeedbackCopy();
  
  // --- PROGRESS CALCS ---
  
  // Lecture Logic (Next Threshold)
  const unlockThresholds = [0, 3, 6, 12, 20]; // Example thresholds matching seed.js
  const currentCount = state.lifetimeSessions;
  const nextThreshold = unlockThresholds.find(t => t > currentCount) || currentCount + 5;
  const sessionsLeft = Math.max(0, nextThreshold - currentCount);
  const lectureProgress = Math.min(100, (currentCount / nextThreshold) * 100);

  // Stage Logic
  const currentLevel = userProfile.currentLevel;
  const maxLevelXP = getMaxXP(currentLevel);
  const currentTotalXP = state.newTotalXP;
  const stageProgress = Math.min(100, (currentTotalXP / maxLevelXP) * 100);
  
  // Is this a high quality session? (Bonus Visual)
  const isHighQuality = state.exertion === 'perfect' && state.painScore < 5;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-between p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 pointer-events-none"></div>

      {/* 1. Header & XP */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
        
        <div className="animate-float mb-8">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border-4 border-slate-800 ${state.stageUp ? 'bg-yellow-500' : 'bg-gradient-to-br from-blue-500 to-green-500'}`}>
              {state.stageUp ? <Package className="w-12 h-12 text-slate-900 animate-bounce-subtle" /> : <Check className="w-12 h-12 text-white" strokeWidth={4} />}
           </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 leading-tight animate-fade-in-up">
          {copy.title}
        </h1>
        <p className="text-slate-400 text-center mb-10 px-4 animate-fade-in-up delay-100">
          {copy.subtitle}
        </p>

        {/* XP Counter */}
        <div className="relative mb-12 animate-scale-in delay-200">
           <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-mono tracking-tighter">
              +{displayedXP}
           </div>
           <div className="text-center text-blue-400 font-bold tracking-widest text-sm uppercase mt-1">
              XP Intjänat
           </div>
           
           {/* Bonus Pop */}
           {showBonus && isHighQuality && (
              <div className="absolute -right-12 -top-4 animate-bounce-subtle">
                 <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-lg rotate-12 shadow-lg border-2 border-yellow-200">
                    PERFEKT!
                 </div>
              </div>
           )}
        </div>

      </div>

      {/* 2. Progression Cards */}
      <div className="w-full max-w-md space-y-4 mb-8 z-10">
         
         {/* Lecture Progress */}
         <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex items-center gap-4 animate-slide-up delay-300">
            <div className="w-12 h-12 rounded-xl bg-blue-900/50 flex items-center justify-center text-blue-400 flex-shrink-0">
               <Video className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-200">Nästa Lektion</span>
                  <span className="text-xs font-bold text-slate-400">
                     {sessionsLeft === 0 ? 'Upplåst!' : `${sessionsLeft} pass kvar`}
                  </span>
               </div>
               <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: `${lectureProgress}%` }}
                  ></div>
               </div>
            </div>
            {sessionsLeft === 0 ? (
               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Video className="w-4 h-4 text-white fill-current" />
               </div>
            ) : (
               <Lock className="w-5 h-5 text-slate-600" />
            )}
         </div>

         {/* Journey Progress */}
         <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex items-center gap-4 animate-slide-up delay-400">
            <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center text-purple-400 flex-shrink-0">
               <Map className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-200">Mot Nästa Etapp</span>
                  <span className="text-xs font-bold text-slate-400">{Math.round(stageProgress)}%</span>
               </div>
               <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${stageProgress}%` }}
                  ></div>
               </div>
            </div>
            <Star className={`w-5 h-5 ${stageProgress >= 100 ? 'text-yellow-400 fill-current animate-spin-slow' : 'text-slate-600'}`} />
         </div>

      </div>

      {/* 3. CTA */}
      {state.stageUp ? (
         <button 
           onClick={() => navigate('/journey')}
           className="w-full max-w-md py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:bg-yellow-300 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 z-10 animate-pulse delay-500"
         >
           Gå till kartan för att hämta belöning <ArrowRight className="w-6 h-6" />
         </button>
      ) : (
         <button 
           onClick={() => navigate('/dashboard')}
           className="w-full max-w-md py-4 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 z-10 animate-fade-in delay-500"
         >
           Tillbaka till Dashboard <ArrowRight className="w-6 h-6" />
         </button>
      )}

    </div>
  );
};

export default WorkoutSummary;
