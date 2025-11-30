import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Lock, BookOpen, ChevronRight, Trophy, Map } from 'lucide-react';
import { EDUCATION_MODULES, LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const MyJourney = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  // Target sessions to unlock next level (SOP Rule: approx 12 sessions)
  const SESSIONS_TARGET = 12;

  useEffect(() => {
    if (!userProfile) return;
    
    // Calculate sessions done in current level
    // Note: In a real app we might store 'levelStartedAt' timestamp to filter logs accurately.
    // For now, we assume all logs with the current level property count.
    const history = userProfile.activityHistory || [];
    const currentLevelCount = history.filter(
        h => h.type === 'rehab' // Only rehab counts for progression, typically
    ).length;
    
    // Simplification for demo: Using total rehab logs. 
    // Ideally this would reset when level increments.
    setSessionsCompleted(currentLevelCount % SESSIONS_TARGET); // Modulo to simulate progress within current level cycle
  }, [userProfile]);

  const currentLevel = userProfile?.currentLevel || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  
  // Cap at 100%
  const progressPercentage = Math.min(100, Math.round((sessionsCompleted / SESSIONS_TARGET) * 100));

  const handleReadArticle = async (articleId: string) => {
      if (!user) return;
      // Optimistic UI update could happen here, but we rely on refreshProfile
      try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
              completedEducationIds: arrayUnion(articleId)
          });
          await refreshProfile();
      } catch (e) {
          console.error("Failed to mark article as read", e);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Header & Timeline */}
      <div className="bg-white px-6 pt-8 pb-8 shadow-sm rounded-b-3xl mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Din Resa</h1>
        <p className="text-slate-500 mb-8">
            Mot målet: <span className="font-semibold text-slate-900 capitalize">{userGoal.replace(/_/g, ' ')}</span>
        </p>
        
        {/* Timeline Visual */}
        <div className="relative flex justify-between items-center px-2">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10 transform -translate-y-1/2 mx-4"></div>
            
            {[1, 2, 3, 4].map((level) => {
                const isCompleted = level < currentLevel;
                const isCurrent = level === currentLevel;
                const isLocked = level > currentLevel;

                return (
                    <div key={level} className="flex flex-col items-center gap-2">
                        <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all z-10
                                ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' : ''}
                                ${isCurrent ? 'bg-blue-600 border-blue-200 shadow-lg shadow-blue-200 text-white scale-110' : ''}
                                ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : ''}
                            `}
                        >
                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : 
                             isLocked ? <Lock className="w-5 h-5" /> : 
                             <span className="font-bold text-lg">{level}</span>}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                            Fas {level}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        
        {/* 2. Current Status & Progress (Boss Fight Tracker) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Fas {currentLevel}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
                    </p>
                </div>
                {progressPercentage >= 100 && (
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 animate-pulse">
                        <Trophy className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Framsteg mot nästa nivå</span>
                    <span className="text-blue-600">{progressPercentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-400 text-right">
                    {sessionsCompleted} av {SESSIONS_TARGET} pass avklarade
                </p>
            </div>

            {progressPercentage >= 100 ? (
                <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Gör Nivåtestet (Boss Fight)
                </button>
            ) : (
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex gap-2 items-center">
                    <Lock className="w-4 h-4" />
                    Slutför träningspassen för att låsa upp nivåtestet.
                </div>
            )}
        </div>

        {/* 3. Education / Knowledge Base */}
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 px-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Artrosskolan
            </h3>
            
            <div className="space-y-3">
                {EDUCATION_MODULES.map((module) => {
                    const isLocked = module.requiredLevel > currentLevel;
                    const isRead = userProfile?.completedEducationIds?.includes(module.id);

                    return (
                        <button 
                            key={module.id}
                            disabled={isLocked}
                            onClick={() => !isLocked && !isRead && handleReadArticle(module.id)}
                            className={`w-full flex items-center p-4 bg-white rounded-xl border transition-all text-left group
                                ${isLocked ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                            `}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                                ${isRead ? 'bg-green-100 text-green-600' : 
                                  isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}
                            `}>
                                {isRead ? <CheckCircle className="w-5 h-5" /> : 
                                 isLocked ? <Lock className="w-5 h-5" /> : 
                                 <BookOpen className="w-5 h-5" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                        {module.category}
                                    </span>
                                    <span className="text-xs text-slate-400">{module.readTime}</span>
                                </div>
                                <h4 className={`font-semibold truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                    {module.title}
                                </h4>
                            </div>
                            
                            {!isLocked && !isRead && (
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 ml-2" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MyJourney;