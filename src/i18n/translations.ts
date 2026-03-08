export type Locale = 'fr' | 'en' | 'es' | 'de';

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
};

type TranslationTree = {
  nav: {
    features: string;
    pricing: string;
    demo: string;
    login: string;
    signup: string;
    contact: string;
    requestTrial: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    ctaDemo: string;
  };
  triage: {
    title: string;
    chiefComplaint: string;
    symptomPicker: string;
    vitalSigns: string;
    heartRate: string;
    bloodPressure: string;
    spo2: string;
    temperature: string;
    gcs: string;
    arrivalMode: string;
    ambulance: string;
    walkIn: string;
    samu: string;
    analyze: string;
    analyzing: string;
    result: string;
    confidence: string;
    reasoning: string;
    category: string;
  };
  flow: {
    title: string;
    subtitle: string;
    waiting: string;
    inTreatment: string;
    awaitingResults: string;
    awaitingBed: string;
    bottleneckAlerts: string;
    noAlerts: string;
    zoneNormal: string;
    zoneBusy: string;
    zoneCritical: string;
    patients: string;
    avgWait: string;
    minutes: string;
  };
  samuPanel: {
    title: string;
    subtitle: string;
    eta: string;
    prepareRoom: string;
    roomPrepared: string;
    condition: string;
    age: string;
    incoming: string;
    noAlerts: string;
  };
  quality: {
    title: string;
    subtitle: string;
    dtasRate: string;
    fourHourTarget: string;
    readmission72h: string;
    satisfaction: string;
    benchmark: string;
    actual: string;
    monthly: string;
  };
  cyber: {
    encrypted: string;
    lastAudit: string;
    incidents: string;
    secure: string;
  };
  footer: {
    product: string;
    company: string;
    legal: string;
    compliance: string;
    disclaimer: string;
    contactUs: string;
    backToTop: string;
  };
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
    search: string;
    noData: string;
  };
};

