import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Faq, type FaqItem } from "@/components/Faq";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string; // ISO
  readMinutes: number;
  author: string;
  content: ReactNode;
  faq?: FaqItem[];
}

const Internal = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="text-primary underline-offset-4 hover:underline">
    {children}
  </Link>
);

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-12 text-2xl font-bold text-foreground sm:text-3xl">{children}</h2>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-8 text-xl font-semibold text-foreground">{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="mt-4 text-base leading-7 text-muted-foreground">{children}</p>
);
const UL = ({ children }: { children: ReactNode }) => (
  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">{children}</ul>
);

const COMMISSION_FAQ: FaqItem[] = [
  {
    question: "Which companies offer 100% commission brokerage services in the US?",
    answer:
      "The major national options include eXp Realty, Real Broker, Fathom Realty, HomeSmart, Realty ONE Group, and United Estates Realty. Each has a different fee structure, so the right choice depends on your production volume and support needs.",
  },
  {
    question: "How to join a 100% commission brokerage firm?",
    answer:
      "Hold an active license, choose a brokerage, complete a license transfer, and pay the initial fee. Most flat-fee brokerages process transfers digitally within a few business days.",
  },
  {
    question: "How does a 100% commission brokerage model work for real estate agents?",
    answer:
      "The agent keeps the full commission from every deal and pays the brokerage a flat monthly or per-transaction fee instead of a percentage split.",
  },
  {
    question: "What are the typical fee structures at a full commission real estate brokerage?",
    answer:
      "Monthly fees range from $0 to $500, per-transaction fees from $0 to $600, and E&O fees from $30 to $50 per deal. United Estates Realty charges $98 per month with zero transaction fees and zero E&O add-ons.",
  },
  {
    question: "What are the benefits of using a 100% commission brokerage?",
    answer:
      "Higher net income per deal, predictable fixed costs, full brand control, included CRM tools, and no income ceiling as production grows.",
  },
];

