import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Menu, TrendingUp, DollarSign, Facebook, Linkedin, Instagram } from "lucide-react";

import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeoHead } from "@/components/SeoHead";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const UER_MONTHLY_FEE = 98;

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function CommissionCalculator() {
  const [avgDealPrice, setAvgDealPrice] = useState<number>(450000);
  const [annualDeals, setAnnualDeals] = useState<number>(12);
  const [commissionPct, setCommissionPct] = useState<number>(3);
  const [splitPct, setSplitPct] = useState<number>(30);
  const [perDealFee, setPerDealFee] = useState<number>(295);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const results = useMemo(() => {
    const grossCommissionPerDeal = (avgDealPrice * commissionPct) / 100;
    const grossAnnual = grossCommissionPerDeal * annualDeals;

    // Traditional brokerage: split + per-deal transaction fee
    const traditionalSplitCost = grossAnnual * (splitPct / 100);
    const traditionalFeeCost = perDealFee * annualDeals;
    const traditionalTotalCost = traditionalSplitCost + traditionalFeeCost;
    const traditionalNet = grossAnnual - traditionalTotalCost;

    // United Estates Realty: flat $98/mo, 100% commission, no per-deal fees
    const uerAnnualCost = UER_MONTHLY_FEE * 12;
    const uerNet = grossAnnual - uerAnnualCost;

    const savings = uerNet - traditionalNet;

    return {
      grossAnnual,
      traditionalTotalCost,
      traditionalNet,
      uerAnnualCost,
      uerNet,
      savings,
    };
  }, [avgDealPrice, annualDeals, commissionPct, splitPct, perDealFee]);

  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Florida 100% Commission vs Split Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free calculator for Florida real estate agents to compare 100% commission flat-fee brokerages like United Estates Realty against traditional percentage-split brokerages.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title="100% Commission vs Split Calculator for Florida Agents"
        description="Compare 100% commission flat-fee brokerages to traditional splits. Enter your average deal size and annual volume to see how much Florida agents save with United Estates Realty."
        path="/commission-calculator"
        structuredData={calculatorSchema}
      />

      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="United Estates Realty">
            <UERLogo width={188} className="w-[65px] sm:w-[132px] lg:w-[168px]" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <Link to="/why-us" className="transition-colors hover:text-primary">Why Us</Link>
            <Link to="/case-studies" className="transition-colors hover:text-primary">Case Studies</Link>
            <Link to="/commission-calculator" className="font-medium text-primary">Calculator</Link>
            <a href="/pricing" className="transition-colors hover:text-primary">Pricing</a>
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
                  <Link to="/why-us" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Why Us</Link>
                  <Link to="/case-studies" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Case Studies</Link>
                  <Link to="/commission-calculator" className="rounded-md px-3 py-2 font-medium text-primary transition-colors hover:bg-muted">Calculator</Link>
                  <a href="/pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Pricing</a>
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
        <section className="border-b bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">For Florida Real Estate Agents</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                100% Commission vs Split Calculator
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                See exactly how much your Florida brokerage's commission split is costing you every year. Enter your average sale price and annual deal volume, then compare a traditional split against United Estates Realty's flat $98/month, 100% commission model.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="bg-background py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Inputs */}
              <div className="lg:col-span-2">
                <div className="border bg-muted/20 p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Your numbers</h2>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="avgDealPrice">Average sale price</Label>
                      <Input
                        id="avgDealPrice"
                        type="number"
                        min={0}
                        step={10000}
                        value={avgDealPrice}
                        onChange={(e) => setAvgDealPrice(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualDeals">Closed deals per year</Label>
                      <Input
                        id="annualDeals"
                        type="number"
                        min={0}
                        step={1}
                        value={annualDeals}
                        onChange={(e) => setAnnualDeals(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionPct">Your commission per side (%)</Label>
                      <Input
                        id="commissionPct"
                        type="number"
                        min={0}
                        max={10}
                        step={0.25}
                        value={commissionPct}
                        onChange={(e) => setCommissionPct(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="splitPct">Traditional broker split to brokerage (%)</Label>
                      <Input
                        id="splitPct"
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={splitPct}
                        onChange={(e) => setSplitPct(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="perDealFee">Traditional per-transaction fee ($)</Label>
                      <Input
                        id="perDealFee"
                        type="number"
                        min={0}
                        step={25}
                        value={perDealFee}
                        onChange={(e) => setPerDealFee(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <div className="border-2 border-primary bg-background p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Your annual savings</h2>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="border bg-muted/30 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Traditional Brokerage</p>
                      <p className="mt-3 text-3xl font-bold text-foreground">{formatCurrency(results.traditionalNet)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Take-home after split + fees</p>
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Gross commission</span><span>{formatCurrency(results.grossAnnual)}</span></div>
                        <div className="flex justify-between"><span>Brokerage cost</span><span className="text-destructive">−{formatCurrency(results.traditionalTotalCost)}</span></div>
                      </div>
                    </div>

                    <div className="border-2 border-primary bg-primary/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">United Estates Realty</p>
                      <p className="mt-3 text-3xl font-bold text-foreground">{formatCurrency(results.uerNet)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Take-home after flat fee</p>
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Gross commission</span><span>{formatCurrency(results.grossAnnual)}</span></div>
                        <div className="flex justify-between"><span>Brokerage cost</span><span className="text-destructive">−{formatCurrency(results.uerAnnualCost)}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border bg-muted">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">You keep an extra</p>
                        <p className="text-2xl font-bold text-primary sm:text-3xl">{formatCurrency(Math.max(0, results.savings))} / year</p>
                      </div>
                    </div>
                    <Button asChild className="hidden sm:inline-flex">
                      <Link to={primaryHref}>
                        Claim Your Commissions
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <Button asChild className="mt-4 w-full sm:hidden">
                    <Link to={primaryHref}>
                      Claim Your Commissions
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Estimates only. Actual brokerage costs vary based on cap structures, desk fees, technology fees, and E&O. United Estates Realty charges a flat $98/month with no commission splits, transaction fees, or hidden charges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Florida context */}
        <section className="border-y bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Florida Brokerage Savings</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Why Florida agents are switching from split brokerages.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Florida agents in Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale routinely give away 20%–50% of every commission check to a traditional brokerage, on top of per-transaction fees, monthly desk fees, and technology charges. At Florida's median sale price, that's tens of thousands of dollars a year, money that should be funding your business, not your broker's.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                United Estates Realty is a fully licensed Florida brokerage built around a single idea: agents earn the commission, agents should keep the commission. Flat $98/month membership, 100% commission, zero transaction fees, and a complete platform for transactions, CRM, listings, marketing, and signatures.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="border-2 border-primary bg-muted/20 p-8 sm:p-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Stop paying for a commission split you don't need.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Join United Estates Realty today. Keep 100% of every commission. $98 a month. Cancel anytime.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link to={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/why-us">See Why Us</Link>
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
                A full-service licensed Florida real estate brokerage. 100% commission, $98 a month, zero transaction fees.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Explore</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground transition-colors hover:text-primary">Home</Link></li>
                <li><Link to="/why-us" className="text-muted-foreground transition-colors hover:text-primary">Why Us</Link></li>
                <li><Link to="/case-studies" className="text-muted-foreground transition-colors hover:text-primary">Case Studies</Link></li>
                <li><Link to="/commission-calculator" className="text-muted-foreground transition-colors hover:text-primary">Commission Calculator</Link></li>
                <li><a href="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</a></li>
                <li><Link to="/auth" className="text-muted-foreground transition-colors hover:text-primary">Agent Login</Link></li>
                <li><Link to="/signup" className="text-muted-foreground transition-colors hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Follow Us</p>
              <div className="mt-4 flex items-center gap-3">
                <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Facebook className="h-4 w-4" /></a>
                <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Linkedin className="h-4 w-4" /></a>
                <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Instagram className="h-4 w-4" /></a>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Email Us</p>
                <a href="mailto:brokerage@unitedestatesagent.com" className="mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary">brokerage@unitedestatesagent.com</a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} United Estates Realty. Licensed Real Estate Brokerage.</p>
            <p className="text-xs text-muted-foreground">Equal Housing Opportunity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}