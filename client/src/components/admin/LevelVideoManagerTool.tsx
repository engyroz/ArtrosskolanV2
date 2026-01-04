
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Video, Film, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { db } from '../../firebase';
import { BunnyVideo } from '../../types';

interface LevelVideoManagerToolProps {
  onBack: () => void;
}

type JointOption = 'knee' | 'hip' | 'shoulder';

interface LevelVideoConfig {
  bossIntroVideoId?: string;
  levelIntroVideoId?: string;
  welcomeVideoId?: string; // New field for initial assignment
}

const LevelVideoManagerTool = ({ onBack }: LevelVideoManagerToolProps) => {
  // State
  const [selectedJoint, setSelectedJoint] = useState<JointOption>('knee');
  const [bunnyVideos, setBunnyVideos] = useState<BunnyVideo[]>([]);
  const [loadingBunny, setLoadingBunny] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bunnyError, setBunnyError] = useState<string | null>(null);

  // Local state for the 4 levels of the selected joint
  // Map level number (1-4) to config
  const [levelConfigs, setLevelConfigs] = useState<Record<number, LevelVideoConfig>>({
    1: {}, 2: {}, 3: {}, 4: {}
  });

  // --- 1. Fetch Bunny Videos ---
  useEffect(() => {
    const fetchBunnyVideos = async () => {
      setLoadingBunny(true);
      setBunnyError(null);
      try {
        const res = await fetch('/api/admin/bunny/videos');
        if (!res.ok) throw new Error("Failed to fetch videos from server proxy");
        
        const data = await res.json();
        if (data.items) {
            setBunnyVideos(data.items);
        } else if (Array.isArray(data)) {
            setBunnyVideos(data);
        } else if (data.error) {
            throw new Error(data.error);
        }
      } catch (err: any) {
        console.error("Error loading bunny videos:", err);
        setBunnyError(err.message);
      } finally {
        setLoadingBunny(false);
      }
    };
    fetchBunnyVideos();
  }, []);

  // --- 2. Fetch Level Configs when Joint Changes ---
  useEffect(() => {
    const fetchLevelConfigs = async () => {
      setLoadingConfig(true);
      const newConfigs: Record<number, LevelVideoConfig> = { 1: {}, 2: {}, 3: {}, 4: {} };

      try {
        // Fetch docs for knee_1, knee_2, etc.
        const promises = [1, 2, 3, 4].map(level => 
            db.collection('levels').doc(`${selectedJoint}_${level}`).get()
        );
        
        const snapshots = await Promise.all(promises);
        
        snapshots.forEach((snap, index) => {
            const level = index + 1;
            if (snap.exists) {
                const data = snap.data();
                newConfigs[level] = {
                    bossIntroVideoId: data?.bossIntroVideoId || '',
                    levelIntroVideoId: data?.levelIntroVideoId || '',
                    welcomeVideoId: data?.welcomeVideoId || ''
                };
            }
        });

        setLevelConfigs(newConfigs);
      } catch (error) {
        console.error("Error fetching level configs:", error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchLevelConfigs();
  }, [selectedJoint]);

  // --- Handlers ---

  const handleConfigChange = (level: number, field: keyof LevelVideoConfig, value: string) => {
    setLevelConfigs(prev => ({
        ...prev,
        [level]: {
            ...prev[level],
            [field]: value
        }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        const batch = db.batch();

        [1, 2, 3, 4].forEach(level => {
            const docRef = db.collection('levels').doc(`${selectedJoint}_${level}`);
            const config = levelConfigs[level];
            
            // We use merge: true so we don't overwrite existing exercise arrays (stage1_ids, etc)
            batch.set(docRef, {
                bossIntroVideoId: config.bossIntroVideoId || '',
                levelIntroVideoId: config.levelIntroVideoId || '',
                welcomeVideoId: config.welcomeVideoId || ''
            }, { merge: true });
        });

        await batch.commit();
        alert("Video configuration saved successfully!");
    } catch (error) {
        console.error("Error saving configs:", error);
        alert("Failed to save configuration.");
    } finally {
        setSaving(false);
    }
  };

  // --- Helpers ---
  const getVideoTitle = (guid: string) => {
      const vid = bunnyVideos.find(v => v.guid === guid);
      return vid ? vid.title : guid;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Toolbar */}
       <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm flex-shrink-0">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Film className="w-6 h-6 text-indigo-600" /> Level Video Manager
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                     <select 
                        value={selectedJoint} 
                        onChange={(e) => setSelectedJoint(e.target.value as JointOption)}
                        className="p-2 border border-slate-300 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    >
                        <option value="knee">Knä (Knee)</option>
                        <option value="hip">Höft (Hip)</option>
                        <option value="shoulder">Axel (Shoulder)</option>
                    </select>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

                    <button 
                        onClick={handleSave}
                        disabled={saving || loadingConfig}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
       </div>

       {/* Content */}
       <div className="max-w-6xl mx-auto w-full p-6 animate-fade-in">
            
            {/* Bunny Status */}
            {bunnyError && (
                 <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Error loading Bunny videos: {bunnyError}</span>
                 </div>
            )}
            
            {loadingBunny && (
                <div className="mb-6 bg-blue-50 text-blue-600 p-4 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading videos library...
                </div>
            )}

            {loadingConfig ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
                </div>
            ) : (
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Nivå {level}</h2>
                                <span className="text-xs font-mono text-slate-400">{selectedJoint}_{level}</span>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* 1. Welcome Video (NEW) */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Sparkles className="w-4 h-4 text-yellow-500" /> Welcome Video
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3 min-h-[2.5em]">
                                        Played when a user is <strong>first assigned</strong> this level (e.g. after assessment).
                                    </p>
                                    <select 
                                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                        value={levelConfigs[level]?.welcomeVideoId || ''}
                                        onChange={(e) => handleConfigChange(level, 'welcomeVideoId', e.target.value)}
                                    >
                                        <option value="">-- No Video Selected --</option>
                                        {bunnyVideos.map(v => (
                                            <option key={v.guid} value={v.guid}>
                                                {v.title}
                                            </option>
                                        ))}
                                    </select>
                                    {levelConfigs[level]?.welcomeVideoId && (
                                        <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                            Selected: {getVideoTitle(levelConfigs[level]!.welcomeVideoId!)}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Level Intro Video */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Video className="w-4 h-4 text-blue-500" /> Level Intro Video
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3 min-h-[2.5em]">
                                        Played when unlocking this level from the previous one (Victory screen).
                                    </p>
                                    <select 
                                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                        value={levelConfigs[level]?.levelIntroVideoId || ''}
                                        onChange={(e) => handleConfigChange(level, 'levelIntroVideoId', e.target.value)}
                                    >
                                        <option value="">-- No Video Selected --</option>
                                        {bunnyVideos.map(v => (
                                            <option key={v.guid} value={v.guid}>
                                                {v.title}
                                            </option>
                                        ))}
                                    </select>
                                    {levelConfigs[level]?.levelIntroVideoId && (
                                        <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                            Selected: {getVideoTitle(levelConfigs[level]!.levelIntroVideoId!)}
                                        </div>
                                    )}
                                </div>

                                {/* 3. Boss Fight Intro Video */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Video className="w-4 h-4 text-orange-500" /> Boss Fight Intro
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3 min-h-[2.5em]">
                                        Played when the user clicks "Start Level Test" for Level {level}.
                                    </p>
                                    <select 
                                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                        value={levelConfigs[level]?.bossIntroVideoId || ''}
                                        onChange={(e) => handleConfigChange(level, 'bossIntroVideoId', e.target.value)}
                                    >
                                        <option value="">-- No Video Selected --</option>
                                        {bunnyVideos.map(v => (
                                            <option key={v.guid} value={v.guid}>
                                                {v.title}
                                            </option>
                                        ))}
                                    </select>
                                    {levelConfigs[level]?.bossIntroVideoId && (
                                        <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                            Selected: {getVideoTitle(levelConfigs[level]!.bossIntroVideoId!)}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
       </div>
    </div>
  );
};

export default LevelVideoManagerTool;
