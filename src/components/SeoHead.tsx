import { Head } from "vite-react-ssg";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  ogType?: "website" | "article";
  structuredData?: object;
}

const SITE_URL = "https://unitedestatesagent.com";
const DEFAULT_IMAGE = "https://unitedestatesagent.com/homepage-og-preview.png";

function ensureAbsoluteImage(image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

export function SeoHead({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  ogType = "website",
  structuredData,
}: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;
  const absoluteImage = ensureAbsoluteImage(image);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Head>
  );
}
