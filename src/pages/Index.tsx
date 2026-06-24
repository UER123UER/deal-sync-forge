import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Facebook, Linkedin, Instagram, Menu, X } from "lucide-react";

import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Faq, type FaqItem } from "@/components/Faq";
import { blogPosts } from "@/data/blogPosts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const HOME_FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is a 100% commission brokerage, and how does it work?",
    answer:
      "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business.",
  },
  {
    question: "How does United Estates Realty make money if agents keep 100%?",
    answer:
      "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time.",
  },
  {
    question: "Is United Estates Realty available in my state?",
    answer:
      "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions.",
  },
  {
    question: "Can a new real estate agent join United Estates Realty?",
    answer:
      "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent.",
  },
  {
    question: "Does United Estates Realty charge any transaction fees?",
    answer:
      "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage.",
  },
];

const whyUs = [
  {
    heading: "Keep 100% of your commission.",
    body: "Every dollar of your commission split stays with you. We don't touch it. No transaction fees, no royalty cuts, no per-deal charges - ever. Close a $10,000 commission, keep $10,000.",
  },
  {
    heading: "$98 a month. Nothing else.",
    body: "One flat monthly fee is all you pay. No desk fees on top. No E&O add-ons. No hidden charges when you close a big deal. Just $98, every month, and that's the entire cost of your brokerage.",
  },
  {
    heading: "Software built for agents.",
    body: "Manage your listings, contracts, contacts, tasks, and marketing from one place. Built for how agents actually work, not how a vendor imagined it.",
  },
  {
    heading: "Earn from referrals.",
    body: "Refer a fellow agent and earn $20 every month they stay active. No cap, no expiration - it compounds as your network grows.",
  },
] as const;

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

