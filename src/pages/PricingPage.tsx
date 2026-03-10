import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Building2, HelpCircle, Calculator } from 'lucide-react';
import { JsonLd, PageMeta, webPageSchema, faqPageSchema } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { useI18n } from '@/i18n/I18nContext';

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const PLANS = [
    {
      name: t.pricing.trialName,
      target: t.pricing.trialTarget,
      price: t.pricing.trialPrice,
      description: t.pricing.trialDescription,
      features: t.pricingFeatures.trial,
      cta: t.pricing.trialCta,
      popular: true,
    },
    {
      name: t.pricing.extensionName,
      target: t.pricing.extensionTarget,
      price: t.pricing.extensionPrice,
      description: t.pricing.extensionDescription,
      features: t.pricingFeatures.extension,
      cta: t.pricing.extensionCta,
      popular: false,
    },
    {
      name: t.pricing.consortiumName,
      target: t.pricing.consortiumTarget,
      price: t.pricing.consortiumPrice,
      description: t.pricing.consortiumDescription,
      features: t.pricingFeatures.consortium,
      cta: t.pricing.consortiumCta,
      popular: false,
    },
  ];

  const FAQ_PRICING = [
    { q: t.pricingFaq.q1, a: t.pricingFaq.a1 },
    { q: t.pricingFaq.q2, a: t.pricingFaq.a2 },
    { q: t.pricingFaq.q3, a: t.pricingFaq.a3 },
    { q: t.pricingFaq.q4, a: t.pricingFaq.a4 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Tarifs UrgenceOS — Essai 10 semaines, Extension, Consortium GHT"
        description="Modèle économique UrgenceOS : essai cadré 10 semaines avec ROI mesuré, extension multi-services, consortium GHT mutualisé. Pas d'engagement pluriannuel."
        canonical="https://urgenceos.fr/tarifs"
      />
      <JsonLd id="pricing-webpage" data={webPageSchema({
        name: 'Tarifs UrgenceOS — Modèle économique Hospital-Owned Software',
        description: 'Essai 10 semaines avec ROI mesuré, extension multi-services, consortium GHT. Coûts prévisibles et décroissants.',
        url: 'https://urgenceos.fr/tarifs',
        breadcrumb: ['Accueil', 'Tarifs'],
      })} />
      <JsonLd id="pricing-faq" data={faqPageSchema(FAQ_PRICING.map(f => ({ question: f.q, answer: f.a })))} />
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <Breadcrumb items={[
          { label: t.pricing.breadcrumbHome, to: '/' },
          { label: t.pricing.breadcrumbPricing },
        ]} />
        <div className="text-center mb-10 sm:mb-16">
          <Badge variant="secondary" className="mb-4">{t.pricing.badge}</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/15 ring-2 ring-primary/25'
                  : 'bg-card hover:border-primary/20 hover:shadow-primary/5'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {t.pricing.recommended}
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.target}</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-extrabold">{plan.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => navigate('/b2b')}
              >
                {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mb-12 sm:mb-20 -mt-6 sm:-mt-14">
          {t.pricing.pricingNote}{' '}
          <button onClick={() => navigate('/b2b')} className="text-primary hover:underline font-medium">{t.pricing.contactForQuote}</button>
        </p>

        <div className="mb-20 p-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <Calculator className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.pricing.businessCaseTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.pricing.businessCaseSubtitle}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm mb-2 text-foreground">{t.pricing.currentCosts}</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {t.pricingBusinessCase.currentItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <h4 className="font-semibold text-sm mb-2 text-primary">{t.pricing.targetCosts}</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {t.pricingBusinessCase.targetItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">{t.pricing.roiFormulas}</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {t.pricingBusinessCase.roiItems.map((item, i) => {
                const [label, ...rest] = item.split(' = ');
                return <li key={i}><strong className="text-foreground">{label}</strong> = {rest.join(' = ')}</li>;
              })}
            </ul>
          </div>
          <div className="mt-4 p-4 rounded-xl border bg-card">
            <h4 className="font-semibold text-sm mb-3">{t.pricing.dafMethod}</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {t.pricingBusinessCase.dafItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t.pricing.transparency}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">{t.pricing.faqTitle}</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_PRICING.map((item) => (
              <div key={item.q} className="p-5 rounded-xl border bg-card">
                <h4 className="font-semibold flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  {item.q}
                </h4>
                <p className="text-sm text-muted-foreground mt-2 ml-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-8 sm:py-12 px-4 sm:px-6 rounded-2xl border bg-card">
          <Building2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">{t.pricing.ctaTitle}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
            {t.pricing.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => navigate('/b2b')} className="w-full sm:w-auto">
              {t.pricing.requestTrial} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/demo')} className="w-full sm:w-auto">
              {t.pricing.seeDemo}
            </Button>
          </div>
        </div>

        <div className="mt-12 p-4 rounded-lg border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            {t.pricing.disclaimer}
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
