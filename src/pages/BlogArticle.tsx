import { Link, useParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { BlogShell } from "@/components/marketing/BlogShell";

function toTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const title = slug ? toTitle(slug) : "Article";

  return (
    <BlogShell>
      <SeoHead
        title={`${title} | United Estates Realty Blog`}
        description="Straight talk on commission splits, client management, and what actually works for agents."
        path={`/blog/${slug}`}
      />

      <article className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
            ← Back to blog
          </Link>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground">
            This article is coming soon.
          </p>
        </div>
      </article>
    </BlogShell>
  );
}