
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ChevronRight, Lock, CheckCircle, Search, PlayCircle } from 'lucide-react';
import { EDUCATION_MODULES } from '../utils/contentConfig';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { isContentUnlocked, calculateProgressionUpdate } from '../utils/progressionEngine';

const KnowledgeBase = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const handleReadArticle = async (articleId: string) => {
      if (!user || !userProfile) return;
      
      const alreadyRead = userProfile.completedEducationIds?.includes(articleId);
      
      try {
          // If NOT read before, award XP (50 XP)
          if (!alreadyRead) {
              const result = calculateProgressionUpdate(userProfile, 'KNOWLEDGE_ARTICLE');
              
              const userRef = db.collection('users').doc(user.uid);
              await userRef.update({
                  completedEducationIds: firebase.firestore.FieldValue.arrayUnion(articleId),
                  "progression.experiencePoints": result.newTotalXP,
                  "progression.currentStage": result.newStage,
                  "progression.levelMaxedOut": result.levelMaxedOut
              });
              await refreshProfile();
              alert(`Artikel läst! +${result.xpEarned} XP`);
          } else {
              alert("Öppnar artikel...");
          }
      } catch (e) {
          console.error("Failed to mark article as read", e);
      }
  };

  // Split into sections
  const seriesA = EDUCATION_MODULES.filter(m => m.unlockType === 'lifetime');
  const seriesB = EDUCATION_MODULES.filter(m => m.unlockType === 'level');

  const renderModule = (module: any) => {
      const isLocked = !isContentUnlocked(userProfile!, { 
          unlockType: module.unlockType, 
          requiredLevel: module.requiredLevel, 
          requiredStage: module.requiredStage,
          requiredSessions: module.requiredSessions
      });
      
      const isRead = userProfile?.completedEducationIds?.includes(module.id);

      // Unlock Criteria Text
      let criteriaText = "";
      if (isLocked) {
          if (module.unlockType === 'lifetime') {
              const left = (module.requiredSessions || 0) - (userProfile?.progression?.lifetimeSessions || 0);
              criteriaText = `Kräver ${left} pass till`;
          } else {
              if (module.requiredLevel > (userProfile?.currentLevel || 1)) {
                 criteriaText = `Låses upp på Nivå ${module.requiredLevel}`; 
              } else {
                 criteriaText = `Låses upp vid Etapp ${module.requiredStage}`; 
              }
          }
      }

      return (
        <button 
            key={module.id}
            disabled={isLocked}
            onClick={() => !isLocked && handleReadArticle(module.id)}
            className={`w-full flex items-center p-4 bg-white rounded-xl border transition-all text-left group
                ${isLocked ? 'border-slate-100 opacity-70' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
            `}
        >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                ${isRead ? 'bg-green-100 text-green-600' : 
                  isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}
            `}>
                {isRead ? <CheckCircle className="w-6 h-6" /> : 
                 isLocked ? <Lock className="w-5 h-5" /> : 
                 module.unlockType === 'lifetime' ? <PlayCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        {module.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded">
                        {module.readTime}
                    </span>
                </div>
                <h4 className={`font-semibold truncate ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                    {module.title}
                </h4>
                {isLocked && (
                    <p className="text-xs text-orange-500 font-medium mt-1 flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> {criteriaText}
                    </p>
                )}
            </div>
            
            {!isLocked && (
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 ml-2" />
            )}
        </button>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      <div className="bg-white shadow-sm border-b border-slate-100">
          <div className="max-w-md mx-auto px-4 pt-8 pb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Kunskap</h1>
                    <p className="text-slate-500 text-sm">Totalt antal pass: <span className="font-bold text-slate-900">{userProfile?.progression?.lifetimeSessions || 0}</span></p>
                </div>
            </div>
            
            <div className="mt-6 relative">
                <input 
                    type="text" 
                    placeholder="Sök artiklar..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
        
        {/* SERIES A */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                Generella Serien (Baserad på flit)
            </h3>
            <div className="space-y-3">
                {seriesA.map(renderModule)}
            </div>
        </section>

        {/* SERIES B */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                Nivåguiden (Din fas)
            </h3>
            <div className="space-y-3">
                {seriesB.map(renderModule)}
            </div>
        </section>

      </div>
    </div>
  );
};

export default KnowledgeBase;
