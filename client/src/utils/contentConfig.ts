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

export const EDUCATION_MODULES: EducationModule[] = [
  // Level 1 Content
  {
    id: 'l1-vad-ar-artros',
    title: 'Vad är artros egentligen?',
    category: 'Fakta',
    readTime: '3 min',
    requiredLevel: 1,
    contentUrl: 'artros-fakta'
  },
  {
    id: 'l1-trafikljuset',
    title: 'Trafikljuset: Så tolkar du smärta',
    category: 'Viktigt',
    readTime: '4 min',
    requiredLevel: 1,
    contentUrl: 'smart-modell'
  },
  {
    id: 'l1-vilovark',
    title: 'Varför gör det ont när jag vilar?',
    category: 'Symtom',
    readTime: '2 min',
    requiredLevel: 1,
    contentUrl: 'vilovark'
  },
  // Level 2 Content
  {
    id: 'l2-hitta-muskeln',
    title: 'Hitta kontakten med muskeln',
    category: 'Tips',
    readTime: '3 min',
    requiredLevel: 2,
    contentUrl: 'muskelkontakt'
  },
  {
    id: 'l2-muskelkorsett',
    title: 'Muskelkorsetten – Ledens stötdämpare',
    category: 'Fakta',
    readTime: '3 min',
    requiredLevel: 2,
    contentUrl: 'muskelkorsett'
  },
  {
    id: 'l2-somn',
    title: 'Sömn och smärta – en ond cirkel',
    category: 'Livsstil',
    readTime: '4 min',
    requiredLevel: 2,
    contentUrl: 'somn-halsa'
  },
  // Level 3 Content
  {
    id: 'l3-kinesiofobi',
    title: 'Rädsla för rörelse (Kinesiofobi)',
    category: 'Psykologi',
    readTime: '5 min',
    requiredLevel: 3,
    contentUrl: 'radsla-rorelse'
  },
  {
    id: 'l3-bakslag',
    title: 'Hjälp, jag fick ont igen! (Om bakslag)',
    category: 'Viktigt',
    readTime: '3 min',
    requiredLevel: 3,
    contentUrl: 'bakslag'
  },
  {
    id: 'l3-gummiband',
    title: 'Gummiband och tyngre grejer',
    category: 'Träningslära',
    readTime: '3 min',
    requiredLevel: 3,
    contentUrl: 'progression'
  },
  // Level 4 Content
  {
    id: 'l4-aktivitet',
    title: 'Fysiska aktivitetsrekommendationer',
    category: 'Hälsa',
    readTime: '4 min',
    requiredLevel: 4,
    contentUrl: 'fysisk-aktivitet'
  },
  {
    id: 'l4-idrott',
    title: 'Återgång till idrott & Padel',
    category: 'Mål',
    readTime: '5 min',
    requiredLevel: 4,
    contentUrl: 'atergang-sport'
  }
];