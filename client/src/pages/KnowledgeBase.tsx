

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, Lock, CheckCircle, Play, PlayCircle, Video, Book, 
  ChevronRight, ArrowRight, X, Sparkles, HelpCircle, Dumbbell, Apple 
} from 'lucide-react';
import { EDUCATION_MODULES } from '../utils/contentConfig';
import { EducationModule } from '../types';
import { isContentUnlocked, calculateProgressionUpdate } from '../utils/progressionEngine';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

// --- TYPES & HELPERS ---

type ModuleStatus = 'locked' | 'unlocked' | 'completed';

const getModuleStatus = (
  module: EducationModule, 
  userProfile: any
): ModuleStatus => {
  if (userProfile?.completedEducationIds?.includes(module.id)) return 'completed';
  
  const unlocked = isContentUnlocked(userProfile, {
    unlockType: module.unlockType,
    requiredLevel: module.requiredLevel,
    requiredStage: module.requiredStage,
    requiredSessions: module.requiredSessions
  });

  return unlocked ? 'unlocked' : 'locked';
};

// --- COMPONENTS ---

const ReaderOverlay = ({ 
  module, 
  onClose, 
  onComplete 
}: { 
  module: EducationModule, 
  onClose: () => void, 
  onComplete: () => void 
}) => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    // Trigger confetti sound or effect here if desired
    setTimeout(() => {
        onComplete();
    }, 1500); // Wait for animation
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      {/* 1. Sticky Media Header */}
      <div className="relative w-full aspect-video bg-slate-900 sticky top-0 flex-shrink-0">
        <img 
            src={module.imageUrl || 'https://images.unsplash.com/photo-1550505295-69024f2b1c6d'} 
            className="w-full h-full object-cover opacity-80"
            alt={module.title}
        />
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-all z-20"
        >
            <X className="w-6 h-6" />
        </button>
        
        {module.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50">
                    <Play className="w-6 h-6 text-white fill-current ml-1" />
                </div>
            </div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
             <div className="inline-flex items-center bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2">
                 {module.category.toUpperCase()}
             </div>
             <h1 className="text-2xl font-bold text-white leading-tight">{module.title}</h1>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 bg-white">
         <div className="prose prose-slate max-w-none">
             <p className="text-lg text-slate-600 leading-relaxed font-medium">
                 Här skulle själva innehållet för artikeln eller beskrivningen av videon ligga. 
                 Eftersom detta är en prototyp visar vi platshållartext.
             </p>
             <p className="text-slate-600">
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                 Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
             </p>
             <h3>Varför är detta viktigt?</h3>
             <p className="text-slate-600">
                 Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                 Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
             </p>
         </div>
      </div>

      {/* 3. Reward / Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 shadow-lg">
          <div className="max-w-md mx-auto">
              {!completed ? (
                  <button 
                    onClick={handleComplete}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      Markera som klar <span className="text-yellow-400 font-black">+50 XP</span>
                  </button>
              ) : (
                  <div className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 animate-bounce">
                      <CheckCircle className="w-6 h-6" /> Bra jobbat!
                  </div>
              )}
          </div>
      </div>

      {/* Confetti Animation Layer */}
      {completed && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] animate-fade-in"></div>
              <div className="relative text-center animate-scale-up">
                  <Sparkles className="w-24 h-24 text-yellow-500 mx-auto animate-spin-slow" />
                  <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2 drop-shadow-md">XP UPPLÅST!</h2>
              </div>
          </div>
      )}
    </div>
  );
};