export const translations: Record<Locale, TranslationTree> = {
  fr: {
    nav: {
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      demo: 'Démo',
      login: 'Connexion',
      signup: 'Inscription',
      contact: 'Contact',
      requestTrial: 'Demander un essai',
    },
    hero: {
      title: 'Le logiciel des urgences que votre hôpital contrôle',
      subtitle: 'UrgenceOS remplace les outils dispersés de votre service d\'urgences par une plateforme intégrée.',
      cta: 'Demander un essai',
      ctaDemo: 'Voir la démo',
    },
    triage: {
      title: 'Triage IA — Classification Manchester',
      chiefComplaint: 'Motif de consultation',
      symptomPicker: 'Sélection des symptômes',
      vitalSigns: 'Constantes vitales',
      heartRate: 'Fréquence cardiaque',
      bloodPressure: 'Pression artérielle',
      spo2: 'SpO2',
      temperature: 'Température',
      gcs: 'Score de Glasgow',
      arrivalMode: 'Mode d\'arrivée',
      ambulance: 'Ambulance',
      walkIn: 'À pied',
      samu: 'SAMU',
      analyze: 'Analyser le triage',
      analyzing: 'Analyse en cours…',
      result: 'Résultat du triage',
      confidence: 'Confiance',
      reasoning: 'Raisonnement',
      category: 'Catégorie',
    },
    flow: {
      title: 'Tableau de bord temps réel',
      subtitle: 'Vue d\'ensemble du flux patient',
      waiting: 'En attente',
      inTreatment: 'En traitement',
      awaitingResults: 'Résultats en attente',
      awaitingBed: 'En attente de lit',
      bottleneckAlerts: 'Alertes goulets d\'étranglement',
      noAlerts: 'Aucune alerte en cours',
      zoneNormal: 'Normal',
      zoneBusy: 'Chargé',
      zoneCritical: 'Critique',
      patients: 'patients',
      avgWait: 'Attente moy.',
      minutes: 'min',
    },
    samuPanel: {
      title: 'Intégration SAMU',
      subtitle: 'Alertes pré-hospitalières entrantes',
      eta: 'Arrivée dans',
      prepareRoom: 'Préparer la salle',
      roomPrepared: 'Salle préparée ✓',
      condition: 'État',
      age: 'Âge',
      incoming: 'En approche',
      noAlerts: 'Aucune alerte SAMU en cours',
    },
    quality: {
      title: 'Indicateurs qualité',
      subtitle: 'KPIs mensuels avec comparaison benchmark',
      dtasRate: 'Taux DTAS',
      fourHourTarget: 'Objectif 4 heures',
      readmission72h: 'Réadmission 72h',
      satisfaction: 'Satisfaction patient',
      benchmark: 'Benchmark',
      actual: 'Réel',
      monthly: 'Mensuel',
    },
    cyber: {
      encrypted: 'Connexion chiffrée',
      lastAudit: 'Dernier audit',
      incidents: 'Incidents',
      secure: 'Sécurisé',
    },
    footer: {
      product: 'Produit',
      company: 'Entreprise',
      legal: 'Légal',
      compliance: 'Conformité',
      disclaimer: 'UrgenceOS est un outil d\'aide à la gestion des urgences hospitalières. Il ne constitue pas un dispositif médical certifié.',
      contactUs: 'Nous contacter',
      backToTop: '↑ Haut de page',
    },
    common: {
      loading: 'Chargement…',
      error: 'Erreur',
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      search: 'Rechercher',
      noData: 'Aucune donnée',
    },
  },

  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      demo: 'Demo',
      login: 'Login',
      signup: 'Sign up',
      contact: 'Contact',
      requestTrial: 'Request a trial',
    },
    hero: {
      title: 'The emergency software your hospital controls',
      subtitle: 'UrgenceOS replaces scattered tools in your emergency department with an integrated platform.',
      cta: 'Request a trial',
      ctaDemo: 'See the demo',
    },
    triage: {
      title: 'AI Triage — Manchester Classification',
      chiefComplaint: 'Chief complaint',
      symptomPicker: 'Symptom selection',
      vitalSigns: 'Vital signs',
      heartRate: 'Heart rate',
      bloodPressure: 'Blood pressure',
      spo2: 'SpO2',
      temperature: 'Temperature',
      gcs: 'Glasgow Coma Scale',
      arrivalMode: 'Arrival mode',
      ambulance: 'Ambulance',
      walkIn: 'Walk-in',
      samu: 'EMS',
      analyze: 'Analyze triage',
      analyzing: 'Analyzing…',
      result: 'Triage result',
      confidence: 'Confidence',
      reasoning: 'Reasoning',
      category: 'Category',
    },
    flow: {
      title: 'Real-time Dashboard',
      subtitle: 'Patient flow overview',
      waiting: 'Waiting',
      inTreatment: 'In treatment',
      awaitingResults: 'Awaiting results',
      awaitingBed: 'Awaiting bed',
      bottleneckAlerts: 'Bottleneck alerts',
      noAlerts: 'No active alerts',
      zoneNormal: 'Normal',
      zoneBusy: 'Busy',
      zoneCritical: 'Critical',
      patients: 'patients',
      avgWait: 'Avg. wait',
      minutes: 'min',
    },
    samuPanel: {
      title: 'EMS Integration',
      subtitle: 'Incoming pre-hospital alerts',
      eta: 'ETA',
      prepareRoom: 'Prepare room',
      roomPrepared: 'Room prepared ✓',
      condition: 'Condition',
      age: 'Age',
      incoming: 'Incoming',
      noAlerts: 'No active EMS alerts',
    },
    quality: {
      title: 'Quality Metrics',
      subtitle: 'Monthly KPIs with benchmark comparison',
      dtasRate: 'DTAS Rate',
      fourHourTarget: '4-Hour Target',
      readmission72h: '72h Readmission',
      satisfaction: 'Patient Satisfaction',
      benchmark: 'Benchmark',
      actual: 'Actual',
      monthly: 'Monthly',
    },
    cyber: {
      encrypted: 'Encrypted connection',
      lastAudit: 'Last audit',
      incidents: 'Incidents',
      secure: 'Secure',
    },
    footer: {
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      compliance: 'Compliance',
      disclaimer: 'UrgenceOS is a management tool for hospital emergency departments. It is not a certified medical device.',
      contactUs: 'Contact us',
      backToTop: '↑ Back to top',
    },
    common: {
      loading: 'Loading…',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      search: 'Search',
      noData: 'No data',
    },
  },

  es: {
    nav: {
      features: 'Funcionalidades',
      pricing: 'Precios',
      demo: 'Demo',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      contact: 'Contacto',
      requestTrial: 'Solicitar prueba',
    },
    hero: {
      title: 'El software de urgencias que tu hospital controla',
      subtitle: 'UrgenceOS reemplaza las herramientas dispersas de tu servicio de urgencias por una plataforma integrada.',
      cta: 'Solicitar prueba',
      ctaDemo: 'Ver demo',
    },
    triage: {
      title: 'Triaje IA — Clasificación Manchester',
      chiefComplaint: 'Motivo de consulta',
      symptomPicker: 'Selección de síntomas',
      vitalSigns: 'Signos vitales',
      heartRate: 'Frecuencia cardíaca',
      bloodPressure: 'Presión arterial',
      spo2: 'SpO2',
      temperature: 'Temperatura',
      gcs: 'Escala de Glasgow',
      arrivalMode: 'Modo de llegada',
      ambulance: 'Ambulancia',
      walkIn: 'A pie',
      samu: 'SAMU/SEM',
      analyze: 'Analizar triaje',
      analyzing: 'Analizando…',
      result: 'Resultado del triaje',
      confidence: 'Confianza',
      reasoning: 'Razonamiento',
      category: 'Categoría',
    },
    flow: {
      title: 'Panel en tiempo real',
      subtitle: 'Vista general del flujo de pacientes',
      waiting: 'En espera',
      inTreatment: 'En tratamiento',
      awaitingResults: 'Esperando resultados',
      awaitingBed: 'Esperando cama',
      bottleneckAlerts: 'Alertas de cuello de botella',
      noAlerts: 'Sin alertas activas',
      zoneNormal: 'Normal',
      zoneBusy: 'Ocupado',
      zoneCritical: 'Crítico',
      patients: 'pacientes',
      avgWait: 'Espera prom.',
      minutes: 'min',
    },
    samuPanel: {
      title: 'Integración SAMU/SEM',
      subtitle: 'Alertas prehospitalarias entrantes',
      eta: 'Llegada en',
      prepareRoom: 'Preparar sala',
      roomPrepared: 'Sala preparada ✓',
      condition: 'Estado',
      age: 'Edad',
      incoming: 'En camino',
      noAlerts: 'Sin alertas SAMU activas',
    },
    quality: {
      title: 'Indicadores de calidad',
      subtitle: 'KPIs mensuales con comparación benchmark',
      dtasRate: 'Tasa DTAS',
      fourHourTarget: 'Objetivo 4 horas',
      readmission72h: 'Reingreso 72h',
      satisfaction: 'Satisfacción del paciente',
      benchmark: 'Benchmark',
      actual: 'Real',
      monthly: 'Mensual',
    },
    cyber: {
      encrypted: 'Conexión cifrada',
      lastAudit: 'Última auditoría',
      incidents: 'Incidentes',
      secure: 'Seguro',
    },
    footer: {
      product: 'Producto',
      company: 'Empresa',
      legal: 'Legal',
      compliance: 'Cumplimiento',
      disclaimer: 'UrgenceOS es una herramienta de gestión para servicios de urgencias hospitalarias. No es un dispositivo médico certificado.',
      contactUs: 'Contáctenos',
      backToTop: '↑ Volver arriba',
    },
    common: {
      loading: 'Cargando…',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      back: 'Volver',
      next: 'Siguiente',
      search: 'Buscar',
      noData: 'Sin datos',
    },
  },

  de: {
    nav: {
      features: 'Funktionen',
      pricing: 'Preise',
      demo: 'Demo',
      login: 'Anmelden',
      signup: 'Registrieren',
      contact: 'Kontakt',
      requestTrial: 'Test anfragen',
    },
    hero: {
      title: 'Die Notaufnahme-Software, die Ihr Krankenhaus kontrolliert',
      subtitle: 'UrgenceOS ersetzt verstreute Werkzeuge Ihrer Notaufnahme durch eine integrierte Plattform.',
      cta: 'Test anfragen',
      ctaDemo: 'Demo ansehen',
    },
    triage: {
      title: 'KI-Triage — Manchester-Klassifikation',
      chiefComplaint: 'Hauptbeschwerde',
      symptomPicker: 'Symptomauswahl',
      vitalSigns: 'Vitalzeichen',
      heartRate: 'Herzfrequenz',
      bloodPressure: 'Blutdruck',
      spo2: 'SpO2',
      temperature: 'Temperatur',
      gcs: 'Glasgow Coma Scale',
      arrivalMode: 'Ankunftsart',
      ambulance: 'Krankenwagen',
      walkIn: 'Selbsteinweisung',
      samu: 'Rettungsdienst',
      analyze: 'Triage analysieren',
      analyzing: 'Analyse läuft…',
      result: 'Triage-Ergebnis',
      confidence: 'Konfidenz',
      reasoning: 'Begründung',
      category: 'Kategorie',
    },
    flow: {
      title: 'Echtzeit-Dashboard',
      subtitle: 'Patientenfluss-Übersicht',
      waiting: 'Wartend',
      inTreatment: 'In Behandlung',
      awaitingResults: 'Ergebnisse ausstehend',
      awaitingBed: 'Bett ausstehend',
      bottleneckAlerts: 'Engpass-Alarme',
      noAlerts: 'Keine aktiven Alarme',
      zoneNormal: 'Normal',
      zoneBusy: 'Ausgelastet',
      zoneCritical: 'Kritisch',
      patients: 'Patienten',
      avgWait: 'Ø Wartezeit',
      minutes: 'Min',
    },
    samuPanel: {
      title: 'Rettungsdienst-Integration',
      subtitle: 'Eingehende präklinische Alarme',
      eta: 'Ankunft in',
      prepareRoom: 'Raum vorbereiten',
      roomPrepared: 'Raum vorbereitet ✓',
      condition: 'Zustand',
      age: 'Alter',
      incoming: 'Eintreffend',
      noAlerts: 'Keine aktiven Rettungsdienst-Alarme',
    },
    quality: {
      title: 'Qualitätskennzahlen',
      subtitle: 'Monatliche KPIs mit Benchmark-Vergleich',
      dtasRate: 'DTAS-Rate',
      fourHourTarget: '4-Stunden-Ziel',
      readmission72h: '72h-Wiederaufnahme',
      satisfaction: 'Patientenzufriedenheit',
      benchmark: 'Benchmark',
      actual: 'Ist',
      monthly: 'Monatlich',
    },
    cyber: {
      encrypted: 'Verschlüsselte Verbindung',
      lastAudit: 'Letztes Audit',
      incidents: 'Vorfälle',
      secure: 'Sicher',
    },
    footer: {
      product: 'Produkt',
      company: 'Unternehmen',
      legal: 'Rechtliches',
      compliance: 'Compliance',
      disclaimer: 'UrgenceOS ist ein Management-Tool für Notaufnahmen. Es ist kein zertifiziertes Medizinprodukt.',
      contactUs: 'Kontakt',
      backToTop: '↑ Nach oben',
    },
    common: {
      loading: 'Laden…',
      error: 'Fehler',
      save: 'Speichern',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      back: 'Zurück',
      next: 'Weiter',
      search: 'Suchen',
      noData: 'Keine Daten',
    },
  },
};
