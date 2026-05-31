import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { getCaseStudyBySlug } from "@/data/caseStudies";
import NotFound from "@/pages/NotFound";

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudyBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!study) {
    return <NotFound />;
  }

  return (
    <MarketingShell activeNav="case-studies">
      <SeoHead
        title={`${study.headlineResult} — ${study.agentName}, ${study.city} | United Estates Realty`}
        description={study.summary.slice(0, 160)}
        path={`/case-studies/${study.slug}`}
      />

      <section className="border-b bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            All case studies
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {study.agentName}, {study.city}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {study.headlineResult}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            {study.summary}
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">The Challenge</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{study.challenge}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">The Solution</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{study.solution}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">The Results</h2>
            <ul className="mt-4 space-y-3">
              {study.results.map((r) => (
                <li key={r} className="flex items-start gap-3 text-base leading-7 text-foreground">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="border-l-2 border-primary pl-6 text-lg italic leading-8 text-foreground">
            "{study.quote}"
            <footer className="mt-3 text-sm not-italic text-muted-foreground">
              — {study.agentName}, {study.city}
            </footer>
          </blockquote>

          <div className="border-t pt-10">
            <h2 className="text-2xl font-bold text-foreground">Ready to write your own story?</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Join United Estates Realty and keep 100% of every commission for a flat $98/month.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Sign Up
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/case-studies">More case studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}