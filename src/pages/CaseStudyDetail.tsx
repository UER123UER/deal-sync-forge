import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.headlineResult,
    description: study.summary,
    image:
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea1221eb-a238-4087-9d8a-e039199b22b7/id-preview-b44d7743--c987c87c-e16f-4694-9045-0ccdf362905d.lovable.app-1773887688710.png",
    author: {
      "@type": "Organization",
      name: "United Estates Realty",
    },
    publisher: {
      "@type": "Organization",
      name: "United Estates Realty",
      logo: {
        "@type": "ImageObject",
        url: "https://unitedestatesagent.com/logo.png",
      },
    },
  };

  return (
    <MarketingShell activeNav="case-studies">
      <SeoHead
        title={`${study.headlineResult} — ${study.agentName}, ${study.city} | United Estates Realty`}
        description={study.summary.slice(0, 160)}
        path={`/case-studies/${study.slug}`}
        structuredData={articleSchema}
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

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {study.label}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {study.headlineResult}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            {study.summary}
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8">
          {/* Snapshot */}
          <div className="border bg-muted/20 p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              The Snapshot
            </h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Agent
                </dt>
                <dd className="mt-1 text-base text-foreground">{study.snapshot.agent}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-1 text-base text-foreground">{study.snapshot.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience
                </dt>
                <dd className="mt-1 text-base text-foreground">{study.snapshot.experience}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Situation
                </dt>
                <dd className="mt-1 text-base text-foreground">{study.snapshot.situation}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Result
                </dt>
                <dd className="mt-1 text-base text-foreground">{study.snapshot.result}</dd>
              </div>
            </dl>
          </div>

          {/* The Story */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">The Story</h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
              {study.story.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* What Changed */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">What Changed</h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
              {study.whatChanged.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Marcus's Advice */}
          <blockquote className="border-l-2 border-primary pl-6 text-lg italic leading-8 text-foreground">
            {study.advice}
            <footer className="mt-3 text-sm not-italic text-muted-foreground">
              — {study.agentName}, {study.city}
            </footer>
          </blockquote>

          {/* CTA */}
          <div className="border-t pt-10">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to write your own story?
            </h2>
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

          {/* Disclaimer */}
          <p className="text-xs leading-5 text-muted-foreground">{study.disclaimer}</p>
        </div>
      </section>
    </MarketingShell>
  );
}
