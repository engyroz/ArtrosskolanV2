
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, Lock, CheckCircle, Clock, Info, Loader2, PlayCircle, BookOpen
} from 'lucide-react';
import { Lecture } from '../types';
import { calculateProgressionUpdate } from '../utils/progressionEngine';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import BunnyPlayer from '../components/BunnyPlayer';

const KnowledgeBase = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLockedMessage, setShowLockedMessage] = useState<string | null>(null);

  // 1. Fetch Lectures from Firestore
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const snapshot = await db.collection('lectures').orderBy('order', 'asc').get();
        
        if (snapshot.empty) {
          console.log("No lectures found in Firestore.");
          setLectures([]);
        } else {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
          setLectures(data);
          
          // Auto-select first unlocked lecture if available
          if (userProfile) {
             const lifetimeSessions = userProfile.progression?.lifetimeSessions || 0;
             // Find the first unlocked lecture (or the first one if all are locked/unlocked logic fails)
             const firstUnlocked = data.find(l => lifetimeSessions >= l.unlockThreshold) || data[0];
             setActiveLecture(firstUnlocked);
          }
        }
      } catch (err) {
        console.error("Error fetching lectures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [userProfile?.uid]); // Dependency on UID ensures refresh on login

  // 2. Progression Helpers
  const lifetimeSessions = userProfile?.progression?.lifetimeSessions || 0;

  const isLocked = (lecture: Lecture) => {
    return lifetimeSessions < lecture.unlockThreshold;
  };

  const handleSelectLecture = (lecture: Lecture) => {
    if (isLocked(lecture)) {
      const needed = lecture.unlockThreshold - lifetimeSessions;
      setShowLockedMessage(`Du behöver genomföra ${needed} träningspass till för att låsa upp denna lektion.`);
      
      // Clear message after 4 seconds
      setTimeout(() => setShowLockedMessage(null), 4000);
      return;
    }
    
    setActiveLecture(lecture);
    
    // Smooth scroll to top on mobile to show player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markAsCompleted = async () => {
    if (!user || !userProfile || !activeLecture) return;
    
    // Prevent duplicate XP if already completed
    if (userProfile.completedEducationIds?.includes(activeLecture.id)) return;

    try {
      const result = calculateProgressionUpdate(userProfile, 'KNOWLEDGE_ARTICLE');
      
      await db.collection('users').doc(user.uid).update({
        completedEducationIds: firebase.firestore.FieldValue.arrayUnion(activeLecture.id),
        "progression.experiencePoints": result.newTotalXP,
        "progression.currentStage": result.newStage,
        "progression.levelMaxedOut": result.levelMaxedOut
      });
      
      await refreshProfile();
      console.log("Lecture marked as complete + XP awarded");
    } catch (e) {
      console.error("Failed to update progress:", e);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Laddar kursinnehåll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      
      {/* --- PRIMARY AREA (Mobile: Top / Desktop: Left 70%) --- */}
      <div className="flex-1 lg:flex-[0.7] flex flex-col overflow-y-auto bg-white scrollbar-hide">
        
        {/* Sticky Video Player */}
        <div className="sticky top-0 z-30 w-full bg-black shadow-lg">
           {activeLecture ? (
             <BunnyPlayer 
               videoId={activeLecture.videoId} 
               title={activeLecture.title}
               onLoad={markAsCompleted}
             />
           ) : (
             <div className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-center text-slate-500">
               <BookOpen className="w-12 h-12 mb-2 opacity-50" />
               <p>Välj en lektion</p>
             </div>
           )}
        </div>

        {/* Active Lecture Metadata */}
        <div className="p-6 pb-12 lg:pb-6">
           {activeLecture ? (
             <div className="animate-fade-in space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {activeLecture.category || 'Utbildning'}
                  </span>
                  {userProfile?.completedEducationIds?.includes(activeLecture.id) && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                      <CheckCircle className="w-3 h-3" /> KLAR
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" /> {activeLecture.duration}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">
                    {activeLecture.title}
                  </h1>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {activeLecture.description || "Ingen beskrivning tillgänglig för denna lektion."}
                  </p>
                </div>
             </div>
           ) : (
             <div className="text-center py-10 text-slate-400">
               <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
               <p>Välj en lektion från listan för att börja titta.</p>
             </div>
           )}
        </div>
      </div>

      {/* --- SECONDARY AREA (Mobile: Bottom Scroll / Desktop: Right Sidebar 30%) --- */}
      <div className="flex-1 lg:flex-[0.3] flex flex-col bg-slate-50 lg:border-l border-slate-200 lg:h-full overflow-hidden">
        
        {/* Playlist Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
           <div>
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Kursinnehåll</h2>
             <p className="text-xs text-slate-500">{lectures.length} Lektioner tillgängliga</p>
           </div>
           <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
             {lifetimeSessions} Pass utförda
           </div>
        </div>

        {/* Scrollable Playlist */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1 pb-24 lg:pb-6">
          {lectures.length === 0 && (
             <div className="text-center py-10 px-4">
               <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                 <Info className="w-6 h-6 text-slate-400" />
               </div>
               <p className="text-slate-500 text-sm font-medium">Inga lektioner hittades.</p>
               <p className="text-slate-400 text-xs mt-1">Kontakta admin om detta kvarstår.</p>
             </div>
          )}

          {lectures.map((lecture, index) => {
            const locked = isLocked(lecture);
            const active = activeLecture?.id === lecture.id;
            const completed = userProfile?.completedEducationIds?.includes(lecture.id);

            return (
              <button
                key={lecture.id}
                onClick={() => handleSelectLecture(lecture)}
                className={`w-full flex items-center p-3 rounded-xl border text-left transition-all duration-200 group relative ${
                  active 
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500 z-10' 
                    : locked
                      ? 'bg-slate-100 border-transparent opacity-60 hover:opacity-100 grayscale'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {/* Thumbnail Area */}
                <div className="relative w-20 h-14 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden mr-3 flex items-center justify-center border border-slate-100 shadow-inner">
                    {lecture.thumbnailUrl ? (
                      <img src={lecture.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      // Fallback icons if no thumb
                      locked ? <Lock className="w-5 h-5 text-slate-500" /> : <PlayCircle className="w-6 h-6 text-slate-400" />
                    )}
                    
                    {/* Active Pulse Overlay */}
                    {active && (
                       <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                       </div>
                    )}
                    
                    {/* Duration Badge on Thumb */}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-medium">
                      {lecture.duration}
                    </div>
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start">
                     <span className={`text-xs font-bold mb-1 line-clamp-2 leading-tight ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                       {index + 1}. {lecture.title}
                     </span>
                     {completed && <CheckCircle className="w-4 h-4 text-green-500 ml-2 flex-shrink-0" />}
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {locked ? (
                       <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded flex items-center">
                         <Lock className="w-2.5 h-2.5 mr-1" />
                         Kräver {lecture.unlockThreshold} pass
                       </span>
                    ) : (
                       <span className="text-[10px] text-slate-400 font-medium truncate">
                         {lecture.category || 'Allmänt'}
                       </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Locked Message Toast (Floating) */}
      {showLockedMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-fade-in-down">
          <div className="bg-slate-800/95 backdrop-blur shadow-2xl p-4 rounded-xl flex items-start gap-3 border border-slate-700 text-white">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Lektionen är låst</p>
              <p className="text-xs text-slate-300 leading-relaxed">{showLockedMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KnowledgeBase;
