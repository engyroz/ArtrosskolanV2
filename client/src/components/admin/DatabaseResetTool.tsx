
import React, { useState } from 'react';
import { ArrowLeft, Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../../firebase';

interface DatabaseResetToolProps {
  onBack: () => void;
}

const DatabaseResetTool = ({ onBack }: DatabaseResetToolProps) => {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleResetDatabase = async () => {
    if (!jsonInput.trim()) {
        alert("Please paste JSON content first.");
        return;
    }

    let exercises;
    try {
        exercises = JSON.parse(jsonInput);
        if (!Array.isArray(exercises)) throw new Error("Root must be an array");
    } catch (e) {
        alert("Invalid JSON format. Please check syntax.");
        return;
    }

    if (!window.confirm("WARNING: This will DELETE all existing exercises and replace them with the provided JSON. Are you sure?")) {
        return;
    }

    setLoading(true);
    setStatus('processing');
    setProgress('Starting...');

    try {
        // 1. Delete existing documents
        setProgress('Fetching existing exercises...');
        const snapshot = await db.collection('exercises').get();
        const totalToDelete = snapshot.size;
        
        if (totalToDelete > 0) {
            setProgress(`Deleting ${totalToDelete} existing documents...`);
            const BATCH_SIZE = 400;
            const deleteChunks = [];
            for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
                deleteChunks.push(snapshot.docs.slice(i, i + BATCH_SIZE));
            }

            for (const chunk of deleteChunks) {
                const batch = db.batch();
                chunk.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }

        // 2. Upload new documents
        const totalToUpload = exercises.length;
        setProgress(`Uploading ${totalToUpload} new exercises...`);
        
        const BATCH_SIZE = 400;
        const uploadChunks = [];
        for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
            uploadChunks.push(exercises.slice(i, i + BATCH_SIZE));
        }

        let uploadedCount = 0;
        for (const chunk of uploadChunks) {
            const batch = db.batch();
            chunk.forEach((ex: any) => {
                // Ensure there is an ID
                if (!ex.id) {
                    ex.id = `ex_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
                }
                const ref = db.collection('exercises').doc(ex.id);
                batch.set(ref, ex);
            });
            await batch.commit();
            uploadedCount += chunk.length;
            setProgress(`Uploaded ${uploadedCount}/${totalToUpload} exercises`);
        }

        setStatus('success');
        setProgress('Database reset complete!');

    } catch (error: any) {
        console.error(error);
        setStatus('error');
        setProgress(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to tools
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <Database className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Database Reset</h2>
                    <p className="text-sm text-slate-500">Update 'exercises' collection via JSON</p>
                </div>
            </div>

            {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Success!</h3>
                    <p className="text-green-700 mb-6">{progress}</p>
                    <button 
                    onClick={() => { setStatus('idle'); setJsonInput(''); setProgress(''); }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
                    >
                        Reset Another Batch
                    </button>
                </div>
            ) : (
                <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This action is destructive. It will delete all existing documents in the <code>exercises</code> collection before uploading the new ones. Ensure your JSON contains valid data with unique IDs.
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Paste exercises.json content here
                    </label>
                    <textarea
                        className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder='[ { "id": "ex1", "title": "..." }, ... ]'
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {status === 'processing' && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-500 mb-2">
                            <span>Progress</span>
                            <span>{progress}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 animate-pulse w-full"></div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6">
                        {progress}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleResetDatabase}
                        disabled={loading || !jsonInput}
                        className={`px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 ${
                            loading || !jsonInput 
                            ? 'bg-slate-300 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 shadow-lg'
                        }`}
                    >
                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                        {loading ? 'Processing...' : 'Reset Database'}
                    </button>
                </div>
                </>
            )}
        </div>
    </div>
  );
};

export default DatabaseResetTool;
