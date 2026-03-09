/**
 * GEO (Generative Engine Optimization) — JSON-LD injection component.
 * Injects structured data into the page head for AI engines to parse.
 * Supports: FAQPage, HowTo, Organization, WebPage, Article schemas.
 */

import { useEffect } from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
}

/**
 * Injects a JSON-LD script tag into document.head.
 * Cleans up on unmount to avoid stale structured data.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `jsonld-${id || crypto.randomUUID()}`;
    
    // Remove existing script with same ID
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [data, id]);

  return null;
}

/**
 * Sets document title and meta description dynamically.
 * Essential for GEO: each page needs unique, keyword-rich metadata.
 */
export function PageMeta({ title, description, canonical }: { title: string; description: string; canonical?: string }) {
  useEffect(() => {
    document.title = title;
    
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', description);
      document.head.appendChild(meta);
    }

    // Also set OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Set canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (link) {
        link.href = canonical;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonical;
        document.head.appendChild(link);
      }
    }

    // Inject hreflang tags for supported languages
    const LANGS = ['fr', 'en', 'es', 'de'];
    const baseUrl = canonical || window.location.href.split('?')[0].split('#')[0];
    
    // Remove existing hreflang links
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    for (const lang of LANGS) {
      const hreflang = document.createElement('link');
      hreflang.rel = 'alternate';
      hreflang.hreflang = lang;
      hreflang.href = baseUrl;
      document.head.appendChild(hreflang);
    }
    // x-default
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.href = baseUrl;
    document.head.appendChild(xDefault);

    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [title, description, canonical]);

  return null;
}

// ── Pre-built schema generators for GEO ──

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EmotionsCare SASU',
    alternateName: 'UrgenceOS',
    url: 'https://urgenceos.fr',
    description: 'Éditeur français de logiciels pour urgences hospitalières. Modèle Hospital-Owned Software : le socle logiciel appartient à l\'hôpital, pas à l\'éditeur.',
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    knowsAbout: [
      'Urgences hospitalières',
      'Système d\'information hospitalier (SIH)',
      'Interopérabilité FHIR R4',
      'HL7v2',
      'Hospital-Owned Software',
      'Triage CIMU',
      'RPU ATIH',
      'MSSanté',
      'DMP',
      'Hébergement données de santé HDS',
      'RBAC santé',
      'Médecine d\'urgence',
    ],
    slogan: 'Le système d\'exploitation des urgences hospitalières',
  };
}

export function softwareSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UrgenceOS',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Emergency Department Management',
    operatingSystem: 'Web (PWA)',
    description: 'Socle logiciel Hospital-Owned pour urgences hospitalières. Interface par rôle (médecin, IOA, IDE, aide-soignant, secrétaire). Interopérabilité FHIR R4, HL7v2. Audit immuable, RBAC serveur, HDS.',
    url: 'https://urgenceos.fr',
    author: organizationSchema(),
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '990',
      highPrice: '1990',
      priceCurrency: 'EUR',
      offerCount: '3',
    },
    featureList: [
      'Interface adaptative par rôle soignant (5 profils)',
      'Récap parcours patient temps réel',
      'Prescriptions et administration médicaments en 1 tap',
      'Triage CIMU avec aide à la décision',
      'Interopérabilité FHIR R4, HL7v2, HPRIM',
      'RPU ATIH automatique',
      'Audit immuable — traçabilité médico-légale',
      'RBAC strict vérifié côté serveur',
      'Mode offline PWA avec sync',
      'Hébergement HDS France',
      'Intégration DPI sans refonte',
      'Multi-tenant GHT',
    ],
    screenshot: 'https://urgenceos.fr/og-image.png',
    softwareRequirements: 'Navigateur moderne (Chrome, Firefox, Safari, Edge)',
    permissions: 'Authentification requise — données de santé protégées',
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function howToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment déployer UrgenceOS dans un service d\'urgences',
    description: 'Guide de déploiement du socle Hospital-Owned Software UrgenceOS en 4 étapes, du cadrage au go-live essai.',
    totalTime: 'P10W',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Cadrage DSI',
        text: 'Atelier technique de 2 heures avec la direction informatique. Audit du SI existant (DPI, LIS, PACS). Cartographie des connecteurs nécessaires.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configuration et intégration',
        text: 'Déploiement du socle sur infrastructure HDS. Connexion au DPI en lecture seule via connecteurs standards. Configuration des rôles (médecin, IOA, IDE, AS, secrétaire).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Formation terrain',
        text: 'Formation par rôle (2h par profil). Prise en main de l\'interface adaptative. Validation des workflows métier avec les équipes soignantes.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Go-live essai 10 semaines',
        text: 'Mise en production sur un service d\'urgences. Mesure avant/après (temps reconstitution parcours, ressaisies, adoption). Rapport de résultats pour la direction.',
      },
    ],
  };
}

export function webPageSchema(page: {
  name: string;
  description: string;
  url: string;
  breadcrumb?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'UrgenceOS',
      url: 'https://urgenceos.fr',
    },
    publisher: organizationSchema(),
    inLanguage: 'fr-FR',
    ...(page.breadcrumb && {
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: page.breadcrumb.map((name, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name,
          item: i === 0 ? 'https://urgenceos.fr' : undefined,
        })),
      },
    }),
  };
}
