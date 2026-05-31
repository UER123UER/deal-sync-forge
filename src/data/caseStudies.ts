export interface CaseStudy {
  slug: string;
  agentName: string;
  city: string;
  headlineResult: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  quote: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "miami-response-time",
    agentName: "Agent",
    city: "Miami",
    headlineResult: "Cut response time by 40%",
    summary:
      "A Miami-based agent was losing leads to slow follow-ups. After switching to United Estates Realty, every new inquiry routed through one unified inbox.",
    challenge:
      "Juggling 60+ active buyer leads across email, SMS, and Zillow meant inquiries sat for hours before getting a reply. Hot leads were going cold daily.",
    solution:
      "Consolidating every lead source inside the United Estates Realty CRM created a single response queue with automatic prioritization and reminders.",
    results: [
      "Average response time dropped from 4.5 hours to 2.7 hours",
      "Booked showings increased by 28% in the first 60 days",
      "Zero leads lost to missed follow-up in Q1",
    ],
    quote:
      "I stopped guessing who to call next. The platform tells me, and my numbers prove it works.",
  },
  {
    slug: "orlando-commission-keep",
    agentName: "Agent",
    city: "Orlando",
    headlineResult: "Kept an extra $47,000 in commissions last year",
    summary:
      "An Orlando agent moved off a 70/30 split brokerage to United Estates Realty's flat $98/month model and pocketed every dollar earned.",
    challenge:
      "Closing 14 deals a year, this agent was handing over nearly $50K in splits and transaction fees without getting tools or support in return.",
    solution:
      "Switching to a flat monthly fee eliminated splits entirely while keeping full brokerage compliance, CRM, and marketing tools included.",
    results: [
      "$47,000 in additional take-home commission",
      "$0 in transaction or desk fees across 14 closings",
      "Reinvested savings into paid lead generation",
    ],
    quote:
      "I was paying my old brokerage like a partner and getting treated like a tenant. Not anymore.",
  },
  {
    slug: "tampa-deal-volume",
    agentName: "Agent",
    city: "Tampa",
    headlineResult: "Closed 3x more deals in 6 months",
    summary:
      "A Tampa agent used the deal pipeline and task automation to scale from 2 closings a month to 6 without adding any team members.",
    challenge:
      "Manual checklists and scattered documents created a ceiling on how many deals could realistically move forward at once.",
    solution:
      "Standardized checklists, automatic document routing, and a single deal dashboard let one agent manage triple the volume confidently.",
    results: [
      "Closings grew from 2/month to 6/month",
      "Document turnaround cut from 3 days to same-day",
      "Net income up 240% year-over-year",
    ],
    quote:
      "The system does the busywork. I just show houses and close deals.",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}