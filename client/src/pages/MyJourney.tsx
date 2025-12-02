
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Lock, Trophy, Map, Compass, PlayCircle, Star, ArrowRight } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { BOSS_FIGHT_QUESTIONS } from '../utils/textConstants';

// Helper for dynamic level titles (Uppdraget)
const getLevelFocus = (level: number) => {
  switch (level) {
    case 1: return "Smärtlindring & Ro";
    case 2: return "Grundstyrka";
    case 3: return "Uppbyggnad";
    case 4: return "Återgång & Prestation";
    default: return "Rehab";
  }
};

const SegmentedProgressCircle = ({ level, currentXP, maxXP }: { level: number, currentXP: number, maxXP: number }) => {
  // Calculate progress for the 3 segments (0-1 range)
  const totalProgress = Math.min(1, Math.max(0, currentXP / maxXP));
  
  // Segment 1: 0% - 33%
  const seg1 = Math.min(1, totalProgress * 3);
  // Segment 2: 33% - 66%
  const seg2 = Math.min(1, Math.max(0, (totalProgress - 0.333) * 3));
  // Segment 3: 66% - 100%
  const seg3 = Math.min(1, Math.max(0, (totalProgress - 0.666) * 3));

  // SVG Configuration
  const size = 160;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Gap size in degrees converted to dash offset roughly
  const gap = 10; 
  const segmentLength = (circumference / 3) - (gap * 2); 

  // Helper to render a segment arc
  // We rotate the circle to position the 3 segments: 
  // Seg 1 (Bottom Leftish to Top), Seg 2 (Top to Bottom Right), Seg 3 (Bottom Right to Bottom Left)
  // Actually, simplest is standard clock: 
  // 1: 12-4, 2: 4-8, 3: 8-12? 
  // Let's stick to a visual "Pie" logic roughly rotated.
  
  // Using a simpler approach: 3 distinct circles with stroke-dasharray
  // Total circumference is C.
  // We want 3 segments of length (C/3) - gap.
  // Rotation offsets: -90deg (Top), 30deg, 150deg
  
  const Segment = ({ progress, rotation, colorClass }: any) => {
    // We only show the "filled" part based on progress
    // The background track is always full segment length
    const dashArray = `${segmentLength} ${circumference - segmentLength}`;
    
    // Calculate filled portion: simple approach, we mask it or change color
    // Better: Render background grey segment, then overlay colored segment with varying length
    
    return (
      <g transform={`rotate(${rotation}, ${center}, ${center})`}>
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          className="text-slate-100"
          strokeLinecap="round"
        />
        {/* Filled Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${segmentLength * progress} ${circumference - (segmentLength * progress)}`}
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div className="relative flex items-center justify-center">
       {/* Pulse effect if near level up */}
       {totalProgress >= 1 && (
         <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 scale-110"></div>
       )}

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Segment 1: Starts at 0 (Top in standard SVG, but we rotated parent -90, so it starts Right)
            Wait, let's keep parent normal and rotate segments.
            -90 puts 0 at top.
            We want 3 segments.
            1: Top-Right (0 to 120)
            2: Bottom (120 to 240)
            3: Top-Left (240 to 360)
         */}
         {/* Adjust rotations to create the gap feel */}
        <Segment progress={seg1} rotation={0 + 2} colorClass="text-blue-500" />
        <Segment progress={seg2} rotation={120 + 2} colorClass="text-blue-600" />
        <Segment progress={seg3} rotation={240 + 2} colorClass="text-blue-700" />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nivå</span>
        <span className="text-4xl font-black text-slate-900 leading-none">{level}</span>
      </div>
      
      {/* Feedback pop (visual only, simplified) */}
      {/* <div className="absolute -right-4 top-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
         Etapp {seg3 > 0 ? 3 : seg2 > 0 ? 2 : 1}
      </div> */}
    </div>
  );
};

