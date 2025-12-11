
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, Trash2, Check, AlertCircle, Loader2, Plus, Search } from 'lucide-react';
import { db, storage } from '../../firebase';
import firebase from 'firebase/compat/app';
import { Exercise } from '../../types';

interface ImageManagerToolProps {
  onBack: () => void;
}

const ImageManagerTool = ({ onBack }: ImageManagerToolProps) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'single'>('bulk');

  // --- BULK STATE ---
  const [bulkFiles, setBulkFiles] = useState<FileList | null>(null);
  const [bulkProgress, setBulkProgress] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // --- SINGLE STATE ---
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [uploadingSingle, setUploadingSingle] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load exercises for dropdown
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const snapshot = await db.collection('exercises').orderBy('title').get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        setExercises(list);
      } catch (error) {
        console.error("Error loading exercises", error);
      }
    };
    fetchExercises();
  }, []);

  // --- BULK LOGIC ---

  const handleBulkUpload = async () => {
    if (!bulkFiles || bulkFiles.length === 0) return;

    setBulkStatus('uploading');
    setBulkProgress('Analyzing files...');

    try {
        const updates: Record<string, { sequence: number; url: string }[]> = {};
        const totalFiles = bulkFiles.length;

        // 1. Upload Loop
        for (let i = 0; i < totalFiles; i++) {
            const file = bulkFiles[i];
            setBulkProgress(`Uploading ${i + 1}/${totalFiles}: ${file.name}`);

            // Parse filename: [id]_[seq].ext
            // Example: squat_1.jpg
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
            const parts = nameWithoutExt.split('_');
            
            // Default to sequence 1 if no underscore found
            let exerciseId = nameWithoutExt;
            let sequence = 1;

            // If format is id_number, parse it
            const lastPart = parts[parts.length - 1];
            if (!isNaN(parseInt(lastPart))) {
                sequence = parseInt(lastPart);
                exerciseId = parts.slice(0, parts.length - 1).join('_');
            }

            // Upload to Storage
            const storageRef = storage.ref(`exercises/${file.name}`);
            await storageRef.put(file);
            const downloadURL = await storageRef.getDownloadURL();

            if (!updates[exerciseId]) {
                updates[exerciseId] = [];
            }
            updates[exerciseId].push({ sequence, url: downloadURL });
        }

        setBulkProgress('Updating database records...');

        // 2. Batch Update Firestore
        const batch = db.batch();
        let batchCount = 0;

        for (const [exId, images] of Object.entries(updates)) {
            // Sort by sequence
            images.sort((a, b) => a.sequence - b.sequence);
            const urls = images.map(img => img.url);

            const docRef = db.collection('exercises').doc(exId);
            
            // We set 'imageUrl' to the first one for backward compatibility
            batch.set(docRef, { 
                imageUrls: urls,
                imageUrl: urls[0] 
            }, { merge: true });

            batchCount++;
            if (batchCount >= 400) {
                await batch.commit();
                batchCount = 0; // Reset for next batch logic if needed (simplified here)
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        setBulkStatus('success');
        setBulkProgress(`Successfully processed ${totalFiles} images for ${Object.keys(updates).length} exercises.`);
        setBulkFiles(null); // Reset input

    } catch (error: any) {
        console.error(error);
        setBulkStatus('error');
        setBulkProgress(`Error: ${error.message}`);
    }
  };

  // --- SINGLE LOGIC ---

  const handleSingleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !selectedExerciseId) return;
      
      const file = e.target.files[0];
      setUploadingSingle(true);

      try {
          // Upload
          const storageRef = storage.ref(`exercises/${selectedExerciseId}_${Date.now()}_${file.name}`);
          await storageRef.put(file);
          const downloadURL = await storageRef.getDownloadURL();

          // Update Firestore
          await db.collection('exercises').doc(selectedExerciseId).update({
              imageUrls: firebase.firestore.FieldValue.arrayUnion(downloadURL),
              // If it was empty/missing, set the main one too
              imageUrl: downloadURL 
          });

          // Refresh local state (simplified by just updating the one item in list)
          setExercises(prev => prev.map(ex => {
              if (ex.id === selectedExerciseId) {
                  const currentUrls = ex.imageUrls || (ex.imageUrl ? [ex.imageUrl] : []);
                  return { ...ex, imageUrls: [...currentUrls, downloadURL], imageUrl: ex.imageUrl || downloadURL };
              }
              return ex;
          }));

      } catch (error) {
          console.error(error);
          alert("Failed to upload image");
      } finally {
          setUploadingSingle(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleSingleDeleteImage = async (urlToDelete: string) => {
      if (!window.confirm("Are you sure you want to remove this image?")) return;
      if (!selectedExerciseId) return;

      try {
          await db.collection('exercises').doc(selectedExerciseId).update({
              imageUrls: firebase.firestore.FieldValue.arrayRemove(urlToDelete)
          });

          // Handle main imageUrl fallback
          const currentEx = exercises.find(e => e.id === selectedExerciseId);
          if (currentEx && currentEx.imageUrl === urlToDelete) {
             // If we deleted the "cover" image, pick another one if available
             const remaining = (currentEx.imageUrls || []).filter(u => u !== urlToDelete);
             const newMain = remaining.length > 0 ? remaining[0] : ''; // Fallback placeholder in real app
             await db.collection('exercises').doc(selectedExerciseId).update({
                 imageUrl: newMain
             });
          }

          // Refresh local
          setExercises(prev => prev.map(ex => {
              if (ex.id === selectedExerciseId) {
                  const updatedUrls = (ex.imageUrls || []).filter(u => u !== urlToDelete);
                  const updatedMain = ex.imageUrl === urlToDelete ? (updatedUrls[0] || '') : ex.imageUrl;
                  return { ...ex, imageUrls: updatedUrls, imageUrl: updatedMain };
              }
              return ex;
          }));

      } catch (error) {
          console.error(error);
          alert("Failed to delete image link");
      }
  };

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId);
  const currentImages = selectedExercise?.imageUrls || (selectedExercise?.imageUrl ? [selectedExercise.imageUrl] : []);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> Image Manager
            </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
            <button
                onClick={() => setActiveTab('bulk')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'bulk' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Bulk Upload
            </button>
            <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'single' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Single Manager
            </button>
        </div>

        {/* --- BULK CONTENT --- */}
        {activeTab === 'bulk' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Batch Upload</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Select multiple files. Files should be named <code>exerciseID_sequence.jpg</code> (e.g. <code>squat_1.jpg</code>).
                </p>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors mb-6">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => setBulkFiles(e.target.files)}
                        className="hidden" 
                        id="bulk-file-upload"
                    />
                    <label htmlFor="bulk-file-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-10 h-10 text-slate-400 mb-3" />
                        <span className="text-slate-700 font-bold mb-1">Click to select files</span>
                        <span className="text-slate-400 text-xs">JPG, PNG, WEBP</span>
                    </label>
                </div>

                {bulkFiles && (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium">
                        {bulkFiles.length} files selected
                    </div>
                )}

                {bulkStatus === 'uploading' && (
                     <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
                             <Loader2 className="w-4 h-4 animate-spin" /> {bulkProgress}
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-full animate-pulse"></div>
                        </div>
                     </div>
                )}

                {bulkStatus === 'success' && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                        <Check className="w-5 h-5" /> {bulkProgress}
                    </div>
                )}

                {bulkStatus === 'error' && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {bulkProgress}
                    </div>
                )}

                <button
                    onClick={handleBulkUpload}
                    disabled={!bulkFiles || bulkStatus === 'uploading'}
                    className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
                        !bulkFiles || bulkStatus === 'uploading' 
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    Start Upload
                </button>
            </div>
        )}

        {/* --- SINGLE CONTENT --- */}
        {activeTab === 'single' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Manage Single Exercise</h2>
                
                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Exercise</label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 pl-10 bg-slate-50 border border-slate-300 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedExerciseId}
                            onChange={(e) => setSelectedExerciseId(e.target.value)}
                        >
                            <option value="">-- Choose an exercise --</option>
                            {exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.title} ({ex.id})
                                </option>
                            ))}
                        </select>
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                {selectedExerciseId && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">Current Images ({currentImages.length})</h3>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleSingleAddImage}
                                    className="hidden" 
                                    id="single-add-image"
                                    disabled={uploadingSingle}
                                />
                                <label 
                                    htmlFor="single-add-image"
                                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 ${uploadingSingle ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploadingSingle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Image
                                </label>
                            </div>
                        </div>

                        {currentImages.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-sm">
                                No images found for this exercise.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {currentImages.map((url, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={url} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => handleSingleDeleteImage(url)}
                                                className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50"
                                                title="Delete image"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                                            {idx + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default ImageManagerTool;
