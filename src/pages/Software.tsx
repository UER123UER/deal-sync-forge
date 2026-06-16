import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const softwareFeatures = [
  "Transaction management & checklists",
  "Contact and client CRM",
  "Listing pipeline and status tracking",
  "Marketing asset builder",
  "Task management and reminders",
  "Document storage and PDF access",
  "Calendar and deadline tracking",
  "Referral program with live earnings dashboard",
] as const;

export default function Software() {
  return (
    <MarketingShell activeNav="software">
      <SeoHead
        title="Real Estate Agent Software — CRM, Transactions & Marketing in One"
        description="The United Estates Realty agent platform includes a full CRM, transaction management, listings, marketing tools, and calendar — built for how Florida agents actually work."
        path="/software"
      />

      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">The Software</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Real Estate Agent Software — CRM, Transactions & Marketing in One Platform
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Every United Estates Realty membership includes full access to our agent platform. Not a third-party tool — our own software, built specifically for how real estate agents work day to day.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {softwareFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3 border bg-muted/30 px-4 py-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}