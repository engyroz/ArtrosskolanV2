

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

export interface BossQuestion {
    id: string;
    text: string;
    failFeedback: string;
}

export const BOSS_FIGHT_TITLES = {
    1: "Bas-stabil",
    2: "Rörelse-säker",
    3: "Funktionellt Stark",
    4: "Rörelse-fri"
};

// Data structured by Joint -> Level -> Questions
export const BOSS_FIGHT_DATA: Record<string, Record<number, BossQuestion[]>> = {
  'knee': {
      1: [
          { 
              id: 'k1_1', 
              text: 'Har din vilovärk minskat betydligt eller försvunnit?', 
              failFeedback: 'Att du fortfarande har vilovärk tyder på att leden är irriterad. Fortsätt med de lugna cirkulationsövningarna i Nivå 1 ett tag till – de hjälper kroppen att dämpa inflammationen naturligt.' 
          },
          { 
              id: 'k1_2', 
              text: 'Kan du sträcka ut knät helt rakt (samma som det friska)?', 
              failFeedback: 'Full sträckning är avgörande för att du ska kunna gå normalt utan att överbelasta andra leder. Lägg extra fokus på rörlighetsövningarna för knästräckning innan vi går vidare.' 
          },
          { 
              id: 'k1_3', 
              text: 'Kan du hitta och spänna lårmuskeln på beställning?', 
              failFeedback: 'Kontakten mellan hjärnan och lårmuskeln är grunden i din stabilitet. Träna lite mer på de statiska aktiveringsövningarna för att "hitta" muskeln igen.' 
          }
      ],
      2: [
          { 
              id: 'k2_1', 
              text: 'Kan du resa dig från en stol utan att använda händerna?', 
              failFeedback: 'Att resa sig utan händer kräver en viss grundstyrka i låren. Fortsätt träna på kontrollerade uppresningar från stol för att bygga upp kraften som behövs för nästa nivå.' 
          },
          { 
              id: 'k2_2', 
              text: 'Kan du gå uppför trappor utan smärthugg?', 
              failFeedback: 'Smärta vid trappgång tyder på att knät behöver mer tålighet under belastning. Repetera övningarna i Nivå 2 för att stärka musklerna kring knäskålen.' 
          },
          { 
              id: 'k2_3', 
              text: 'Känner du dig trygg när du står på ett ben?', 
              failFeedback: 'Balans är ditt skydd mot snedbelastning. Träna lite mer på enbensbalansen (gärna nära ett stöd) för att öka tryggheten i leden.' 
          }
      ],
      3: [
          { 
              id: 'k3_1', 
              text: 'Kan du gå nedför trappor kontrollerat utan stor smärta?', 
              failFeedback: 'Att gå nedför trappor är det mest krävande momentet för ett knä. Det kräver god bromsförmåga. Fortsätt med nivå 3-övningarna för att stärka den excentriska (bromsande) styrkan.' 
          },
          { 
              id: 'k3_2', 
              text: 'Klarar du enbensböj utan att knät viker in?', 
              failFeedback: 'Enbensböj visar att knät tål hög belastning. Om det gör ont behöver vi ge musklerna lite mer tid att bli starka nog att avlasta leden helt.' 
          },
          { 
              id: 'k3_3', 
              text: 'Känner du tillit till knät på ojämnt underlag?', 
              failFeedback: 'Trygghet på ojämnt underlag kommer med tiden. Fortsätt träna på de mer utmanande stabilitetsövningarna för att bygga upp din tillit till knät.' 
          }
      ]
  },
  'hip': {
      1: [
          { 
              id: 'h1_1', 
              text: 'Har du blivit fri från värk i vila?', 
              failFeedback: 'Att höften värker i vila tyder på att den behöver mer avlastning och lugn cirkulation. Fortsätt med nivå 1 ett tag till för att låta irritationen lägga sig.' 
          },
          { 
              id: 'h1_2', 
              text: 'Kan du stå upp en stund utan att det gör ont direkt?', 
              failFeedback: 'Om det gör ont att bara stå tyder det på att musklerna kring höften blir trötta snabbt. Vi behöver bygga upp den uthålliga basstyrkan lite mer.' 
          },
          { 
              id: 'h1_3', 
              text: 'Får du sova utan att höften väcker dig?', 
              failFeedback: 'Sömnen är viktig för din återhämtning. Om höften stör nattsömnen behöver vi jobba mer på att sänka den allmänna retbarheten i leden innan vi ökar träningen.' 
          }
      ],
      2: [
          { 
              id: 'h2_1', 
              text: 'Går du jämnt utan att halta?', 
              failFeedback: 'Att halta är kroppens sätt att skydda höften, men det skapar snedbelastning. Fortsätt träna på gångteknik och styrka i Nivå 2 tills du känner dig stabil nog att gå jämnt.' 
          },
          { 
              id: 'h2_2', 
              text: 'Kan du ta på dig strumporna stående (eller med lätthet)?', 
              failFeedback: 'Rörlighet vid påklädning kräver god rörlighet i höftleden. Fortsätt med rörlighetsmomenten i Nivå 2 för att mjuka upp kapseln kring leden.' 
          },
          { 
              id: 'h2_3', 
              text: 'Kan du resa dig från stol utan att ta sats med ryggen?', 
              failFeedback: 'Uppresningar testar din kraft i sätesmuskulaturen. Fortsätt bygga upp den styrkan så att du kan resa dig mjukt utan att belasta ryggen.' 
          }
      ],
      3: [
          { 
              id: 'h3_1', 
              text: 'Kan du stå på ett ben med rakt bäcken (utan att tippa)?', 
              failFeedback: 'Att hålla bäckenet rakt på ett ben kräver starka höftabduktorer. Detta är avgörande för att skydda höften vid längre promenader. Träna lite mer på sidostabiliteten.' 
          },
          { 
              id: 'h3_2', 
              text: 'Kan du promenera 20 minuter utan bakslag?', 
              failFeedback: 'Smärta efter 20 minuter är ett tecken på att ledens uthållighet inte riktigt matchar din aktivitet än. Fortsätt bygga tåligheten i Nivå 3.' 
          },
          { 
              id: 'h3_3', 
              text: 'Kan du ta dig upp från golvet utan stora problem?', 
              failFeedback: 'Att ta sig upp från golvet kräver både styrka och rörlighet i ytterlägen. Det är en avancerad rörelse – ge dig själv lite mer tid att träna upp denna förmåga.' 
          }
      ]
  },
  'shoulder': {
      1: [
          { 
              id: 's1_1', 
              text: 'Har den intensiva nattvärken lagt sig?', 
              failFeedback: 'Intensiv nattvärk tyder på hög irritation. Fortsätt med de avlastande rörelseövningarna i Nivå 1 för att öka cirkulationen utan att reta leden.' 
          },
          { 
              id: 's1_2', 
              text: 'Kan du ta på dig en jacka utan skarp smärta?', 
              failFeedback: 'Smärta vid påklädning visar att axeln reagerar på snabba eller oväntade rörelser. Vi behöver jobba mer på den passiva rörligheten.' 
          },
          { 
              id: 's1_3', 
              text: 'Kan du slappna av i axeln (utan att dra upp den mot örat)?', 
              failFeedback: 'Att dra upp axlarna mot öronen är ett vanligt smärtförsvar. Träna mer på avslappningsövningarna i Nivå 1 för att "släppa ner" axeln och minska spänningar.' 
          }
      ],
      2: [
          { 
              id: 's2_1', 
              text: 'Kan du lyfta armen till axelhöjd (90 grader) kontrollerat?', 
              failFeedback: 'Att lyfta armen till axelhöjd kräver att musklerna drar åt rätt håll. Fortsätt träna på de aktiva lyften i Nivå 2 för att stärka kontrollen.' 
          },
          { 
              id: 's2_2', 
              text: 'Kan du nå bakhuvudet med handen?', 
              failFeedback: 'Att nå bakhuvudet kräver utåtrotation i axeln. Fortsätt med rörlighetsövningarna så att du får tillbaka den funktionella rörligheten du behöver i vardagen.' 
          },
          { 
              id: 's2_3', 
              text: 'Kan du föra handen bakom ryggen (mot svanken)?', 
              failFeedback: 'Att föra handen bakom ryggen är ofta det sista som kommer tillbaka. Var tålmodig och fortsätt med de mjuka stretchövningarna för axelns baksida.' 
          }
      ],
      3: [
          { 
              id: 's3_1', 
              text: 'Kan du lyfta armen rakt upp mot taket utan smärta?', 
              failFeedback: 'Full rörlighet rakt upp kräver både styrka och god rörlighet i bröstryggen. Fortsätt träna på de sista graderna av rörlighet i Nivå 3.' 
          },
          { 
              id: 's3_2', 
              text: 'Kan du bära en matkasse utan att axeln blir trött direkt?', 
              failFeedback: 'Att bära en kasse kräver uthållig styrka i axelns stabiliserande muskler. Fortsätt med de stärkande övningarna för att öka din bärförmåga.' 
          },
          { 
              id: 's3_3', 
              text: 'Klarar axeln av tryck/belastning (t.ex. öppna tung dörr)?', 
              failFeedback: 'Stabilitet mot tryck visar att axeln är redo för mer sportiga aktiviteter. Fortsätt träna på kontrollen i dessa lägen innan du går över till helt fri rörelseglädje.' 
          }
      ]
  }
};


export const STAGE_NAMES = {
  1: {
    title: "Lugn start",
    stages: { 1: "Lugn start", 2: "Grundläggande kontroll", 3: "Stabil bas" }
  },
  2: {
    title: "Grundstyrka",
    stages: { 1: "Smidiga rörelser", 2: "Balans i vardagen", 3: "Funktionell styrka" }
  },
  3: {
    title: "Uppbyggnad",
    stages: { 1: "Kraftfull utveckling", 2: "Uthållig vävnad", 3: "Toppform" }
  },
  4: {
    title: "Återgång",
    stages: { 1: "Fri rörlighet", 2: "Stark framtid", 3: "Livslång hälsa" }
  }
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
