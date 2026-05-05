import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Users2,
} from "lucide-react";

import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const offerings = [
  {
    title: "Property-aware checklists",
    description:
      "Default forms adjust around the property type so condo, single-family, land, lease, and referral deals start with the right checklist.",
    icon: ListChecks,
    // primary tint
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Searchable form library",
    description:
      "Keep the core checklist clean, hide the long-tail forms, then search and add the extras only when the file actually needs them.",
    icon: ScrollText,
    // warning tint
    iconClassName: "bg-warning/10 text-warning",
  },
  {
    title: "Brokerage dashboard",
    description:
      "Track listings, contracts, notes, due dates, and office activity from one workspace instead of bouncing between files, inboxes, and side conversations.",
    icon: LayoutDashboard,
    // success tint
    iconClassName: "bg-success/10 text-success",
  },
  {
    title: "Marketing tools",
    description:
      "Build branded listing and social assets from inside the same system your agents use for brokerage-approved workflow and follow-up.",
    icon: Megaphone,
    // muted accent
    iconClassName: "bg-accent text-accent-foreground",
  },
  {
    title: "Team visibility",
    description:
      "Give agents, coordinators, and leadership a shared view of live files, current status, and what still needs to get crossed off.",
    icon: Users2,
    // destructive tint
    iconClassName: "bg-destructive/10 text-destructive",
  },
  {
    title: "Office-ready workflows",
    description:
      "Standardize your process with one place for forms, tasks, people, and compliance tracking without bringing back editing clutter.",
    icon: ShieldCheck,
    // success tint (darker read)
    iconClassName: "bg-success/10 text-success",
  },
] as const;

const pricingTiers = [
  {
    name: "Independent Agent",
    pricing: "Custom monthly pricing",
    description:
      "For agents who want one clean place to work inside the brokerage's process for forms, contacts, listings, and marketing.",
    features: [
      "Personal agent workspace",
      "Property-specific default checklists",
      "PDF view and download access",
      "Marketing and referral tools",
    ],
  },
  {
    name: "Team Rollout",
    pricing: "Office pricing by headcount",
    description:
      "For small teams that need shared visibility, consistent deal flow, and a smoother handoff between agents and support staff.",
    features: [
      "Shared deal visibility",
      "Standardized form library",
      "People pipeline tracking",
      "Centralized checklist process",
    ],
    featured: true,
  },
  {
    name: "Brokerage Setup",
    pricing: "Custom rollout pricing",
    description:
      "For brokerages that want a tailored setup around office structure, onboarding, templates, and the workflow standards they enforce.",
    features: [
      "Brokerage-wide form standards",
      "Onboarding and rollout support",
      "Office-level oversight",
      "Configuration around your process",
    ],
  },
] as const;

const workflowSteps = [
  {
    title: "Start the deal with the right file type",
    description:
      "Create a listing, contract, lease, land, or referral file and let the office checklist match the kind of property you picked.",
  },
  {
    title: "Work the checklist as the transaction moves",
    description:
      "Check items off manually, open the linked PDF when you need it, and add hidden forms only when the file calls for them.",
  },
  {
    title: "Keep the whole office aligned",
    description:
      "Use the same workspace for tasks, people, notes, marketing, and reporting so updates do not get trapped in side channels.",
  },
] as const;

