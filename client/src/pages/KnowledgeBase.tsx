import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ChevronRight, Lock, CheckCircle, Search } from 'lucide-react';
import { EDUCATION_MODULES } from '../utils/contentConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const KnowledgeBase = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const currentLevel = userProfile?.currentLevel || 1;

  const handleReadArticle = async (articleId: string) => {
      if (!user) return;
      try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
              completedEducationIds: arrayUnion(articleId)
          });
          await refreshProfile();
          alert("Artikel öppnad (Demo)");
      } catch (e) {
          console.error("Failed to mark article as read", e);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      <div className="bg-white shadow-sm border-b border-slate-100">
          <div className="max-w-md mx-auto px-4 pt-8 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Kunskap</h1>
            <p className="text-slate-500 text-sm">Lär dig mer om din kropp och artros.</p>
            
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

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        
        {EDUCATION_MODULES.map((module) => {
            const isLocked = module.requiredLevel > currentLevel;
            const isRead = userProfile?.completedEducationIds?.includes(module.id);

            return (
                <button 
                    key={module.id}
                    disabled={isLocked}
                    onClick={() => !isLocked && handleReadArticle(module.id)}
                    className={`w-full flex items-center p-4 bg-white rounded-xl border transition-all text-left group
                        ${isLocked ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                    `}
                >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                        ${isRead ? 'bg-green-100 text-green-600' : 
                          isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}
                    `}>
                        {isRead ? <CheckCircle className="w-6 h-6" /> : 
                         isLocked ? <Lock className="w-5 h-5" /> : 
                         <BookOpen className="w-6 h-6" />}
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
                        <h4 className={`font-semibold truncate ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                            {module.title}
                        </h4>
                    </div>
                    
                    {!isLocked && (
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 ml-2" />
                    )}
                </button>
            );
        })}
      </div>
    </div>
  );
};

export default KnowledgeBase;