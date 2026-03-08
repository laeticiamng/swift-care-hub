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
    establishments: string;
    faq: string;
    about: string;
    board: string;
    seeDemo: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    subtitleDetail: string;
    cta: string;
    ctaDemo: string;
    badgeLabel: string;
    boardPreviewCaption: string;
    trustCompatible: string;
    trustOneScreen: string;
    trustHostedFrance: string;
    trustResults: string;
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
    complaintPlaceholder: string;
    errorNoComplaint: string;
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
    features: string;
    pricing: string;
    demo: string;
    security: string;
    dashboard: string;
    status: string;
    sla: string;
    about: string;
    establishments: string;
    faq: string;
    contact: string;
    legalNotices: string;
    privacy: string;
    terms: string;
    hdsTarget: string;
    isoTarget: string;
    rgpdHealth: string;
    ciSis: string;
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
      establishments: 'Établissements',
      faq: 'FAQ',
      about: 'À propos',
      board: 'Board',
      seeDemo: 'Voir la démo',
    },
    hero: {
      title: 'Le logiciel des urgences',
      titleHighlight: 'que votre hôpital contrôle.',
      subtitle: 'Un seul écran par soignant. Zéro ressaisie. Triage, prescriptions, résultats et coordination — tout réuni, en temps réel, adapté à chaque rôle.',
      subtitleDetail: 'UrgenceOS remplace les outils dispersés de votre service d\'urgences par une plateforme intégrée, compatible avec votre dossier patient informatisé existant. L\'hôpital garde le contrôle total du logiciel et de ses données.',
      cta: 'Demander un essai gratuit',
      ctaDemo: 'Voir la démo',
      badgeLabel: 'Logiciel possédé par l\'hôpital',
      boardPreviewCaption: 'Aperçu du board panoramique — données fictives',
      trustCompatible: 'Compatible avec votre dossier patient existant',
      trustOneScreen: 'Un écran unique par rôle soignant',
      trustHostedFrance: 'Données hébergées en France',
      trustResults: 'Résultats mesurables en 10 semaines',
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
      complaintPlaceholder: 'Ex: Douleur thoracique depuis 2h, irradiation bras gauche...',
      errorNoComplaint: 'Veuillez décrire le motif de consultation',
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
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      demo: 'Démo',
      security: 'Sécurité',
      dashboard: 'Dashboard',
      status: 'Statut',
      sla: 'SLA',
      about: 'À propos',
      establishments: 'Établissements',
      faq: 'FAQ',
      contact: 'Contact',
      legalNotices: 'Mentions légales',
      privacy: 'Confidentialité',
      terms: 'CGU',
      hdsTarget: 'Objectif HDS',
      isoTarget: 'Objectif ISO 27001',
      rgpdHealth: 'RGPD Santé',
      ciSis: 'CI-SIS / ANS',
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
      establishments: 'Hospitals',
      faq: 'FAQ',
      about: 'About',
      board: 'Board',
      seeDemo: 'See the demo',
    },
    hero: {
      title: 'The emergency software',
      titleHighlight: 'your hospital controls.',
      subtitle: 'One screen per caregiver. Zero re-entry. Triage, prescriptions, results and coordination — all in one place, in real time, adapted to each role.',
      subtitleDetail: 'UrgenceOS replaces the scattered tools of your emergency department with an integrated platform, compatible with your existing EHR. The hospital retains full control of the software and its data.',
      cta: 'Request a free trial',
      ctaDemo: 'See the demo',
      badgeLabel: 'Hospital-owned software',
      boardPreviewCaption: 'Panoramic board preview — demo data',
      trustCompatible: 'Compatible with your existing EHR',
      trustOneScreen: 'One screen per caregiver role',
      trustHostedFrance: 'Data hosted in France',
      trustResults: 'Measurable results in 10 weeks',
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
      complaintPlaceholder: 'E.g.: Chest pain for 2 hours, radiating to left arm...',
      errorNoComplaint: 'Please describe the chief complaint',
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
      features: 'Features',
      pricing: 'Pricing',
      demo: 'Demo',
      security: 'Security',
      dashboard: 'Dashboard',
      status: 'Status',
      sla: 'SLA',
      about: 'About',
      establishments: 'Hospitals',
      faq: 'FAQ',
      contact: 'Contact',
      legalNotices: 'Legal notices',
      privacy: 'Privacy',
      terms: 'Terms of use',
      hdsTarget: 'HDS Target',
      isoTarget: 'ISO 27001 Target',
      rgpdHealth: 'Health GDPR',
      ciSis: 'CI-SIS / ANS',
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
      establishments: 'Hospitales',
      faq: 'FAQ',
      about: 'Acerca de',
      board: 'Board',
      seeDemo: 'Ver demo',
    },
    hero: {
      title: 'El software de urgencias',
      titleHighlight: 'que tu hospital controla.',
      subtitle: 'Una sola pantalla por cuidador. Cero reentrada. Triaje, prescripciones, resultados y coordinación — todo en un solo lugar, en tiempo real, adaptado a cada rol.',
      subtitleDetail: 'UrgenceOS reemplaza las herramientas dispersas de tu servicio de urgencias por una plataforma integrada, compatible con tu historia clínica electrónica existente. El hospital mantiene el control total del software y sus datos.',
      cta: 'Solicitar prueba gratuita',
      ctaDemo: 'Ver demo',
      badgeLabel: 'Software propiedad del hospital',
      boardPreviewCaption: 'Vista previa del board panorámico — datos de demostración',
      trustCompatible: 'Compatible con tu historia clínica existente',
      trustOneScreen: 'Una pantalla por rol de cuidador',
      trustHostedFrance: 'Datos alojados en Francia',
      trustResults: 'Resultados medibles en 10 semanas',
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
      complaintPlaceholder: 'Ej: Dolor torácico desde hace 2h, irradiación al brazo izquierdo...',
      errorNoComplaint: 'Por favor describa el motivo de consulta',
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
      features: 'Funcionalidades',
      pricing: 'Precios',
      demo: 'Demo',
      security: 'Seguridad',
      dashboard: 'Dashboard',
      status: 'Estado',
      sla: 'SLA',
      about: 'Acerca de',
      establishments: 'Hospitales',
      faq: 'FAQ',
      contact: 'Contacto',
      legalNotices: 'Aviso legal',
      privacy: 'Privacidad',
      terms: 'Términos de uso',
      hdsTarget: 'Objetivo HDS',
      isoTarget: 'Objetivo ISO 27001',
      rgpdHealth: 'RGPD Salud',
      ciSis: 'CI-SIS / ANS',
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
      establishments: 'Krankenhäuser',
      faq: 'FAQ',
      about: 'Über uns',
      board: 'Board',
      seeDemo: 'Demo ansehen',
    },
    hero: {
      title: 'Die Notaufnahme-Software,',
      titleHighlight: 'die Ihr Krankenhaus kontrolliert.',
      subtitle: 'Ein Bildschirm pro Pflegekraft. Keine Doppeleingabe. Triage, Verordnungen, Ergebnisse und Koordination — alles an einem Ort, in Echtzeit, für jede Rolle angepasst.',
      subtitleDetail: 'UrgenceOS ersetzt die verstreuten Werkzeuge Ihrer Notaufnahme durch eine integrierte Plattform, kompatibel mit Ihrem bestehenden KIS. Das Krankenhaus behält die volle Kontrolle über die Software und ihre Daten.',
      cta: 'Kostenlos testen',
      ctaDemo: 'Demo ansehen',
      badgeLabel: 'Krankenhauseigene Software',
      boardPreviewCaption: 'Panorama-Board-Vorschau — Demodaten',
      trustCompatible: 'Kompatibel mit Ihrem bestehenden KIS',
      trustOneScreen: 'Ein Bildschirm pro Pflegerolle',
      trustHostedFrance: 'Daten in Frankreich gehostet',
      trustResults: 'Messbare Ergebnisse in 10 Wochen',
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
      complaintPlaceholder: 'Z.B.: Brustschmerzen seit 2 Stunden, Ausstrahlung in den linken Arm...',
      errorNoComplaint: 'Bitte beschreiben Sie die Hauptbeschwerde',
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
      features: 'Funktionen',
      pricing: 'Preise',
      demo: 'Demo',
      security: 'Sicherheit',
      dashboard: 'Dashboard',
      status: 'Status',
      sla: 'SLA',
      about: 'Über uns',
      establishments: 'Krankenhäuser',
      faq: 'FAQ',
      contact: 'Kontakt',
      legalNotices: 'Impressum',
      privacy: 'Datenschutz',
      terms: 'AGB',
      hdsTarget: 'HDS-Ziel',
      isoTarget: 'ISO 27001-Ziel',
      rgpdHealth: 'DSGVO Gesundheit',
      ciSis: 'CI-SIS / ANS',
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