const KnowledgeBase = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [readingModule, setReadingModule] = useState<EducationModule | null>(null);

  // --- DATA PREP ---
  const allModules = EDUCATION_MODULES.map(m => ({
    ...m,
    status: getModuleStatus(m, userProfile)
  }));

  // 1. HERO LOGIC
  // Find first UNLOCKED but NOT COMPLETED
  let heroModule = allModules.find(m => m.status === 'unlocked');
  let heroScenario: 'new' | 'grinding' = 'new';
  
  if (!heroModule) {
      // If all unlocked are done, show next LOCKED
      heroModule = allModules.find(m => m.status === 'locked');
      heroScenario = 'grinding';
  }

  // 2. SERIES TRACK (Horizontal)
  const seriesModules = allModules
      .filter(m => m.unlockType === 'lifetime')
      .sort((a, b) => (a.requiredSessions || 0) - (b.requiredSessions || 0));

  // 3. GUIDE TRACK (Vertical)
  // Only current level
  const currentLevel = userProfile?.currentLevel || 1;
  const guideModules = allModules
      .filter(m => m.unlockType === 'level' && m.requiredLevel === currentLevel)
      .sort((a, b) => (a.requiredStage || 0) - (b.requiredStage || 0));
  
  // Group by stage
  const guideByStage: Record<number, typeof guideModules> = {};
  guideModules.forEach(m => {
      const s = m.requiredStage || 1;
      if (!guideByStage[s]) guideByStage[s] = [];
      guideByStage[s].push(m);
  });

  // --- ACTIONS ---

  const handleModuleClick = (module: typeof allModules[0]) => {
      if (module.status === 'locked') {
          // Toast or Shake?
          let reqText = "";
          if (module.unlockType === 'lifetime') {
             const left = (module.requiredSessions || 0) - (userProfile?.progression?.lifetimeSessions || 0);
             reqText = `Kräver ${Math.max(0, left)} pass till.`;
          } else {
             reqText = `Låses upp vid Etapp ${module.requiredStage} i din resa.`;
          }
          alert(`🔒 Låst! ${reqText}`); // Native alert for simplicity in prototype
          return;
      }
      setReadingModule(module);
  };

  const handleFinishReading = async () => {
      if (!user || !userProfile || !readingModule) return;
      
      try {
          const result = calculateProgressionUpdate(userProfile, 'KNOWLEDGE_ARTICLE');
          
          const userRef = db.collection('users').doc(user.uid);
          await userRef.update({
              completedEducationIds: firebase.firestore.FieldValue.arrayUnion(readingModule.id),
              "progression.experiencePoints": result.newTotalXP,
              "progression.currentStage": result.newStage,
              "progression.levelMaxedOut": result.levelMaxedOut
          });
          await refreshProfile();
          setReadingModule(null); // Close modal
      } catch (e) {
          console.error("Failed to mark read", e);
      }
  };

  // --- RENDERERS ---

  const renderHero = () => {
      if (!heroModule) return null;

      if (heroScenario === 'new') {
          return (
              <div className="mb-8 animate-fade-in">
                  <div 
                    onClick={() => handleModuleClick(heroModule!)}
                    className="w-full aspect-[4/3] sm:aspect-[2/1] rounded-3xl relative overflow-hidden shadow-xl group cursor-pointer"
                  >
                      <img 
                        src={heroModule.imageUrl} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                              NYTT!
                          </span>
                      </div>

                      <div className="absolute bottom-0 left-0 p-6 w-full">
                          <span className="text-blue-300 font-bold text-xs uppercase tracking-wider mb-2 block">
                              {heroModule.category}
                          </span>
                          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                              {heroModule.title}
                          </h2>
                          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg group-hover:bg-blue-50 transition-colors">
                              {heroModule.type === 'video' ? <Play className="w-4 h-4 mr-2 fill-current" /> : <BookOpen className="w-4 h-4 mr-2" />}
                              {heroModule.type === 'video' ? 'Spela upp' : 'Läs nu'}
                          </button>
                      </div>
                  </div>
              </div>
          );
      } else {
          // Scenario B: Grinding
          const sessionsLeft = (heroModule.requiredSessions || 0) - (userProfile?.progression?.lifetimeSessions || 0);
          
          return (
              <div className="mb-8 animate-fade-in">
                  <div className="w-full bg-slate-100 rounded-3xl p-6 border border-slate-200 relative overflow-hidden">
                      <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                              <Lock className="w-8 h-8" />
                          </div>
                          <h2 className="text-xl font-bold text-slate-700 mb-2">
                              Nästa belöning väntar
                          </h2>
                          <p className="text-slate-500 text-sm font-medium mb-6">
                              "{heroModule.title}" låses upp om <span className="text-slate-900 font-bold">{Math.max(1, sessionsLeft)} pass</span>.
                          </p>
                          <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-colors"
                          >
                              Gå till Idag & Träna
                          </button>
                      </div>
                      
                      {/* Background blurred image */}
                      <img 
                        src={heroModule.imageUrl} 
                        className="absolute inset-0 w-full h-full object-cover opacity-10 filter blur-sm grayscale"
                      />
                  </div>
              </div>
          );
      }
  };

  const renderSeriesCard = (m: typeof allModules[0]) => {
      const isCompleted = m.status === 'completed';
      const isLocked = m.status === 'locked';

      return (
          <div 
            key={m.id}
            onClick={() => handleModuleClick(m)}
            className={`min-w-[280px] aspect-video rounded-xl relative overflow-hidden shadow-sm flex-shrink-0 cursor-pointer transition-all hover:scale-[1.02]
                ${isLocked ? 'grayscale' : ''}
            `}
          >
              <img src={m.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              {/* Status Layer */}
              <div className="absolute inset-0 flex items-center justify-center">
                  {isLocked && <Lock className="w-10 h-10 text-white/50" />}
                  {m.status === 'unlocked' && <PlayCircle className="w-12 h-12 text-white opacity-90" />}
                  {isCompleted && <CheckCircle className="w-10 h-10 text-green-500" />}
              </div>

              {/* Title Layer */}
              <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex justify-between items-end">
                    <span className={`text-xs font-bold line-clamp-2 leading-tight ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                        {m.title}
                    </span>
                    {isLocked && (
                        <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                            Kräver {m.requiredSessions} pass
                        </span>
                    )}
                  </div>
              </div>

              {/* Progress Bar for Completed */}
              {isCompleted && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
              )}
          </div>
      );
  };

  const renderGuideRow = (m: typeof allModules[0]) => {
      const isLocked = m.status === 'locked';
      const isCompleted = m.status === 'completed';

      return (
          <button
            key={m.id}
            onClick={() => handleModuleClick(m)}
            className={`w-full flex items-center p-4 rounded-xl border transition-all text-left group
                ${isLocked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}
            `}
          >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                  ${isCompleted ? 'bg-green-100 text-green-600' : 
                    isLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'}
              `}>
                  {m.type === 'video' ? <Video className="w-5 h-5" /> : <Book className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {m.title}
                  </h4>
                  <span className="text-xs text-slate-400">
                      {m.readTime} • {m.category}
                  </span>
              </div>

              {isLocked ? (
                  <Lock className="w-4 h-4 text-slate-300" />
              ) : isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
              )}
          </button>
      );
  };

  return (
    <>
      {readingModule && (
        <ReaderOverlay 
            module={readingModule} 
            onClose={() => setReadingModule(null)} 
            onComplete={handleFinishReading}
        />
      )}

      <div className="min-h-screen bg-white pb-24">
        
        {/* HEADER */}
        <div className="pt-6 px-6 pb-2">
            <h1 className="text-2xl font-black text-slate-900">Kunskap</h1>
        </div>

        {/* HERO SECTION */}
        <div className="px-6">
            {renderHero()}
        </div>

        {/* TRACK A: SERIES (Horizontal Scroll) */}
        <div className="mb-10">
            <div className="px-6 flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Artrosskolan: Serien</h3>
                <span className="text-xs font-bold text-slate-400">{userProfile?.progression?.lifetimeSessions || 0} Pass</span>
            </div>
            
            {/* Carousel Container */}
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 -mx-0 snap-x hide-scrollbar">
                {seriesModules.map(renderSeriesCard)}
                {/* Spacer */}
                <div className="w-2 flex-shrink-0"></div>
            </div>
        </div>

        {/* TRACK B: GUIDE (Vertical List) */}
        <div className="px-6 mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Din Guide till Nivå {currentLevel}</h3>
            
            <div className="space-y-6">
                {Object.entries(guideByStage).map(([stageStr, modules]) => {
                    const stage = parseInt(stageStr);
                    const userStage = userProfile?.progression?.currentStage || 1;
                    const isGroupLocked = stage > userStage && currentLevel === (userProfile?.currentLevel || 1); // Simple logic
                    
                    return (
                        <div key={stage} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3 mt-4">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded
                                    ${isGroupLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-700'}
                                `}>
                                    Etapp {stage}
                                </span>
                                {isGroupLocked && <Lock className="w-3 h-3 text-slate-400" />}
                            </div>
                            
                            <div className="space-y-3">
                                {modules.map(renderGuideRow)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* REFERENCE LIBRARY (Static for now) */}
        <div className="px-6 pb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Uppslagsverk & Kategorier</h3>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Övningsbanken', icon: Dumbbell, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Kost & Hälsa', icon: Apple, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Vanliga Frågor', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Utrustning', icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((cat) => (
                    <button key={cat.label} className={`${cat.bg} p-4 rounded-xl flex flex-col items-center justify-center text-center hover:opacity-80 transition-opacity`}>
                        <cat.icon className={`w-8 h-8 ${cat.color} mb-2`} />
                        <span className={`text-xs font-bold ${cat.color}`}>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>

      </div>
    </>
  );
};

export default KnowledgeBase;