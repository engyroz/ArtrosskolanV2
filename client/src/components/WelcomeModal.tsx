
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import BunnyPlayer from './BunnyPlayer';
import { Activity, MessageCircle, BookOpen, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const WelcomeModal = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Normalize Joint Name to match DB keys
  const normalizeJoint = (j: string) => {
      const lower = (j || '').toLowerCase();
      if (lower.includes('knä') || lower.includes('knee') || lower.includes('kna')) return 'knee';
      if (lower.includes('höft') || lower.includes('hip') || lower.includes('hoft')) return 'hip';
      if (lower.includes('axel') || lower.includes('shoulder')) return 'shoulder';
      return 'knee'; // Fallback
  };

  useEffect(() => {
    // Show only if onboarding is done AND not yet seen
    if (userProfile && userProfile.onboardingCompleted && !userProfile.welcomeScreenSeen) {
       setIsOpen(true);
       
       const level = userProfile.currentLevel || 1;
       const joint = normalizeJoint(userProfile.program?.joint || 'knee');
       
       // Fetch video config
       const fetchWelcomeVideo = async () => {
           setLoadingVideo(true);
           try {
               const docId = `${joint}_${level}`;
               const doc = await db.collection('levels').doc(docId).get();
               if (doc.exists) {
                   const data = doc.data();
                   if (data?.welcomeVideoId) {
                       setVideoId(data.welcomeVideoId);
                   }
               }
           } catch (e) {
               console.error("Failed to fetch welcome video", e);
           } finally {
               setLoadingVideo(false);
           }
       };
       fetchWelcomeVideo();
    }
  }, [userProfile]);

  const handleStart = async () => {
    if (!user) return;
    try {
      // Mark as seen in Firestore
      await db.collection('users').doc(user.uid).update({
        welcomeScreenSeen: true
      });
      // Refresh local profile context so modal doesn't pop up again
      await refreshProfile();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating profile", error);
      // Optimistically close even on error to not block user
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  const firstName = userProfile?.displayName?.split(' ')[0] || 'Kämpe';
  const jointName = userProfile?.program?.joint || 'led';

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
          <div className="max-w-md mx-auto px-6 pt-12 pb-6">
              
              {/* Header */}
              <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4 animate-bounce-subtle">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
                      Välkommen {firstName}!
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                      Nu börjar vi din resa mot en starkare och smärtfri {jointName}.
                  </p>
              </div>

              {/* Video Player */}
              <div className="w-full aspect-video bg-black rounded-2xl shadow-xl overflow-hidden mb-10 border-4 border-white ring-1 ring-slate-200">
                  {loadingVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                      </div>
                  ) : videoId ? (
                      <BunnyPlayer 
                        videoId={videoId} 
                        title="Välkomstvideo" 
                        muted={true} // Autoplay without sound
                      />
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                          <p className="text-sm font-bold">Ingen video tillgänglig</p>
                      </div>
                  )}
              </div>

              {/* Value Props */}
              <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600">
                          <Activity className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 mb-1">Små steg, stora resultat</h3>
                          <p className="text-sm text-slate-500 leading-snug">
                              Regelbundenhet är nyckeln. Korta pass varje dag ger bättre effekt än långa pass sällan.
                          </p>
                      </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                          <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 mb-1">Din feedback räknas</h3>
                          <p className="text-sm text-slate-500 leading-snug">
                              Efter varje pass frågar vi hur det kändes. Dina svar hjälper oss att anpassa nivån åt dig.
                          </p>
                      </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600">
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 mb-1">Lär dig mer</h3>
                          <p className="text-sm text-slate-500 leading-snug">
                              Kunskap är smärtlindring. Utforska fliken Kunskap för att förstå vad som händer i kroppen.
                          </p>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="bg-white border-t border-slate-200 p-4 pb-safe safe-area-bottom z-20">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleStart}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                  Starta mitt första pass <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      </div>

    </div>
  );
};

export default WelcomeModal;
