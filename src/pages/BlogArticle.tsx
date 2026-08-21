import { Link, useParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { BlogShell } from "@/components/marketing/BlogShell";
import { getBlogPost } from "@/data/blogPosts";

export default function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <BlogShell>
        <SeoHead
          title="Article not found | United Estates Realty Blog"
          description="The article you're looking for isn't available."
          path={`/blog/${slug}`}
        />
        <article className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
              ← Back to blog
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">Article not found</h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              The article you're looking for isn't available. Browse the latest posts on the blog index.
            </p>
          </div>
        </article>
      </BlogShell>
    );
  }

  const url = `https://unitedestatesagent.com/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: post.image,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "United Estates Realty",
      url: "https://unitedestatesagent.com",
    },
    mainEntityOfPage: url,
  };

  return (
    <BlogShell>
      <SeoHead
        title={post.metaTitle ?? `${post.title} | United Estates Realty Blog`}
        description={post.description}
        path={`/blog/${post.slug}`}
        image={post.image}
        ogType="article"
        structuredData={articleSchema}
      />

      <article className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
            ← Back to blog
          </Link>
          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {post.readMinutes} min read
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.image && (
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              className="mt-8 w-full rounded-lg object-cover"
              width={1600}
              height={896}
            />
          )}
          <div className="mt-8">{post.content}</div>
        </div>
      </article>
    </BlogShell>
  );
}