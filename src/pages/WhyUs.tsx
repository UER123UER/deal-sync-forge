import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Users, Zap, BarChart3, Award, Clock, Facebook, Linkedin, Instagram, Menu, User, ArrowUpRight } from "lucide-react";
import tevelFounder from "@/assets/tevel-founder.webp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { caseStudies } from "@/data/caseStudies";
import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const differentiators = [
  {
    icon: Zap,
    heading: "100% Commission. Every Deal.",
    body: "Close a $10,000 commission, keep $10,000. No splits, no royalty cuts, no per-deal charges. Ever. We don't touch your money because we don't need to; our flat monthly fee covers everything.",
  },
  {
    icon: BarChart3,
    heading: "$98/Month. Nothing Else.",
    body: "One flat fee. No E&O add-ons. No hidden charges when you close a big deal. No transaction fees of any kind. Just $98 every month and that's the entire cost of running your business under our license.",
  },
  {
    icon: Users,
    heading: "Built by Agents, for Agents.",
    body: "Our platform wasn't designed by a software vendor who has never shown a house. It was built around how real estate agents actually work, from first contact to closing. Transaction management, CRM, listings, marketing, and calendar tools in one seamless system.",
  },
  {
    icon: Shield,
    heading: "Licensed. Compliant. Protected.",
    body: "United Estates Realty is a fully licensed Florida brokerage. You get full brokerage support, compliance oversight, and the legal backing you need to operate with confidence. Your license hangs with a real brokerage, not a tech shell.",
  },
  {
    icon: Award,
    heading: "Referral Earnings That Compound.",
    body: "Refer one agent, earn $20 every month they stay active. Refer five, that's $100/month, more than covering your own membership. No cap. No expiration. No approval gates. Your network becomes a real revenue stream.",
  },
  {
    icon: Clock,
    heading: "No Long-Term Contracts.",
    body: "Stay because it works, not because you're trapped. Cancel anytime with no penalties, no clawbacks, no exit fees. We earn your business every single month by delivering real value.",
  },
] as const;

const comparisonRows = [
  { feature: "Commission split", uer: "100% — you keep it all", traditional: "50%–70% to brokerage" },
  { feature: "Monthly fee", uer: "$98 flat", traditional: "$0–$500+ desk fee" },
  { feature: "Transaction fees", uer: "$0", traditional: "$100–$500 per deal" },
  { feature: "CRM & software", uer: "Included", traditional: "$50–$200/month extra" },
  { feature: "Referral program", uer: "$20/mo per agent", traditional: "Rarely offered" },
  { feature: "Contract length", uer: "Cancel anytime", traditional: "6–12 month lock" },
] as const;

