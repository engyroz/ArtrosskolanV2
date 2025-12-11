
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, X, ChevronRight, Search, Plus, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { Exercise } from '../../types';

interface ProgramBuilderToolProps {
  onBack: () => void;
}

type JointOption = 'knee' | 'hip' | 'shoulder';

const ProgramBuilderTool = ({ onBack }: ProgramBuilderToolProps) => {
  // --- Selection State ---
  const [selectedJoint, setSelectedJoint] = useState<JointOption>('knee');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // --- Data State ---
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  
  // --- Staging State ---
  const [stage1, setStage1] = useState<string[]>([]);
  const [stage2, setStage2] = useState<string[]>([]);
  const [stage3, setStage3] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch All Exercises on Mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const snapshot = await db.collection('exercises').get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        setAllExercises(list);
      } catch (error) {
        console.error("Error loading exercises:", error);
      } finally {
        setLoadingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  // 2. Fetch Program Config when Joint/Level changes
  useEffect(() => {
    const fetchProgram = async () => {
      setLoadingProgram(true);
      const docId = `${selectedJoint}_${selectedLevel}`;
      
      try {
        const doc = await db.collection('levels').doc(docId).get();
        if (doc.exists) {
          const data = doc.data();
          setStage1(data?.stage1_ids && Array.isArray(data.stage1_ids) ? data.stage1_ids : []);
          setStage2(data?.stage2_ids && Array.isArray(data.stage2_ids) ? data.stage2_ids : []);
          setStage3(data?.stage3_ids && Array.isArray(data.stage3_ids) ? data.stage3_ids : []);
        } else {
          // Reset if no config exists yet
          setStage1([]);
          setStage2([]);
          setStage3([]);
        }
      } catch (error) {
        console.error("Error loading program:", error);
        // Ensure arrays are valid even on error
        setStage1([]);
        setStage2([]);
        setStage3([]);
      } finally {
        setLoadingProgram(false);
      }
    };

    fetchProgram();
  }, [selectedJoint, selectedLevel]);

  // 3. Save Handler
  const handleSave = async () => {
    setSaving(true);
    const docId = `${selectedJoint}_${selectedLevel}`;
    
    const payload = {
      id: docId,
      joint: selectedJoint,
      level: selectedLevel,
      stage1_ids: stage1,
      stage2_ids: stage2,
      stage3_ids: stage3,
      updatedAt: new Date().toISOString()
    };

    try {
      await db.collection('levels').doc(docId).set(payload, { merge: true });
      alert("Program saved successfully!");
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Failed to save program.");
    } finally {
      setSaving(false);
    }
  };

  // --- Filtering Logic ---
  
  const isJointMatch = (ex: Exercise, target: string) => {
    if (!ex) return false;

    // Check 'affected_joints' array if it exists (future proofing)
    if (Array.isArray((ex as any).affected_joints)) {
        return (ex as any).affected_joints.includes(target);
    }
    // Fallback to legacy 'joint' string
    const j = ex.joint ? ex.joint.toLowerCase() : '';
    if (!j) return false;
    
    // Normalize DB values to target
    let normalizedDB = j;
    if (j === 'knä' || j === 'kna') normalizedDB = 'knee';
    if (j === 'höft' || j === 'hoft') normalizedDB = 'hip';
    if (j === 'axel') normalizedDB = 'shoulder';

    return normalizedDB === target;
  };

  const getExerciseById = (id: string) => allExercises.find(e => e.id === id);

  // Pool of exercises that match the joint AND are not already in a stage
  const usedIds = new Set([...stage1, ...stage2, ...stage3]);
  const availableExercises = allExercises.filter(ex => {
    if (!ex) return false;
    const matchesJoint = isJointMatch(ex, selectedJoint);
    const notUsed = !usedIds.has(ex.id);
    
    // Safety check for search
    const title = ex.title || '';
    const id = ex.id || '';
    const s = searchTerm.toLowerCase();
    
    const matchesSearch = title.toLowerCase().includes(s) || id.toLowerCase().includes(s);
    return matchesJoint && notUsed && matchesSearch;
  });

  // --- Handlers ---

  const addToStage = (exerciseId: string, stageNum: 1 | 2 | 3) => {
    if (stageNum === 1) setStage1(prev => [...prev, exerciseId]);
    if (stageNum === 2) setStage2(prev => [...prev, exerciseId]);
    if (stageNum === 3) setStage3(prev => [...prev, exerciseId]);
  };

  const removeFromStage = (exerciseId: string, stageNum: 1 | 2 | 3) => {
    if (stageNum === 1) setStage1(prev => prev.filter(id => id !== exerciseId));
    if (stageNum === 2) setStage2(prev => prev.filter(id => id !== exerciseId));
    if (stageNum === 3) setStage3(prev => prev.filter(id => id !== exerciseId));
  };

  // --- Render Helpers ---

  const renderExerciseCard = (id: string, stageNum: 1 | 2 | 3, isSource = false) => {
    const ex = getExerciseById(id);
    if (!ex) return null;

    return (
      <div key={ex.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-2 hover:border-blue-300 transition-colors group">
        <div className="flex gap-3">
            {ex.imageUrl && (
                <img src={ex.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate" title={ex.title}>{ex.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{ex.category || 'General'}</div>
            </div>
        </div>
        
        {/* Actions */}
        <div className="mt-3 flex gap-1 justify-end">
            {isSource ? (
                <>
                    <button onClick={() => addToStage(ex.id, 1)} className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded hover:bg-blue-100">+ S1</button>
                    <button onClick={() => addToStage(ex.id, 2)} className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-600 rounded hover:bg-purple-100">+ S2</button>
                    <button onClick={() => addToStage(ex.id, 3)} className="px-2 py-1 text-[10px] font-bold bg-orange-50 text-orange-600 rounded hover:bg-orange-100">+ S3</button>
                </>
            ) : (
                <button onClick={() => removeFromStage(ex.id, stageNum)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Toolbar */}
       <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Program Builder</h1>
                </div>

                <div className="flex items-center gap-4">
                    <select 
                        value={selectedJoint} 
                        onChange={(e) => setSelectedJoint(e.target.value as JointOption)}
                        className="p-2 border border-slate-300 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="knee">Knä (Knee)</option>
                        <option value="hip">Höft (Hip)</option>
                        <option value="shoulder">Axel (Shoulder)</option>
                    </select>

                    <select 
                        value={selectedLevel} 
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                        className="p-2 border border-slate-300 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>Nivå 1</option>
                        <option value={2}>Nivå 2</option>
                        <option value={3}>Nivå 3</option>
                        <option value={4}>Nivå 4</option>
                    </select>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Program
                    </button>
                </div>
            </div>
       </div>

       {/* Workspace */}
       <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Column 1: Available */}
                <div className="flex flex-col bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-700">Available Pool</h3>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{availableExercises.length}</span>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                                type="text" 
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loadingExercises ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : availableExercises.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-8">No matching exercises found.</p>
                        ) : (
                            availableExercises.map(ex => renderExerciseCard(ex.id, 1, true))
                        )}
                    </div>
                </div>

                {/* Column 2: Stage 1 */}
                <div className="flex flex-col bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-blue-100 bg-white/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-blue-900">Stage 1</h3>
                            <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-600 font-bold">{stage1.length}</span>
                        </div>
                        <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-wide">Nykomling (0-33%)</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loadingProgram ? <Loader2 className="animate-spin mx-auto text-blue-400 mt-8" /> : (
                            stage1.length === 0 ? 
                                <div className="text-center py-10 text-blue-300 text-sm border-2 border-dashed border-blue-100 rounded-xl m-2">Empty Stage</div> :
                                stage1.map(id => renderExerciseCard(id, 1))
                        )}
                    </div>
                </div>

                {/* Column 3: Stage 2 */}
                <div className="flex flex-col bg-purple-50/50 rounded-2xl border border-purple-100 overflow-hidden h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-purple-100 bg-white/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-purple-900">Stage 2</h3>
                            <span className="text-xs bg-purple-100 px-2 py-0.5 rounded-full text-purple-600 font-bold">{stage2.length}</span>
                        </div>
                        <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-wide">På väg (34-66%)</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loadingProgram ? <Loader2 className="animate-spin mx-auto text-purple-400 mt-8" /> : (
                            stage2.length === 0 ? 
                                <div className="text-center py-10 text-purple-300 text-sm border-2 border-dashed border-purple-100 rounded-xl m-2">Empty Stage</div> :
                                stage2.map(id => renderExerciseCard(id, 2))
                        )}
                    </div>
                </div>

                {/* Column 4: Stage 3 */}
                <div className="flex flex-col bg-orange-50/50 rounded-2xl border border-orange-100 overflow-hidden h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-orange-100 bg-white/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-orange-900">Stage 3</h3>
                            <span className="text-xs bg-orange-100 px-2 py-0.5 rounded-full text-orange-600 font-bold">{stage3.length}</span>
                        </div>
                        <p className="text-[10px] text-orange-400 mt-1 uppercase tracking-wide">Expert (67-100%)</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loadingProgram ? <Loader2 className="animate-spin mx-auto text-orange-400 mt-8" /> : (
                            stage3.length === 0 ? 
                                <div className="text-center py-10 text-orange-300 text-sm border-2 border-dashed border-orange-100 rounded-xl m-2">Empty Stage</div> :
                                stage3.map(id => renderExerciseCard(id, 3))
                        )}
                    </div>
                </div>

            </div>
       </div>
    </div>
  );
};

export default ProgramBuilderTool;
