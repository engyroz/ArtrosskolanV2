import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { Exercise } from '../types';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { Play, Check, Circle, Activity, CheckCircle } from 'lucide-react';
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
  
  const [activityCompletedToday, setActivityCompletedToday] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);

  const userProfileHistory = userProfile?.activityHistory || [];
  const currentLevel = userProfile?.currentLevel || 1;
  const selectedDateStr = toLocalISOString(today);
  
  const rehabLog = userProfileHistory.find(h => h.date === selectedDateStr && h.type === 'rehab');
  const circulationLog = userProfileHistory.find(h => h.date === selectedDateStr && h.type === 'circulation');
  const activityLog = userProfileHistory.find(h => h.date === selectedDateStr && h.type === 'daily_activity');
  
  const startDate = userProfile?.assessmentData?.timestamp 
    ? new Date(userProfile.assessmentData.timestamp) 
    : new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentWeek = Math.ceil(daysSinceStart / 7);
  const currentDayInWeek = ((daysSinceStart - 1) % 7) + 1;

  const dayIndex = today.getDay();
  const isRehabDay = currentLevel === 1 || [1, 3, 5].includes(dayIndex);
  
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

  useEffect(() => {
    if (!userProfile) return;
    const realXP = userProfile.progression?.experiencePoints || 0;
    const locationState = location.state as any;
    const earnedXP = locationState?.xpEarned;

    if (earnedXP) {
        const startXP = Math.max(0, realXP - earnedXP);
        setDisplayedXP(startXP);
        const timer = setTimeout(() => {
            setDisplayedXP(realXP);
        }, 300); 
        return () => clearTimeout(timer);
    } else {
        setDisplayedXP(realXP);
    }
  }, [userProfile, location.state]);

  const showDailyMedicine = (currentLevel === 2 || currentLevel === 3); 

  const activityConfig = PHYSICAL_ACTIVITY_TASKS[currentLevel as keyof typeof PHYSICAL_ACTIVITY_TASKS] || PHYSICAL_ACTIVITY_TASKS[1];
  const isActivityDone = !!activityLog || activityCompletedToday;

  useEffect(() => {
    if (activityLog) setActivityCompletedToday(true);
    else setActivityCompletedToday(false);
  }, [activityLog, selectedDateStr]);

  useEffect(() => {
    const initPlan = async () => {
      if (!userProfile) return;
      if (!userProfile.activePlanIds || userProfile.activePlanIds.length === 0) {
        try {
            const querySnapshot = await db.collection("exercises").get();
            const allExercises: Exercise[] = [];
            querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));
            
            const joint = userProfile.program?.joint || 'Knä'; 
            const mappedJoint = joint === 'Knä' ? 'knee' : (joint === 'Höft' ? 'hip' : 'shoulder');
            const newPlanIds = generateLevelPlan(allExercises, currentLevel, mappedJoint);
            
            await db.collection('users').doc(userProfile.uid).update({ activePlanIds: newPlanIds });
            await refreshProfile();
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    initPlan();
  }, [userProfile, currentLevel]);

  const handleHeroClick = () => {
    if (heroMode === 'completed') {
        return; 
    }
    if (heroMode === 'recovery') {
        navigate('/journey'); 
        return;
    }
    if (heroMode === 'boss_fight') {
        setShowBossFight(true);
        return;
    }
    setPreFlightType('rehab');
    setShowPreFlight(true);
  };

  const handleMedicineClick = () => {
      if (circulationLog) return; 
      setPreFlightType('circulation');
      setShowPreFlight(true);
  };

  const handleLaunchSession = async () => {
    setShowPreFlight(false);
    if (!userProfile) return;

    const querySnapshot = await db.collection("exercises").get();
    const allExercises: Exercise[] = [];
    querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));

    const session = getWorkoutSession(userProfile, allExercises, preFlightType);
    navigate('/workout', { state: { session } });
  };

  const handleToggleActivity = async () => {
      if (isActivityDone) return; 
      
      setActivityCompletedToday(true); 
      
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
          
          await db.collection('users').doc(userProfile.uid).update({
              activityHistory: firebase.firestore.FieldValue.arrayUnion(newLog),
              "progression.experiencePoints": (userProfile.progression?.experiencePoints || 0) + 10
          });
          await refreshProfile();
      } catch (e) {
          console.error(e);
          setActivityCompletedToday(false); 
      }
  };

  const handleBossFightSuccess = async () => {
    if (!userProfile) return;
    try {
        const nextLevel = userProfile.currentLevel + 1;
        const userRef = db.collection('users').doc(userProfile.uid);
        await userRef.update({
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

      {/* Header - Constrained Width */}
      <div className="bg-white sticky top-0 z-30 border-b border-slate-100">
          <div className="max-w-md mx-auto px-4 pt-8 pb-4 flex justify-between items-start">
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
      </div>

      <div className="px-4 max-w-md mx-auto mt-6 space-y-8 animate-fade-in">
        <section>
            <ActionCard 
                mode={heroMode}
                title={heroTitle}
                subtitle={heroSubtitle}
                meta={heroMeta}
                onClick={handleHeroClick}
            />
            {heroMode !== 'recovery' && (
                <LevelProgressBar 
                    level={currentLevel} 
                    currentXP={displayedXP} 
                    maxXP={getMaxXP(currentLevel)} 
                />
            )}
        </section>

        {showDailyMedicine && (
            <section className={`rounded-2xl p-6 shadow-sm border flex justify-between items-center transition-all ${
                circulationLog 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-slate-100'
            }`}>
                <div>
                    <h3 className={`text-lg font-bold mb-1 ${circulationLog ? 'text-green-900' : 'text-slate-900'}`}>Daglig Medicin</h3>
                    <p className={`text-sm mb-2 ${circulationLog ? 'text-green-700' : 'text-slate-500'}`}>
                        {circulationLog ? 'Utförd' : 'Smörj leden (Cirkulation)'}
                    </p>
                    {!circulationLog && (
                        <div className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                            +30 XP
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleMedicineClick}
                    disabled={!!circulationLog}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        circulationLog 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                >
                    {circulationLog ? <Check className="w-6 h-6" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                </button>
            </section>
        )}

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