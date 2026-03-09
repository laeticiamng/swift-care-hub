

# Plan: Make all 5 new features clearly visible from the Landing Page

## Current State
- The `/flow` page exists with all 5 features (Flow Dashboard, AI Triage, SAMU, Quality Metrics, CyberSecurity footer) in tabs.
- The footer has a link to `/flow` but it's buried.
- The **landing page has NO prominent section** showcasing these features.
- The **SiteHeader nav** has no link to the dashboard/flow page.
- The Features page (`/features`) doesn't mention these specific capabilities.

## Plan

### 1. Add a "Platform Preview" section to the Landing Page
Insert a new section between `BenefitsSection` and `TestimonialsSection` in `LandingPage.tsx` that showcases the 5 features with:
- A prominent heading ("Découvrez la plateforme en action")
- 5 cards in a grid, each representing one feature: Flow Dashboard, Triage IA, SAMU Integration, Indicateurs Qualité, Cybersécurité
- Each card has an icon, title, short description, and orange accent styling
- A CTA button linking to `/flow` ("Voir le dashboard en direct")

Create `src/components/landing/PlatformPreviewSection.tsx`.

### 2. Add "/flow" link in SiteHeader navigation
Add a "Dashboard" entry in the `NAV_LINKS` array in `SiteHeader.tsx` pointing to `/flow`, making it visible from every page.

### 3. Add CyberSecurityFooter to the Landing Page
Add the `CyberSecurityFooter` component to `LandingPage.tsx` above `FooterSection` to show the security indicator directly on the homepage.

### Files to modify:
- `src/components/landing/PlatformPreviewSection.tsx` (new)
- `src/pages/LandingPage.tsx` (add section + CyberSecurityFooter)
- `src/components/landing/SiteHeader.tsx` (add nav link)

