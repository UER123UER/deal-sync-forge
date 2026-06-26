import { Head } from "vite-react-ssg";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  structuredData?: object;
}

const SITE_URL = "https://unitedestatesagent.com";
const DEFAULT_IMAGE = "https://unitedestatesagent.com/homepage-og-preview.png";

export function SeoHead({ title, description, path, image = DEFAULT_IMAGE, structuredData }: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Head>
  );
}