export default function WhyUs() {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title="Why Florida Real Estate Agents Choose United Estates Realty"
        description="Why Florida agents choose United Estates Realty. Keep 100% commissions, $98/month flat fee, zero transaction fees, full CRM + brokerage support. No contracts."
        path="/why-us"
      />

      {/* Same sticky header as homepage */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="United Estates Realty">
            <UERLogo width={188} className="w-[65px] sm:w-[132px] lg:w-[168px]" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <Link to="/why-us" className="font-medium text-primary">Why Us</Link>
            <Link to="/case-studies" className="transition-colors hover:text-primary">Case Studies</Link>
            <a href="/#pricing" className="transition-colors hover:text-primary">Pricing</a>
            <a href="/#software" className="transition-colors hover:text-primary">Software</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:items-center md:gap-2">
              <Button variant="ghost" asChild className="px-2.5 sm:px-4">
                <Link to="/auth">Agent Login</Link>
              </Button>
              <Button asChild>
                <Link to={primaryHref}>{primaryLabel}</Link>
              </Button>
            </div>
            <Button asChild size="sm" className="md:hidden">
              <Link to={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="mt-8 flex flex-col gap-1 text-base">
                  <Link to="/" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Home</Link>
                  <Link to="/why-us" className="rounded-md px-3 py-2 font-medium text-primary transition-colors hover:bg-muted">Why Us</Link>
                  <Link to="/case-studies" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Case Studies</Link>
                  <a href="/#pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Pricing</a>
                  <a href="/#software" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Software</a>
                  <Link to="/auth" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Agent Login</Link>
                  <Link to={primaryHref} className="mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90">{primaryLabel}</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Why Florida Real Estate Agents Choose United Estates Realty
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Most brokerages charge you a monthly fee and then take a cut of every deal on top of it. We don't. One flat fee, real software, and you keep every dollar you earn.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to={primaryHref}>
                    Join United Estates Realty
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">The Difference</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Six reasons agents switch and never look back.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {differentiators.map(({ icon: Icon, heading, body }) => (
                <div key={heading} className="border bg-muted/20 p-6">
                  <div className="flex h-10 w-10 items-center justify-center border bg-background">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{heading}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-y bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Comparison</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                United Estates Realty vs. traditional brokerages.
              </h2>
            </div>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 pr-4 text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-primary">United Estates Realty</th>
                    <th className="py-3 text-sm font-semibold text-muted-foreground">Traditional Brokerage</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(({ feature, uer, traditional }) => (
                    <tr key={feature} className="border-b">
                      <td className="py-3 pr-4 text-sm font-medium text-foreground">{feature}</td>
                      <td className="py-3 pr-4 text-sm text-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          {uer}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{traditional}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Success Stories</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Real agents. Real results.
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                See how agents across the country are growing their business with United Estates Realty.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {caseStudies.map((study) => (
                <div key={study.slug} className="group border bg-muted/20 p-6 transition-colors hover:border-primary/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    {study.agentName}, {study.city}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {study.headlineResult}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {study.summary}
                  </p>
                  <Link
                    to={`/case-studies/${study.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    Read full story
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild>
                <Link to="/case-studies">
                  View all case studies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Founder Bio */}
        <section className="border-y bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Leadership</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Why Tevel Built This
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                The agent who got tired of working hard and earning nothing.
              </p>
            </div>

            <div className="mt-10 grid items-start gap-8 md:grid-cols-[280px_1fr]">
              {/* Founder Photo */}
              <div className="flex flex-col items-center md:items-start">
                <div className="h-64 w-64 overflow-hidden border bg-muted/30 sm:h-72 sm:w-72">
                  <img
                    src={tevelFounder}
                    alt="Tevel, Founder & Managing Broker of United Estates Realty"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-center md:text-left">
                  <p className="text-lg font-semibold text-foreground">Tevel</p>
                  <p className="text-sm text-muted-foreground">Founder & Managing Broker</p>
                </div>
              </div>

              {/* Founder Story */}
              <div className="space-y-4 text-base leading-7 text-muted-foreground">
                <p>
                  Tevel was a real estate agent just like you.
                </p>
                <p>
                  He worked hard. He chased leads, managed clients and closed deals. And every single month, without fail, the bills came in.
                </p>
                <p>
                  First, the monthly subscription fees. Not cheap but fine, tools cost money. He paid.
                </p>
                <p>
                  Then came the transaction fees. Every deal he closed, a percentage disappeared before he even saw it. Not because he did anything wrong. Just because the platform decided it deserved a cut of his work.
                </p>
                <p>
                  Then came the commission split. A portion of every hard-earned commission is gone. To a company that never made a single phone call, never sat in a single meeting, never chased a single client.
                </p>
                <p>
                  And if you wanted a basic feature that should have been included from day one? That was another charge. Another tier. Another "upgrade."
                </p>
                <p>
                  Tevel looked at his earnings one evening and did the math. The subscriptions. The transaction fees. The commission cuts. The add-ons. The numbers were shocking, not because any single charge was outrageous, but because they never stopped. Every direction he turned, someone had their hand in his pocket.
                </p>
                <p>
                  He was not just paying to use a tool. He was paying a tax on his own success.
                </p>
                <p>
                  That was the moment everything changed.
                </p>
                <p>
                  Tevel did not build United Estates Realty because he saw a market opportunity. He built it because he was furious — and he knew every agent reading this feels the same way.
                </p>
                <p className="italic text-foreground">
                  "I was tired of working hard and watching my earnings disappear into fees I never agreed to. Every time I closed a deal, someone else was already waiting to take their cut. I built this because agents deserve to keep what they earn." — Tevel
                </p>
                <p className="text-foreground">
                  United Estates Realty was built by an agent who got tired of paying for everything and keeping nothing. That is why we built something different — and that is why it will always stay that way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-y bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Questions agents ask before they join.
              </h2>
            </div>

            <div className="mt-10 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    What is a 100% commission brokerage, and how does it work?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    How does United Estates Realty make money if agents keep 100%?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    Is United Estates Realty available in my state?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    Can a new real estate agent join United Estates Realty?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    Does United Estates Realty charge any transaction fees?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="border-2 border-primary bg-muted/20 p-8 sm:p-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Ready to keep 100% of your commissions?
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Join the brokerage that puts agents first. No commission splits. No transaction fees. No hidden charges. Just $98 a month and a platform built to help you close more deals.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link to={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/">Back to Home</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3 md:items-start">
            <div className="space-y-4">
              <UERLogo width={160} />
              <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Explore</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground transition-colors hover:text-primary">Home</Link></li>
                <li><Link to="/why-us" className="text-muted-foreground transition-colors hover:text-primary">Why Us</Link></li>
                <li><Link to="/case-studies" className="text-muted-foreground transition-colors hover:text-primary">Case Studies</Link></li>
                <li><a href="/#pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</a></li>
                <li><a href="/#software" className="text-muted-foreground transition-colors hover:text-primary">Software</a></li>
                <li><Link to="/auth" className="text-muted-foreground transition-colors hover:text-primary">Agent Login</Link></li>
                <li><Link to="/signup" className="text-muted-foreground transition-colors hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Follow Us</p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" />
                  </svg>
                </a>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Email Us</p>
                <a
                  href="mailto:brokerage@unitedestatesagent.com"
                  className="mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  brokerage@unitedestatesagent.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} United Estates Realty. Licensed Real Estate Brokerage.
            </p>
            <p className="text-xs text-muted-foreground">
              Equal Housing Opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