export default function Index() {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const [showProductHunt, setShowProductHunt] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("productHuntDismissed");
    if (dismissed === "1") setShowProductHunt(false);
  }, []);

  const dismissProductHunt = () => {
    setShowProductHunt(false);
    localStorage.setItem("productHuntDismissed", "1");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title="United Estates Realty — Florida's 100% Commission Brokerage"
        description="Join Florida's top flat-fee brokerage. Licensed agents keep 100% of every commission for just $98/month. No splits, no transaction fees, no desk fees."
        path="/"
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
            <a href="/pricing" className="transition-colors hover:text-primary">Pricing</a>
            <a href="/software" className="transition-colors hover:text-primary">Software</a>
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
                  <a href="/pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Pricing</a>
                  <a href="/software" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Software</a>
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
        <section className="relative overflow-hidden">
          <div className="relative min-h-[60vh] sm:min-h-[78vh]">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/home-hero-mobile.webp"
                type="image/webp"
              />
              <source srcSet="/home-hero.webp" type="image/webp" />
              <img
                src="/home-hero-opt.jpg"
                alt="United Estates Realty"
                width={1600}
                height={1067}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(8,15,29,0.52) 0%, rgba(8,15,29,0.68) 50%, rgba(8,15,29,0.82) 100%), linear-gradient(90deg, rgba(8,15,29,0.88) 0%, rgba(8,15,29,0.60) 45%, rgba(8,15,29,0.20) 100%)",
              }}
            />
            <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-8 sm:min-h-[78vh] sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-24">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  United Estates Realty - Licensed Brokerage
                </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Stop Giving Away Your Commissions. Keep 100% and zero transaction fees.
              </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                  Get the best real estate CRM and brokerage platform for just $98/month. One flat fee, no per-seat pricing, no add-ons, no commission splits. Everything you need to close more deals in one place.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link to={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white/40 bg-white/10 text-white hover:bg-white/18 hover:text-white"
                  >
                    <a href="/pricing">See Pricing</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three hard facts - the real pitch */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto grid max-w-6xl divide-y px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
            {[
              { stat: "100%", label: "Commission you keep" },
              { stat: "$98", label: "Flat monthly fee" },
              { stat: "$0", label: "Transaction fees" },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-8 text-center">
                <p className="text-4xl font-bold text-primary">{stat}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Hunt floating embed */}
        {showProductHunt && (
          <div
            className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            <div
              style={{
                position: 'relative',
                border: '1px solid rgb(224, 224, 224)',
                borderRadius: 12,
                padding: 20,
                maxWidth: 340,
                width: 'calc(100vw - 2rem)',
                background: 'rgb(255, 255, 255)',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 4px 20px',
              }}
            >
              <button
                type="button"
                onClick={dismissProductHunt}
                aria-label="Dismiss Product Hunt card"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 24 }}>
                <img
                  alt="United Estates Realty"
                  src="https://ph-files.imgix.net/8cd75457-2c51-461c-ae53-11c822e655f4.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80"
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'rgb(26, 26, 26)',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    United Estates Realty
                  </h3>
                  <p
                    style={{
                      margin: '4px 0px 0px',
                      fontSize: 13,
                      color: 'rgb(102, 102, 102)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    Keep 100% of your real estate commission
                  </p>
                </div>
              </div>
              <a
                href="https://www.producthunt.com/products/united-estates-realty?embed=true&utm_source=embed&utm_medium=post_embed"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 14px',
                  background: 'rgb(255, 97, 84)',
                  color: 'rgb(255, 255, 255)',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Check it out on Product Hunt →
              </a>
            </div>
          </div>
        )}


        {/* Pricing - one card, honest numbers */}
        <section id="pricing" className="border-y bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Simple pricing. No surprises.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                One plan. Every agent pays the same flat monthly rate and gets full access to everything - software, support, and the brokerage.
              </p>
            </div>

            <div className="mt-10 max-w-md">
              <div className="border-2 border-primary bg-background p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Agent Membership</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-bold text-foreground">$98</span>
                  <span className="mb-1 text-lg text-muted-foreground">/ month</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No transaction fees. No desk fees. No royalties.</p>

                <ul className="mt-8 space-y-3">
                  {[
                    "Keep 100% of your commission - every closing, no exceptions",
                    "No transaction fees. Not $100. Not $50. Zero.",
                    "Licensed brokerage - hang your license here",
                    "Full transaction management software included",
                    "CRM, listings, marketing, and calendar tools",
                    "Referral program - earn $20/mo per active agent you refer",
                    "Brokerage support and compliance",
                  ].map((item) => (
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

        {/* Software - what agents actually get */}
        <section id="software" className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">The Software</p>
                <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  Everything you need to run your business, built in.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Your membership includes full access to the United Estates Realty agent platform. Not a third-party tool - our own software, built specifically for how agents work.
                </p>
                <div className="mt-8">
                  <Button asChild>
                    <Link to="/signup">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {softwareFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 border bg-muted/30 px-4 py-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Referral */}
        <section className="border-y bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Referral Program</p>
                <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  Refer an agent. Earn every month they stay.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Every agent you refer to United Estates Realty earns you $20 per month for as long as they keep their license here. Refer five agents and that's $100 a month - more than covering your own membership.
                </p>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  There's no cap, no expiration, and no approval process. Share your referral link and the tracking is automatic.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { step: "01", text: "Get your unique referral link from your agent dashboard." },
                  { step: "02", text: "Share it with any licensed agent looking for a better brokerage." },
                  { step: "03", text: "Earn $20 every month they stay active - automatically." },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-5 border bg-background px-5 py-4">
                    <span className="mt-0.5 min-w-[2rem] text-sm font-bold text-primary">{step}</span>
                    <p className="text-sm leading-6 text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="border-t bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">From the blog</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Resources for working agents.
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  Straight talk on commission splits, client management, and what actually works, written by agents, not marketers.
                </p>
              </div>
              <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
                View all articles →
              </Link>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: blogPosts.length > 3,
              }}
              className="mt-10 w-full"
            >
              <CarouselContent className="-ml-4">
                {[...blogPosts]
                  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                  .map((post) => (
                    <CarouselItem key={post.slug} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <article className="flex h-full flex-col bg-background p-4 rounded-lg border">
                        {post.image && (
                          <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg">
                            <img
                              src={post.image}
                              alt={post.imageAlt || post.title}
                              className="aspect-[16/9] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </Link>
                        )}
                        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {" · "}
                          {post.readMinutes} min read
                        </p>
                        <h3 className="mt-2 text-lg font-bold leading-snug text-foreground">
                          <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                        >
                          Read article →
                        </Link>
                      </article>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <div className="mt-6 flex items-center justify-end gap-2">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>

        {/* Training — coming soon */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 border-l-2 border-primary pl-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Coming Soon</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Agent training, built into the platform.
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  We're building out a full training library for United Estates Realty agents — contracts, compliance, prospecting, and how to get the most out of the software. It'll be included with your membership, no extra cost.
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-block border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                  Training Coming Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Faq
              eyebrow="FAQ"
              heading="Questions agents ask before they join."
              items={HOME_FAQ_ITEMS}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-white sm:py-20" style={{ backgroundColor: "hsl(var(--sidebar-bg))" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Stop giving away your commission. Join a brokerage that lets you keep it.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                100% commission. $98 a month flat. No transaction fees. No surprises. Join United Estates Realty today.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link to="/signup">
                    Join the Brokerage
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/auth">Agent Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4 md:items-start">
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
                <li><a href="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</a></li>
                <li><Link to="/blog" className="text-muted-foreground transition-colors hover:text-primary">Blog</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Agents</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="/software" className="text-muted-foreground transition-colors hover:text-primary">Software</a></li>
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
