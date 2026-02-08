export function FooterSection() {
  return (
    <footer className="border-t py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-medium">
          Urgence<span className="text-primary">OS</span> — Projet de recherche en systèmes d'information de santé — 2026
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-primary hover:underline"
          >
            Haut de page
          </button>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-xs">React · TypeScript · Temps réel</span>
        </div>
      </div>
    </footer>
  );
}
