import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getAssessmentFromStorage, clearAssessmentStorage } from '../utils/assessmentEngine';
import { generateLevelPlan } from '../utils/workoutEngine';
import { UserProfile, Exercise } from '../types';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const assessmentData = getAssessmentFromStorage();
      
      let profileData: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email!,
        subscriptionStatus: 'none',
        onboardingCompleted: false,
        currentLevel: 1,
      };

      if (assessmentData && assessmentData.programConfig) {
        // GENERATE PLAN IDS
        // We need to fetch exercises once to generate the random IDs
        const querySnapshot = await getDocs(collection(db, "exercises"));
        const allExercises: Exercise[] = [];
        querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));
        
        const joint = assessmentData.joint === 'Knä' ? 'knee' : (assessmentData.joint === 'Höft' ? 'hip' : 'shoulder');
        const planIds = generateLevelPlan(allExercises, assessmentData.programConfig.level, joint);

        profileData = {
            ...profileData,
            currentLevel: assessmentData.level,
            program: assessmentData.programConfig,
            activePlanIds: planIds,
            exerciseProgress: {} // Init empty progress
        };
      }

      await setDoc(doc(db, 'users', user.uid), profileData);
      clearAssessmentStorage();
      navigate('/payment');

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Spara din plan</h2>
        <form onSubmit={handleRegister} className="space-y-4">
            <input 
                type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-300"
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-post"
            />
            <input 
                type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-300"
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Lösenord"
            />
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex justify-center">
                {loading ? <Loader2 className="animate-spin" /> : 'Spara & Gå vidare'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Register;