export default function Index() {
  const { user, loading } = useAuth();

  const primaryHref = !loading && user ? "/transactions" : "/signup";
  const primaryLabel = !loading && user ? "Open Workspace" : "Get Started";
  const headerPrimaryLabel = !loading && user ? "Workspace" : "Start";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav — solid background, no blur; elevation earned only by the border */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="United Estates Agent home">
            <UERLogo width={188} className="w-[132px] sm:w-[168px] lg:w-[188px]" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#offerings" className="transition-colors hover:text-primary">
              What We Offer
            </a>
            <a href="#pricing" className="transition-colors hover:text-primary">
              Pricing
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-primary">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="px-2.5 sm:px-4">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to={primaryHref}>
                <ArrowRight className="h-4 w-4" />
                {headerPrimaryLabel}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — image-backed, no blur overlay, gradient is intentional for text legibility */}
        <section className="relative overflow-hidden">
          <div
            className="min-h-[74vh] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(8, 15, 29, 0.46) 0%, rgba(8, 15, 29, 0.62) 46%, rgba(8, 15, 29, 0.76) 100%), linear-gradient(90deg, rgba(8, 15, 29, 0.84) 0%, rgba(8, 15, 29, 0.62) 42%, rgba(8, 15, 29, 0.26) 100%), url('/home-hero.jpg')",
            }}
          >
            <div className="mx-auto flex min-h-[74vh] max-w-6xl items-end px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20">
              <div className="max-w-3xl drop-shadow-[0_10px_30px_rgba(8,15,29,0.28)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                  Brokerage operations platform
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  United Estates Realty keeps your agents, listings, contracts, and office follow-up in one place.
                </h1>
                <p className="mt-5 hidden max-w-2xl text-base leading-7 text-white/90 sm:block sm:text-lg">
                  Run your brokerage from one workspace with property-specific checklists, searchable forms, office visibility,
                  marketing tools, and the structure your team needs to keep agents supported and files moving.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild className="shadow-sm">
                    <Link to={primaryHref}>
                      <ArrowRight className="h-4 w-4" />
                      {primaryLabel}
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white/45 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <a href="#pricing">
                      <BadgeDollarSign className="h-4 w-4" />
                      View Pricing
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value strip — muted wash, no raw hex */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Built for active files</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start with the right checklist for condo, single-family, land, lease, commercial, or referral files.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-success">Made for the office</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Give agents, coordinators, and leadership one operating view instead of separate spreadsheets and texts.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-warning">Ready for growth</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep the default process tight, hide the extra forms, and add exactly what the file needs when the moment comes.
              </p>
            </div>
          </div>
        </section>

        {/* Offerings */}
        <section id="offerings" className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What We Offer</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                A cleaner operating system for your brokerage, agents, and staff.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                United Estates Agent is built around how a brokerage actually runs: active listings, changing paperwork,
                office standards, agent support, and the daily follow-up that has to stay organized.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {offerings.map(({ title, description, icon: Icon, iconClassName }) => (
                <Card key={title} className="h-full shadow-none">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-md ${iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing — secondary muted wash to break rhythm, not a brand color */}
        <section id="pricing" className="border-y bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-warning">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                Pricing built around how your office wants to roll out.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                United Estates Agent can be set up for an individual agent, a growing team, or a brokerage-wide rollout. We
                match pricing to the headcount, setup, and workflow support your office needs.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {pricingTiers.map((tier) => {
                const { name, pricing, description, features } = tier;
                const featured = (tier as { featured?: boolean }).featured;
                return (
                <Card
                  key={name}
                  className={[
                    "h-full shadow-none",
                    featured ? "border-primary" : "",
                  ].join(" ")}
                >
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{name}</p>
                        <p className="mt-3 text-2xl font-semibold text-foreground">{pricing}</p>
                      </div>
                      {featured ? (
                        <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                          Most Popular
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>

                    <ul className="mt-6 space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <Button asChild variant={featured ? "default" : "outline"} className="w-full">
                        <Link to="/signup">
                          <ArrowRight className="h-4 w-4" />
                          Request Access
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                Keep the process simple without oversimplifying the work.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The goal is not more screens. The goal is one place where your office can see what has been started, what is
                complete, and what still needs attention on every live file.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {workflowSteps.map(({ title, description }, index) => (
                <div key={title} className="border bg-muted/40 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — uses the same deep navy as the sidebar: one intentional dark surface, not a random color */}
        <section className="py-16 text-white sm:py-20" style={{ backgroundColor: "hsl(var(--sidebar-bg))" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">United Estates Agent</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Give your agents one homepage, one workspace, and one cleaner way to run the file.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                Launch with a public front door at <span className="font-semibold text-white">unitedestatesagent.com</span>,
                then move directly into the workspace your team uses every day.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link to={primaryHref}>
                  <Building2 className="h-4 w-4" />
                  {primaryLabel}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#offerings">
                  <CalendarCheck2 className="h-4 w-4" />
                  Explore Features
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
