import { Link } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { BlogShell } from "@/components/marketing/BlogShell";

export default function Blog() {
  return (
    <BlogShell>
      <SeoHead
        title="Real Estate Agent Resources: Tips on Commissions, Leads, and Growing Your Business"
        description="Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers."
        path="/blog"
      />

      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Blog</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Real Estate Agent Resources: Tips on Commissions, Leads, and Growing Your Business
          </h1>
          <h2 className="mt-5 text-lg leading-7 text-muted-foreground sm:text-xl">
            Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers.
          </h2>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-base text-muted-foreground">
            New articles are on the way. Check back soon for fresh insights from working Florida agents.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </BlogShell>
  );
}