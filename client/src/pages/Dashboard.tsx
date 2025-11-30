import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { Exercise } from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Flame, Lightbulb, ExternalLink } from 'lucide-react';
import { toLocalISOString } from '../utils/dateHelpers';
import { generateLevelPlan, getWorkoutSession } from '../utils/workoutEngine';
import { getMaxXP } from '../utils/progressionEngine'; // Updated import

import ActionCard from '../components/ActionCard';
import LevelProgressBar from '../components/LevelProgressBar';
import PreWorkoutModal from '../components/PreWorkoutModal';
import BossFightModal from '../components/BossFightModal';

const Dashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const { currentDate: today } = useTime(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [showPreFlight, setShowPreFlight] = useState(false);
  const [showBossFight, setShowBossFight] = useState(false);
  
  const history = userProfile?.activityHistory || [];
  const currentLevel = userProfile?.currentLevel || 1;
  const selectedDateStr = toLocalISOString(today);
  const logEntry = history.find(h => h.date === selectedDateStr);
  
  const dayIndex = today.getDay();
  const rehabDays = [1, 3, 5]; 
  const isRehabDay = currentLevel === 1 || rehabDays.includes(dayIndex);
  
  let dailyState = 'rest';
  
  if (logEntry) {
      dailyState = 'completed';
  } else if (isRehabDay) {
      if (userProfile?.progression?.levelMaxedOut) {
          dailyState = 'boss_fight_ready';
      } else {
          dailyState = 'todo';
      }
  } else {
      dailyState = 'rest';
  }

  useEffect(() => {
    const initPlan = async () => {
      if (!userProfile) return;
      
      if (!userProfile.activePlanIds || userProfile.activePlanIds.length === 0) {
        console.log("Generating plan for user...");
        try {
            const querySnapshot = await getDocs(collection(db, "exercises"));
            const allExercises: Exercise[] = [];
            querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));
            
            const joint = userProfile.program?.joint || 'Knä'; 
            const mappedJoint = joint === 'Knä' ? 'knee' : (joint === 'Höft' ? 'hip' : 'shoulder');

            const newPlanIds = generateLevelPlan(allExercises, currentLevel, mappedJoint);
            
            await updateDoc(doc(db, 'users', userProfile.uid), {
                activePlanIds: newPlanIds
            });
            await refreshProfile();
        } catch (e) {
            console.error("Plan generation failed", e);
        }
      }
      setLoading(false);
    };
    initPlan();
  }, [userProfile, currentLevel]);

  const handleStartClick = () => {
    if (dailyState === 'boss_fight_ready') {
        setShowBossFight(true);
    } else {
        setShowPreFlight(true);
    }
  };

  const handleLaunchSession = async () => {
    setShowPreFlight(false);
    if (!userProfile) return;

    const querySnapshot = await getDocs(collection(db, "exercises"));
    const allExercises: Exercise[] = [];
    querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));

    const session = getWorkoutSession(userProfile, allExercises, 'rehab');
    
    navigate('/workout', { state: { session } });
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
    } catch (e) {
        console.error("Level up failed:", e);
    }
  };

  let cardTitle = "Vila & Återhämtning";
  let cardSubtitle = "Ingen träning idag";
  
  if (dailyState === 'todo') {
      cardTitle = "Starta Dagens Pass";
      cardSubtitle = "Fokus: Styrka & Kontroll";
  } else if (dailyState === 'boss_fight_ready') {
      cardTitle = "GÖR NIVÅ-TESTET";
      cardSubtitle = "Du är redo för nästa nivå!";
  }

  // Calculate dynamic Max XP
  const maxXP = getMaxXP(currentLevel);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      <PreWorkoutModal 
        isOpen={showPreFlight} 
        onClose={() => setShowPreFlight(false)} 
        onStart={handleLaunchSession}
        level={currentLevel}
        type="rehab"
      />

      <BossFightModal
        isOpen={showBossFight}
        onClose={() => setShowBossFight(false)}
        onSuccess={handleBossFightSuccess}
        level={currentLevel}
      />

      {/* Header */}
      <div className="pt-12 pb-6 px-6 bg-white sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Hej {userProfile?.displayName || 'Kämpe'} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                {new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
            </p>
        </div>
        <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <Flame className="w-4 h-4 text-orange-500 mr-1.5 fill-orange-500" />
            <span className="text-sm font-bold text-orange-700">3 dagar</span>
        </div>
      </div>

      <div className="px-6 max-w-md mx-auto mt-6 space-y-10 animate-fade-in">
        <div className="relative">
            <ActionCard 
                state={dailyState as any}
                title={cardTitle}
                subtitle={cardSubtitle}
                duration="Ca 15 min"
                onClick={handleStartClick}
            />
            {dailyState !== 'rest' && (
                <LevelProgressBar 
                    level={currentLevel} 
                    currentXP={userProfile?.progression?.experiencePoints || 0} 
                    maxXP={maxXP} 
                />
            )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
                <Lightbulb className="w-5 h-5 text-yellow-500 fill-current" />
                Dagens Tips
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Varför gör det ont när det regnar?</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Lufttrycket påverkar vätsketrycket i leden.
            </p>
            <button className="text-blue-600 text-sm font-bold flex items-center hover:underline">
                Läs hela artikeln <ExternalLink className="w-3 h-3 ml-1" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;