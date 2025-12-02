

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
    title: 'Välkommen till Artrosskolan',
    category: 'Start',
    readTime: '2 min',
    contentUrl: 'intro-video',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 0
  },
  {
    id: 'series-a-mechanism',
    title: 'Varför gör det ont?',
    category: 'Mekanik',
    readTime: '5 min',
    contentUrl: 'mechanism-video',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2187d61b36f9?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 5
  },
  {
    id: 'series-a-longterm',
    title: 'Långsiktig Hälsa',
    category: 'Framtid',
    readTime: '4 min',
    contentUrl: 'longterm-video',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 10
  },
  {
    id: 'series-a-lifestyle',
    title: 'Kost och Artros',
    category: 'Livsstil',
    readTime: '6 min',
    contentUrl: 'lifestyle-video',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 15
  },
  {
    id: 'series-a-stress',
    title: 'Stress & Smärta',
    category: 'Hälsa',
    readTime: '5 min',
    contentUrl: 'stress-video',
    imageUrl: 'https://images.unsplash.com/photo-1447452001602-7090c774637d?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 20
  },

  // --- SERIES B: LEVEL SPECIFIC GUIDE (Level + Stage) ---
  
  // LEVEL 1
  {
    id: 'l1-s1-fakta',
    title: 'Vad är artros egentligen?',
    category: 'Guide',
    readTime: '3 min',
    contentUrl: 'artros-fakta',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 1
  },
  {
    id: 'l1-s2-trafikljus',
    title: 'Så tolkar du smärta',
    category: 'Guide',
    readTime: '4 min',
    contentUrl: 'smart-modell',
    imageUrl: 'https://images.unsplash.com/photo-1550505295-69024f2b1c6d?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 2
  },
  {
    id: 'l1-s3-vilovark',
    title: 'Varför gör det ont när jag vilar?',
    category: 'Guide',
    readTime: '2 min',
    contentUrl: 'vilovark',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 1,
    requiredStage: 3
  },

  // LEVEL 2
  {
    id: 'l2-s1-kontakt',
    title: 'Hitta kontakten med muskeln',
    category: 'Guide',
    readTime: '3 min',
    contentUrl: 'muskelkontakt',
    imageUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 2,
    requiredStage: 1
  },
  {
    id: 'l2-s2-korsett',
    title: 'Muskelkorsetten – Ledens stötdämpare',
    category: 'Guide',
    readTime: '3 min',
    contentUrl: 'muskelkorsett',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 2,
    requiredStage: 2
  },
  
  // LEVEL 3
  {
    id: 'l3-s1-fear',
    title: 'Rädsla för rörelse (Kinesiofobi)',
    category: 'Guide',
    readTime: '5 min',
    contentUrl: 'radsla-rorelse',
    imageUrl: 'https://images.unsplash.com/photo-1533227297464-909798031e5f?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 3,
    requiredStage: 1
  },
  {
    id: 'l3-s2-setbacks',
    title: 'Hjälp, jag fick ont igen!',
    category: 'Guide',
    readTime: '3 min',
    contentUrl: 'bakslag',
    imageUrl: 'https://images.unsplash.com/photo-1596541223131-0da5f0d6194b?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 3,
    requiredStage: 2
  },

  // LEVEL 4
  {
    id: 'l4-s1-sport',
    title: 'Återgång till idrott & Padel',
    category: 'Guide',
    readTime: '5 min',
    contentUrl: 'atergang-sport',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    type: 'article',
    unlockType: 'level',
    requiredLevel: 4,
    requiredStage: 1
  }
];