const CommissionArticle = () => (
  <>
    <P>Most real estate agents know their commission percentage. Very few know their actual take-home number.</P>
    <P>
      After brokerage fees, taxes, and expenses, agents typically take home just 35 to 55% of the original gross
      commission. That means on a $15,000 commission check, many agents pocket between $5,250 and $8,250. The rest
      disappears across splits, desk fees, transaction charges, and franchise royalties before a single dollar reaches a
      bank account.
    </P>
    <P>
      In 2026, more agents are questioning whether their brokerage model is working for them or against them. This guide
      gives you the real math on both options so you can decide with clear numbers instead of a recruiter's pitch.
    </P>

    <H2>How the Traditional Split Model Works</H2>
    <P>
      In a traditional brokerage, the agent and brokerage divide every commission earned. Common split structures range
      from 50/50 for new agents up to 90/10 for top producers. As agents gain experience and increase their sales volume,
      splits can reach as high as 90/10.
    </P>
    <P>Here is what the math actually looks like on a real deal.</P>
    <P>
      On a $400,000 home sale with a 6% total commission, the transaction generates $24,000 split equally between buyer
      and seller agents. A 70/30 split with the brokerage allows the agent to take home $8,400.
    </P>
    <P>That is before desk fees, technology fees, transaction charges, and E&amp;O insurance are subtracted.</P>
    <P>
      An agent's net take-home pay is often less than 50% of their gross commission after accounting for splits, franchise
      fees, desk fees, and essential business expenses.
    </P>
    <P>
      Traditional brokerages justify the split by offering training, transaction support, broker access, and marketing
      infrastructure. For newer agents, those resources have genuine value. For experienced agents who generate their own
      leads and run their own transactions, the split often becomes a cost with diminishing returns.
    </P>

    <H2>How the 100% Commission Model Works</H2>
    <P>
      In a 100% commission brokerage, the agent keeps the full commission from every deal. The brokerage charges flat fees
      instead of a percentage.
    </P>
    <P>
      These typically include a monthly desk fee, usually $100 to $500 per month and a per-transaction fee of $200 to $600
      per closing. The brokerage covers its costs through those charges rather than a split of your earnings.
    </P>
    <P>
      The brokerage runs lean through virtual offices and cloud-based transaction management, which keeps fixed costs low
      on both sides.
    </P>
    <P>
      <Internal to="/">United Estates Realty</Internal> operates on this model. Agents pay a flat $98 per month with zero
      transaction fees on top. No percentage split. No hidden charges per closing. The CRM is included in that monthly
      fee, so agents are not paying separately for lead management tools on top of brokerage costs.
    </P>

    <H2>Side by Side: The Real Numbers in 2026</H2>
    <P>
      Here is a direct comparison for an agent closing 10 transactions per year at an average commission of $10,000 per
      deal.
    </P>

    <H3>Traditional Split (70/30) with Fees</H3>
    <UL>
      <li>Gross commissions: $100,000</li>
      <li>Brokerage split (30%): $30,000 gone</li>
      <li>Desk fee ($300/month): $3,600 gone</li>
      <li>Transaction fees ($300 per deal): $3,000 gone</li>
      <li>Technology fee ($100/month): $1,200 gone</li>
      <li>Agent net: $62,200</li>
    </UL>

    <H3>100% Commission with Flat Fee</H3>
    <UL>
      <li>Gross commissions: $100,000</li>
      <li>Monthly flat fee ($98/month): $1,176 gone</li>
      <li>Transaction fees: $0</li>
      <li>Technology/CRM fee: $0 (included)</li>
      <li>Agent net: $98,824</li>
    </UL>

    <P>The difference in identical production is $36,624 per year.</P>
    <P>
      That number scales with volume. An agent closing 20 deals keeps over $70,000 more annually under a flat-fee model
      compared to a traditional 70/30 split with standard layered fees.
    </P>

    <H2>Which Companies Offer 100% Commission in the US</H2>
    <P>Several national brokerages operate on this model with different fee structures:</P>
    <P>
      eXp Realty runs an 80/20 split until the agent hits a $16,000 annual cap, then pays 100% for the rest of the year.
      The monthly fee is $85 with a startup cost of $149.
    </P>
    <P>
      Real Broker uses an 85/15 split capped at $12,000 annually, then 100%. No monthly fee but a $250 charge taken from
      each of the first three closings per year.
    </P>
    <P>
      Fathom Realty offers a 7% split with a $9,000 cap on its core plan. Monthly fee of $75 with a $350 minimum
      transaction fee.
    </P>
    <P>HomeSmart and Realty ONE Group operate as true flat-fee brokerages with 100% of the first deal.</P>
    <P>
      United Estates Realty offers 100% commission from day one with a flat{" "}
      <Internal to="/pricing">$98 monthly fee</Internal> and zero transaction fees, making it one of the most
      straightforward cost structures available.
    </P>

    <H2>How to Join a 100% Commission Brokerage</H2>
    <P>The process is simpler than most agents expect. Steps typically include:</P>
    <UL>
      <li>Hold an active real estate license in your state</li>
      <li>Submit a license transfer request from your current brokerage</li>
      <li>Complete onboarding paperwork and pay any startup or first-month fee</li>
      <li>Access your CRM and transaction tools</li>
    </UL>
    <P>
      At United Estates Realty, the process is fully digital. There are no in-person requirements, and license transfers
      are processed within a few business days.
    </P>

    <H2>What Are the Benefits of a 100% Commission Brokerage</H2>
    <P>
      Higher net income on every deal. The flat fee does not scale with your commission size. A $20,000 commission costs
      the same in brokerage fees as a $5,000 one, which means high-value deals stay high-value.
    </P>
    <P>
      Predictable costs every month. A fixed monthly fee makes business planning straightforward. There are no surprise
      charges after closing and no variable costs tied to transaction volume.
    </P>
    <P>
      Full control over your brand. Agents at flat-fee brokerages operate their own business under their own name without
      being tied to a corporate identity that benefits the brokerage more than the agent.
    </P>
    <P>
      CRM and tools included. At United Estates Realty, the monthly fee covers a full CRM, so agents are not assembling a
      separate technology stack on top of brokerage costs.
    </P>
    <P>
      No income cap. In a split model, earning more means giving more to the brokerage. In a flat-fee model, every
      additional dollar of production stays with the agent.
    </P>

    <H2>Who the Flat-Fee Model Is Best For</H2>
    <P>
      The 100% commission model delivers the most value for agents who are already generating their own leads and closing
      deals consistently. Agents consistently closing 15 or more transactions per year, who are entirely self-sufficient
      and have an established client base and referral network, get the clearest financial benefit.
    </P>
    <P>
      For agents in their first year who need hands-on mentorship and structured training, a traditional brokerage may
      provide more developmental support. The key question is whether the guidance offered is genuinely valuable enough to
      justify the split over time.
    </P>
    <P>Once an agent has developed their systems and client base, the flat-fee model is the straightforward financial choice.</P>

    <section className="mt-16">
      <Faq eyebrow="FAQ" heading="Frequently Asked Questions" items={COMMISSION_FAQ} />
    </section>

    <P>
      At United Estates Realty, we built the simplest flat-fee structure we could: $98 per month, zero transaction fees,
      and a full CRM included. If you are evaluating your options, the full details are at{" "}
      <Internal to="/">unitedestatesagent</Internal>.
    </P>
  </>
);

export const blogPosts: BlogPost[] = [
  {
    slug: "100-commission-vs-traditional-split-2026",
    title: "100% Commission vs Traditional Split: 2026 Guide",
    description:
      "See what agents actually take home in 2026 after splits and fees. We compare 100% commission vs traditional brokerage models with real numbers and clear math.",
    excerpt:
      "After splits, desk fees, and transaction charges, agents typically keep just 35–55% of gross commission. Here's the real math on both models in 2026.",
    date: "2026-06-19",
    readMinutes: 8,
    author: "United Estates Realty",
    content: <CommissionArticle />,
    faq: COMMISSION_FAQ,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}