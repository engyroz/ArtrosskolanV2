import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { Exercise } from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Play, Check, Circle, Activity } from 'lucide-react';
import { toLocalISOString, isSameDay } from '../utils/dateHelpers';
import { generateLevelPlan, getWorkoutSession } from '../utils/workoutEngine';
import { getMaxXP } from '../utils/progressionEngine';
import { 
    ACTION_CARD_CONFIG, 
    PHYSICAL_ACTIVITY_TASKS, 
    PHASE_NAMES,
    PRE_FLIGHT_MESSAGES 
} from '../utils/textConstants';

// Components
import ActionCard from '../components/ActionCard';
import LevelProgressBar from '../components/LevelProgressBar';
import PreWorkoutModal from '../components/PreWorkoutModal';
import BossFightModal from '../components/BossFightModal';

const Dashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const { currentDate: today } = useTime(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [showPreFlight, setShowPreFlight] = useState(false);
  const [showBossFight, setShowBossFight] = useState(false);
  const [preFlightType, setPreFlightType] = useState<'rehab' | 'circulation'>('rehab');
  
  // State for optimistic UI updates
  const [activityCompletedToday, setActivityCompletedToday] = useState(false);
  
  // State for animated XP bar
  const [displayedXP, setDisplayedXP] = useState(0);

  // --- DERIVED STATE ---
  const history = userProfile?.activityHistory || [];
  const currentLevel = userProfile?.currentLevel || 1;
  const selectedDateStr = toLocalISOString(today);
  
  // Find logs for today
  const rehabLog = history.find(h => h.date === selectedDateStr && h.type === 'rehab');
  const activityLog = history.find(h => h.date === selectedDateStr && h.type === 'daily_activity');
  
  // Calculate Week/Day since start
  const startDate = userProfile?.assessmentData?.timestamp 
    ? new Date(userProfile.assessmentData.timestamp) 
    : new Date(); // Fallback to today if missing
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentWeek = Math.ceil(daysSinceStart / 7);
  const currentDayInWeek = ((daysSinceStart - 1) % 7) + 1;

  // Schedule Logic (Active vs Recovery)
  const dayIndex = today.getDay();
  // Level 1: Rehab every day. Level 2+: Mon/Wed/Fri
  const isRehabDay = currentLevel === 1 || [1, 3, 5].includes(dayIndex);
  
  // --- HERO CARD STATE ---
  let heroMode: 'active' | 'recovery' | 'completed' | 'boss_fight' = 'active';
  
  if (rehabLog) {
      heroMode = 'completed';
  } else if (isRehabDay) {
      if (userProfile?.progression?.levelMaxedOut) {
          heroMode = 'boss_fight';
      } else {
          heroMode = 'active';
      }
  } else {
      heroMode = 'recovery';
  }

  // --- XP ANIMATION EFFECT ---
  useEffect(() => {
    if (!userProfile) return;
    const realXP = userProfile.progression?.experiencePoints || 0;
    
    // Check if we just returned from a workout with earned XP
    const earnedXP = location.state?.xpEarned;

    if (earnedXP) {
        // Start animation from "previous" total
        const startXP = Math.max(0, realXP - earnedXP);
        setDisplayedXP(startXP);
        
        // Trigger fill animation after mount
        const timer = setTimeout(() => {
            setDisplayedXP(realXP);
        }, 300); // Small delay to let user see the "before" state briefly if loading is fast
        
        return () => clearTimeout(timer);
    } else {
        // No animation needed, just show current
        setDisplayedXP(realXP);
    }
  }, [userProfile, location.state]);

  // --- SECONDARY CARD LOGIC (Daglig Medicin) ---
  const showDailyMedicine = (currentLevel === 2 || currentLevel === 3) && !rehabLog; 

  // --- TERTIARY CARD CONFIG ---
  const activityConfig = PHYSICAL_ACTIVITY_TASKS[currentLevel as keyof typeof PHYSICAL_ACTIVITY_TASKS] || PHYSICAL_ACTIVITY_TASKS[1];
  const isActivityDone = !!activityLog || activityCompletedToday;

  // --- EFFECTS ---

  useEffect(() => {
    // Sync local state with DB history
    if (activityLog) setActivityCompletedToday(true);
    else setActivityCompletedToday(false);
  }, [activityLog, selectedDateStr]);

  // Plan Generation
  useEffect(() => {
    const initPlan = async () => {
      if (!userProfile) return;
      if (!userProfile.activePlanIds || userProfile.activePlanIds.length === 0) {
        try {
            const querySnapshot = await getDocs(collection(db, "exercises"));
            const allExercises: Exercise[] = [];
            querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));
            
            const joint = userProfile.program?.joint || 'Knä'; 
            const mappedJoint = joint === 'Knä' ? 'knee' : (joint === 'Höft' ? 'hip' : 'shoulder');
            const newPlanIds = generateLevelPlan(allExercises, currentLevel, mappedJoint);
            
            await updateDoc(doc(db, 'users', userProfile.uid), { activePlanIds: newPlanIds });
            await refreshProfile();
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    initPlan();
  }, [userProfile, currentLevel]);

  // --- HANDLERS ---

  const handleHeroClick = () => {
    if (heroMode === 'completed') {
        // Maybe go to stats?
        return; 
    }
    if (heroMode === 'recovery') {
        navigate('/journey'); // Go to education
        return;
    }
    if (heroMode === 'boss_fight') {
        setShowBossFight(true);
        return;
    }
    // Active
    setPreFlightType('rehab');
    setShowPreFlight(true);
  };

  const handleMedicineClick = () => {
      setPreFlightType('circulation');
      setShowPreFlight(true);
  };

  const handleLaunchSession = async () => {
    setShowPreFlight(false);
    if (!userProfile) return;

    const querySnapshot = await getDocs(collection(db, "exercises"));
    const allExercises: Exercise[] = [];
    querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));

    const session = getWorkoutSession(userProfile, allExercises, preFlightType);
    
    navigate('/workout', { state: { session } });
  };

  const handleToggleActivity = async () => {
      if (isActivityDone) return; // Already done
      
      setActivityCompletedToday(true); // Optimistic
      
      if (!userProfile) return;
      try {
          const newLog = {
            date: selectedDateStr,
            type: 'daily_activity',
            completedAt: new Date().toISOString(),
            painScore: 0, 
            exertion: 'light',
            feedbackMessage: 'Aktivitet registrerad',
            xpEarned: 10
          };
          
          await updateDoc(doc(db, 'users', userProfile.uid), {
              activityHistory: arrayUnion(newLog),
              "progression.experiencePoints": (userProfile.progression?.experiencePoints || 0) + 10
          });
          await refreshProfile();
      } catch (e) {
          console.error(e);
          setActivityCompletedToday(false); // Revert
      }
  };

  const handleBossFightSuccess = async () => {
    if (!userProfile) return;
    try {
        const nextLevel = userProfile.currentLevel + 1;
        const userRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userRef, {
            currentLevel: nextLevel,
            "progression.experiencePoints": 0,
            "progression.levelMaxedOut": false,
            "progression.currentPhase": 1,
            "progression.consecutivePerfectSessions": 0,
            activePlanIds: [], 
            exerciseProgress: {} 
        });
        await refreshProfile();
        setShowBossFight(false);
    } catch (e) { console.error(e); }
  };

  // --- RENDER HELPERS ---
  const levelConfig = ACTION_CARD_CONFIG[currentLevel as keyof typeof ACTION_CARD_CONFIG] || ACTION_CARD_CONFIG[1];
  
  const heroTitle = heroMode === 'active' ? "Dagens Rehabpass" :
                    heroMode === 'recovery' ? "Återhämtning" :
                    heroMode === 'boss_fight' ? "NIVÅTEST" : "Bra jobbat!";
  
  const heroSubtitle = heroMode === 'active' ? levelConfig.activeSubtitle :
                       heroMode === 'recovery' ? levelConfig.recoverySubtitle :
                       heroMode === 'boss_fight' ? "Du är redo för nästa nivå" :
                       "Dagens rehab är avklarad.";

  const heroMeta = heroMode === 'active' ? { time: levelConfig.time, xp: levelConfig.xp } : 
                   heroMode === 'recovery' ? { xp: 10 } : undefined;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      <PreWorkoutModal 
        isOpen={showPreFlight} 
        onClose={() => setShowPreFlight(false)} 
        onStart={handleLaunchSession}
        level={currentLevel}
        type={preFlightType}
      />

      <BossFightModal
        isOpen={showBossFight}
        onClose={() => setShowBossFight(false)}
        onSuccess={handleBossFightSuccess}
        level={currentLevel}
      />

      {/* 1. HEADER */}
      <div className="pt-12 pb-4 px-6 bg-white sticky top-0 z-30 border-b border-slate-100 flex justify-between items-start">
        <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Hej {userProfile?.displayName || 'Kämpe'}!
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                Vecka {currentWeek}, Dag {currentDayInWeek}
            </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold">
            {PHASE_NAMES[currentLevel as keyof typeof PHASE_NAMES]}
        </div>
      </div>

      <div className="px-6 max-w-md mx-auto mt-6 space-y-8 animate-fade-in">
        
        {/* 2. HERO SECTION */}
        <section>
            <ActionCard 
                mode={heroMode}
                title={heroTitle}
                subtitle={heroSubtitle}
                meta={heroMeta}
                onClick={handleHeroClick}
            />
            {/* Gamification Progress - ALWAYS visible now */}
            {heroMode !== 'recovery' && (
                <LevelProgressBar 
                    level={currentLevel} 
                    currentXP={displayedXP} 
                    maxXP={getMaxXP(currentLevel)} 
                />
            )}
        </section>

        {/* 3. SECONDARY CARD: DAGLIG MEDICIN */}
        {showDailyMedicine && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Daglig Medicin</h3>
                    <p className="text-slate-500 text-sm mb-2">Smörj leden (Cirkulation)</p>
                    <div className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        +30 XP
                    </div>
                </div>
                <button 
                    onClick={handleMedicineClick}
                    className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                    <Play className="w-5 h-5 ml-1 fill-current" />
                </button>
            </section>
        )}

        {/* 4. TERTIARY CARD: FYSISK AKTIVITET (FaR) */}
        <section className={`rounded-2xl p-5 border flex items-center gap-4 transition-all cursor-pointer ${
            isActivityDone ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300'
        }`} onClick={handleToggleActivity}>
            
            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isActivityDone ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'
            }`}>
                {isActivityDone ? <Check className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>

            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className={`font-bold ${isActivityDone ? 'text-green-900' : 'text-slate-900'}`}>
                        {activityConfig.title}
                    </h3>
                    {!isActivityDone && <span className="text-xs font-bold text-green-600">+10 XP</span>}
                </div>
                <p className={`text-sm ${isActivityDone ? 'text-green-700' : 'text-slate-500'}`}>
                    {activityConfig.desc}
                </p>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;