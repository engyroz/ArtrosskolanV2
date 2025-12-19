
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Video, Plus, Trash2, Edit2, PlayCircle, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { db } from '../../firebase';
import { Lecture, BunnyVideo } from '../../types';
import { BUNNY_LIBRARY_ID, BUNNY_PULL_ZONE } from '../../utils/contentConfig';

interface LectureManagerToolProps {
  onBack: () => void;
}

const LectureManagerTool = ({ onBack }: LectureManagerToolProps) => {
  // Data State
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [bunnyVideos, setBunnyVideos] = useState<BunnyVideo[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [loadingBunny, setLoadingBunny] = useState(true);
  const [bunnyError, setBunnyError] = useState<string | null>(null);
  
  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<Partial<Lecture>>({
    title: '',
    description: '',
    category: 'Education',
    order: 1,
    unlockThreshold: 0,
    videoId: '',
    duration: '',
    thumbnailUrl: ''
  });

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchLectures();
    fetchBunnyVideos();
  }, []);

  const fetchLectures = async () => {
    setLoadingLectures(true);
    try {
      const snapshot = await db.collection('lectures').orderBy('order', 'asc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
      setLectures(data);
    } catch (err) {
      console.error("Error loading lectures:", err);
    } finally {
      setLoadingLectures(false);
    }
  };

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

  // --- 2. Form Logic ---

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    const nextOrder = lectures.length > 0 ? Math.max(...lectures.map(l => l.order)) + 1 : 1;
    setFormData({
      title: '',
      description: '',
      category: 'Education',
      order: nextOrder,
      unlockThreshold: 0,
      videoId: '',
      duration: '',
      thumbnailUrl: '',
      bunnyLibraryId: BUNNY_LIBRARY_ID
    });
  };

  const handleEdit = (lecture: Lecture) => {
    setIsCreating(false);
    setEditingId(lecture.id);
    setFormData({ ...lecture });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      await db.collection('lectures').doc(id).delete();
      setLectures(prev => prev.filter(l => l.id !== id));
      if (editingId === id) {
          setEditingId(null);
          setIsCreating(false);
      }
    } catch (err) {
      console.error("Error deleting lecture:", err);
      alert("Failed to delete.");
    }
  };

  const handleBunnySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedGuid = e.target.value;
      if (!selectedGuid) return;

      const vid = bunnyVideos.find(v => v.guid === selectedGuid);
      if (vid) {
          // Calculate duration MM:SS
          const minutes = Math.floor(vid.length / 60);
          const seconds = vid.length % 60;
          const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          // Construct thumbnail URL
          // If a specific Pull Zone is configured, use it. Otherwise fall back to the default pattern.
          const pullZoneHost = BUNNY_PULL_ZONE || `vz-${BUNNY_LIBRARY_ID}.b-cdn.net`;
          const thumbUrl = `https://${pullZoneHost}/${vid.guid}/${vid.thumbnailFileName}`;

          setFormData(prev => ({
              ...prev,
              videoId: vid.guid,
              title: prev.title || vid.title, // Auto-fill title if empty
              duration: durationStr,
              thumbnailUrl: thumbUrl
          }));
      }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.videoId) {
        alert("Title and Video are required.");
        return;
    }

    setSaving(true);
    try {
        const payload = {
            ...formData,
            bunnyLibraryId: BUNNY_LIBRARY_ID // Ensure lib ID is attached
        };

        if (isCreating) {
            const newRef = db.collection('lectures').doc();
            await newRef.set({ id: newRef.id, ...payload });
            setLectures(prev => [...prev, { id: newRef.id, ...payload } as Lecture]);
        } else if (editingId) {
            await db.collection('lectures').doc(editingId).update(payload);
            setLectures(prev => prev.map(l => l.id === editingId ? { ...l, ...payload } as Lecture : l));
        }

        setIsCreating(false);
        setEditingId(null);
        alert("Lecture saved successfully!");
    } catch (err) {
        console.error("Error saving lecture:", err);
        alert("Failed to save.");
    } finally {
        setSaving(false);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Toolbar */}
       <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm flex-shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Video className="w-6 h-6 text-blue-600" /> Lecture Manager
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> New Lecture
                    </button>
                </div>
            </div>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
            
            {/* LEFT: List */}
            <div className="w-full md:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-140px)]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Database Lectures</h3>
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{lectures.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loadingLectures ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : lectures.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <Database className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-bold">No lectures in Database.</p>
                            <p className="text-xs">Create one here or run the seed script to populate defaults.</p>
                        </div>
                    ) : (
                        lectures.map(l => (
                            <div 
                                key={l.id} 
                                onClick={() => handleEdit(l)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${editingId === l.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{l.order}</span>
                                    {l.category && <span className="text-[10px] text-slate-500 uppercase">{l.category}</span>}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{l.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {l.duration}</span>
                                    <span className="px-1">•</span>
                                    <span>Unlock: {l.unlockThreshold} sessions</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Editor */}
            <div className="w-full md:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-140px)]">
                 {(isCreating || editingId) ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                {isCreating ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                {isCreating ? 'Create New Lecture' : 'Edit Lecture'}
                            </h3>
                            {!isCreating && (
                                <button onClick={() => handleDelete(editingId!)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Bunny Video Selector */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                                    <span>Select Video Source (Bunny.net)</span>
                                    <button onClick={fetchBunnyVideos} className="text-blue-600 hover:text-blue-800" title="Refresh Videos">
                                        <RefreshCw className={`w-3.5 h-3.5 ${loadingBunny ? 'animate-spin' : ''}`} />
                                    </button>
                                </label>
                                
                                {loadingBunny ? (
                                     <div className="text-xs text-slate-500 flex items-center gap-2 py-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Connecting to Bunny API...
                                     </div>
                                ) : bunnyError ? (
                                    <div className="text-red-600 text-xs flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100">
                                        <AlertCircle className="w-4 h-4" /> {bunnyError}
                                    </div>
                                ) : bunnyVideos.length === 0 ? (
                                    <div className="text-orange-600 text-xs flex items-center gap-2 bg-orange-50 p-2 rounded border border-orange-100">
                                        <AlertCircle className="w-4 h-4" /> Connected, but no videos found in library.
                                    </div>
                                ) : (
                                    <select 
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        value={formData.videoId || ''}
                                        onChange={handleBunnySelection}
                                    >
                                        <option value="">-- Choose a Video --</option>
                                        {bunnyVideos.map(v => (
                                            <option key={v.guid} value={v.guid}>
                                                {v.title} ({Math.floor(v.length/60)}m {v.length%60}s)
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <p className="text-xs text-slate-400 mt-2">
                                    Selecting a video will auto-fill Title, Duration, and the Thumbnail.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Order Index</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={formData.order}
                                        onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unlock Threshold</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={formData.unlockThreshold}
                                        onChange={e => setFormData({...formData, unlockThreshold: parseInt(e.target.value)})}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Sessions required to view</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration Text</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={formData.duration}
                                        placeholder="e.g. 05:30"
                                        onChange={e => setFormData({...formData, duration: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea 
                                    className="w-full p-2 border border-slate-300 rounded-lg h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thumbnail URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                                        value={formData.thumbnailUrl}
                                        readOnly
                                        title="Auto-generated from Bunny.net"
                                    />
                                </div>
                                {formData.thumbnailUrl ? (
                                    <div className="mt-2 w-32 aspect-video bg-black rounded overflow-hidden relative">
                                        <img 
                                          src={formData.thumbnailUrl} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover" 
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'text-[10px]');
                                            (e.target as HTMLImageElement).parentElement!.innerText = "Image not found";
                                          }}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Select a video to automatically fetch the thumbnail.
                                    </p>
                                )}
                            </div>

                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                             <button 
                                onClick={() => { setIsCreating(false); setEditingId(null); }}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2"
                             >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Lecture
                             </button>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a lecture to edit or create a new one.</p>
                    </div>
                 )}
            </div>
       </div>
    </div>
  );
};

export default LectureManagerTool;
