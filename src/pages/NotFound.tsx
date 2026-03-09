import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/seo/JsonLd";
import { useI18n } from "@/i18n/I18nContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();
  const nf = t.notFound;

  useEffect(() => {
    console.warn("404 : tentative d'accès à une route inexistante :", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <PageMeta
        title={`${nf.subtitle} — UrgenceOS`}
        description={nf.detail}
      />
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-foreground">{nf.title}</h1>
        <p className="text-xl text-muted-foreground">{nf.subtitle}</p>
        <p className="text-sm text-muted-foreground">{nf.detail}</p>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            {nf.backHome}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
