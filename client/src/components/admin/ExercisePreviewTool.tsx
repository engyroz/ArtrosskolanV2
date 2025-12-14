
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { Exercise } from '../../types';
import { Loader2, ChevronLeft, ChevronRight, Info, ChevronUp, ChevronDown, ArrowLeft, Search } from 'lucide-react';

interface ExercisePreviewToolProps {
  onBack: () => void;
}

const ExercisePreviewTool = ({ onBack }: ExercisePreviewToolProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Visual State from WorkoutPlayer
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  // Load all exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const snapshot = await db.collection('exercises').orderBy('title').get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        setExercises(list);
      } catch (error) {
        console.error("Error loading exercises", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const currentExercise = exercises[currentIndex];

  // Image Slideshow Logic (Replicated from WorkoutPlayer)
  useEffect(() => {
    if (!currentExercise) return;
    
    // Reset state on exercise change
    setActiveImageIndex(0);
    setInstructionsExpanded(false);

    const images = currentExercise.imageUrls || (currentExercise.imageUrl ? [currentExercise.imageUrl] : []);
    
    if (images.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % images.length);
      }, 3000); // 3 seconds per image
      return () => clearInterval(interval);
    }
  }, [currentExercise]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % exercises.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + exercises.length) % exercises.length);
  };

  const handleJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.value);
      if (!isNaN(idx)) setCurrentIndex(idx);
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!currentExercise) return <div>No exercises found.</div>;

  // --- MOCK DATA FOR PREVIEW ---
  // Since we are viewing raw exercises, we mock the session config
  const unit = (currentExercise.level === 1) ? 'sek' : 'reps';
  const displayImages = currentExercise.imageUrls || (currentExercise.imageUrl ? [currentExercise.imageUrl] : []);
  const currentImage = displayImages[activeImageIndex];
  const instructionsText = Array.isArray(currentExercise.instructions) 
      ? currentExercise.instructions.join(' ') 
      : currentExercise.instructions;
  
  // Mock config
  const mockConfig = { sets: 3, reps: 10 };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      
      {/* --- ADMIN CONTROLS OVERLAY --- */}
      <div className="bg-slate-900 text-white p-2 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2">
              <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full">
                  <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400">Exercise Previewer</span>
                <span className="text-sm font-bold truncate max-w-[150px]">{currentExercise.title}</span>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                  <select 
                    className="appearance-none bg-slate-800 border border-slate-700 text-xs py-1.5 pl-3 pr-8 rounded-lg outline-none focus:border-blue-500 w-48"
                    value={currentIndex}
                    onChange={handleJump}
                  >
                      {exercises.map((ex, i) => (
                          <option key={ex.id} value={i}>
                              {i + 1}. {ex.title} ({ex.id})
                          </option>
                      ))}
                  </select>
                  <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>

              <div className="flex bg-slate-800 rounded-lg p-0.5">
                  <button onClick={handlePrev} className="p-1.5 hover:bg-slate-700 rounded-md">
                      <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 flex items-center text-xs font-mono">{currentIndex + 1} / {exercises.length}</span>
                  <button onClick={handleNext} className="p-1.5 hover:bg-slate-700 rounded-md">
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </div>

      {/* --- WORKOUT PLAYER UI --- */}

      {/* 2. Image Area (The Star) */}
      <div className="flex-1 relative bg-slate-100 flex items-center justify-center overflow-hidden w-full max-h-[60vh]">
        {currentImage ? (
            <div className="w-full h-full relative">
                {displayImages.map((img, idx) => (
                    <img 
                        key={idx}
                        src={img} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        alt={currentExercise.title} 
                    />
                ))}
                
                {/* Image Dots Indicator */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {displayImages.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'bg-blue-600 w-3' : 'bg-slate-300'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-sm font-bold">No Image Available</span>
                <span className="text-xs">{currentExercise.id}</span>
            </div>
        )}
      </div>

      {/* 3. Controls & Info (Bottom Sheet Style) */}
      <div className="flex-none bg-white rounded-t-3xl -mt-6 relative z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex flex-col flex-grow">
        
        {/* Content Scroll Container */}
        <div className="p-6 pb-2 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-slate-900 leading-tight max-w-[70%]">
                    {currentExercise.title}
                </h2>
                <div className="flex flex-col items-end opacity-50 grayscale">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold uppercase mb-1">
                        {mockConfig.sets} x {mockConfig.reps}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {unit === 'sek' ? 'Sekunder' : 'Repetitioner'}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all">
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-3 h-3" /> Instruktioner
                </div>
                <p className={`text-slate-600 text-sm leading-relaxed ${instructionsExpanded ? '' : 'line-clamp-2'}`}>
                    {instructionsText}
                </p>
                
                <button 
                    onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                    className="mt-2 text-blue-600 text-xs font-bold flex items-center hover:underline"
                >
                    {instructionsExpanded ? (
                        <>Visa mindre <ChevronUp className="w-3 h-3 ml-1" /></>
                    ) : (
                        <>Läs hela <ChevronDown className="w-3 h-3 ml-1" /></>
                    )}
                </button>
            </div>
            
            <div className="mt-4 p-4 border border-dashed border-slate-200 rounded-xl">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Debug Info</h4>
                 <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono">
                     <div>ID: <span className="text-slate-900">{currentExercise.id}</span></div>
                     <div>Level: <span className="text-slate-900">{currentExercise.level}</span></div>
                     <div>Joint: <span className="text-slate-900">{currentExercise.joint}</span></div>
                     <div>Category: <span className="text-slate-900">{currentExercise.category}</span></div>
                 </div>
            </div>
        </div>

        {/* Fixed Bottom Action (Mock) */}
        <div className="p-4 bg-white border-t border-slate-50 mt-auto">
            <button 
                onClick={handleNext}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 flex items-center justify-center transition-all active:scale-[0.98]"
            >
                Nästa Övning (Admin)
                <ChevronRight className="w-6 h-6 ml-2" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default ExercisePreviewTool;
