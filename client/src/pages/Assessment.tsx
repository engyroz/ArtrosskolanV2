import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { 
  getAssessmentState,
  AVAILABLE_JOINTS,
  AssessmentState,
  saveAssessmentToStorage
} from '../utils/assessmentEngine';
import { generateLevelPlan } from '../utils/workoutEngine';
import { JointType, Question, Exercise } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';

const Assessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshProfile } = useAuth();
  
  const [selectedJoint, setSelectedJoint] = useState<JointType | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({ status: 'QUESTION', progress: 0 });
  
  const [loading, setLoading] = useState(false);
  const [localValue, setLocalValue] = useState<any>(null); 

  useEffect(() => {
    const jointParam = searchParams.get('joint');
    if (jointParam) {
        if (jointParam === 'knee') setSelectedJoint('Knä');
        else if (jointParam === 'hip') setSelectedJoint('Höft');
        else if (jointParam === 'shoulder') setSelectedJoint('Axel');
    }
  }, [searchParams]);

  // Recalculate state when answers or joint change
  useEffect(() => {
    if (selectedJoint) {
      const state = getAssessmentState(selectedJoint, answers);
      setAssessmentState(state);
      
      // Reset local value when moving to a NEW question
      // We check if the question ID has changed to avoid resetting during re-renders of same question
      if (state.status === 'QUESTION' && state.nextQuestion?.id !== assessmentState.nextQuestion?.id) {
          setLocalValue(null);
      }
    }
  }, [selectedJoint, answers]);

  const finishAssessment = async (finalAnswers: Record<string, any>, result: any) => {
    if (loading) return; 
    setLoading(true);
    console.log("Finishing Assessment...", result);

    try {
        if (user) {
            console.log("User is authenticated. Saving to Firestore...");
            const querySnapshot = await getDocs(collection(db, "exercises"));
            const allExercises: Exercise[] = [];
            querySnapshot.forEach((doc) => allExercises.push({ id: doc.id, ...doc.data() } as Exercise));
            
            const mappedJoint = selectedJoint === 'Knä' ? 'knee' : (selectedJoint === 'Höft' ? 'hip' : 'shoulder');
            const planIds = generateLevelPlan(allExercises, result.level, mappedJoint);

            const userRef = doc(db, 'users', user.uid);
            
            const payload = {
                onboardingCompleted: true,
                assessmentData: finalAnswers,
                currentLevel: result.level,
                program: result,
                activePlanIds: planIds,
                exerciseProgress: {} 
            };

            await setDoc(userRef, payload, { merge: true });
            await refreshProfile();
            navigate('/dashboard');
        } else {
            console.log("User is anonymous. Saving to LocalStorage...");
            saveAssessmentToStorage({
                joint: selectedJoint!,
                level: result.level,
                functionalAnswers: finalAnswers, 
                activityLevel: finalAnswers['activityProfile'],
                goal: finalAnswers['mainGoal'],
                programConfig: result
            });

            setTimeout(() => {
                navigate('/results');
            }, 500); 
        }
    } catch (error) {
        console.error("Error saving assessment:", error);
        alert("Ett fel uppstod. Försök igen.");
        setLoading(false);
    }
  };

  const handleNext = () => {
    if (assessmentState.nextQuestion && localValue !== null) {
        const newAnswers = { ...answers, [assessmentState.nextQuestion.id]: localValue };
        setAnswers(newAnswers);

        // Check immediately if this was the last question
        const nextState = getAssessmentState(selectedJoint!, newAnswers);
        
        if (nextState.status === 'COMPLETE' && nextState.result) {
            finishAssessment(newAnswers, nextState.result);
        }
    }
  };

  // --- Renderers ---

  const renderSafetyCheck = () => (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
            <h2 className="text-2xl font-bold text-red-800">Säkerhetskontroll</h2>
        </div>
        <p className="text-lg text-slate-800 mb-6 font-medium">
            Eftersom du har hög smärta måste vi utesluta att det är något akut.
            Stämmer något av följande in på dig?
        </p>
        <ul className="list-disc list-inside space-y-3 mb-8 text-slate-700 text-lg ml-2">
            <li>Du har nyligen ramlat eller slagit i leden kraftigt.</li>
            <li>Du har feber eller känner dig allmänt sjuk.</li>
            <li>Leden är kraftigt svullen, röd och varm.</li>
        </ul>
        
        <div className="grid grid-cols-1 gap-4">
            <button 
                onClick={() => setAnswers(prev => ({ ...prev, safetyCheck: 'fail' }))}
                className="w-full p-4 border-2 border-red-300 bg-white hover:bg-red-100 rounded-xl text-left font-bold text-red-800 transition-all"
            >
                Ja, något av detta stämmer
            </button>
            <button 
                onClick={() => {
                    const newAnswers = { ...answers, safetyCheck: 'pass' };
                    setAnswers(newAnswers);
                    // Check if complete immediately (Level 1 fast track)
                    const nextState = getAssessmentState(selectedJoint!, newAnswers);
                    if (nextState.status === 'COMPLETE' && nextState.result) {
                        finishAssessment(newAnswers, nextState.result);
                    }
                }}
                className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all text-center"
            >
                Nej, inget av detta stämmer (Gå vidare)
            </button>
        </div>
    </div>
  );

  const renderHardStop = () => (
    <div className="bg-white p-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-red-600 mb-6">
            <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Vi rekommenderar vårdkontakt</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            Baserat på dina svar bör du kontakta 1177 eller din vårdcentral för en fysisk undersökning innan du börjar träna på egen hand.
        </p>
        <a 
            href="https://www.1177.se" 
            className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
        >
            Gå till 1177.se
        </a>
        <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-slate-400 font-medium">Börja om</button>
    </div>
  );

  const renderQuestion = (q: Question) => {
    // Determine button label based on progress
    const isLastQuestion = assessmentState.progress >= 90;
    const buttonLabel = isLastQuestion ? 'Analysera mina svar' : 'Nästa';

    if (q.type === 'scale') {
        return (
            <div className="animate-fade-in-up">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">{q.text}</h3>
                <input 
                    type="range" min="0" max="10" step="1"
                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                    value={localValue || 5}
                    onChange={(e) => setLocalValue(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-slate-500 font-medium mb-12">
                    <span>Ingen smärta (0)</span>
                    <span>Värsta tänkbara (10)</span>
                </div>
                <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-blue-600">{localValue !== null ? localValue : 5}</span>
                </div>
                <button
                    onClick={() => {
                        // Special handling for scale: confirm local value then next
                        const val = localValue !== null ? localValue : 5;
                        setLocalValue(val); // Ensure local value is set
                        // Need to manually trigger logic similar to handleNext since handleNext relies on state being ready
                        // But handleNext uses localValue, so we can just call it
                        // We set localValue first to be safe, though state update is async.
                        // Better to pass val directly to logic.
                        const newAnswers = { ...answers, [q.id]: val };
                        setAnswers(newAnswers);
                        const nextState = getAssessmentState(selectedJoint!, newAnswers);
                        if (nextState.status === 'COMPLETE' && nextState.result) {
                            finishAssessment(newAnswers, nextState.result);
                        }
                    }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg"
                >
                    {buttonLabel}
                </button>
            </div>
        );
    }

    return (
      <div className="animate-fade-in-up">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">{q.text}</h3>
        <div className="space-y-4 mb-8">
            {q.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalValue(opt.value)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all group relative ${
                    localValue === opt.value 
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-lg font-medium ${localValue === opt.value ? 'text-blue-900' : 'text-slate-700'}`}>
                    {opt.label}
                </span>
                {localValue === opt.value && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-blue-600">
                        <CheckCircle className="w-6 h-6 fill-current" />
                    </div>
                )}
              </button>
            ))}
        </div>
        
        <button
            onClick={handleNext}
            disabled={localValue === null}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center ${
                localValue !== null 
                ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
            {buttonLabel} 
            {!isLastQuestion && <ArrowRight className="ml-2 w-5 h-5" />}
        </button>
      </div>
    );
  };

  const renderJointSelection = () => (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Vad söker du hjälp för?</h2>
      <div className="space-y-4">
        {AVAILABLE_JOINTS.map((joint) => (
          <button
            key={joint}
            onClick={() => setSelectedJoint(joint)}
            className="w-full flex items-center p-6 text-left border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group bg-white shadow-sm"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-slate-900">{joint}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-20 animate-fade-in">
      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 text-blue-600 mb-8">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Skapar din rehabplan...</h2>
      <p className="text-xl text-slate-600">
        Analyserar smärtnivå, funktion och mål.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        
        {selectedJoint && assessmentState.status !== 'COMPLETE' && assessmentState.status !== 'HARD_STOP' && (
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Analys</span>
                    <span>{assessmentState.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-blue-600 h-2 transition-all duration-500 ease-out" 
                        style={{ width: `${assessmentState.progress}%` }}
                    ></div>
                </div>
            </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 border border-slate-100 min-h-[400px] flex flex-col justify-center">
            
            {loading || assessmentState.status === 'COMPLETE' ? renderLoading() : (
                <>
                    {!selectedJoint && renderJointSelection()}
                    {selectedJoint && assessmentState.status === 'SAFETY_CHECK' && renderSafetyCheck()}
                    {selectedJoint && assessmentState.status === 'HARD_STOP' && renderHardStop()}
                    {selectedJoint && assessmentState.status === 'QUESTION' && assessmentState.nextQuestion && (
                        renderQuestion(assessmentState.nextQuestion)
                    )}
                </>
            )}

        </div>
      </div>
    </div>
  );
};

export default Assessment;