import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

import { UERLogo } from "@/components/UERLogo";

interface BlogShellProps {
  children: ReactNode;
}

export function BlogShell({ children }: BlogShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>{children}</main>

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
                <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</Link></li>
                <li><Link to="/software" className="text-muted-foreground transition-colors hover:text-primary">Software</Link></li>
                <li><Link to="/blog" className="text-muted-foreground transition-colors hover:text-primary">Blog</Link></li>
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