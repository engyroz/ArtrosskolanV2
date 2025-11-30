// Centralized text configuration for the app

export const PRE_FLIGHT_MESSAGES = {
  level_1: {
    rehab: {
      title: "Fokus: Kontakt & Ro",
      body: "Idag ska vi väcka musklerna utan att irritera leden. Fokusera på att hitta spänningen i muskeln snarare än att ta i hårt. Det ska kännas tryggt och kontrollerat."
    },
    circulation: {
      title: "Fokus: Cirkulation",
      body: "En mjuk genomrörare för att smörja leden. Gör rörelserna långsamt och avslappnat. Målet är att minska stelheten."
    }
  },
  level_2: {
    rehab: {
      title: "Fokus: Kvalitet & Kontroll",
      body: "Nu börjar vi bygga styrka. Det är helt okej att muskeln känns trött eller darrar lite mot slutet. Se till att leden rör sig i en rak och fin linje."
    },
    circulation: {
      title: "Fokus: Återhämtning",
      body: "Idag låter vi musklerna vila från tung belastning, men håller igång rörligheten. Perfekt för att mjuka upp kroppen inför nästa styrkepass."
    }
  },
  level_3: {
    rehab: {
      title: "Fokus: Utmaning & Balans",
      body: "Idag utmanar vi stabiliteten. Om du tappar balansen eller det darrar rejält – bra! Det betyder att nervsystemet lär sig. Våga lita på leden."
    },
    circulation: {
      title: "Fokus: Underhåll",
      body: "Ett kort pass för att behålla rörligheten. Känn efter hur kroppen känns idag jämfört med när du började."
    }
  },
  level_4: {
    rehab: {
      title: "Fokus: Kraft & Explosivitet",
      body: "Nu handlar det om prestation. Ta i ordentligt i övningarna. Vi sänker antalet repetitioner för att du ska kunna öka belastningen. Det ska kännas tungt!"
    },
    circulation: {
      title: "Aktiv Återhämtning",
      body: "Förbered kroppen för nästa tunga pass."
    }
  }
};

export const BOSS_FIGHT_QUESTIONS = {
  1: [
      { id: 'bf1_1', text: 'Är din vilovärk borta (eller mycket låg)?' },
      { id: 'bf1_2', text: 'Kan du sträcka ut leden helt rakt?' },
      { id: 'bf1_3', text: 'Kan du spänna muskeln ordentligt på beställning?' }
  ],
  2: [
      { id: 'bf2_1', text: 'Kan du resa dig från en stol utan att använda händerna (3 gånger)?' },
      { id: 'bf2_2', text: 'Kan du gå i en trappa växelvis utan smärthugg?' },
      { id: 'bf2_3', text: 'Klarar du att stå på ett ben i 10 sekunder?' }
  ],
  3: [
      { id: 'bf3_1', text: 'Känner du dig trygg med att bära en matkasse i trappor?' },
      { id: 'bf3_2', text: 'Kan du göra 10 snabba uppresningar från stol utan att bli trött i leden?' },
      { id: 'bf3_3', text: 'Upplever du att leden begränsar dig i vardagen? (Svar: Nej)' }
  ]
};

// --- DASHBOARD CONSTANTS ---

export const ACTION_CARD_CONFIG = {
  1: {
    time: "10 min",
    xp: 100,
    activeSubtitle: "Smärtlindring & Cirkulation",
    recoverySubtitle: "Låt kroppen vila idag"
  },
  2: {
    time: "15 min",
    xp: 100,
    activeSubtitle: "Grundstyrka & Kontroll",
    recoverySubtitle: "Vila bygger starka muskler"
  },
  3: {
    time: "20 min",
    xp: 100,
    activeSubtitle: "Tålighet & Balans",
    recoverySubtitle: "Senorna anpassar sig nu"
  },
  4: {
    time: "25 min",
    xp: 100,
    activeSubtitle: "Prestation & Funktion",
    recoverySubtitle: "Ladda inför nästa pass"
  }
};

export const PHYSICAL_ACTIVITY_TASKS = {
  1: { title: "Rörelsesnacks", desc: "Res dig upp en gång i timmen. Gå ett varv runt bordet." },
  2: { title: "Vardagsmotion", desc: "Promenad 20 min, Cykling eller Simning." },
  3: { title: "Kondition", desc: "Rask promenad 30 min (få upp pulsen)." },
  4: { title: "Prestation", desc: "Valfri pulshöjande aktivitet, Sport eller Padel." }
};

export const PHASE_NAMES = {
  1: "Fas 1: Smärtlindring",
  2: "Fas 2: Grundstyrka",
  3: "Fas 3: Uppbyggnad",
  4: "Fas 4: Återgång"
};