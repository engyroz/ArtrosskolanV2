
import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Loader2, UserCheck } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfileResetToolProps {
  onBack: () => void;
}

const UserProfileResetTool = ({ onBack }: UserProfileResetToolProps) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedJoint, setSelectedJoint] = useState<'knee' | 'hip' | 'shoulder'>('knee');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const handleReset = async () => {
    if (!user || !userProfile) return;
    
    if (!window.confirm("WARNING: This will completely WIPE your current progress, history, and settings to simulate a brand new user starting at the selected level. Your 'admin' role will be preserved.")) {
        return;
    }

    setLoading(true);

    try {
        const userRef = db.collection('users').doc(user.uid);
        
        // Map to display names for DB
        const jointNameMap: Record<string, string> = {
            'knee': 'Knä',
            'hip': 'Höft',
            'shoulder': 'Axel'
        };

        const jointName = jointNameMap[selectedJoint];

        const resetPayload = {
            // Ensure subscription is active so we can see the app
            subscriptionStatus: 'active',
            
            // Trigger Welcome Flow
            onboardingCompleted: true,
            welcomeScreenSeen: false, // <--- This triggers the modal on Dashboard

            // Program Config
            currentLevel: selectedLevel,
            program: {
                joint: jointName,
                level: selectedLevel,
                generatedAt: new Date().toISOString(),
                irritability: 'Moderate', // Default
                rehabDaysPerWeek: 3,
                circulationDaysPerWeek: 4,
                focusAreas: ['Styrka', 'Funktion'],
                activityPrescription: {
                    type: 'Promenad',
                    label: 'Daglig Promenad',
                    description: '30 minuter',
                    durationMinutes: 30,
                    frequencyLabel: 'Varje dag'
                }
            },

            // Reset Progression
            progression: {
                currentPhase: 1,
                experiencePoints: 0,
                levelMaxedOut: false,
                lifetimeSessions: 0,
                currentStage: 1
            },

            // Clear History
            activityHistory: [],
            exerciseProgress: {},
            completedEducationIds: [],
            openedChests: []
        };

        // Perform update
        await userRef.update(resetPayload);
        
        // Refresh context
        await refreshProfile();

        // Navigate
        navigate('/dashboard');

    } catch (error) {
        console.error("Reset failed:", error);
        alert("Failed to reset profile.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to tools
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Reset User Profile</h2>
                    <p className="text-sm text-slate-500">Simulate a new user starting a specific program.</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 text-sm text-blue-800">
                <strong>Action:</strong> Resets your current account (keeping Admin role) to "Just Onboarded" state.
                This allows you to test the <strong>Welcome Modal</strong> and the initial dashboard state for any Joint/Level combination.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Joint</label>
                    <select 
                        value={selectedJoint}
                        onChange={(e) => setSelectedJoint(e.target.value as any)}
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="knee">Knä (Knee)</option>
                        <option value="hip">Höft (Hip)</option>
                        <option value="shoulder">Axel (Shoulder)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Starting Level</label>
                    <select 
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value={1}>Nivå 1</option>
                        <option value={2}>Nivå 2</option>
                        <option value={3}>Nivå 3</option>
                        <option value={4}>Nivå 4</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={handleReset}
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Reset & Go to Dashboard
            </button>
        </div>
    </div>
  );
};

export default UserProfileResetTool;
