import { Link } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { BlogShell } from "@/components/marketing/BlogShell";
import { blogPosts } from "@/data/blogPosts";

export default function Blog() {
  return (
    <BlogShell>
      <SeoHead
        title="Real Estate Agent Resources: Tips on Commissions, Leads, and Growing Your Business"
        description="Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers."
        path="/blog"
      />

      <section className="border-b bg-muted/30 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Blog</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Real Estate Agent Resources
          </h1>
          <h2 className="mt-4 text-lg leading-7 text-muted-foreground sm:text-xl">
            Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers.
          </h2>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ul className="space-y-8">
            {blogPosts.map((post) => (
              <li key={post.slug} className="border-b pb-8 last:border-b-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {post.readMinutes} min read
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Read article →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </BlogShell>
  );
}