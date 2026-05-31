import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SeoHead } from "@/components/SeoHead";
import { caseStudies } from "@/data/caseStudies";

export default function CaseStudies() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MarketingShell activeNav="case-studies">
      <SeoHead
        title="Case Studies — Real Agents, Real Results | United Estates Realty"
        description="See how Florida real estate agents use United Estates Realty to manage more client queries and close more deals."
        path="/case-studies"
      />

      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Case Studies</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              Real Agents. Real Results.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              See how real estate agents use United Estates Realty to manage more client queries and close more deals.
            </p>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <article
                key={study.slug}
                className="flex flex-col border bg-muted/20 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {study.agentName}, {study.city}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-tight text-foreground">
                  {study.headlineResult}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {study.summary}
                </p>
                <div className="mt-6 flex-1" />
                <Link
                  to={`/case-studies/${study.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Read full story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}