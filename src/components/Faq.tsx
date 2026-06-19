import { Head } from "vite-react-ssg";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  items: FaqItem[];
  /** Optional eyebrow label rendered above the heading. */
  eyebrow?: string;
  /** Optional heading rendered above the accordion. */
  heading?: string;
  /** Optional supporting copy below the heading. */
  description?: string;
  /** Set to false to skip rendering the JSON-LD <script>. Defaults to true. */
  includeSchema?: boolean;
  className?: string;
  /** Constrain the accordion width. Defaults to "max-w-3xl". */
  accordionClassName?: string;
}

/**
 * Reusable FAQ block.
 *
 * Renders an accessible accordion and automatically emits the matching
 * schema.org FAQPage JSON-LD into <head>, so any FAQ added anywhere on the
 * site is structured-data ready without extra work.
 */
export function Faq({
  items,
  eyebrow,
  heading,
  description,
  includeSchema = true,
  className,
  accordionClassName,
}: FaqProps) {
  if (!items?.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className={className}>
      {includeSchema && (
        <Head>
          <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Head>
      )}

      {(eyebrow || heading || description) && (
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={cn("mt-10 max-w-3xl", accordionClassName)}>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={`${i}-${item.question}`} value={`item-${i + 1}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}