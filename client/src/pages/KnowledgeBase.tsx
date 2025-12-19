
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, Lock, CheckCircle, Clock, Info, Loader2, PlayCircle, BookOpen, AlertCircle
} from 'lucide-react';
import { Lecture } from '../types';
import { calculateProgressionUpdate } from '../utils/progressionEngine';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import BunnyPlayer from '../components/BunnyPlayer';
import { BUNNY_PULL_ZONE } from '../utils/contentConfig';

// --- Sub-component for robust thumbnail handling ---
const LectureThumbnail = ({ lecture, active, locked }: { lecture: Lecture, active: boolean, locked: boolean }) => {
  const [imgError, setImgError] = useState(false);
  
  // Construct a fallback URL based on env config if available
  // This handles the case where the DB has a bad URL (from the old admin tool)
  const fallbackUrl = BUNNY_PULL_ZONE && lecture.videoId 
    ? `https://${BUNNY_PULL_ZONE}/${lecture.videoId}/thumbnail.jpg`
    : null;

  const [currentSrc, setCurrentSrc] = useState(lecture.thumbnailUrl || fallbackUrl);

  const handleError = () => {
      // If we are currently using the DB url, and it failed, try the dynamic fallback
      if (currentSrc === lecture.thumbnailUrl && fallbackUrl && lecture.thumbnailUrl !== fallbackUrl) {
          setCurrentSrc(fallbackUrl);
      } else {
          // If fallback failed (or we didn't have one), give up
          setImgError(true);
      }
  };
  
  // Reset when lecture changes
  useEffect(() => {
      setCurrentSrc(lecture.thumbnailUrl || fallbackUrl);
      setImgError(false);
  }, [lecture.id, lecture.thumbnailUrl, fallbackUrl]);

  // If no URL works, show placeholder
  if (!currentSrc || imgError) {
    return (
      <div className={`w-full h-full flex items-center justify-center transition-colors ${active ? 'bg-blue-50' : 'bg-slate-100'}`}>
        {locked ? (
           <Lock className="w-6 h-6 text-slate-300" />
        ) : (
           <PlayCircle className={`w-8 h-8 ${active ? 'text-blue-400' : 'text-slate-300'}`} />
        )}
      </div>
    );
  }

  return (
    <>
      <img 
        src={currentSrc} 
        alt="" 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={handleError} 
      />
      {/* Overlay gradient for text readability if needed, or just style */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
    </>
  );
};

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
    // Show toast if locked, but STILL select it so the user sees the lock screen in the player
    if (isLocked(lecture)) {
      const needed = lecture.unlockThreshold - lifetimeSessions;
      setShowLockedMessage(`Du behöver genomföra ${needed} träningspass till för att låsa upp denna lektion.`);
      
      // Clear message after 4 seconds
      setTimeout(() => setShowLockedMessage(null), 4000);
    }
    
    setActiveLecture(lecture);
    
    // Smooth scroll to top on mobile to show player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markAsCompleted = async () => {
    if (!user || !userProfile || !activeLecture) return;
    
    // Prevent duplicate XP if already completed
    if (userProfile.completedEducationIds?.includes(activeLecture.id)) return;
    // Prevent marking locked videos as complete (safety check)
    if (isLocked(activeLecture)) return;

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
      <div className="flex-1 lg:flex-[0.7] flex flex-col overflow-y-auto bg-slate-50 scrollbar-hide">
        
        {/* PLAYER CONTAINER - STYLED CARD */}
        <div className="p-4 lg:p-8 pb-0">
            <div className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white ring-1 ring-slate-200 transition-all duration-500 ${!activeLecture ? 'aspect-video flex items-center justify-center' : ''}`}>
               {activeLecture ? (
                 <BunnyPlayer 
                   videoId={activeLecture.videoId} 
                   title={activeLecture.title}
                   onLoad={markAsCompleted}
                   isLocked={isLocked(activeLecture)}
                   posterUrl={activeLecture.thumbnailUrl} // Use Firestore override if available
                 />
               ) : (
                 <div className="text-slate-500 flex flex-col items-center">
                   <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                   <p>Välj en lektion</p>
                 </div>
               )}
            </div>
        </div>

        {/* Active Lecture Metadata */}
        <div className="p-6 lg:px-10 pb-12 lg:pb-6">
           {activeLecture ? (
             <div className="animate-fade-in space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                    {activeLecture.category || 'Utbildning'}
                  </span>
                  {userProfile?.completedEducationIds?.includes(activeLecture.id) && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                      <CheckCircle className="w-3.5 h-3.5" /> KLAR
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {activeLecture.duration}
                  </span>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
                        {activeLecture.title}
                    </h1>
                    <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
                        {activeLecture.description || "Ingen beskrivning tillgänglig för denna lektion."}
                    </div>
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
      <div className="flex-1 lg:flex-[0.3] flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200 lg:h-full overflow-hidden">
        
        {/* Playlist Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
           <div>
             <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Kursinnehåll
             </h2>
           </div>
           <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
             {lifetimeSessions} Pass utförda
           </div>
        </div>

        {/* Scrollable Playlist */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 pb-24 lg:pb-6 bg-slate-50/50">
          {lectures.length === 0 && (
             <div className="text-center py-10 px-4">
               <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                 <Info className="w-6 h-6 text-slate-400" />
               </div>
               <p className="text-slate-500 text-sm font-medium">Inga lektioner hittades.</p>
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
                className={`w-full flex items-center p-3 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden ${
                  active 
                    ? 'bg-white border-blue-500 shadow-lg ring-1 ring-blue-500 z-10 transform scale-[1.02]' 
                    : locked
                      ? 'bg-slate-100 border-transparent opacity-70 hover:opacity-100'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {/* Thumbnail Area - Now uses subcomponent */}
                <div className="relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden mr-4 border border-slate-100 shadow-sm bg-slate-200">
                    <LectureThumbnail lecture={lecture} active={active} locked={locked} />
                    
                    {/* Active Pulse Overlay */}
                    {active && (
                       <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                       </div>
                    )}
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wide">
                      {lecture.duration}
                    </div>
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-xs font-bold line-clamp-2 leading-snug ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                       {index + 1}. {lecture.title}
                     </span>
                     {completed && <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-2 flex-shrink-0" />}
                  </div>
                  
                  <div className="flex items-center">
                    {locked ? (
                       <span className="text-[9px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded flex items-center">
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
          <div className="bg-slate-900/95 backdrop-blur-md shadow-2xl p-4 rounded-2xl flex items-start gap-3 border border-slate-700 text-white">
            <div className="bg-yellow-500/20 p-2 rounded-xl">
                <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1 text-yellow-100">Lektionen är låst</p>
              <p className="text-xs text-slate-300 leading-relaxed">{showLockedMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KnowledgeBase;
