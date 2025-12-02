
import { EducationModule } from '../types';

export const contentConfig = {
  diagnosisTexts: {
    1: {
      title: "Fas 1: Smärtlindring & Ro",
      body: "Din analys visar tecken på irritation och vilovärk. Just nu behöver leden lugn och cirkulation snarare än tung träning. Att gå för hårt ut nu skulle öka smärtan."
    },
    2: {
      title: "Fas 2: Grundstyrka",
      body: "Du har kommit förbi den akuta fasen, men saknar stabiliteten för att vardagen ska kännas enkel. Din led behöver lära sig tåla belastning igen."
    },
    3: {
      title: "Fas 3: Uppbyggnad",
      body: "Du har en bra grund, men behöver mer styrka och balans för att nå dina högre mål. Nu är det dags att utmana musklerna på riktigt."
    },
    4: {
      title: "Fas 4: Återgång & Prestation",
      body: "Du är stark, men behöver specifika övningar för att klara de sista, tunga kraven (hopp, tunga lyft eller idrott) utan bakslag."
    }
  },
  focusTexts: {
    'Knä': "lårmuskelstyrka och knäkontroll",
    'Höft': "sätesstyrka och höftstabilitet",
    'Axel': "skulderbladskontroll och smärtfri rörlighet",
    'Rygg': "bålstabilitet och rörlighet",
    'Handled/Tumbas': "greppstyrka och finmotorik"
  },
  activityTexts: {
    'minimal': "Dagliga 'rörelsesnacks' för att bryta stelhet.",
    'moderate': "Promenadschema anpassat för din smärta.",
    'active': "Alternativ konditionsträning som sparar leden."
  }
};

export const LEVEL_DESCRIPTIONS = {
  1: "Fokus ligger på att minska smärta och hitta cirkulation. Vi väcker musklerna försiktigt.",
  2: "Nu bygger vi grundstyrka för att klara vardagens krav som trappor och uppresningar.",
  3: "Vi ökar belastningen för att bygga tålighet och balans inför tyngre aktiviteter.",
  4: "Maximal funktion och återgång till full aktivitet eller idrott."
};

// Defined based on PDF "Upplåsning-logiken"
export const EDUCATION_MODULES: EducationModule[] = [
  // --- SERIES A: THE GENERAL SERIES (Lifetime Sessions) ---
  {
    id: 'series-a-intro',
    title: 'Välkommen till Artrosskolan (Intro)',
    category: 'Start',
    readTime: '2 min',
    contentUrl: 'intro-video',
    unlockType: 'lifetime',
    requiredSessions: 0
  },
  {
    id: 'series-a-mechanism',
    title: 'Varför gör det ont? (Mekanik)',
    category: 'Kunskapsserie',
    readTime: '5 min',
    contentUrl: 'mechanism-video',
    unlockType: 'lifetime',
    requiredSessions: 5
  },
  {
    id: 'series-a-longterm',
    title: 'Långsiktig Hälsa',
    category: 'Kunskapsserie',
    readTime: '4 min',
    contentUrl: 'longterm-video',
    unlockType: 'lifetime',
    requiredSessions: 10
  },
  {
    id: 'series-a-lifestyle',
    title: 'Kost och Artros',
    category: 'Kunskapsserie',
    readTime: '6 min',
    contentUrl: 'lifestyle-video',
    unlockType: 'lifetime',
    requiredSessions: 15
  },

  // --- SERIES B: LEVEL SPECIFIC GUIDE (Level + Stage) ---
  
  // LEVEL 1
  {
    id: 'l1-s1-fakta',
    title: 'Vad är artros egentligen?',
    category: 'Fas 1 Guide',
    readTime: '3 min',
    contentUrl: 'artros-fakta',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 1
  },
  {
    id: 'l1-s2-trafikljus',
    title: 'Trafikljuset: Så tolkar du smärta',
    category: 'Fas 1 Guide',
    readTime: '4 min',
    contentUrl: 'smart-modell',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 2
  },
  {
    id: 'l1-s3-vilovark',
    title: 'Varför gör det ont när jag vilar?',
    category: 'Fas 1 Guide',
    readTime: '2 min',
    contentUrl: 'vilovark',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 3
  },

  // LEVEL 2
  {
    id: 'l2-s1-kontakt',
    title: 'Hitta kontakten med muskeln',
    category: 'Fas 2 Guide',
    readTime: '3 min',
    contentUrl: 'muskelkontakt',
    unlockType: 'level',
    requiredLevel: 2,
    requiredStage: 1
  },
  {
    id: 'l2-s2-korsett',
    title: 'Muskelkorsetten – Ledens stötdämpare',
    category: 'Fas 2 Guide',
    readTime: '3 min',
    contentUrl: 'muskelkorsett',
    unlockType: 'level',
    requiredLevel: 2,
    requiredStage: 2
  },
  
  // LEVEL 3
  {
    id: 'l3-s1-fear',
    title: 'Rädsla för rörelse (Kinesiofobi)',
    category: 'Fas 3 Guide',
    readTime: '5 min',
    contentUrl: 'radsla-rorelse',
    unlockType: 'level',
    requiredLevel: 3,
    requiredStage: 1
  },
  {
    id: 'l3-s2-setbacks',
    title: 'Hjälp, jag fick ont igen! (Om bakslag)',
    category: 'Fas 3 Guide',
    readTime: '3 min',
    contentUrl: 'bakslag',
    unlockType: 'level',
    requiredLevel: 3,
    requiredStage: 2
  },

  // LEVEL 4
  {
    id: 'l4-s1-sport',
    title: 'Återgång till idrott & Padel',
    category: 'Fas 4 Guide',
    readTime: '5 min',
    contentUrl: 'atergang-sport',
    unlockType: 'level',
    requiredLevel: 4,
    requiredStage: 1
  }
];