const MyJourney = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentLevel = userProfile?.currentLevel || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  
  // Get Goal Description mapping (simplified from Assessment options)
  const getGoalText = (val: string) => {
      const map: Record<string, string> = {
          'family': 'Leka med barnbarnen',
          'nature': 'Gå i skogen',
          'sport': 'Spela Padel igen',
          'daily_life': 'Klara vardagen smärtfritt',
          'work': 'Jobba utan besvär',
          'security': 'Lita på kroppen'
      };
      return map[val] || val.replace(/_/g, ' ');
  };

  const currentXP = userProfile?.progression?.experiencePoints || 0;
  const maxXP = getMaxXP(currentLevel);
  const isLevelMaxed = currentXP >= maxXP; // Ready for boss
  const lifetimeSessions = userProfile?.progression?.lifetimeSessions || 0;

  // Determine Subtext
  const progressPct = currentXP / maxXP;
  let motivationalText = "Bra start! Fortsätt jobba.";
  if (progressPct > 0.3) motivationalText = "Första etappen snart klar!";
  if (progressPct > 0.34) motivationalText = "Bra jobbat! Etapp 2 påbörjad.";
  if (progressPct > 0.6) motivationalText = "Bara 1 pass kvar till Etapp 3!";
  if (progressPct > 0.67) motivationalText = "Sista rycket mot nästa nivå!";
  if (progressPct >= 1) motivationalText = "Du är redo för Nivåtestet!";

  const renderTimelineNode = (level: number) => {
      const status = level < currentLevel ? 'completed' : level === currentLevel ? 'active' : 'locked';
      
      // Line connector (draw above node unless last)
      const showLine = level < 4;

      return (
          <div key={level} className="relative flex flex-col items-center">
              {/* Vertical Line */}
              {showLine && (
                  <div className={`absolute top-12 bottom-[-48px] w-1 z-0 
                      ${level < currentLevel ? 'bg-green-300' : 'bg-slate-100'}
                  `}></div>
              )}

              {/* Node Content */}
              <div className="z-10 bg-slate-50 py-2"> {/* Background matching to hide line behind node if needed, or transparent */}
                  
                  {status === 'completed' && (
                      <button 
                        className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-600 shadow-sm transition-transform hover:scale-110"
                        onClick={() => alert(`Historik för Nivå ${level} (Kommer snart)`)}
                      >
                          <CheckCircle className="w-6 h-6" />
                      </button>
                  )}

                  {status === 'locked' && (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-300">
                          <Lock className="w-4 h-4" />
                      </div>
                  )}

                  {status === 'active' && (
                      <div className="py-4">
                          <SegmentedProgressCircle 
                              level={level} 
                              currentXP={currentXP} 
                              maxXP={maxXP} 
                          />
                      </div>
                  )}
              </div>
              
              {/* Labels for small nodes */}
              {status !== 'active' && (
                  <span className={`text-xs font-bold mt-1 ${status === 'completed' ? 'text-green-700' : 'text-slate-400'}`}>
                      Nivå {level}
                  </span>
              )}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Header: "Kompassen" */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-8 px-6 text-center shadow-sm">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-50 rounded-full text-blue-600 mb-4">
             <Compass className="w-6 h-6" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
              <span className="text-slate-400 text-lg font-bold block mb-1 uppercase tracking-wider">Uppdraget</span>
              Fokus: {getLevelFocus(currentLevel)}
          </h1>
          
          <div className="mt-4 inline-block relative px-6 py-2">
              {/* Handwritten style mimic */}
              <p className="font-medium text-slate-600 italic text-lg relative z-10 font-serif">
                  "För att kunna: {getGoalText(userGoal)}"
              </p>
              <div className="absolute inset-0 bg-yellow-100 transform -rotate-1 rounded-lg -z-0 opacity-50"></div>
          </div>
      </div>

      {/* 2. Main Content: The Map */}
      <div className="max-w-md mx-auto px-4 mt-8 flex flex-col items-center">
          
          {/* Render Timeline Nodes */}
          <div className="flex flex-col items-center w-full space-y-4">
              {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
          </div>

          {/* 3. XP Meter & Status (Belongs to active level) */}
          <div className="w-full text-center mt-2 mb-8 animate-fade-in">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                 Nivå-XP
             </h3>
             <p className="text-2xl font-black text-slate-900 font-mono">
                 {currentXP} <span className="text-slate-400 text-lg">/ {maxXP}</span>
             </p>
             <p className="text-blue-600 font-medium text-sm mt-2">
                 {motivationalText}
             </p>
          </div>

          {/* 4. Boss Fight Portal */}
          <div className="w-full mb-12">
              {isLevelMaxed ? (
                  // UNLOCKED STATE
                  <button 
                    onClick={() => navigate('/dashboard', { state: { openBossFight: true } })} // Pass intent to dashboard or handle locally? Dashboard has the modal.
                    className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute -right-6 -bottom-6 text-yellow-600 opacity-20 rotate-12">
                          <Trophy className="w-24 h-24" />
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                          <div className="bg-white/20 p-3 rounded-full mb-3 animate-pulse">
                              <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-widest mb-1">
                              Gör Nivåtestet
                          </h3>
                          <p className="text-yellow-100 font-medium text-sm">
                              Du är redo för nästa nivå!
                          </p>
                      </div>
                  </button>
              ) : (
                  // LOCKED STATE (Grinding)
                  <div className="w-full bg-slate-100 border-2 border-slate-200 border-dashed rounded-2xl p-6 flex items-center justify-between opacity-80">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-200 p-3 rounded-full text-slate-400">
                              <Lock className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                              <h3 className="font-bold text-slate-500">Lås upp Nivåtestet</h3>
                              <div className="h-1.5 w-24 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-slate-400" style={{ width: `${Math.min(100, progressPct * 100)}%` }}></div>
                              </div>
                          </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                          {Math.round(progressPct * 100)}% klart
                      </span>
                  </div>
              )}
          </div>

          {/* 5. Gamification Stats (Sidospår) */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <span className="text-3xl font-black text-slate-900 mb-1">{lifetimeSessions}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Totalt antal pass</span>
              </div>
              
              <button 
                onClick={() => navigate('/knowledge')}
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center text-center hover:bg-blue-100 transition-colors group"
              >
                  <div className="flex items-center gap-1 mb-2 text-blue-600">
                      <PlayCircle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase">Nästa Belöning</span>
                  </div>
                  <p className="text-xs text-blue-800 font-medium leading-tight">
                      "Låses upp om 2 pass"
                  </p>
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1" />
              </button>
          </div>

      </div>
    </div>
  );
};

export default MyJourney;
