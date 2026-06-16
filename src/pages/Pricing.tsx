import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const includedFeatures = [
  "Keep 100% of your commission - every closing, no exceptions",
  "No transaction fees. Not $100. Not $50. Zero.",
  "Licensed Florida brokerage - hang your license here",
  "Full transaction management software included",
  "CRM, listings, marketing, and calendar tools",
  "Referral program - earn $20/mo per active agent you refer",
  "Brokerage support and compliance",
] as const;

export default function Pricing() {
  return (
    <MarketingShell activeNav="pricing">
      <SeoHead
        title="100% Commission Real Estate Brokerage Pricing — $98/Month Flat Fee"
        description="One flat $98/month fee. Keep 100% of every commission with zero transaction fees, desk fees, or hidden charges at United Estates Realty."
        path="/pricing"
      />

      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              100% Commission Real Estate Brokerage Pricing — $98/Month Flat Fee
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              One simple plan. Every Florida agent pays the same flat monthly rate and gets full access to the brokerage, the software, and the support. No splits, no transaction fees, no surprises.
            </p>
          </div>

          <div className="mt-12 max-w-md">
            <div className="border-2 border-primary bg-background p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Agent Membership</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold text-foreground">$98</span>
                <span className="mb-1 text-lg text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No transaction fees. No desk fees. No royalties.</p>

              <ul className="mt-8 space-y-3">
                {includedFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button asChild size="lg" className="w-full">
                  <Link to="/signup">
                    Join United Estates Realty
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { stat: "100%", label: "Commission you keep" },
              { stat: "$98", label: "Flat monthly fee" },
              { stat: "$0", label: "Transaction fees" },
            ].map(({ stat, label }) => (
              <div key={label} className="border bg-muted/30 px-6 py-8 text-center">
                <p className="text-4xl font-bold text-primary">{stat}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}