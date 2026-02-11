import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Tag, User } from 'lucide-react';

interface Article {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    title: 'Pourquoi les urgences ont besoin d\'un OS dédié',
    excerpt: 'Les logiciels hospitaliers généralistes ne répondent pas aux contraintes temps réel des urgences. Analyse des limites actuelles et vision d\'une solution pensée pour le terrain.',
    date: '2026-02-01',
    readTime: '8 min',
    author: 'Équipe UrgenceOS',
    category: 'Vision',
    featured: true,
  },
  {
    title: 'Tri IOA en moins de 2 minutes : retour d\'expérience',
    excerpt: 'Comment le workflow 5 étapes d\'UrgenceOS réduit le temps de tri IOA de 5-8 minutes à moins de 2 minutes, avec suggestion CIMU automatique.',
    date: '2026-01-20',
    readTime: '5 min',
    author: 'Équipe UrgenceOS',
    category: 'Produit',
  },
  {
    title: 'Interopérabilité FHIR R4 : guide pratique pour les DSI',
    excerpt: 'Guide technique pour les équipes DSI : comment intégrer UrgenceOS à votre SIH via FHIR R4, HL7v2 et MSSanté sans perturber l\'existant.',
    date: '2026-01-10',
    readTime: '12 min',
    author: 'Équipe UrgenceOS',
    category: 'Technique',
  },
  {
    title: 'HDS, ISO 27001, RGPD santé : le triptyque sécurité',
    excerpt: 'Comprendre les exigences réglementaires pour l\'hébergement et le traitement des données de santé en France. Notre approche secure-by-design.',
    date: '2025-12-15',
    readTime: '7 min',
    author: 'Équipe UrgenceOS',
    category: 'Sécurité',
  },
  {
    title: 'Mode offline aux urgences : pourquoi c\'est non négociable',
    excerpt: 'Quand le réseau tombe en pleine nuit, les urgences ne s\'arrêtent pas. Architecture PWA offline-first avec synchronisation automatique.',
    date: '2025-12-01',
    readTime: '6 min',
    author: 'Équipe UrgenceOS',
    category: 'Technique',
  },
  {
    title: 'La pancarte IDE unifiée : zéro changement de page',
    excerpt: 'Prescriptions, constantes, transmissions DAR, résultats biologiques : tout sur un seul écran. Retour sur la conception de l\'interface infirmière.',
    date: '2025-11-15',
    readTime: '5 min',
    author: 'Équipe UrgenceOS',
    category: 'Produit',
  },
];

const CATEGORIES = ['Tous', 'Vision', 'Produit', 'Technique', 'Sécurité'];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    Vision: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Produit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Technique: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Sécurité: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return map[cat] || '';
}

export default function BlogPage() {
  const navigate = useNavigate();
  const featured = ARTICLES.find((a) => a.featured);
  const others = ARTICLES.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Blog & Actualités</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Expertise e-santé & urgences
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyses, retours d'expérience et guides techniques pour transformer
            les urgences hospitalières.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={cat === 'Tous' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-accent px-3 py-1"
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Featured article */}
        {featured && (
          <div className="mb-12 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <Badge className={categoryColor(featured.category)} >{featured.category}</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-3">{featured.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(featured.date)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featured.author}</span>
            </div>
            <Button variant="outline" size="sm">
              Lire l'article <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Articles grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {others.map((article) => (
            <article key={article.title} className="rounded-xl border bg-card p-6 flex flex-col">
              <Badge className={`w-fit text-[10px] ${categoryColor(article.category)}`}>
                {article.category}
              </Badge>
              <h3 className="font-bold mt-3 mb-2 leading-snug">{article.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-4 border-t">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(article.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="text-center py-12 px-6 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-3">Restez informé</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Recevez nos analyses et actualités sur la transformation numérique des urgences.
          </p>
          <div className="flex justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.fr"
              className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm"
            />
            <Button>
              S'abonner
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Pas de spam. Désinscription en un clic.
          </p>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
