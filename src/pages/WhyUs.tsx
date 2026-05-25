import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Users, Zap, BarChart3, Award, Clock } from "lucide-react";

import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";

const differentiators = [
  {
    icon: Zap,
    heading: "100% Commission. Every Deal.",
    body: "Close a $10,000 commission, keep $10,000. No splits, no royalty cuts, no per-deal charges. Ever. We don't touch your money because we don't need to — our flat monthly fee covers everything.",
  },
  {
    icon: BarChart3,
    heading: "$98/Month. Nothing Else.",
    body: "One flat fee. No desk fees layered on top. No E&O add-ons. No hidden charges when you close a big deal. No transaction fees of any kind. Just $98 every month and that's the entire cost of running your business under our license.",
  },
  {
    icon: Users,
    heading: "Built by Agents, for Agents.",
    body: "Our platform wasn't designed by a software vendor who has never shown a house. It was built around how real estate agents actually work — from first contact to closing. Transaction management, CRM, listings, marketing, and calendar tools in one seamless system.",
  },
  {
    icon: Shield,
    heading: "Licensed. Compliant. Protected.",
    body: "United Estates Realty is a fully licensed Florida brokerage. You get full brokerage support, compliance oversight, and the legal backing you need to operate with confidence. Your license hangs with a real brokerage, not a tech shell.",
  },
  {
    icon: Award,
    heading: "Referral Earnings That Compound.",
    body: "Refer one agent, earn $20 every month they stay active. Refer five, that's $100/month — more than covering your own membership. No cap. No expiration. No approval gates. Your network becomes a real revenue stream.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title="Why United Estates Realty — 100% Commission Florida Brokerage"
        description="See why Florida agents choose United Estates Realty. Keep 100% of commissions, $98/month flat fee, zero transaction fees, and full CRM + brokerage support. No contracts."
        path="/why-us"
      />

      {/* Same sticky header as homepage */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="United Estates Realty">
            <UERLogo width={188} className="w-[132px] sm:w-[168px] lg:w-[188px]" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/why-us" className="font-medium text-primary">Why Us</Link>
            <a href="/#pricing" className="transition-colors hover:text-primary">Pricing</a>
            <a href="/#software" className="transition-colors hover:text-primary">Software</a>
          </nav>

          <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
            <Button variant="ghost" asChild className="px-2.5 sm:px-4">
              <Link to="/auth">Agent Login</Link>
            </Button>
            <Button asChild>
              <Link to={primaryHref}>{primaryLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why Us</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                A brokerage built for agents, not for overhead.
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

        {/* CTA */}
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

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <UERLogo width={120} />
            </div>
            <p className="text-xs text-muted-foreground">
              United Estates Realty &copy; {new Date().getFullYear()}. Licensed Florida brokerage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
