
import { EducationModule } from '../types';

// --- VIKTIGT: KONFIGURATION FÖR VIDEO ---
// Byt ut denna sträng mot ditt "Video Library ID" från Bunny.net dashboard.
export const BUNNY_LIBRARY_ID = '567438'; 

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

export const EDUCATION_MODULES: EducationModule[] = [
  // --- SERIES A: THE GENERAL SERIES (Lifetime Sessions) ---
  {
    id: 'series-a-intro',
    title: 'Välkommen till Artrosskolan',
    category: 'Introduktion',
    readTime: '02:15 min',
    // Klistra in Video ID från Bunny.net här (inte hela URLen, bara IDt)
    contentUrl: '9a3e8e32-7849-4e27-8b59-4f3f237e606e', 
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 0
  },
  {
    id: 'series-a-mechanism',
    title: 'Vad händer egentligen i leden?',
    category: 'Mekanik',
    readTime: '05:30 min',
    contentUrl: 'fbcacd1c-2271-4d80-a489-1b470387531c',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2187d61b36f9?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 3
  },
  {
    id: 'l1-s2-trafikljus',
    title: 'Trafikljusmodellen: Tolka din smärta',
    category: 'Metodik',
    readTime: '04:20 min',
    contentUrl: '6ad69cc1-01c1-4178-94f8-e6c498fbcc34',
    imageUrl: 'https://images.unsplash.com/photo-1550505295-69024f2b1c6d?auto=format&fit=crop&q=80&w=800',
    type: 'video',
    unlockType: 'lifetime',
    requiredSessions: 6
  },
];
