
import { JointType, ProgramConfig, IrritabilityLevel, ActivityPrescription, Question, AssessmentData } from '../types';

export const AVAILABLE_JOINTS: JointType[] = ['Knä', 'Höft', 'Axel'];

// --- STORAGE KEY ---
const STORAGE_KEY = 'artrosskolan_assessment';

export const saveAssessmentToStorage = (data: Partial<AssessmentData>) => {
  const existing = getAssessmentFromStorage() || {};
  const updated = { ...existing, ...data, timestamp: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getAssessmentFromStorage = (): AssessmentData | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearAssessmentStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- QUESTION BANK ---

// 1. Triage
const Q_PAIN_REST: Question = {
  id: 'painAtRest',
  text: 'Har du ont i leden när du vilar (sitter stilla eller ligger i sängen)?',
  type: 'choice',
  options: [
    { label: 'Ja, ofta', value: 'high' },
    { label: 'Ibland / Lite', value: 'moderate' },
    { label: 'Nej', value: 'low' }
  ]
};

const Q_PAIN_LOAD: Question = {
  id: 'painLoad',
  text: 'Hur skulle du skatta din smärta vid belastning (t.ex. när du går/lyfter) de senaste dagarna?',
  type: 'scale',
};

// 2. Safety Check (Red Flags)
const Q_SAFETY_CHECK: Question = {
  id: 'safetyCheck',
  text: 'Säkerhetskontroll (Viktigt)',
  type: 'choice', // Multi-choice logic handled in component usually, but here simple Yes/No for "Any of these"
  options: [
    { label: 'Nej, inget av detta stämmer', value: 'pass' },
    { label: 'Ja, något av detta stämmer', value: 'fail' }
  ]
};
// Note: The UI should display the bullets: Trauma, Fever, Swelling.

// 3. Functional Tests
const FUNCTIONAL_QUESTIONS: Record<JointType, Question[]> = {
  'Knä': [
    { 
      id: 'knee_chair', 
      text: 'Kan du resa dig från en vanlig köksstol UTAN att ta hjälp av armarna?', 
      type: 'choice',
      options: [
        { label: 'Nej', value: 'fail' }, 
        { label: 'Ja, men det är tungt', value: 'struggle' }, 
        { label: 'Ja, utan problem', value: 'pass' } 
      ]
    },
    { 
      id: 'knee_stairs', 
      text: 'Hur går du i trappor?', 
      type: 'choice',
      options: [
        { label: 'Jag undviker trappor / Måste hålla i räcket', value: 'fail' }, 
        { label: 'Jag kan gå växelvis men det känns osäkert', value: 'struggle' }, 
        { label: 'Jag går utan problem', value: 'pass' } 
      ]
    },
    { 
      id: 'knee_jump', 
      text: 'Kan du göra ett litet upphopp jämfota och landa stabilt?', 
      type: 'choice',
      options: [
        { label: 'Nej / Vågar inte', value: 'fail' },
        { label: 'Ja', value: 'pass' } 
      ]
    }
  ],
  'Höft': [
    { 
      id: 'hip_chair', 
      text: 'Kan du resa dig från en vanlig köksstol UTAN att ta hjälp av armarna?', 
      type: 'choice',
      options: [
        { label: 'Nej', value: 'fail' }, 
        { label: 'Ja, men det är tungt', value: 'struggle' }, 
        { label: 'Ja, utan problem', value: 'pass' } 
      ]
    },
    { 
      id: 'hip_stairs', 
      text: 'Hur går du i trappor?', 
      type: 'choice',
      options: [
        { label: 'Jag undviker trappor / Måste hålla i räcket', value: 'fail' }, 
        { label: 'Jag kan gå växelvis men det känns osäkert', value: 'struggle' }, 
        { label: 'Jag går utan problem', value: 'pass' } 
      ]
    },
    { 
      id: 'hip_jump', 
      text: 'Kan du göra ett litet upphopp jämfota och landa stabilt?', 
      type: 'choice',
      options: [
        { label: 'Nej / Vågar inte', value: 'fail' },
        { label: 'Ja', value: 'pass' } 
      ]
    }
  ],
  'Axel': [
    { 
      id: 'shoulder_lift', 
      text: 'Kan du lyfta armen rakt upp över huvudet (så du nuddar örat)?', 
      type: 'choice',
      options: [
        { label: 'Nej (Stelhet/Smärta stoppar)', value: 'fail' }, 
        { label: 'Ja, men det gör ont i toppläget', value: 'struggle' }, 
        { label: 'Ja, smärtfritt', value: 'pass' } 
      ]
    },
    { 
      id: 'shoulder_back', 
      text: 'Kan du lägga handen på ryggen (som för att knäppa en behå eller stoppa in skjortan)?', 
      type: 'choice',
      options: [
        { label: 'Nej / Svårt', value: 'fail' }, 
        { label: 'Ja', value: 'pass' } 
      ]
    },
    { 
      id: 'shoulder_carry', 
      text: 'Klarar du av att bära en tung matkasse i den handen utan att få ont i axeln?', 
      type: 'choice',
      options: [
        { label: 'Nej', value: 'fail' }, 
        { label: 'Ja', value: 'pass' } 
      ]
    }
  ],
  'Rygg': [],
  'Handled/Tumbas': []
};

// 4. Activity Profile
const Q_ACTIVITY: Question = {
  id: 'activityProfile',
  text: 'Hur ser din aktivitetsnivå ut idag (bortsett från artrosbesvären)?',
  type: 'choice',
  options: [
    { label: 'Stillasittande: Mest stilla (t.ex. kontorsjobb)', value: 'minimal' },
    { label: 'Vardagsmotionär: Promenerar/cyklar ibland', value: 'moderate' },
    { label: 'Aktiv: Försöker hålla igång regelbundet', value: 'active' }
  ]
};

// 5. Goal (Dynamic based on Level/Joint)
const getGoalQuestion = (joint: JointType, level: number): Question => {
  let options = [];
  
  if (level === 1) {
    options = [
      { label: 'Slippa vilovärken (Sova bättre)', value: 'pain_relief' },
      { label: 'Kunna stödja på benet/armen', value: 'basic_load' },
      { label: 'Minska stelhet & svullnad', value: 'reduce_swelling' }
    ];
  } else if (level === 2) {
    options = [
      { label: 'Klara vardagen (Trappor/Klä på mig)', value: 'daily_function' },
      { label: 'Gå till affären / Handla', value: 'shopping' },
      { label: 'Komma igång med promenader', value: 'start_walking' }
    ];
  } else if (level === 3) {
    options = [
      { label: 'Långpromenader i skogen', value: 'long_walks' },
      { label: 'Leka med barnbarn / Hund', value: 'play' },
      { label: 'Våga lita på leden igen', value: 'trust' }
    ];
  } else {
    options = [
      { label: 'Återgå till sport (Golf/Padel/Tennis)', value: 'sport' },
      { label: 'Tungt trädgårdsarbete', value: 'heavy_work' },
      { label: 'Springa/Jogga', value: 'run' }
    ];
  }

  return {
    id: 'mainGoal',
    text: 'Vad är ditt viktigaste mål just nu?',
    type: 'choice',
    options
  };
};

// --- LOGIC ENGINE ---

export interface AssessmentState {
  status: 'QUESTION' | 'SAFETY_CHECK' | 'HARD_STOP' | 'COMPLETE';
  nextQuestion?: Question;
  progress: number; 
  result?: ProgramConfig;
  calculatedLevel?: number; // Internal state to track level before saving
}

export const getAssessmentState = (
  joint: JointType,
  answers: Record<string, any>
): AssessmentState => {
  
  // 1. PAIN REST
  if (answers[Q_PAIN_REST.id] === undefined) {
    return { status: 'QUESTION', nextQuestion: Q_PAIN_REST, progress: 10 };
  }

  // 2. PAIN LOAD
  if (answers[Q_PAIN_LOAD.id] === undefined) {
    return { status: 'QUESTION', nextQuestion: Q_PAIN_LOAD, progress: 20 };
  }

  // CHECK TRIAGE -> RED FLAG TRIGGER
  const painRest = answers[Q_PAIN_REST.id];
  const painLoad = answers[Q_PAIN_LOAD.id];
  const isHighIrritability = painRest === 'high' || painLoad >= 7;

  // 3. SAFETY CHECK (If High Irritability)
  if (isHighIrritability) {
    if (answers[Q_SAFETY_CHECK.id] === undefined) {
      return { status: 'SAFETY_CHECK', nextQuestion: Q_SAFETY_CHECK, progress: 25 };
    }
    // Failed Safety Check
    if (answers[Q_SAFETY_CHECK.id] === 'fail') {
      return { status: 'HARD_STOP', progress: 100 };
    }
    // Passed Safety Check -> Force Level 1, Skip Functional
    return checkProfileQuestions(joint, 1, answers);
  }

  // 4. FUNCTIONAL TESTS (If Low/Mod Irritability)
  const tree = FUNCTIONAL_QUESTIONS[joint];
  
  // Q1 Functional
  const q1 = tree[0];
  if (answers[q1.id] === undefined) return { status: 'QUESTION', nextQuestion: q1, progress: 30 };
  
  if (answers[q1.id] === 'fail') return checkProfileQuestions(joint, 1, answers);
  if (answers[q1.id] === 'struggle') return checkProfileQuestions(joint, 2, answers);

  // Q2 Functional
  const q2 = tree[1];
  if (answers[q2.id] === undefined) return { status: 'QUESTION', nextQuestion: q2, progress: 50 };

  if (answers[q2.id] === 'fail') return checkProfileQuestions(joint, 2, answers);
  if (answers[q2.id] === 'struggle') return checkProfileQuestions(joint, 3, answers);

  // Q3 Functional
  const q3 = tree[2];
  if (answers[q3.id] === undefined) return { status: 'QUESTION', nextQuestion: q3, progress: 70 };

  if (answers[q3.id] === 'fail') return checkProfileQuestions(joint, 3, answers);
  
  // Passed all -> Level 4
  return checkProfileQuestions(joint, 4, answers);
};

// HELPER: PROFILE & GOAL
const checkProfileQuestions = (joint: JointType, level: number, answers: Record<string, any>): AssessmentState => {
  // Activity
  if (answers[Q_ACTIVITY.id] === undefined) {
    return { status: 'QUESTION', nextQuestion: Q_ACTIVITY, progress: 85, calculatedLevel: level };
  }

  // Goal
  const goalQ = getGoalQuestion(joint, level);
  if (answers[goalQ.id] === undefined) {
    return { status: 'QUESTION', nextQuestion: goalQ, progress: 95, calculatedLevel: level };
  }

  // COMPLETE
  const irritability = level === 1 ? 'High' : 'Low'; // Simplified for result generation
  const result = createProgram(joint, level, irritability, answers[Q_ACTIVITY.id]);
  
  return {
    status: 'COMPLETE',
    progress: 100,
    result
  };
};

const createProgram = (
  joint: JointType, 
  level: number, 
  irritability: IrritabilityLevel, 
  activityProfile: string
): ProgramConfig => {
  
  let rehabDays = 3;
  let circDays = 4;
  
  if (level === 1) { rehabDays = 7; circDays = 7; }
  else if (level === 2) { rehabDays = 3; circDays = 4; }
  else if (level === 3) { rehabDays = 3; circDays = 0; }
  else { rehabDays = 4; circDays = 0; }

  let activityPrescription: ActivityPrescription = {
    type: 'Promenad', label: 'Daglig Promenad', description: '10 minuter', durationMinutes: 10, frequencyLabel: 'Varje dag'
  };

  if (activityProfile === 'minimal') {
    activityPrescription = { type: 'Rörelse', label: 'Dagliga Rörelsesnacks', description: 'Bryt stillasittandet var 30:e minut.', durationMinutes: 5, frequencyLabel: 'Varje dag' };
  } else if (activityProfile === 'moderate') {
    activityPrescription = { type: 'Cykling/Gång', label: 'Rask Promenad', description: '30 minuter i prat-tempo.', durationMinutes: 30, frequencyLabel: '3 ggr/vecka' };
  } else if (activityProfile === 'active') {
    activityPrescription = { type: 'Kondition', label: 'Crosstrainer/Cykel', description: 'Låg ledbelastning för kondition.', durationMinutes: 45, frequencyLabel: '3 ggr/vecka' };
  }

  return {
    generatedAt: new Date().toISOString(),
    joint,
    level,
    irritability,
    rehabDaysPerWeek: rehabDays,
    circulationDaysPerWeek: circDays,
    activityPrescription,
    focusAreas: level === 1 ? ['Smärtlindring', 'Cirkulation'] : ['Styrka', 'Funktion']
  };
};
