
import React, { useState, useEffect } from 'react';
import { Package, PackageOpen, Check, Loader2, Dumbbell, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../firebase';
import { STAGE_NAMES } from '../utils/textConstants';
import { Exercise } from '../types';

interface StageRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  stage: number;
  joint: string;
  isNewUnlock: boolean; // True if just clicked to open, False if already opened (history view)
}

const StageRewardModal = ({ isOpen, onClose, level, stage, joint, isNewUnlock }: StageRewardModalProps) => {
  if (!isOpen) return null;

  const [animState, setAnimState] = useState<'closed' | 'opening' | 'open'>(isNewUnlock ? 'closed' : 'open');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Text Config
  const levelConfig = STAGE_NAMES[level as keyof typeof STAGE_NAMES] || { title: `Level ${level}`, stages: {} };
  const stageName = (levelConfig.stages as any)[stage] || `Etapp ${stage}`;

  // Fetch Exercises for this stage
  useEffect(() => {
    const loadRewards = async () => {
      setLoading(true);
      const docId = `${joint.toLowerCase()}_${level}`;
      try {
        const doc = await db.collection('levels').doc(docId).get();
        if (doc.exists) {
          const data = doc.data();
          const stageKey = `stage${stage}_ids`;
          const ids: string[] = data?.[stageKey] || [];
          
          if (ids.length > 0) {
             // Fetch actual exercise docs to get titles/images
             const promises = ids.map(id => db.collection('exercises').doc(id).get());
             const snapshots = await Promise.all(promises);
             const loaded = snapshots.map(s => ({ id: s.id, ...s.data() } as Exercise));
             setExercises(loaded);
          }
        }
      } catch (e) {
        console.error("Failed to load rewards", e);
      } finally {
        setLoading(false);
      }
    };
    loadRewards();
  }, [level, stage, joint]);

  const handleOpen = () => {
    setAnimState('opening');
    
    // Shake animation
    setTimeout(() => {
        setAnimState('open');
        triggerConfetti();
        triggerHaptics();
    }, 800);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
  };

  const triggerHaptics = () => {
      if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  // Reusable Chest Visual for consistency between Closed and Opening states
  const ChestVisual = ({ animate = false }) => (
    <div className={`relative w-48 h-48 flex items-center justify-center ${animate ? 'animate-bounce-subtle' : ''}`}>
        {/* Glow Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        
        {/* The Box */}
        <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-4 border-yellow-500 shadow-2xl flex items-center justify-center transform transition-transform duration-300 hover:scale-105 group-hover:border-yellow-400 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]">
            <Package className="w-20 h-20 text-yellow-400 drop-shadow-md" strokeWidth={1.5} />
            
            {/* Corner Badge */}
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-yellow-950 p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                <Star className="w-4 h-4 fill-current" />
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
       {/* Dark Glass Background */}
       <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={onClose}></div>
       
       <div className="relative w-full max-w-sm flex flex-col items-center justify-center text-center z-10">
          
          {/* --- ANIMATION PHASE: CLOSED --- */}
          {animState === 'closed' && (
              <div className="animate-scale-in flex flex-col items-center w-full">
                  {/* Header Text */}
                  <div className="text-white mb-12 space-y-1">
                      <h2 className="text-xs font-bold tracking-[0.2em] text-yellow-400 uppercase flex items-center justify-center gap-2">
                          <Sparkles className="w-3 h-3" /> Belöning Upplåst
                      </h2>
                      <h1 className="text-4xl font-black tracking-tight">{stageName}</h1>
                  </div>

                  {/* Clickable Area */}
                  <div 
                    onClick={handleOpen}
                    className="group cursor-pointer flex flex-col items-center gap-8"
                  >
                      <ChestVisual animate={true} />

                      <button className="px-10 py-4 bg-white text-slate-900 rounded-full font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-all active:scale-95">
                          Öppna Belöning
                      </button>
                  </div>
              </div>
          )}

          {/* --- ANIMATION PHASE: OPENING --- */}
          {animState === 'opening' && (
               <div className="animate-shake flex flex-col items-center">
                   <div className="mb-12 opacity-0">Placeholder</div> {/* Spacing keeper */}
                   <ChestVisual animate={false} />
                   <div className="mt-8 opacity-0">Placeholder</div>
               </div>
          )}

          {/* --- ANIMATION PHASE: OPEN / REVEAL --- */}
          {animState === 'open' && (
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-[2rem] p-6 w-full shadow-2xl animate-slide-up backdrop-blur-md relative overflow-hidden">
                   
                   {/* Background Decor */}
                   <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>

                   {/* Header */}
                   <div className="flex flex-col items-center mb-6 relative z-10">
                       <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg -mt-16 mb-4 border-4 border-slate-800 ring-4 ring-yellow-500/20">
                           <PackageOpen className="w-10 h-10 text-slate-900" strokeWidth={2} />
                       </div>
                       <h2 className="text-yellow-400 font-bold text-xs uppercase tracking-widest mb-1">
                           {isNewUnlock ? 'Upplåst!' : 'Avklarad Etapp'}
                       </h2>
                       <h1 className="text-2xl font-black text-white leading-tight">
                           {stageName}
                       </h1>
                   </div>

                   {/* Exercises List */}
                   <div className="bg-slate-900/60 rounded-2xl p-5 mb-6 text-left border border-slate-700/50">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <Dumbbell className="w-3 h-3" /> Nya övningar i ditt schema
                       </h3>
                       
                       {loading ? (
                           <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                       ) : exercises.length > 0 ? (
                           <div className="space-y-3">
                               {exercises.map((ex, idx) => (
                                   <div 
                                     key={ex.id} 
                                     className="flex items-center gap-3 animate-fade-in-right p-2 rounded-lg hover:bg-white/5 transition-colors"
                                     style={{ animationDelay: `${idx * 100}ms` }}
                                   >
                                       {ex.imageUrl ? (
                                           <img src={ex.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700" alt="" />
                                       ) : (
                                           <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                                               <Star className="w-4 h-4 text-slate-600" />
                                           </div>
                                       )}
                                       <div className="flex-1 min-w-0">
                                           <p className="text-sm font-bold text-white leading-tight truncate">{ex.title}</p>
                                           <p className="text-[10px] text-slate-400 uppercase tracking-wide">{ex.category || 'Övning'}</p>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <p className="text-sm text-slate-500 text-center py-2">Inga specifika övningar hittades.</p>
                       )}
                   </div>

                   <button 
                     onClick={onClose}
                     className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-lg shadow-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 transform active:scale-[0.98]"
                   >
                       <Check className="w-5 h-5" strokeWidth={3} /> Toppen, tack!
                   </button>
              </div>
          )}

       </div>
    </div>
  );
};

export default StageRewardModal;
