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
    dashboard: string;
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
  login: {
    backToHome: string;
    systemLogin: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    forgotPassword: string;
    showPassword: string;
    hidePassword: string;
    invalidEmail: string;
    minChars: string;
    tooManyAttempts: string;
    wrongCredentials: string;
    loading: string;
    submit: string;
    noAccount: string;
    createAccount: string;
    or: string;
    demoMode: string;
    leftPanelText: string;
    statTriageTime: string;
    statTraceability: string;
    statPaper: string;
  };
  signup: {
    backToLogin: string;
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    professionalEmail: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    passwordHint: string;
    strengthWeak: string;
    strengthMedium: string;
    strengthFair: string;
    strengthStrong: string;
    strengthVeryStrong: string;
    passwordsMismatch: string;
    minChars: string;
    maxChars: string;
    invalidEmail: string;
    alreadyRegistered: string;
    compromisedPassword: string;
    creating: string;
    createAccount: string;
    termsAgree: string;
    termsLink: string;
    andOur: string;
    privacyLink: string;
    alreadyHaveAccount: string;
    loginLink: string;
    successTitle: string;
    successText: string;
    successNote: string;
    backToLoginBtn: string;
    leftPanelText: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    successTitle: string;
    successText: string;
    backToHome: string;
    formTitle: string;
    formDescription: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    professionalEmail: string;
    emailPlaceholder: string;
    establishment: string;
    establishmentPlaceholder: string;
    role: string;
    rolePlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sending: string;
    send: string;
    directEmail: string;
    requiredFields: string;
    fillRequired: string;
    errorGeneric: string;
    breadcrumbHome: string;
    breadcrumbContact: string;
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    recommended: string;
    trialName: string;
    trialTarget: string;
    trialPrice: string;
    trialDescription: string;
    trialCta: string;
    extensionName: string;
    extensionTarget: string;
    extensionPrice: string;
    extensionDescription: string;
    extensionCta: string;
    consortiumName: string;
    consortiumTarget: string;
    consortiumPrice: string;
    consortiumDescription: string;
    consortiumCta: string;
    pricingNote: string;
    contactForQuote: string;
    businessCaseTitle: string;
    businessCaseSubtitle: string;
    currentCosts: string;
    targetCosts: string;
    roiFormulas: string;
    dafMethod: string;
    transparency: string;
    faqTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    requestTrial: string;
    seeDemo: string;
    disclaimer: string;
    breadcrumbHome: string;
    breadcrumbPricing: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    contactUs: string;
    requestTrial: string;
    seeDemo: string;
    disclaimer: string;
    breadcrumbHome: string;
    breadcrumbFaq: string;
    catUnderstand: string;
    catHowItWorks: string;
    catSecurity: string;
    catTrial: string;
    catPricing: string;
  };
  roles: {
    title: string;
    titleNewUser: string;
    subtitle: string;
    subtitleNewUser: string;
    noRoleTitle: string;
    noRoleText: string;
    noRoleContact: string;
    noRoleToast: string;
    logout: string;
    medecin: string;
    medecinDesc: string;
    ioa: string;
    ioaDesc: string;
    ide: string;
    ideDesc: string;
    as: string;
    asDesc: string;
    secretaire: string;
    secretaireDesc: string;
  };
  about: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    missionTitle: string;
    missionP1: string;
    missionP2: string;
    principlesTitle: string;
    visionTitle: string;
    visionSubtitle: string;
    phase1: string;
    phase1Title: string;
    phase1Desc: string;
    phase2: string;
    phase2Title: string;
    phase2Desc: string;
    phase3: string;
    phase3Title: string;
    phase3Desc: string;
    timelineTitle: string;
    ecosystemTitle: string;
    ecosystemSubtitle: string;
    founderRole: string;
    founderBio: string;
    companyTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    ctaDemo: string;
    disclaimer: string;
    breadcrumbHome: string;
    breadcrumbAbout: string;
  };
  status: {
    pageTitle: string;
    monitoring: string;
    title: string;
    lastCheck: string;
    waitingData: string;
    refresh: string;
    allOperational: string;
    degraded: string;
    incidentActive: string;
    uptime90: string;
    avgLatency: string;
    resolvedIncidents: string;
    uptimeLast90: string;
    daysAgo: string;
    today: string;
    systemComponents: string;
    slaTitle: string;
    slaConsult: string;
    slaNote: string;
    securityTitle: string;
    incidentHistory: string;
    noIncidents: string;
    noIncidentsDetail: string;
    duration: string;
    infrastructure: string;
    breadcrumbHome: string;
    breadcrumbStatus: string;
  };
  forgotPassword: {
    backToLogin: string;
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    emailRequired: string;
    sendError: string;
    sending: string;
    sendLink: string;
    sentTitle: string;
    sentText: string;
    checkSpam: string;
  };
  resetPassword: {
    title: string;
    subtitle: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirm: string;
    confirmPlaceholder: string;
    minChars: string;
    mismatch: string;
    compromised: string;
    updating: string;
    update: string;
    successTitle: string;
    successRedirect: string;
    invalidLink: string;
    requestNew: string;
  };
  demoLive: {
    chooseRole: string;
    chooseRoleDesc: string;
    simulatedPatients: string;
    demoMode: string;
    connectedAs: string;
    goToBoard: string;
    exitDemo: string;
    interactiveDemo: string;
    validationScenarios: string;
    validationDesc: string;
    guardMode: string;
    guardDesc: string;
    auditQuality: string;
    auditDesc: string;
    ehrExchange: string;
    ehrDesc: string;
    backGuidedDemo: string;
    backHome: string;
    createAccount: string;
    login: string;
    disclaimer: string;
  };
  notFound: {
    title: string;
    subtitle: string;
    detail: string;
    backHome: string;
  };
  cookieConsent: {
    technicalOnly: string;
    learnMore: string;
    customize: string;
    refuse: string;
    accept: string;
    settingsTitle: string;
    essential: string;
    essentialDesc: string;
    preferences: string;
    preferencesDesc: string;
    refuseAll: string;
    save: string;
  };
  pricingFeatures: {
    trial: string[];
    extension: string[];
    consortium: string[];
  };
  pricingFaq: {
    q1: string; a1: string;
    q2: string; a2: string;
    q3: string; a3: string;
    q4: string; a4: string;
  };
  pricingBusinessCase: {
    currentItems: string[];
    targetItems: string[];
    roiItems: string[];
    dafItems: string[];
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
      dashboard: 'Plateforme',
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
      dashboard: 'Plateforme',
      status: 'Statut',
      sla: 'SLA',
      about: 'À propos',
      establishments: 'Établissements',
      faq: 'FAQ',
      contact: 'Contact',
      legalNotices: 'Mentions légales',
      privacy: 'Confidentialité',
      terms: 'CGU',
      hdsTarget: 'Certification HDS (en cours)',
      isoTarget: 'ISO 27001 (en cours)',
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
    login: {
      backToHome: 'Retour à l\'accueil',
      systemLogin: 'Connexion au système',
      subtitle: 'Pilotez votre service d\'urgences en temps réel. Triage, prescriptions, résultats et coordination — tout en un seul outil.',
      email: 'Email',
      emailPlaceholder: 'nom@hopital.fr',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      invalidEmail: 'Email invalide',
      minChars: 'Minimum 8 caractères',
      tooManyAttempts: 'Trop de tentatives. Réessayez dans',
      wrongCredentials: 'Email ou mot de passe incorrect',
      loading: 'Chargement...',
      submit: 'Se connecter',
      noAccount: 'Pas encore de compte ?',
      createAccount: 'Créer un compte',
      or: 'ou',
      demoMode: 'Mode Démo — Aucun compte requis',
      leftPanelText: 'Pilotez votre service d\'urgences en temps réel. Triage, prescriptions, résultats et coordination — tout en un seul outil.',
      statTriageTime: 'Temps de triage',
      statTraceability: 'Traçabilité',
      statPaper: 'Papier',
    },
    signup: {
      backToLogin: 'Retour à la connexion',
      title: 'Créer un compte',
      subtitle: 'Inscription à UrgenceOS',
      fullName: 'Nom complet',
      fullNamePlaceholder: 'Dr. Marie Dupont',
      professionalEmail: 'Email professionnel',
      emailPlaceholder: 'nom@hopital.fr',
      password: 'Mot de passe',
      passwordPlaceholder: 'Minimum 8 caractères',
      confirmPassword: 'Confirmer le mot de passe',
      confirmPlaceholder: 'Répétez le mot de passe',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      passwordHint: 'Utilisez majuscules, chiffres et caractères spéciaux',
      strengthWeak: 'Faible',
      strengthMedium: 'Moyen',
      strengthFair: 'Correct',
      strengthStrong: 'Fort',
      strengthVeryStrong: 'Très fort',
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
      minChars: 'Minimum 2 caractères',
      maxChars: 'Maximum 100 caractères',
      invalidEmail: 'Email invalide',
      alreadyRegistered: 'Un compte existe déjà avec cet email.',
      compromisedPassword: 'Le mot de passe a été compromis ou est trop faible. Choisissez-en un autre.',
      creating: 'Création...',
      createAccount: 'Créer mon compte',
      termsAgree: 'En créant un compte, vous acceptez nos',
      termsLink: 'CGU',
      andOur: 'et notre',
      privacyLink: 'politique de confidentialité',
      alreadyHaveAccount: 'Déjà un compte ?',
      loginLink: 'Se connecter',
      successTitle: 'Vérifiez votre email',
      successText: 'Un email de confirmation a été envoyé à',
      successNote: 'Après confirmation, un administrateur vous attribuera un rôle pour accéder à la plateforme.',
      backToLoginBtn: 'Retour à la connexion',
      leftPanelText: 'Rejoignez la plateforme de gestion des urgences hospitalières. Créez votre compte et un administrateur vous attribuera votre rôle.',
    },
    contact: {
      badge: 'Nous contacter',
      title: 'Parlons de votre projet',
      subtitle: 'Une question sur UrgenceOS, un essai à planifier, ou simplement envie d\'en savoir plus ? Remplissez le formulaire ci-dessous.',
      successTitle: 'Message envoyé !',
      successText: 'Nous reviendrons vers vous sous 48h ouvrées.',
      backToHome: 'Retour à l\'accueil',
      formTitle: 'Formulaire de contact',
      formDescription: 'Tous les champs marqués * sont obligatoires.',
      firstName: 'Prénom *',
      firstNamePlaceholder: 'Marie',
      lastName: 'Nom *',
      lastNamePlaceholder: 'Dupont',
      professionalEmail: 'Email professionnel *',
      emailPlaceholder: 'marie.dupont@hopital.fr',
      establishment: 'Établissement *',
      establishmentPlaceholder: 'CHU de Lyon',
      role: 'Fonction *',
      rolePlaceholder: 'DSI, Médecin urgentiste...',
      message: 'Message (optionnel)',
      messagePlaceholder: 'Décrivez votre besoin, la taille de votre service, vos contraintes...',
      sending: 'Envoi...',
      send: 'Envoyer le message',
      directEmail: 'Vous pouvez aussi nous écrire directement à',
      requiredFields: 'Tous les champs marqués * sont obligatoires.',
      fillRequired: 'Veuillez remplir tous les champs obligatoires.',
      errorGeneric: 'Une erreur est survenue. Réessayez ou contactez-nous par email.',
      breadcrumbHome: 'Accueil',
      breadcrumbContact: 'Contact',
    },
    pricing: {
      badge: 'Modèle économique',
      title: 'Un essai de 10 semaines pour voir les résultats.',
      subtitle: 'Pas d\'engagement pluriannuel. Un essai encadré de 10 semaines pour mesurer les gains concrets avec vos propres chiffres. Si ça marche, vous continuez. Sinon, vous arrêtez.',
      recommended: 'Recommandé',
      trialName: 'Essai',
      trialTarget: 'Un service d\'urgences',
      trialPrice: 'À partir de 15 000 €',
      trialDescription: '10 semaines d\'essai. 2 modules inclus. Résultats mesurés. Connexion à votre dossier patient existant.',
      trialCta: 'Demander un essai',
      extensionName: 'Extension',
      extensionTarget: 'Multi-services',
      extensionPrice: 'Sur mesure',
      extensionDescription: 'Après validation de l\'essai. Extension à d\'autres services + modules supplémentaires.',
      extensionCta: 'Contacter l\'équipe',
      consortiumName: 'Consortium GHT',
      consortiumTarget: 'Multi-établissements',
      consortiumPrice: 'Mutualisé',
      consortiumDescription: 'Plateforme partagée. Modules communs. Coûts divisés. Gouvernance commune.',
      consortiumCta: 'Contacter l\'équipe',
      pricingNote: 'Le montant de l\'essai dépend de la complexité d\'intégration avec votre informatique existante.',
      contactForQuote: 'Contactez-nous pour un devis personnalisé →',
      businessCaseTitle: 'Business case : vos chiffres, pas les nôtres.',
      businessCaseSubtitle: 'Nous fournissons un modèle de business case TCO 5 ans à remplir avec les données de votre établissement. Aucun chiffre inventé. Les formules ROI/payback sont transparentes.',
      currentCosts: 'Coûts actuels (à mesurer)',
      targetCosts: 'Coûts cible (avec UrgenceOS)',
      roiFormulas: 'Formules ROI / Payback',
      dafMethod: 'Méthode : réunion DAF 60 minutes',
      transparency: 'Transparence totale. ROI calculé sur vos données réelles. Aucun chiffre présélectionné.',
      faqTitle: 'Questions fréquentes',
      ctaTitle: 'Prêt à évaluer les gains pour votre service ?',
      ctaSubtitle: '60 minutes pour estimer vos économies avec vos propres chiffres. Sans engagement.',
      requestTrial: 'Demander un essai',
      seeDemo: 'Voir la démo',
      disclaimer: 'Les tarifs dépendent du périmètre de déploiement et de la complexité d\'intégration. UrgenceOS ne constitue pas un dispositif médical certifié.',
      breadcrumbHome: 'Accueil',
      breadcrumbPricing: 'Tarifs',
    },
    faq: {
      badge: 'Centre d\'aide',
      title: 'Questions fréquentes',
      subtitle: 'Tout ce que les DSI, DAF, directions d\'établissements et équipes soignantes doivent savoir sur UrgenceOS et le modèle Hospital-Owned Software.',
      ctaTitle: 'Vous n\'avez pas trouvé votre réponse ?',
      ctaSubtitle: 'Notre équipe répond à toutes les questions : architecture, sécurité, intégration DPI, business case.',
      contactUs: 'Nous contacter',
      requestTrial: 'Demander un essai',
      seeDemo: 'Voir la démo',
      disclaimer: 'UrgenceOS est un outil d\'aide à la gestion des urgences hospitalières. Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.',
      breadcrumbHome: 'Accueil',
      breadcrumbFaq: 'FAQ',
      catUnderstand: 'Comprendre UrgenceOS',
      catHowItWorks: 'Comment ça marche',
      catSecurity: 'Sécurité et données',
      catTrial: 'Essai et déploiement',
      catPricing: 'Tarifs',
    },
    roles: {
      title: 'Sélection du rôle',
      titleNewUser: 'En attente d\'attribution',
      subtitle: 'Choisissez votre profil pour cette session',
      subtitleNewUser: 'Un administrateur doit vous attribuer un rôle pour accéder à la plateforme',
      noRoleTitle: 'Aucun rôle attribué',
      noRoleText: 'Votre compte n\'a pas encore de rôle assigné. Contactez un administrateur pour obtenir l\'accès à la plateforme.',
      noRoleContact: 'Email de contact :',
      noRoleToast: 'Aucun rôle attribué à votre compte. Contactez un administrateur pour obtenir un accès.',
      logout: 'Déconnexion',
      medecin: 'Médecin',
      medecinDesc: 'Board panoramique & dossiers patients',
      ioa: 'IOA',
      ioaDesc: 'File d\'attente & tri des patients',
      ide: 'IDE',
      ideDesc: 'Pancarte unifiée & administrations',
      as: 'Aide-soignant',
      asDesc: 'Constantes & surveillance',
      secretaire: 'Secrétaire',
      secretaireDesc: 'Admissions & accueil',
    },
    about: {
      badge: 'À propos',
      heroTitle: 'L\'hôpital public mérite un logiciel qu\'il contrôle.',
      heroSubtitle: 'EmotionsCare conçoit UrgenceOS : un logiciel que l\'hôpital possède, des modules dédiés aux urgences avec des résultats mesurables, et une architecture qui réduit les coûts au lieu de les aggraver.',
      missionTitle: 'Notre conviction',
      missionP1: 'Les hôpitaux accumulent une dette opérationnelle invisible : licences récurrentes en hausse, interfaces fragiles entre 15 à 40 applications, temps clinique perdu en friction logicielle, surface d\'attaque qui croît avec chaque outil supplémentaire. Le problème n\'est pas un manque de logiciels. C\'est un excès d\'outils non maîtrisés.',
      missionP2: 'Hospital-Owned Software est notre réponse : un socle interne que l\'hôpital possède et gouverne, sur lequel se branchent des modules métier interopérables. Le DPI reste en place. Les outils satellites disparaissent un par un. La dette diminue au lieu de s\'accumuler.',
      principlesTitle: 'Nos principes',
      visionTitle: 'Vision : de l\'essai au territoire',
      visionSubtitle: 'Un hôpital valide. Un GHT mutualise. Un territoire standardise.',
      phase1: 'Phase 1', phase1Title: 'Essai', phase1Desc: 'Un établissement prouve le ROI sur le périmètre urgences. 10 semaines, critères go/no-go définis.',
      phase2: 'Phase 2', phase2Title: 'Mutualisation', phase2Desc: 'Trois établissements partagent le socle et les modules. Données isolées, coûts divisés.',
      phase3: 'Phase 3', phase3Title: 'Standardisation', phase3Desc: 'Le GHT standardise ses flux, ses connecteurs et ses indicateurs. ARS-ready.',
      timelineTitle: 'Notre parcours',
      ecosystemTitle: 'Écosystème',
      ecosystemSubtitle: 'UrgenceOS se construit avec les acteurs du terrain',
      founderRole: 'Fondatrice & Présidente — EmotionsCare SASU',
      founderBio: 'Convaincue que l\'hôpital public mérite des outils numériques à la hauteur de sa mission, Laeticia a créé EmotionsCare pour redonner aux établissements de santé la maîtrise de leur informatique. UrgenceOS est né de cette conviction : un logiciel conçu avec les soignants, détenu par l\'hôpital, et mesuré sur des résultats concrets.',
      companyTitle: 'EmotionsCare SASU',
      ctaTitle: 'Prêt à reprendre le contrôle de votre informatique ?',
      ctaSubtitle: '10 semaines pour mesurer les résultats concrets. Sans engagement pluriannuel.',
      ctaButton: 'Demander un essai',
      ctaDemo: 'Voir la démo',
      disclaimer: 'UrgenceOS est un outil d\'aide à la gestion des urgences hospitalières. Il ne constitue pas un dispositif médical certifié au sens de la réglementation en vigueur.',
      breadcrumbHome: 'Accueil',
      breadcrumbAbout: 'À propos',
    },
    status: {
      pageTitle: 'Statut des services',
      monitoring: 'Monitoring 24/7',
      title: 'Statut des services',
      lastCheck: 'Dernière vérification :',
      waitingData: 'Données en attente du premier check automatique',
      refresh: 'Actualiser',
      allOperational: 'Tous les systèmes sont opérationnels',
      degraded: 'Performances dégradées sur certains services',
      incidentActive: 'Incident en cours',
      uptime90: 'Uptime 90j',
      avgLatency: 'Latence moyenne',
      resolvedIncidents: 'Incidents résolus',
      uptimeLast90: 'Uptime — 90 derniers jours',
      daysAgo: '90 jours',
      today: 'Aujourd\'hui',
      systemComponents: 'Composants du système',
      slaTitle: 'Engagements SLA',
      slaConsult: 'Consulter le SLA',
      slaNote: 'Ces engagements s\'appliquent aux établissements en phase d\'essai et en production. Les SLA sont contractualisés et mesurés mensuellement.',
      securityTitle: 'Vérifications de sécurité',
      incidentHistory: 'Historique des incidents',
      noIncidents: 'Aucun incident signalé',
      noIncidentsDetail: 'Aucun incident majeur enregistré sur les 90 derniers jours.',
      duration: 'Durée :',
      infrastructure: 'Infrastructure',
      breadcrumbHome: 'Accueil',
      breadcrumbStatus: 'Statut',
    },
    forgotPassword: {
      backToLogin: 'Retour à la connexion',
      title: 'Mot de passe oublié',
      subtitle: 'Recevez un lien de réinitialisation par email',
      email: 'Email',
      emailPlaceholder: 'nom@hopital.fr',
      emailRequired: 'Email requis',
      sendError: 'Erreur lors de l\'envoi. Vérifiez votre email et réessayez.',
      sending: 'Envoi...',
      sendLink: 'Envoyer le lien',
      sentTitle: 'Email envoyé',
      sentText: 'Si un compte existe avec l\'adresse',
      checkSpam: 'Vérifiez aussi vos courriers indésirables.',
    },
    resetPassword: {
      title: 'Nouveau mot de passe',
      subtitle: 'Choisissez un nouveau mot de passe sécurisé',
      newPassword: 'Nouveau mot de passe',
      newPasswordPlaceholder: 'Minimum 8 caractères',
      confirm: 'Confirmer',
      confirmPlaceholder: 'Répétez le mot de passe',
      minChars: 'Le mot de passe doit contenir au moins 8 caractères.',
      mismatch: 'Les mots de passe ne correspondent pas.',
      compromised: 'Ce mot de passe a été compromis. Choisissez-en un autre.',
      updating: 'Mise à jour...',
      update: 'Mettre à jour le mot de passe',
      successTitle: 'Mot de passe mis à jour',
      successRedirect: 'Redirection vers la connexion...',
      invalidLink: 'Ce lien est invalide ou a expiré.',
      requestNew: 'Demander un nouveau lien',
    },
    demoLive: {
      chooseRole: 'Choisissez votre rôle',
      chooseRoleDesc: 'Sélectionnez un profil pour explorer l\'interface correspondante avec des données fictives. Aucun compte nécessaire.',
      simulatedPatients: '10 patients simulés — Données en temps réel',
      demoMode: 'Mode Démo',
      connectedAs: 'Vous êtes connecté en tant que',
      goToBoard: 'Aller au board',
      exitDemo: 'Quitter la démo',
      interactiveDemo: 'Démo interactive',
      validationScenarios: 'Scénarios de validation',
      validationDesc: '8 scénarios de test issus du cahier des charges hospitalier',
      guardMode: 'Mode Garde',
      guardDesc: 'Vue multi-services SAU + UHCD + Déchocage avec alertes et transmissions',
      auditQuality: 'Audit & Qualité',
      auditDesc: 'Tableau de bord qualité, indicateurs automatisés, export RMM/CREX',
      ehrExchange: 'Échanges dossier patient',
      ehrDesc: 'Connexion avec votre DPI — export compte-rendu et ordonnance',
      backGuidedDemo: 'Retour à la démo guidée',
      backHome: 'Retour à l\'accueil',
      createAccount: 'Créer un compte',
      login: 'Se connecter',
      disclaimer: 'Les données affichées sont fictives et générées pour la démonstration. UrgenceOS ne constitue pas un dispositif médical certifié.',
    },
    notFound: {
      title: '404',
      subtitle: 'Page introuvable',
      detail: 'L\'adresse demandée n\'existe pas ou a été déplacée.',
      backHome: 'Retour à l\'accueil',
    },
    cookieConsent: {
      technicalOnly: 'Cookies techniques uniquement.',
      learnMore: 'En savoir plus',
      customize: 'Personnaliser',
      refuse: 'Refuser',
      accept: 'Accepter',
      settingsTitle: 'Paramètres cookies',
      essential: 'Essentiels',
      essentialDesc: 'Session d\'authentification',
      preferences: 'Préférences',
      preferencesDesc: 'Thème, onboarding',
      refuseAll: 'Refuser tout',
      save: 'Enregistrer',
    },
    pricingFeatures: {
      trial: [
        'Plateforme complète (identité, droits d\'accès, traçabilité)',
        'Module récap parcours patient par rôle',
        'Module traçabilité temps réel',
        'Connexion à votre dossier patient existant',
        'Réception des résultats de laboratoire',
        'Formation par rôle (2h par profil)',
        'Rapport de résultats pour la direction',
        'Critères de succès définis à l\'avance',
      ],
      extension: [
        'Tout l\'essai initial +',
        'Modules supplémentaires (triage, prescriptions, sortie)',
        'Connexion bidirectionnelle au dossier patient',
        'Authentification unique institutionnelle (SSO)',
        'Supervision complète',
        'Comité de suivi trimestriel',
        'Audit sécurité annuel inclus',
        'Coûts récurrents décroissants',
      ],
      consortium: [
        'Plateforme partagée multi-établissements',
        'Bibliothèque de modules partagés',
        'Connecteurs réutilisables entre établissements',
        'Équipe technique mutualisée',
        'Interopérabilité commune',
        'Indicateurs consolidés pour les tutelles',
        'Division des coûts par établissement',
        'Standardisation des échanges',
      ],
    },
    pricingFaq: {
      q1: 'Pourquoi commencer par un essai plutôt qu\'un déploiement complet ?',
      a1: 'L\'essai mesure le ROI sur vos données réelles avant tout engagement. 10 semaines, périmètre urgences, critères go/no-go définis à l\'avance. Si les résultats sont là, vous décidez de la suite. Si non, vous arrêtez. Pas d\'engagement pluriannuel en première intention.',
      q2: 'Comment le modèle économique diffère-t-il d\'un éditeur classique ?',
      a2: 'Le socle est possédé par l\'hôpital. Pas de licence récurrente sur le socle. Les coûts portent sur le déploiement, la formation, le MCO, et les évolutions. Ils sont prévisibles et décroissants — pas de hausse unilatérale.',
      q3: 'Comment construire le business case pour mon établissement ?',
      a3: 'Nous fournissons un modèle de business case vierge (TCO 5 ans, formules ROI/payback) que nous remplissons ensemble lors d\'une réunion de 60 minutes avec le DAF. Les chiffres sont les vôtres, pas les nôtres.',
      q4: 'Quel est le coût d\'un essai ?',
      a4: 'Le forfait essai est calibré sur le périmètre (un service d\'urgences, 2 modules, 10 semaines). Il inclut le cadrage, le déploiement, la formation, et le rapport de mesure. Le montant exact dépend de la complexité d\'intégration avec votre DPI. Demandez un devis.',
    },
    pricingBusinessCase: {
      currentItems: [
        'Licences outils satellites urgences',
        'Maintenance et support éditeurs',
        'Coûts d\'interfaces et connecteurs',
        'Incidents d\'intégration (heures DSI)',
        'Temps clinique perdu (min/poste x postes x 365j)',
      ],
      targetItems: [
        'Investissement initial (socle + modules + formation)',
        'Équipe plateforme interne (part ETP DSI)',
        'Hébergement HDS',
        'MCO et audit sécurité annuel',
        'Voir les formules détaillées ci-dessous',
      ],
      roiItems: [
        'Économie annuelle nette = coûts actuels (A) - coûts cible (B)',
        'ROI année 1 = (A - B - investissement initial) / investissement × 100',
        'Payback = investissement initial / (A - B) en mois',
        'ROI cumulé 5 ans = ((A - B) × 5 - investissement) / investissement × 100',
      ],
      dafItems: [
        '0-10 min — Contexte : combien d\'outils, combien de licences, combien d\'interfaces',
        '10-30 min — Remplissage collaboratif : vos chiffres dans notre modèle TCO',
        '30-45 min — Calcul ROI en direct : coûts actuels vs coûts cible, payback estimé',
        '45-55 min — Dimension "temps clinique perdu" : valorisation des minutes récupérées',
        '55-60 min — Prochaines étapes : go/no-go essai, calendrier, périmètre',
      ],
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
      dashboard: 'Platform',
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
      hdsTarget: 'HDS Certification (in progress)',
      isoTarget: 'ISO 27001 (in progress)',
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
    login: {
      backToHome: 'Back to home',
      systemLogin: 'System login',
      subtitle: 'Manage your emergency department in real time. Triage, prescriptions, results and coordination — all in one tool.',
      email: 'Email',
      emailPlaceholder: 'name@hospital.com',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      invalidEmail: 'Invalid email',
      minChars: 'Minimum 8 characters',
      tooManyAttempts: 'Too many attempts. Try again in',
      wrongCredentials: 'Incorrect email or password',
      loading: 'Loading...',
      submit: 'Sign in',
      noAccount: 'No account yet?',
      createAccount: 'Create an account',
      or: 'or',
      demoMode: 'Demo Mode — No account required',
      leftPanelText: 'Manage your emergency department in real time. Triage, prescriptions, results and coordination — all in one tool.',
      statTriageTime: 'Triage time',
      statTraceability: 'Traceability',
      statPaper: 'Paper',
    },
    signup: {
      backToLogin: 'Back to login',
      title: 'Create an account',
      subtitle: 'Sign up for UrgenceOS',
      fullName: 'Full name',
      fullNamePlaceholder: 'Dr. Jane Smith',
      professionalEmail: 'Professional email',
      emailPlaceholder: 'name@hospital.com',
      password: 'Password',
      passwordPlaceholder: 'Minimum 8 characters',
      confirmPassword: 'Confirm password',
      confirmPlaceholder: 'Repeat password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      passwordHint: 'Use uppercase, numbers and special characters',
      strengthWeak: 'Weak',
      strengthMedium: 'Medium',
      strengthFair: 'Fair',
      strengthStrong: 'Strong',
      strengthVeryStrong: 'Very strong',
      passwordsMismatch: 'Passwords do not match',
      minChars: 'Minimum 2 characters',
      maxChars: 'Maximum 100 characters',
      invalidEmail: 'Invalid email',
      alreadyRegistered: 'An account already exists with this email.',
      compromisedPassword: 'The password has been compromised or is too weak. Choose another one.',
      creating: 'Creating...',
      createAccount: 'Create my account',
      termsAgree: 'By creating an account, you agree to our',
      termsLink: 'Terms of use',
      andOur: 'and our',
      privacyLink: 'Privacy policy',
      alreadyHaveAccount: 'Already have an account?',
      loginLink: 'Sign in',
      successTitle: 'Check your email',
      successText: 'A confirmation email has been sent to',
      successNote: 'After confirmation, an administrator will assign you a role to access the platform.',
      backToLoginBtn: 'Back to login',
      leftPanelText: 'Join the hospital emergency management platform. Create your account and an administrator will assign your role.',
    },
    contact: {
      badge: 'Contact us',
      title: 'Let\'s talk about your project',
      subtitle: 'A question about UrgenceOS, a trial to plan, or simply want to learn more? Fill out the form below.',
      successTitle: 'Message sent!',
      successText: 'We will get back to you within 48 business hours.',
      backToHome: 'Back to home',
      formTitle: 'Contact form',
      formDescription: 'All fields marked * are required.',
      firstName: 'First name *',
      firstNamePlaceholder: 'Jane',
      lastName: 'Last name *',
      lastNamePlaceholder: 'Smith',
      professionalEmail: 'Professional email *',
      emailPlaceholder: 'jane.smith@hospital.com',
      establishment: 'Hospital *',
      establishmentPlaceholder: 'City General Hospital',
      role: 'Role *',
      rolePlaceholder: 'CIO, Emergency physician...',
      message: 'Message (optional)',
      messagePlaceholder: 'Describe your needs, department size, constraints...',
      sending: 'Sending...',
      send: 'Send message',
      directEmail: 'You can also email us directly at',
      requiredFields: 'All fields marked * are required.',
      fillRequired: 'Please fill in all required fields.',
      errorGeneric: 'An error occurred. Please try again or contact us by email.',
      breadcrumbHome: 'Home',
      breadcrumbContact: 'Contact',
    },
    pricing: {
      badge: 'Pricing model',
      title: 'A 10-week trial to see the results.',
      subtitle: 'No multi-year commitment. A structured 10-week trial to measure concrete gains with your own numbers. If it works, you continue. If not, you stop.',
      recommended: 'Recommended',
      trialName: 'Trial',
      trialTarget: 'One emergency department',
      trialPrice: 'From €15,000',
      trialDescription: '10-week trial. 2 modules included. Measured results. Connection to your existing EHR.',
      trialCta: 'Request a trial',
      extensionName: 'Extension',
      extensionTarget: 'Multi-department',
      extensionPrice: 'Custom',
      extensionDescription: 'After trial validation. Extension to other departments + additional modules.',
      extensionCta: 'Contact the team',
      consortiumName: 'GHT Consortium',
      consortiumTarget: 'Multi-hospital',
      consortiumPrice: 'Shared',
      consortiumDescription: 'Shared platform. Common modules. Shared costs. Joint governance.',
      consortiumCta: 'Contact the team',
      pricingNote: 'Trial cost depends on integration complexity with your existing IT.',
      contactForQuote: 'Contact us for a personalized quote →',
      businessCaseTitle: 'Business case: your numbers, not ours.',
      businessCaseSubtitle: 'We provide a 5-year TCO business case template to fill with your establishment\'s data. No invented figures. ROI/payback formulas are transparent.',
      currentCosts: 'Current costs (to measure)',
      targetCosts: 'Target costs (with UrgenceOS)',
      roiFormulas: 'ROI / Payback formulas',
      dafMethod: 'Method: 60-minute CFO meeting',
      transparency: 'Full transparency. ROI calculated on your actual data. No pre-selected figures.',
      faqTitle: 'Frequently asked questions',
      ctaTitle: 'Ready to evaluate gains for your department?',
      ctaSubtitle: '60 minutes to estimate your savings with your own numbers. No commitment.',
      requestTrial: 'Request a trial',
      seeDemo: 'See the demo',
      disclaimer: 'Pricing depends on deployment scope and integration complexity. UrgenceOS is not a certified medical device.',
      breadcrumbHome: 'Home',
      breadcrumbPricing: 'Pricing',
    },
    faq: {
      badge: 'Help center',
      title: 'Frequently asked questions',
      subtitle: 'Everything CIOs, CFOs, hospital directors and care teams need to know about UrgenceOS and the Hospital-Owned Software model.',
      ctaTitle: 'Didn\'t find your answer?',
      ctaSubtitle: 'Our team answers all questions: architecture, security, EHR integration, business case.',
      contactUs: 'Contact us',
      requestTrial: 'Request a trial',
      seeDemo: 'See the demo',
      disclaimer: 'UrgenceOS is a management tool for hospital emergency departments. It is not a certified medical device under applicable regulations.',
      breadcrumbHome: 'Home',
      breadcrumbFaq: 'FAQ',
      catUnderstand: 'Understanding UrgenceOS',
      catHowItWorks: 'How it works',
      catSecurity: 'Security and data',
      catTrial: 'Trial and deployment',
      catPricing: 'Pricing',
    },
    roles: {
      title: 'Role selection',
      titleNewUser: 'Awaiting assignment',
      subtitle: 'Choose your profile for this session',
      subtitleNewUser: 'An administrator must assign you a role to access the platform',
      noRoleTitle: 'No role assigned',
      noRoleText: 'Your account does not have a role yet. Contact an administrator to get access to the platform.',
      noRoleContact: 'Contact email:',
      noRoleToast: 'No role assigned to your account. Contact an administrator for access.',
      logout: 'Sign out',
      medecin: 'Physician',
      medecinDesc: 'Panoramic board & patient records',
      ioa: 'Triage Nurse',
      ioaDesc: 'Queue & patient triage',
      ide: 'Nurse',
      ideDesc: 'Unified chart & administrations',
      as: 'Nursing assistant',
      asDesc: 'Vitals & monitoring',
      secretaire: 'Secretary',
      secretaireDesc: 'Admissions & reception',
    },
    about: {
      badge: 'About',
      heroTitle: 'Public hospitals deserve software they control.',
      heroSubtitle: 'EmotionsCare builds UrgenceOS: software the hospital owns, modules dedicated to emergency departments with measurable results, and an architecture that reduces costs instead of increasing them.',
      missionTitle: 'Our belief',
      missionP1: 'Hospitals accumulate invisible operational debt: rising recurring licenses, fragile interfaces between 15 to 40 applications, clinical time lost to software friction, attack surface that grows with each additional tool. The problem is not a lack of software. It\'s an excess of uncontrolled tools.',
      missionP2: 'Hospital-Owned Software is our answer: an internal foundation that the hospital owns and governs, on which interoperable business modules plug in. The EHR stays in place. Satellite tools disappear one by one. Debt decreases instead of accumulating.',
      principlesTitle: 'Our principles',
      visionTitle: 'Vision: from trial to territory',
      visionSubtitle: 'One hospital validates. A group shares. A territory standardizes.',
      phase1: 'Phase 1', phase1Title: 'Trial', phase1Desc: 'One facility proves ROI on the emergency scope. 10 weeks, go/no-go criteria defined.',
      phase2: 'Phase 2', phase2Title: 'Sharing', phase2Desc: 'Three facilities share the foundation and modules. Isolated data, shared costs.',
      phase3: 'Phase 3', phase3Title: 'Standardization', phase3Desc: 'The group standardizes its flows, connectors and indicators. Regulator-ready.',
      timelineTitle: 'Our journey',
      ecosystemTitle: 'Ecosystem',
      ecosystemSubtitle: 'UrgenceOS is built with field actors',
      founderRole: 'Founder & President — EmotionsCare SASU',
      founderBio: 'Convinced that public hospitals deserve digital tools worthy of their mission, Laeticia created EmotionsCare to give healthcare institutions back control of their IT. UrgenceOS was born from this conviction: software designed with caregivers, owned by the hospital, and measured on concrete results.',
      companyTitle: 'EmotionsCare SASU',
      ctaTitle: 'Ready to take back control of your IT?',
      ctaSubtitle: '10 weeks to measure concrete results. No multi-year commitment.',
      ctaButton: 'Request a trial',
      ctaDemo: 'See the demo',
      disclaimer: 'UrgenceOS is a management tool for hospital emergency departments. It is not a certified medical device under applicable regulations.',
      breadcrumbHome: 'Home',
      breadcrumbAbout: 'About',
    },
    status: {
      pageTitle: 'Service Status',
      monitoring: '24/7 Monitoring',
      title: 'Service Status',
      lastCheck: 'Last check:',
      waitingData: 'Waiting for first automatic check',
      refresh: 'Refresh',
      allOperational: 'All systems operational',
      degraded: 'Degraded performance on some services',
      incidentActive: 'Active incident',
      uptime90: '90-day Uptime',
      avgLatency: 'Average latency',
      resolvedIncidents: 'Resolved incidents',
      uptimeLast90: 'Uptime — last 90 days',
      daysAgo: '90 days',
      today: 'Today',
      systemComponents: 'System components',
      slaTitle: 'SLA Commitments',
      slaConsult: 'View SLA',
      slaNote: 'These commitments apply to establishments in trial and production phases. SLAs are contractualized and measured monthly.',
      securityTitle: 'Security checks',
      incidentHistory: 'Incident history',
      noIncidents: 'No incidents reported',
      noIncidentsDetail: 'No major incidents recorded in the last 90 days.',
      duration: 'Duration:',
      infrastructure: 'Infrastructure',
      breadcrumbHome: 'Home',
      breadcrumbStatus: 'Status',
    },
    forgotPassword: {
      backToLogin: 'Back to login',
      title: 'Forgot password',
      subtitle: 'Receive a reset link by email',
      email: 'Email',
      emailPlaceholder: 'name@hospital.com',
      emailRequired: 'Email required',
      sendError: 'Error sending. Check your email and try again.',
      sending: 'Sending...',
      sendLink: 'Send link',
      sentTitle: 'Email sent',
      sentText: 'If an account exists with the address',
      checkSpam: 'Also check your spam folder.',
    },
    resetPassword: {
      title: 'New password',
      subtitle: 'Choose a new secure password',
      newPassword: 'New password',
      newPasswordPlaceholder: 'Minimum 8 characters',
      confirm: 'Confirm',
      confirmPlaceholder: 'Repeat password',
      minChars: 'Password must be at least 8 characters.',
      mismatch: 'Passwords do not match.',
      compromised: 'This password has been compromised. Choose another.',
      updating: 'Updating...',
      update: 'Update password',
      successTitle: 'Password updated',
      successRedirect: 'Redirecting to login...',
      invalidLink: 'This link is invalid or has expired.',
      requestNew: 'Request a new link',
    },
    demoLive: {
      chooseRole: 'Choose your role',
      chooseRoleDesc: 'Select a profile to explore the corresponding interface with demo data. No account needed.',
      simulatedPatients: '10 simulated patients — Real-time data',
      demoMode: 'Demo Mode',
      connectedAs: 'You are connected as',
      goToBoard: 'Go to board',
      exitDemo: 'Exit demo',
      interactiveDemo: 'Interactive demo',
      validationScenarios: 'Validation scenarios',
      validationDesc: '8 test scenarios from hospital specifications',
      guardMode: 'Guard Mode',
      guardDesc: 'Multi-service view ED + SHTU + Resus with alerts and handovers',
      auditQuality: 'Audit & Quality',
      auditDesc: 'Quality dashboard, automated indicators, RMM/CREX export',
      ehrExchange: 'EHR Exchange',
      ehrDesc: 'Connection with your EHR — discharge summary and prescription export',
      backGuidedDemo: 'Back to guided demo',
      backHome: 'Back to home',
      createAccount: 'Create account',
      login: 'Log in',
      disclaimer: 'Displayed data is fictitious and generated for demonstration. UrgenceOS is not a certified medical device.',
    },
    notFound: {
      title: '404',
      subtitle: 'Page not found',
      detail: 'The requested page does not exist or has been moved.',
      backHome: 'Back to home',
    },
    cookieConsent: {
      technicalOnly: 'Technical cookies only.',
      learnMore: 'Learn more',
      customize: 'Customize',
      refuse: 'Refuse',
      accept: 'Accept',
      settingsTitle: 'Cookie settings',
      essential: 'Essential',
      essentialDesc: 'Authentication session',
      preferences: 'Preferences',
      preferencesDesc: 'Theme, onboarding',
      refuseAll: 'Refuse all',
      save: 'Save',
    },
    pricingFeatures: {
      trial: [
        'Full platform (identity, access control, traceability)',
        'Patient journey recap module by role',
        'Real-time traceability module',
        'Connection to your existing EHR',
        'Lab result reception',
        'Role-based training (2h per profile)',
        'Results report for management',
        'Success criteria defined upfront',
      ],
      extension: [
        'Everything from the initial trial +',
        'Additional modules (triage, prescriptions, discharge)',
        'Bidirectional EHR connection',
        'Institutional single sign-on (SSO)',
        'Full supervision',
        'Quarterly steering committee',
        'Annual security audit included',
        'Decreasing recurring costs',
      ],
      consortium: [
        'Multi-facility shared platform',
        'Shared module library',
        'Reusable connectors between facilities',
        'Shared technical team',
        'Common interoperability',
        'Consolidated indicators for regulators',
        'Cost sharing per facility',
        'Exchange standardization',
      ],
    },
    pricingFaq: {
      q1: 'Why start with a trial rather than a full deployment?',
      a1: 'The trial measures ROI on your real data before any commitment. 10 weeks, emergency scope, go/no-go criteria defined upfront. If results are there, you decide to continue. If not, you stop. No multi-year commitment initially.',
      q2: 'How does the pricing model differ from a traditional vendor?',
      a2: 'The foundation is owned by the hospital. No recurring license on the foundation. Costs cover deployment, training, maintenance, and evolutions. They are predictable and decreasing — no unilateral increase.',
      q3: 'How to build the business case for my facility?',
      a3: 'We provide a blank business case template (5-year TCO, ROI/payback formulas) that we fill together during a 60-minute meeting with the CFO. The numbers are yours, not ours.',
      q4: 'What does a trial cost?',
      a4: 'The trial package is calibrated to the scope (one emergency department, 2 modules, 10 weeks). It includes scoping, deployment, training, and measurement report. The exact amount depends on integration complexity with your EHR. Request a quote.',
    },
    pricingBusinessCase: {
      currentItems: [
        'Emergency satellite tool licenses',
        'Vendor maintenance and support',
        'Interface and connector costs',
        'Integration incidents (IT hours)',
        'Lost clinical time (min/station x stations x 365d)',
      ],
      targetItems: [
        'Initial investment (foundation + modules + training)',
        'Internal platform team (IT FTE share)',
        'Health data hosting',
        'Maintenance and annual security audit',
        'See detailed formulas below',
      ],
      roiItems: [
        'Net annual savings = current costs (A) - target costs (B)',
        'Year 1 ROI = (A - B - initial investment) / investment × 100',
        'Payback = initial investment / (A - B) in months',
        '5-year cumulative ROI = ((A - B) × 5 - investment) / investment × 100',
      ],
      dafItems: [
        '0-10 min — Context: how many tools, licenses, interfaces',
        '10-30 min — Collaborative fill: your numbers in our TCO model',
        '30-45 min — Live ROI calc: current vs target costs, estimated payback',
        '45-55 min — "Lost clinical time" dimension: valuation of recovered minutes',
        '55-60 min — Next steps: go/no-go trial, timeline, scope',
      ],
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
      dashboard: 'Plataforma',
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
      hdsTarget: 'Certificación HDS (en curso)',
      isoTarget: 'ISO 27001 (en curso)',
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
    login: {
      backToHome: 'Volver al inicio',
      systemLogin: 'Iniciar sesión',
      subtitle: 'Gestione su servicio de urgencias en tiempo real. Triaje, prescripciones, resultados y coordinación — todo en una sola herramienta.',
      email: 'Email',
      emailPlaceholder: 'nombre@hospital.es',
      password: 'Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña',
      invalidEmail: 'Email inválido',
      minChars: 'Mínimo 8 caracteres',
      tooManyAttempts: 'Demasiados intentos. Inténtelo de nuevo en',
      wrongCredentials: 'Email o contraseña incorrectos',
      loading: 'Cargando...',
      submit: 'Iniciar sesión',
      noAccount: '¿No tiene cuenta?',
      createAccount: 'Crear una cuenta',
      or: 'o',
      demoMode: 'Modo Demo — Sin cuenta necesaria',
      leftPanelText: 'Gestione su servicio de urgencias en tiempo real. Triaje, prescripciones, resultados y coordinación — todo en una sola herramienta.',
      statTriageTime: 'Tiempo de triaje',
      statTraceability: 'Trazabilidad',
      statPaper: 'Papel',
    },
    signup: {
      backToLogin: 'Volver al inicio de sesión',
      title: 'Crear una cuenta',
      subtitle: 'Registro en UrgenceOS',
      fullName: 'Nombre completo',
      fullNamePlaceholder: 'Dra. María García',
      professionalEmail: 'Email profesional',
      emailPlaceholder: 'nombre@hospital.es',
      password: 'Contraseña',
      passwordPlaceholder: 'Mínimo 8 caracteres',
      confirmPassword: 'Confirmar contraseña',
      confirmPlaceholder: 'Repita la contraseña',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña',
      passwordHint: 'Use mayúsculas, números y caracteres especiales',
      strengthWeak: 'Débil',
      strengthMedium: 'Medio',
      strengthFair: 'Aceptable',
      strengthStrong: 'Fuerte',
      strengthVeryStrong: 'Muy fuerte',
      passwordsMismatch: 'Las contraseñas no coinciden',
      minChars: 'Mínimo 2 caracteres',
      maxChars: 'Máximo 100 caracteres',
      invalidEmail: 'Email inválido',
      alreadyRegistered: 'Ya existe una cuenta con este email.',
      compromisedPassword: 'La contraseña ha sido comprometida o es demasiado débil. Elija otra.',
      creating: 'Creando...',
      createAccount: 'Crear mi cuenta',
      termsAgree: 'Al crear una cuenta, acepta nuestros',
      termsLink: 'Términos de uso',
      andOur: 'y nuestra',
      privacyLink: 'Política de privacidad',
      alreadyHaveAccount: '¿Ya tiene cuenta?',
      loginLink: 'Iniciar sesión',
      successTitle: 'Verifique su email',
      successText: 'Se ha enviado un email de confirmación a',
      successNote: 'Tras la confirmación, un administrador le asignará un rol para acceder a la plataforma.',
      backToLoginBtn: 'Volver al inicio de sesión',
      leftPanelText: 'Únase a la plataforma de gestión de urgencias hospitalarias. Cree su cuenta y un administrador le asignará su rol.',
    },
    contact: {
      badge: 'Contáctenos',
      title: 'Hablemos de su proyecto',
      subtitle: '¿Una pregunta sobre UrgenceOS, una prueba que planificar, o simplemente quiere saber más? Rellene el formulario.',
      successTitle: '¡Mensaje enviado!',
      successText: 'Le responderemos en un plazo de 48 horas laborables.',
      backToHome: 'Volver al inicio',
      formTitle: 'Formulario de contacto',
      formDescription: 'Todos los campos marcados con * son obligatorios.',
      firstName: 'Nombre *',
      firstNamePlaceholder: 'María',
      lastName: 'Apellido *',
      lastNamePlaceholder: 'García',
      professionalEmail: 'Email profesional *',
      emailPlaceholder: 'maria.garcia@hospital.es',
      establishment: 'Hospital *',
      establishmentPlaceholder: 'Hospital Universitario',
      role: 'Función *',
      rolePlaceholder: 'DSI, Médico urgencista...',
      message: 'Mensaje (opcional)',
      messagePlaceholder: 'Describa su necesidad, el tamaño de su servicio, sus restricciones...',
      sending: 'Enviando...',
      send: 'Enviar mensaje',
      directEmail: 'También puede escribirnos directamente a',
      requiredFields: 'Todos los campos marcados con * son obligatorios.',
      fillRequired: 'Por favor, rellene todos los campos obligatorios.',
      errorGeneric: 'Ha ocurrido un error. Inténtelo de nuevo o contáctenos por email.',
      breadcrumbHome: 'Inicio',
      breadcrumbContact: 'Contacto',
    },
    pricing: {
      badge: 'Modelo económico',
      title: 'Una prueba de 10 semanas para ver los resultados.',
      subtitle: 'Sin compromiso plurianual. Una prueba estructurada de 10 semanas para medir los beneficios concretos con sus propios datos. Si funciona, continúa. Si no, para.',
      recommended: 'Recomendado',
      trialName: 'Prueba',
      trialTarget: 'Un servicio de urgencias',
      trialPrice: 'Desde 15 000 €',
      trialDescription: '10 semanas de prueba. 2 módulos incluidos. Resultados medidos. Conexión a su HCE existente.',
      trialCta: 'Solicitar una prueba',
      extensionName: 'Extensión',
      extensionTarget: 'Multi-servicio',
      extensionPrice: 'A medida',
      extensionDescription: 'Tras la validación de la prueba. Extensión a otros servicios + módulos adicionales.',
      extensionCta: 'Contactar al equipo',
      consortiumName: 'Consorcio',
      consortiumTarget: 'Multi-hospital',
      consortiumPrice: 'Compartido',
      consortiumDescription: 'Plataforma compartida. Módulos comunes. Costes divididos. Gobernanza conjunta.',
      consortiumCta: 'Contactar al equipo',
      pricingNote: 'El coste de la prueba depende de la complejidad de integración con su informática existente.',
      contactForQuote: 'Contáctenos para un presupuesto personalizado →',
      businessCaseTitle: 'Business case: sus cifras, no las nuestras.',
      businessCaseSubtitle: 'Proporcionamos un modelo de business case TCO a 5 años para rellenar con los datos de su establecimiento. Sin cifras inventadas. Las fórmulas ROI/payback son transparentes.',
      currentCosts: 'Costes actuales (a medir)',
      targetCosts: 'Costes objetivo (con UrgenceOS)',
      roiFormulas: 'Fórmulas ROI / Payback',
      dafMethod: 'Método: reunión DAF de 60 minutos',
      transparency: 'Transparencia total. ROI calculado con sus datos reales. Sin cifras preseleccionadas.',
      faqTitle: 'Preguntas frecuentes',
      ctaTitle: '¿Listo para evaluar los beneficios para su servicio?',
      ctaSubtitle: '60 minutos para estimar sus ahorros con sus propios datos. Sin compromiso.',
      requestTrial: 'Solicitar una prueba',
      seeDemo: 'Ver la demo',
      disclaimer: 'Los precios dependen del alcance del despliegue y la complejidad de integración. UrgenceOS no es un dispositivo médico certificado.',
      breadcrumbHome: 'Inicio',
      breadcrumbPricing: 'Precios',
    },
    faq: {
      badge: 'Centro de ayuda',
      title: 'Preguntas frecuentes',
      subtitle: 'Todo lo que los directores de sistemas, directores financieros, directores de hospitales y equipos asistenciales deben saber sobre UrgenceOS y el modelo Hospital-Owned Software.',
      ctaTitle: '¿No encontró su respuesta?',
      ctaSubtitle: 'Nuestro equipo responde a todas las preguntas: arquitectura, seguridad, integración HCE, business case.',
      contactUs: 'Contáctenos',
      requestTrial: 'Solicitar una prueba',
      seeDemo: 'Ver la demo',
      disclaimer: 'UrgenceOS es una herramienta de gestión para servicios de urgencias hospitalarias. No es un dispositivo médico certificado según la normativa vigente.',
      breadcrumbHome: 'Inicio',
      breadcrumbFaq: 'FAQ',
      catUnderstand: 'Entender UrgenceOS',
      catHowItWorks: 'Cómo funciona',
      catSecurity: 'Seguridad y datos',
      catTrial: 'Prueba y despliegue',
      catPricing: 'Precios',
    },
    roles: {
      title: 'Selección de rol',
      titleNewUser: 'En espera de asignación',
      subtitle: 'Elija su perfil para esta sesión',
      subtitleNewUser: 'Un administrador debe asignarle un rol para acceder a la plataforma',
      noRoleTitle: 'Sin rol asignado',
      noRoleText: 'Su cuenta aún no tiene un rol asignado. Contacte a un administrador para obtener acceso a la plataforma.',
      noRoleContact: 'Email de contacto:',
      noRoleToast: 'No tiene rol asignado. Contacte a un administrador para obtener acceso.',
      logout: 'Cerrar sesión',
      medecin: 'Médico',
      medecinDesc: 'Board panorámico y expedientes',
      ioa: 'Enfermero de triaje',
      ioaDesc: 'Cola de espera y triaje',
      ide: 'Enfermero',
      ideDesc: 'Gráfico unificado y administraciones',
      as: 'Auxiliar de enfermería',
      asDesc: 'Signos vitales y vigilancia',
      secretaire: 'Secretario/a',
      secretaireDesc: 'Admisiones y recepción',
    },
    about: {
      badge: 'Acerca de',
      heroTitle: 'Los hospitales públicos merecen un software que controlen.',
      heroSubtitle: 'EmotionsCare crea UrgenceOS: un software que el hospital posee, módulos dedicados a urgencias con resultados medibles, y una arquitectura que reduce costes en lugar de aumentarlos.',
      missionTitle: 'Nuestra convicción',
      missionP1: 'Los hospitales acumulan una deuda operativa invisible: licencias recurrentes en aumento, interfaces frágiles entre 15 a 40 aplicaciones, tiempo clínico perdido en fricción de software, superficie de ataque que crece con cada herramienta adicional. El problema no es la falta de software. Es un exceso de herramientas no controladas.',
      missionP2: 'Hospital-Owned Software es nuestra respuesta: una base interna que el hospital posee y gobierna, sobre la que se conectan módulos de negocio interoperables. La HCE permanece. Las herramientas satélite desaparecen una a una. La deuda disminuye en lugar de acumularse.',
      principlesTitle: 'Nuestros principios',
      visionTitle: 'Visión: del ensayo al territorio',
      visionSubtitle: 'Un hospital valida. Un grupo comparte. Un territorio estandariza.',
      phase1: 'Fase 1', phase1Title: 'Prueba', phase1Desc: 'Un establecimiento prueba el ROI en urgencias. 10 semanas, criterios go/no-go definidos.',
      phase2: 'Fase 2', phase2Title: 'Mutualización', phase2Desc: 'Tres establecimientos comparten la base y los módulos. Datos aislados, costes divididos.',
      phase3: 'Fase 3', phase3Title: 'Estandarización', phase3Desc: 'El grupo estandariza sus flujos, conectores e indicadores. Listo para el regulador.',
      timelineTitle: 'Nuestro recorrido',
      ecosystemTitle: 'Ecosistema',
      ecosystemSubtitle: 'UrgenceOS se construye con los actores del terreno',
      founderRole: 'Fundadora y Presidenta — EmotionsCare SASU',
      founderBio: 'Convencida de que los hospitales públicos merecen herramientas digitales a la altura de su misión, Laeticia creó EmotionsCare para devolver a los establecimientos sanitarios el control de su informática. UrgenceOS nació de esta convicción: un software diseñado con los cuidadores, propiedad del hospital, y medido con resultados concretos.',
      companyTitle: 'EmotionsCare SASU',
      ctaTitle: '¿Listo para retomar el control de su informática?',
      ctaSubtitle: '10 semanas para medir resultados concretos. Sin compromiso plurianual.',
      ctaButton: 'Solicitar una prueba',
      ctaDemo: 'Ver la demo',
      disclaimer: 'UrgenceOS es una herramienta de gestión para servicios de urgencias hospitalarias. No es un dispositivo médico certificado según la normativa vigente.',
      breadcrumbHome: 'Inicio',
      breadcrumbAbout: 'Acerca de',
    },
    status: {
      pageTitle: 'Estado de los servicios',
      monitoring: 'Monitoreo 24/7',
      title: 'Estado de los servicios',
      lastCheck: 'Última verificación:',
      waitingData: 'Esperando el primer chequeo automático',
      refresh: 'Actualizar',
      allOperational: 'Todos los sistemas operativos',
      degraded: 'Rendimiento degradado en algunos servicios',
      incidentActive: 'Incidente activo',
      uptime90: 'Uptime 90d',
      avgLatency: 'Latencia promedio',
      resolvedIncidents: 'Incidentes resueltos',
      uptimeLast90: 'Uptime — últimos 90 días',
      daysAgo: '90 días',
      today: 'Hoy',
      systemComponents: 'Componentes del sistema',
      slaTitle: 'Compromisos SLA',
      slaConsult: 'Consultar SLA',
      slaNote: 'Estos compromisos se aplican a los establecimientos en fase de prueba y producción. Los SLA se contractualizan y miden mensualmente.',
      securityTitle: 'Verificaciones de seguridad',
      incidentHistory: 'Historial de incidentes',
      noIncidents: 'Sin incidentes reportados',
      noIncidentsDetail: 'No se registraron incidentes importantes en los últimos 90 días.',
      duration: 'Duración:',
      infrastructure: 'Infraestructura',
      breadcrumbHome: 'Inicio',
      breadcrumbStatus: 'Estado',
    },
    forgotPassword: {
      backToLogin: 'Volver al inicio de sesión',
      title: 'Contraseña olvidada',
      subtitle: 'Reciba un enlace de restablecimiento por email',
      email: 'Email',
      emailPlaceholder: 'nombre@hospital.es',
      emailRequired: 'Email requerido',
      sendError: 'Error al enviar. Verifique su email e inténtelo de nuevo.',
      sending: 'Enviando...',
      sendLink: 'Enviar enlace',
      sentTitle: 'Email enviado',
      sentText: 'Si existe una cuenta con la dirección',
      checkSpam: 'Revise también su carpeta de spam.',
    },
    resetPassword: {
      title: 'Nueva contraseña',
      subtitle: 'Elija una nueva contraseña segura',
      newPassword: 'Nueva contraseña',
      newPasswordPlaceholder: 'Mínimo 8 caracteres',
      confirm: 'Confirmar',
      confirmPlaceholder: 'Repita la contraseña',
      minChars: 'La contraseña debe tener al menos 8 caracteres.',
      mismatch: 'Las contraseñas no coinciden.',
      compromised: 'Esta contraseña ha sido comprometida. Elija otra.',
      updating: 'Actualizando...',
      update: 'Actualizar contraseña',
      successTitle: 'Contraseña actualizada',
      successRedirect: 'Redirigiendo al inicio de sesión...',
      invalidLink: 'Este enlace es inválido o ha expirado.',
      requestNew: 'Solicitar un nuevo enlace',
    },
    demoLive: {
      chooseRole: 'Elija su rol',
      chooseRoleDesc: 'Seleccione un perfil para explorar la interfaz correspondiente con datos ficticios. Sin necesidad de cuenta.',
      simulatedPatients: '10 pacientes simulados — Datos en tiempo real',
      demoMode: 'Modo Demo',
      connectedAs: 'Está conectado como',
      goToBoard: 'Ir al board',
      exitDemo: 'Salir de la demo',
      interactiveDemo: 'Demo interactiva',
      validationScenarios: 'Escenarios de validación',
      validationDesc: '8 escenarios de prueba del pliego de condiciones hospitalario',
      guardMode: 'Modo Guardia',
      guardDesc: 'Vista multi-servicio SU + UHCD + Reanimación con alertas y transmisiones',
      auditQuality: 'Auditoría y Calidad',
      auditDesc: 'Panel de calidad, indicadores automatizados, exportación RMM/CREX',
      ehrExchange: 'Intercambio HCE',
      ehrDesc: 'Conexión con su HCE — exportación de informes y recetas',
      backGuidedDemo: 'Volver a la demo guiada',
      backHome: 'Volver al inicio',
      createAccount: 'Crear cuenta',
      login: 'Iniciar sesión',
      disclaimer: 'Los datos mostrados son ficticios y generados para la demostración. UrgenceOS no es un dispositivo médico certificado.',
    },
    notFound: {
      title: '404',
      subtitle: 'Página no encontrada',
      detail: 'La dirección solicitada no existe o ha sido movida.',
      backHome: 'Volver al inicio',
    },
    cookieConsent: {
      technicalOnly: 'Solo cookies técnicas.',
      learnMore: 'Más información',
      customize: 'Personalizar',
      refuse: 'Rechazar',
      accept: 'Aceptar',
      settingsTitle: 'Configuración de cookies',
      essential: 'Esenciales',
      essentialDesc: 'Sesión de autenticación',
      preferences: 'Preferencias',
      preferencesDesc: 'Tema, onboarding',
      refuseAll: 'Rechazar todo',
      save: 'Guardar',
    },
    pricingFeatures: {
      trial: [
        'Plataforma completa (identidad, control de acceso, trazabilidad)',
        'Módulo de resumen del recorrido del paciente por rol',
        'Módulo de trazabilidad en tiempo real',
        'Conexión a su HCE existente',
        'Recepción de resultados de laboratorio',
        'Formación por rol (2h por perfil)',
        'Informe de resultados para la dirección',
        'Criterios de éxito definidos de antemano',
      ],
      extension: [
        'Todo el ensayo inicial +',
        'Módulos adicionales (triaje, prescripciones, alta)',
        'Conexión bidireccional a la HCE',
        'Autenticación única institucional (SSO)',
        'Supervisión completa',
        'Comité de seguimiento trimestral',
        'Auditoría de seguridad anual incluida',
        'Costes recurrentes decrecientes',
      ],
      consortium: [
        'Plataforma compartida multi-centro',
        'Biblioteca de módulos compartidos',
        'Conectores reutilizables entre centros',
        'Equipo técnico compartido',
        'Interoperabilidad común',
        'Indicadores consolidados para las autoridades',
        'División de costes por centro',
        'Estandarización de intercambios',
      ],
    },
    pricingFaq: {
      q1: '¿Por qué empezar con una prueba en lugar de un despliegue completo?',
      a1: 'La prueba mide el ROI con sus datos reales antes de cualquier compromiso. 10 semanas, perímetro de urgencias, criterios go/no-go definidos de antemano.',
      q2: '¿Cómo difiere el modelo económico de un editor clásico?',
      a2: 'La base es propiedad del hospital. Sin licencia recurrente sobre la base. Los costes cubren despliegue, formación, mantenimiento y evoluciones. Previsibles y decrecientes.',
      q3: '¿Cómo construir el business case para mi establecimiento?',
      a3: 'Proporcionamos un modelo de business case en blanco (TCO 5 años, fórmulas ROI/payback) que rellenamos juntos en una reunión de 60 minutos con el DAF.',
      q4: '¿Cuánto cuesta una prueba?',
      a4: 'El paquete de prueba se calibra según el perímetro (un servicio de urgencias, 2 módulos, 10 semanas). Incluye el alcance, despliegue, formación e informe de medición.',
    },
    pricingBusinessCase: {
      currentItems: [
        'Licencias de herramientas satélite de urgencias',
        'Mantenimiento y soporte de editores',
        'Costes de interfaces y conectores',
        'Incidentes de integración (horas DSI)',
        'Tiempo clínico perdido (min/puesto x puestos x 365d)',
      ],
      targetItems: [
        'Inversión inicial (base + módulos + formación)',
        'Equipo de plataforma interno (parte ETP DSI)',
        'Alojamiento HDS',
        'MCO y auditoría de seguridad anual',
        'Ver fórmulas detalladas abajo',
      ],
      roiItems: [
        'Ahorro anual neto = costes actuales (A) - costes objetivo (B)',
        'ROI año 1 = (A - B - inversión inicial) / inversión × 100',
        'Payback = inversión inicial / (A - B) en meses',
        'ROI acumulado 5 años = ((A - B) × 5 - inversión) / inversión × 100',
      ],
      dafItems: [
        '0-10 min — Contexto: cuántas herramientas, licencias, interfaces',
        '10-30 min — Relleno colaborativo: sus cifras en nuestro modelo TCO',
        '30-45 min — Cálculo ROI en directo: costes actuales vs objetivo, payback estimado',
        '45-55 min — Dimensión "tiempo clínico perdido": valorización de minutos recuperados',
        '55-60 min — Próximos pasos: go/no-go prueba, calendario, perímetro',
      ],
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
      dashboard: 'Plattform',
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
      hdsTarget: 'HDS-Zertifizierung (in Bearbeitung)',
      isoTarget: 'ISO 27001 (in Bearbeitung)',
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
    login: {
      backToHome: 'Zurück zur Startseite',
      systemLogin: 'Systemanmeldung',
      subtitle: 'Verwalten Sie Ihre Notaufnahme in Echtzeit. Triage, Verordnungen, Ergebnisse und Koordination — alles in einem Tool.',
      email: 'E-Mail',
      emailPlaceholder: 'name@krankenhaus.de',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort verbergen',
      invalidEmail: 'Ungültige E-Mail',
      minChars: 'Mindestens 8 Zeichen',
      tooManyAttempts: 'Zu viele Versuche. Versuchen Sie es erneut in',
      wrongCredentials: 'E-Mail oder Passwort falsch',
      loading: 'Laden...',
      submit: 'Anmelden',
      noAccount: 'Noch kein Konto?',
      createAccount: 'Konto erstellen',
      or: 'oder',
      demoMode: 'Demo-Modus — Kein Konto erforderlich',
      leftPanelText: 'Verwalten Sie Ihre Notaufnahme in Echtzeit. Triage, Verordnungen, Ergebnisse und Koordination — alles in einem Tool.',
      statTriageTime: 'Triage-Zeit',
      statTraceability: 'Rückverfolgbarkeit',
      statPaper: 'Papier',
    },
    signup: {
      backToLogin: 'Zurück zur Anmeldung',
      title: 'Konto erstellen',
      subtitle: 'Registrierung bei UrgenceOS',
      fullName: 'Vollständiger Name',
      fullNamePlaceholder: 'Dr. Anna Müller',
      professionalEmail: 'Berufliche E-Mail',
      emailPlaceholder: 'name@krankenhaus.de',
      password: 'Passwort',
      passwordPlaceholder: 'Mindestens 8 Zeichen',
      confirmPassword: 'Passwort bestätigen',
      confirmPlaceholder: 'Passwort wiederholen',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort verbergen',
      passwordHint: 'Verwenden Sie Großbuchstaben, Zahlen und Sonderzeichen',
      strengthWeak: 'Schwach',
      strengthMedium: 'Mittel',
      strengthFair: 'Akzeptabel',
      strengthStrong: 'Stark',
      strengthVeryStrong: 'Sehr stark',
      passwordsMismatch: 'Passwörter stimmen nicht überein',
      minChars: 'Mindestens 2 Zeichen',
      maxChars: 'Maximal 100 Zeichen',
      invalidEmail: 'Ungültige E-Mail',
      alreadyRegistered: 'Ein Konto mit dieser E-Mail existiert bereits.',
      compromisedPassword: 'Das Passwort wurde kompromittiert oder ist zu schwach. Wählen Sie ein anderes.',
      creating: 'Erstellen...',
      createAccount: 'Mein Konto erstellen',
      termsAgree: 'Mit der Erstellung eines Kontos akzeptieren Sie unsere',
      termsLink: 'AGB',
      andOur: 'und unsere',
      privacyLink: 'Datenschutzrichtlinie',
      alreadyHaveAccount: 'Bereits ein Konto?',
      loginLink: 'Anmelden',
      successTitle: 'Überprüfen Sie Ihre E-Mail',
      successText: 'Eine Bestätigungs-E-Mail wurde gesendet an',
      successNote: 'Nach der Bestätigung wird Ihnen ein Administrator eine Rolle zuweisen, um auf die Plattform zuzugreifen.',
      backToLoginBtn: 'Zurück zur Anmeldung',
      leftPanelText: 'Treten Sie der Plattform für das Notaufnahmemanagement bei. Erstellen Sie Ihr Konto und ein Administrator wird Ihnen Ihre Rolle zuweisen.',
    },
    contact: {
      badge: 'Kontaktieren Sie uns',
      title: 'Lassen Sie uns über Ihr Projekt sprechen',
      subtitle: 'Eine Frage zu UrgenceOS, einen Test planen, oder einfach mehr erfahren? Füllen Sie das Formular aus.',
      successTitle: 'Nachricht gesendet!',
      successText: 'Wir melden uns innerhalb von 48 Geschäftsstunden bei Ihnen.',
      backToHome: 'Zurück zur Startseite',
      formTitle: 'Kontaktformular',
      formDescription: 'Alle mit * markierten Felder sind Pflichtfelder.',
      firstName: 'Vorname *',
      firstNamePlaceholder: 'Anna',
      lastName: 'Nachname *',
      lastNamePlaceholder: 'Müller',
      professionalEmail: 'Berufliche E-Mail *',
      emailPlaceholder: 'anna.mueller@krankenhaus.de',
      establishment: 'Krankenhaus *',
      establishmentPlaceholder: 'Universitätsklinikum',
      role: 'Funktion *',
      rolePlaceholder: 'CIO, Notarzt...',
      message: 'Nachricht (optional)',
      messagePlaceholder: 'Beschreiben Sie Ihren Bedarf, die Größe Ihrer Abteilung, Ihre Einschränkungen...',
      sending: 'Senden...',
      send: 'Nachricht senden',
      directEmail: 'Sie können uns auch direkt schreiben an',
      requiredFields: 'Alle mit * markierten Felder sind Pflichtfelder.',
      fillRequired: 'Bitte füllen Sie alle Pflichtfelder aus.',
      errorGeneric: 'Ein Fehler ist aufgetreten. Versuchen Sie es erneut oder kontaktieren Sie uns per E-Mail.',
      breadcrumbHome: 'Startseite',
      breadcrumbContact: 'Kontakt',
    },
    pricing: {
      badge: 'Preismodell',
      title: 'Ein 10-wöchiger Test, um die Ergebnisse zu sehen.',
      subtitle: 'Keine mehrjährige Bindung. Ein strukturierter 10-wöchiger Test, um konkrete Vorteile mit Ihren eigenen Zahlen zu messen. Wenn es funktioniert, machen Sie weiter. Wenn nicht, hören Sie auf.',
      recommended: 'Empfohlen',
      trialName: 'Test',
      trialTarget: 'Eine Notaufnahme',
      trialPrice: 'Ab 15.000 €',
      trialDescription: '10-wöchiger Test. 2 Module inklusive. Gemessene Ergebnisse. Anbindung an Ihr bestehendes KIS.',
      trialCta: 'Test anfragen',
      extensionName: 'Erweiterung',
      extensionTarget: 'Multi-Abteilung',
      extensionPrice: 'Individuell',
      extensionDescription: 'Nach Testvalidierung. Erweiterung auf andere Abteilungen + zusätzliche Module.',
      extensionCta: 'Team kontaktieren',
      consortiumName: 'Konsortium',
      consortiumTarget: 'Multi-Krankenhaus',
      consortiumPrice: 'Geteilt',
      consortiumDescription: 'Gemeinsame Plattform. Gemeinsame Module. Geteilte Kosten. Gemeinsame Governance.',
      consortiumCta: 'Team kontaktieren',
      pricingNote: 'Die Testkosten hängen von der Integrationskomplexität mit Ihrer bestehenden IT ab.',
      contactForQuote: 'Kontaktieren Sie uns für ein individuelles Angebot →',
      businessCaseTitle: 'Business Case: Ihre Zahlen, nicht unsere.',
      businessCaseSubtitle: 'Wir stellen eine 5-Jahres-TCO-Business-Case-Vorlage bereit, die mit den Daten Ihres Hauses ausgefüllt wird. Keine erfundenen Zahlen. Die ROI/Payback-Formeln sind transparent.',
      currentCosts: 'Aktuelle Kosten (zu messen)',
      targetCosts: 'Zielkosten (mit UrgenceOS)',
      roiFormulas: 'ROI / Payback-Formeln',
      dafMethod: 'Methode: 60-Minuten-CFO-Meeting',
      transparency: 'Volle Transparenz. ROI berechnet mit Ihren tatsächlichen Daten. Keine vorausgewählten Zahlen.',
      faqTitle: 'Häufig gestellte Fragen',
      ctaTitle: 'Bereit, die Vorteile für Ihre Abteilung zu bewerten?',
      ctaSubtitle: '60 Minuten, um Ihre Einsparungen mit Ihren eigenen Zahlen zu schätzen. Ohne Bindung.',
      requestTrial: 'Test anfragen',
      seeDemo: 'Demo ansehen',
      disclaimer: 'Die Preise hängen vom Umfang der Bereitstellung und der Integrationskomplexität ab. UrgenceOS ist kein zertifiziertes Medizinprodukt.',
      breadcrumbHome: 'Startseite',
      breadcrumbPricing: 'Preise',
    },
    faq: {
      badge: 'Hilfezentrum',
      title: 'Häufig gestellte Fragen',
      subtitle: 'Alles, was CIOs, CFOs, Krankenhausdirektoren und Pflegeteams über UrgenceOS und das Hospital-Owned-Software-Modell wissen müssen.',
      ctaTitle: 'Ihre Frage nicht gefunden?',
      ctaSubtitle: 'Unser Team beantwortet alle Fragen: Architektur, Sicherheit, KIS-Integration, Business Case.',
      contactUs: 'Kontaktieren Sie uns',
      requestTrial: 'Test anfragen',
      seeDemo: 'Demo ansehen',
      disclaimer: 'UrgenceOS ist ein Management-Tool für Notaufnahmen. Es ist kein zertifiziertes Medizinprodukt im Sinne der geltenden Vorschriften.',
      breadcrumbHome: 'Startseite',
      breadcrumbFaq: 'FAQ',
      catUnderstand: 'UrgenceOS verstehen',
      catHowItWorks: 'So funktioniert es',
      catSecurity: 'Sicherheit und Daten',
      catTrial: 'Test und Bereitstellung',
      catPricing: 'Preise',
    },
    roles: {
      title: 'Rollenauswahl',
      titleNewUser: 'Warte auf Zuweisung',
      subtitle: 'Wählen Sie Ihr Profil für diese Sitzung',
      subtitleNewUser: 'Ein Administrator muss Ihnen eine Rolle zuweisen, um auf die Plattform zuzugreifen',
      noRoleTitle: 'Keine Rolle zugewiesen',
      noRoleText: 'Ihr Konto hat noch keine Rolle. Kontaktieren Sie einen Administrator für den Zugang zur Plattform.',
      noRoleContact: 'Kontakt-E-Mail:',
      noRoleToast: 'Keine Rolle Ihrem Konto zugewiesen. Kontaktieren Sie einen Administrator.',
      logout: 'Abmelden',
      medecin: 'Arzt',
      medecinDesc: 'Panorama-Board & Patientenakten',
      ioa: 'Triage-Pflegekraft',
      ioaDesc: 'Warteschlange & Patiententriage',
      ide: 'Pflegekraft',
      ideDesc: 'Einheitliche Übersicht & Verabreichungen',
      as: 'Pflegehilfe',
      asDesc: 'Vitalzeichen & Überwachung',
      secretaire: 'Sekretär/in',
      secretaireDesc: 'Aufnahmen & Empfang',
    },
    about: {
      badge: 'Über uns',
      heroTitle: 'Öffentliche Krankenhäuser verdienen Software, die sie kontrollieren.',
      heroSubtitle: 'EmotionsCare entwickelt UrgenceOS: Software, die das Krankenhaus besitzt, Module für Notaufnahmen mit messbaren Ergebnissen, und eine Architektur, die Kosten senkt statt sie zu erhöhen.',
      missionTitle: 'Unsere Überzeugung',
      missionP1: 'Krankenhäuser häufen unsichtbare operative Schulden an: steigende wiederkehrende Lizenzen, fragile Schnittstellen zwischen 15 bis 40 Anwendungen, klinische Zeit verloren durch Software-Reibung, Angriffsfläche die mit jedem zusätzlichen Tool wächst. Das Problem ist nicht ein Mangel an Software. Es ist ein Übermaß an unkontrollierten Werkzeugen.',
      missionP2: 'Hospital-Owned Software ist unsere Antwort: ein internes Fundament, das das Krankenhaus besitzt und steuert, an das sich interoperable Geschäftsmodule anschließen. Das KIS bleibt bestehen. Satelliten-Tools verschwinden nacheinander. Die Schulden sinken statt sich anzuhäufen.',
      principlesTitle: 'Unsere Prinzipien',
      visionTitle: 'Vision: Vom Test zum Territorium',
      visionSubtitle: 'Ein Krankenhaus validiert. Eine Gruppe teilt. Ein Territorium standardisiert.',
      phase1: 'Phase 1', phase1Title: 'Test', phase1Desc: 'Ein Haus beweist den ROI im Notaufnahmebereich. 10 Wochen, Go/No-Go-Kriterien definiert.',
      phase2: 'Phase 2', phase2Title: 'Bündelung', phase2Desc: 'Drei Häuser teilen Fundament und Module. Isolierte Daten, geteilte Kosten.',
      phase3: 'Phase 3', phase3Title: 'Standardisierung', phase3Desc: 'Die Gruppe standardisiert ihre Abläufe, Konnektoren und Indikatoren. Behörden-ready.',
      timelineTitle: 'Unser Weg',
      ecosystemTitle: 'Ökosystem',
      ecosystemSubtitle: 'UrgenceOS wird mit den Akteuren vor Ort gebaut',
      founderRole: 'Gründerin & Präsidentin — EmotionsCare SASU',
      founderBio: 'Überzeugt, dass öffentliche Krankenhäuser digitale Werkzeuge verdienen, die ihrer Mission gerecht werden, hat Laeticia EmotionsCare gegründet, um Gesundheitseinrichtungen die Kontrolle über ihre IT zurückzugeben. UrgenceOS entstand aus dieser Überzeugung: Software mit Pflegekräften entwickelt, im Besitz des Krankenhauses, und an konkreten Ergebnissen gemessen.',
      companyTitle: 'EmotionsCare SASU',
      ctaTitle: 'Bereit, die Kontrolle über Ihre IT zurückzugewinnen?',
      ctaSubtitle: '10 Wochen, um konkrete Ergebnisse zu messen. Ohne mehrjährige Bindung.',
      ctaButton: 'Test anfragen',
      ctaDemo: 'Demo ansehen',
      disclaimer: 'UrgenceOS ist ein Management-Tool für Notaufnahmen. Es ist kein zertifiziertes Medizinprodukt im Sinne der geltenden Vorschriften.',
      breadcrumbHome: 'Startseite',
      breadcrumbAbout: 'Über uns',
    },
    status: {
      pageTitle: 'Service-Status',
      monitoring: '24/7-Monitoring',
      title: 'Service-Status',
      lastCheck: 'Letzte Überprüfung:',
      waitingData: 'Warte auf ersten automatischen Check',
      refresh: 'Aktualisieren',
      allOperational: 'Alle Systeme betriebsbereit',
      degraded: 'Eingeschränkte Leistung bei einigen Diensten',
      incidentActive: 'Aktiver Vorfall',
      uptime90: '90-Tage-Uptime',
      avgLatency: 'Durchschn. Latenz',
      resolvedIncidents: 'Gelöste Vorfälle',
      uptimeLast90: 'Uptime — letzte 90 Tage',
      daysAgo: '90 Tage',
      today: 'Heute',
      systemComponents: 'Systemkomponenten',
      slaTitle: 'SLA-Zusagen',
      slaConsult: 'SLA einsehen',
      slaNote: 'Diese Zusagen gelten für Einrichtungen in Test- und Produktionsphasen. SLAs werden vertraglich festgelegt und monatlich gemessen.',
      securityTitle: 'Sicherheitsprüfungen',
      incidentHistory: 'Vorfallhistorie',
      noIncidents: 'Keine Vorfälle gemeldet',
      noIncidentsDetail: 'Keine größeren Vorfälle in den letzten 90 Tagen verzeichnet.',
      duration: 'Dauer:',
      infrastructure: 'Infrastruktur',
      breadcrumbHome: 'Startseite',
      breadcrumbStatus: 'Status',
    },
    forgotPassword: {
      backToLogin: 'Zurück zur Anmeldung',
      title: 'Passwort vergessen',
      subtitle: 'Erhalten Sie einen Rücksetz-Link per E-Mail',
      email: 'E-Mail',
      emailPlaceholder: 'name@krankenhaus.de',
      emailRequired: 'E-Mail erforderlich',
      sendError: 'Fehler beim Senden. Überprüfen Sie Ihre E-Mail und versuchen Sie es erneut.',
      sending: 'Senden...',
      sendLink: 'Link senden',
      sentTitle: 'E-Mail gesendet',
      sentText: 'Wenn ein Konto mit der Adresse existiert',
      checkSpam: 'Überprüfen Sie auch Ihren Spam-Ordner.',
    },
    resetPassword: {
      title: 'Neues Passwort',
      subtitle: 'Wählen Sie ein neues sicheres Passwort',
      newPassword: 'Neues Passwort',
      newPasswordPlaceholder: 'Mindestens 8 Zeichen',
      confirm: 'Bestätigen',
      confirmPlaceholder: 'Passwort wiederholen',
      minChars: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      mismatch: 'Passwörter stimmen nicht überein.',
      compromised: 'Dieses Passwort wurde kompromittiert. Wählen Sie ein anderes.',
      updating: 'Aktualisieren...',
      update: 'Passwort aktualisieren',
      successTitle: 'Passwort aktualisiert',
      successRedirect: 'Weiterleitung zur Anmeldung...',
      invalidLink: 'Dieser Link ist ungültig oder abgelaufen.',
      requestNew: 'Neuen Link anfordern',
    },
    demoLive: {
      chooseRole: 'Wählen Sie Ihre Rolle',
      chooseRoleDesc: 'Wählen Sie ein Profil, um die entsprechende Oberfläche mit Demodaten zu erkunden. Kein Konto erforderlich.',
      simulatedPatients: '10 simulierte Patienten — Echtzeitdaten',
      demoMode: 'Demo-Modus',
      connectedAs: 'Sie sind verbunden als',
      goToBoard: 'Zum Board',
      exitDemo: 'Demo verlassen',
      interactiveDemo: 'Interaktive Demo',
      validationScenarios: 'Validierungsszenarien',
      validationDesc: '8 Testszenarien aus dem Krankenhaus-Lastenheft',
      guardMode: 'Bereitschaftsmodus',
      guardDesc: 'Multi-Service-Ansicht NA + SHTU + Reanimation mit Alarmen und Übergaben',
      auditQuality: 'Audit & Qualität',
      auditDesc: 'Qualitäts-Dashboard, automatisierte Indikatoren, RMM/CREX-Export',
      ehrExchange: 'KIS-Austausch',
      ehrDesc: 'Anbindung an Ihr KIS — Arztbrief- und Rezept-Export',
      backGuidedDemo: 'Zurück zur geführten Demo',
      backHome: 'Zurück zur Startseite',
      createAccount: 'Konto erstellen',
      login: 'Anmelden',
      disclaimer: 'Die angezeigten Daten sind fiktiv und für die Demonstration generiert. UrgenceOS ist kein zertifiziertes Medizinprodukt.',
    },
    notFound: {
      title: '404',
      subtitle: 'Seite nicht gefunden',
      detail: 'Die angeforderte Adresse existiert nicht oder wurde verschoben.',
      backHome: 'Zurück zur Startseite',
    },
    cookieConsent: {
      technicalOnly: 'Nur technische Cookies.',
      learnMore: 'Mehr erfahren',
      customize: 'Anpassen',
      refuse: 'Ablehnen',
      accept: 'Akzeptieren',
      settingsTitle: 'Cookie-Einstellungen',
      essential: 'Wesentlich',
      essentialDesc: 'Authentifizierungssitzung',
      preferences: 'Präferenzen',
      preferencesDesc: 'Theme, Onboarding',
      refuseAll: 'Alle ablehnen',
      save: 'Speichern',
    },
    pricingFeatures: {
      trial: [
        'Vollständige Plattform (Identität, Zugriffskontrolle, Rückverfolgbarkeit)',
        'Patientenpfad-Zusammenfassungsmodul nach Rolle',
        'Echtzeit-Rückverfolgbarkeitsmodul',
        'Anbindung an Ihr bestehendes KIS',
        'Empfang von Laborergebnissen',
        'Rollenbasierte Schulung (2h pro Profil)',
        'Ergebnisbericht für die Leitung',
        'Erfolgskriterien vorab definiert',
      ],
      extension: [
        'Alles aus dem Ersttest +',
        'Zusätzliche Module (Triage, Verordnungen, Entlassung)',
        'Bidirektionale KIS-Anbindung',
        'Institutionelles Single Sign-On (SSO)',
        'Vollständige Supervision',
        'Vierteljährliches Steuerungskomitee',
        'Jährliches Sicherheitsaudit inklusive',
        'Sinkende wiederkehrende Kosten',
      ],
      consortium: [
        'Geteilte Multi-Einrichtungs-Plattform',
        'Gemeinsame Modulbibliothek',
        'Wiederverwendbare Konnektoren zwischen Einrichtungen',
        'Geteiltes Technikteam',
        'Gemeinsame Interoperabilität',
        'Konsolidierte Indikatoren für Behörden',
        'Kostenteilung pro Einrichtung',
        'Standardisierung des Austauschs',
      ],
    },
    pricingFaq: {
      q1: 'Warum mit einem Test beginnen statt einer vollständigen Bereitstellung?',
      a1: 'Der Test misst den ROI anhand Ihrer realen Daten vor jeglicher Verpflichtung. 10 Wochen, Notaufnahme-Umfang, Go/No-Go-Kriterien vorab definiert.',
      q2: 'Wie unterscheidet sich das Preismodell von einem klassischen Anbieter?',
      a2: 'Das Fundament gehört dem Krankenhaus. Keine wiederkehrende Lizenz auf das Fundament. Die Kosten decken Bereitstellung, Schulung, Wartung und Weiterentwicklungen. Vorhersehbar und sinkend.',
      q3: 'Wie erstelle ich den Business Case für mein Haus?',
      a3: 'Wir stellen eine leere Business-Case-Vorlage bereit (5-Jahres-TCO, ROI/Payback-Formeln), die wir in einem 60-Minuten-Meeting mit dem CFO gemeinsam ausfüllen.',
      q4: 'Was kostet ein Test?',
      a4: 'Das Testpaket ist auf den Umfang kalibriert (eine Notaufnahme, 2 Module, 10 Wochen). Es umfasst Scoping, Bereitstellung, Schulung und Messbericht.',
    },
    pricingBusinessCase: {
      currentItems: [
        'Lizenzen für Notaufnahme-Satellitentools',
        'Anbieterwartung und Support',
        'Schnittstellen- und Konnektorkosten',
        'Integrationsvorfälle (IT-Stunden)',
        'Verlorene klinische Zeit (Min/Station x Stationen x 365T)',
      ],
      targetItems: [
        'Erstinvestition (Fundament + Module + Schulung)',
        'Internes Plattformteam (IT-VZÄ-Anteil)',
        'Gesundheitsdaten-Hosting',
        'Wartung und jährliches Sicherheitsaudit',
        'Siehe detaillierte Formeln unten',
      ],
      roiItems: [
        'Jährliche Netto-Einsparung = aktuelle Kosten (A) - Zielkosten (B)',
        'ROI Jahr 1 = (A - B - Erstinvestition) / Investition × 100',
        'Payback = Erstinvestition / (A - B) in Monaten',
        'Kumulierter ROI 5 Jahre = ((A - B) × 5 - Investition) / Investition × 100',
      ],
      dafItems: [
        '0-10 Min — Kontext: wie viele Tools, Lizenzen, Schnittstellen',
        '10-30 Min — Gemeinsames Ausfüllen: Ihre Zahlen in unserem TCO-Modell',
        '30-45 Min — Live-ROI-Berechnung: aktuelle vs. Zielkosten, geschätzter Payback',
        '45-55 Min — Dimension "verlorene klinische Zeit": Bewertung der gewonnenen Minuten',
        '55-60 Min — Nächste Schritte: Go/No-Go-Test, Zeitplan, Umfang',
      ],
    },
  },
};
