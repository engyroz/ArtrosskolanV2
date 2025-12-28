
import React, { useState, useEffect } from 'react';
import { Package, PackageOpen, Check, Loader2, Dumbbell, Star } from 'lucide-react';
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
             // Note: In production, consider a simpler "bulk fetch" or just storing titles in the level config
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
       {/* Dark Glass Background */}
       <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose}></div>
       
       <div className="relative w-full max-w-sm flex flex-col items-center justify-center text-center">
          
          {/* --- ANIMATION PHASE: CLOSED --- */}
          {animState === 'closed' && (
              <div className="animate-scale-in flex flex-col items-center">
                  <div className="text-white mb-8 space-y-2">
                      <h2 className="text-sm font-bold tracking-widest text-yellow-400 uppercase">Belöning Tillgänglig</h2>
                      <h1 className="text-3xl font-black">{stageName}</h1>
                  </div>

                  <button 
                    onClick={handleOpen}
                    className="relative group cursor-pointer"
                  >
                      <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                      <div className="w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-4 border-yellow-500 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                         <Package className="w-20 h-20 text-yellow-400 animate-bounce-subtle" />
                      </div>
                      <div className="mt-8 bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                          Öppna Belöning
                      </div>
                  </button>
              </div>
          )}

          {/* --- ANIMATION PHASE: OPENING --- */}
          {animState === 'opening' && (
               <div className="animate-shake">
                   <div className="w-40 h-40 bg-slate-800 rounded-3xl border-4 border-white flex items-center justify-center shadow-2xl">
                         <Package className="w-20 h-20 text-white" />
                   </div>
               </div>
          )}

          {/* --- ANIMATION PHASE: OPEN / REVEAL --- */}
          {animState === 'open' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 w-full shadow-2xl animate-slide-up backdrop-blur-md">
                   
                   {/* Header */}
                   <div className="flex flex-col items-center mb-6">
                       <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg -mt-14 mb-4 border-4 border-slate-800">
                           <PackageOpen className="w-8 h-8 text-slate-900" />
                       </div>
                       <h2 className="text-yellow-400 font-bold text-xs uppercase tracking-widest mb-1">
                           {isNewUnlock ? 'Upplåst!' : 'Avklarad Etapp'}
                       </h2>
                       <h1 className="text-2xl font-black text-white leading-tight">
                           {stageName}
                       </h1>
                   </div>

                   {/* Exercises List */}
                   <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 text-left border border-slate-700/50">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <Dumbbell className="w-3 h-3" /> Dina nya verktyg
                       </h3>
                       
                       {loading ? (
                           <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                       ) : exercises.length > 0 ? (
                           <div className="space-y-3">
                               {exercises.map((ex, idx) => (
                                   <div 
                                     key={ex.id} 
                                     className="flex items-center gap-3 animate-fade-in-right"
                                     style={{ animationDelay: `${idx * 100}ms` }}
                                   >
                                       {ex.imageUrl ? (
                                           <img src={ex.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-800" alt="" />
                                       ) : (
                                           <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                               <Star className="w-4 h-4 text-slate-600" />
                                           </div>
                                       )}
                                       <div>
                                           <p className="text-sm font-bold text-white leading-tight">{ex.title}</p>
                                           <p className="text-[10px] text-slate-400">{ex.category || 'Övning'}</p>
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
                     className="w-full py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                   >
                       <Check className="w-5 h-5" /> Toppen!
                   </button>
              </div>
          )}

       </div>
    </div>
  );
};

export default StageRewardModal;
