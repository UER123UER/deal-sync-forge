import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Menu } from "lucide-react";

import { UERLogo } from "@/components/UERLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MarketingShellProps {
  children: ReactNode;
  activeNav?: "home" | "why-us" | "case-studies" | "pricing" | "software";
}

export function MarketingShell({ children, activeNav }: MarketingShellProps) {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";

  const navItem = (key: string, base = "transition-colors hover:text-primary") =>
    activeNav === key ? "font-medium text-primary" : base;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="United Estates Realty">
            <UERLogo width={188} className="w-[65px] sm:w-[132px] lg:w-[168px]" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className={navItem("home")}>Home</Link>
            <Link to="/why-us" className={navItem("why-us")}>Why Us</Link>
            <Link to="/case-studies" className={navItem("case-studies")}>Case Studies</Link>
            <Link to="/pricing" className={navItem("pricing")}>Pricing</Link>
            <Link to="/software" className={navItem("software")}>Software</Link>
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
                  <Link to="/pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Pricing</Link>
                  <Link to="/software" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Software</Link>
                  <Link to="/auth" className="rounded-md px-3 py-2 transition-colors hover:bg-muted">Agent Login</Link>
                  <Link to={primaryHref} className="mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90">{primaryLabel}</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>{children}</main>

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
                <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</Link></li>
                <li><Link to="/blog" className="text-muted-foreground transition-colors hover:text-primary">Blog</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Agents</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/software" className="text-muted-foreground transition-colors hover:text-primary">Software</Link></li>
                <li><Link to="/auth" className="text-muted-foreground transition-colors hover:text-primary">Agent Login</Link></li>
                <li><Link to="/signup" className="text-muted-foreground transition-colors hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Follow Us</p>
              <div className="mt-4 flex items-center gap-3">
                <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Email Us</p>
                <a href="mailto:brokerage@unitedestatesagent.com" className="mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary">
                  brokerage@unitedestatesagent.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} United Estates Realty. Licensed Real Estate Brokerage.
            </p>
            <p className="text-xs text-muted-foreground">Equal Housing Opportunity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}