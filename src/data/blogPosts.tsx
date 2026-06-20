import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Faq, type FaqItem } from "@/components/Faq";
import blogImage1 from "@/assets/commission-vs-traditional-split-2026.webp.asset.json";
import blogImage2 from "@/assets/real-estate-crm-software-dashboard-lead-management-agents.jpg.asset.json";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string; // ISO
  readMinutes: number;
  author: string;
  image?: string;
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

const CRM_FAQ: FaqItem[] = [
  {
    question: "Where to buy a real estate CRM with mobile app support?",
    answer:
      "Follow Up Boss, Wise Agent and Sierra Interactive all offer strong mobile apps available through standard app stores. United Estates Realty agents access the included CRM through a mobile-ready platform without a separate purchase.",
  },
  {
    question: "Top features to look for in a real estate CRM?",
    answer:
      "Lead management, automation, mobile access, MLS integration and customizable workflows. These five features directly affect how many leads you convert and how much time you spend on manual tasks.",
  },
  {
    question: "Which CRM works best for independent real estate agents?",
    answer:
      "Wise Agent is widely recommended for solo agents due to its affordability and simple interface. Agents with United Estates Realty get a full CRM included in the monthly flat fee, which eliminates the need to evaluate standalone options entirely.",
  },
  {
    question: "Do CRM platforms connect directly with MLS databases?",
    answer:
      "Yes. Several CRM platforms offer direct MLS integration that automatically populates property listing data and provides real-time alerts on property status updates without manual data entry. Top Producer and Sierra Interactive are among the strongest options for MLS connectivity.",
  },
  {
    question: "Can you customize a CRM for workflows unique to your agency?",
    answer:
      "Most modern CRMs offer some level of customization. The degree varies significantly between platforms. Before committing request a live demo and specifically ask to see the workflow builder and pipeline customization tools rather than relying on what the feature list says.",
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

    <figure className="mt-8">
      <img
        src={blogImage1.url}
        alt="Real estate agent comparing commission structures and brokerage splits to evaluate take-home income in a 100 percent commission brokerage versus a traditional split model"
        className="w-full rounded-lg"
        loading="eager"
      />
    </figure>

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

const CrmArticle = () => (
  <>
    <P>
      Most real estate agents pick a CRM the wrong way.
    </P>
    <P>
      They scroll through a list of names. They pick the one with the most features. They pay for a subscription and spend three weeks trying to figure out how to use it. By month two, they are back to managing leads in a spreadsheet.
    </P>
    <P>
      The problem is not the CRM. The problem is that nobody told them what to actually look for before choosing one.
    </P>
    <P>
      This guide fixes that. We cover the features that separate useful CRMs from expensive ones and answer the questions agents ask most before making a decision.
    </P>

    <figure className="mt-8">
      <img
        src={blogImage2.url}
        alt="Real estate CRM software dashboard for agents showing lead management, sales pipeline tracking, property listings, client follow-ups, and mobile real estate brokerage tools"
        className="w-full rounded-lg"
        loading="eager"
      />
    </figure>

    <H2>What a Real Estate CRM Actually Does</H2>
    <P>
      A CRM is not a contact book. It is the operational center of your entire business.
    </P>
    <P>
      A real estate CRM helps you manage all the facets of a customer's buying journey. The right platform makes it easier to stay in touch with clients and automates tasks that free up valuable time.
    </P>
    <P>
      Every lead you receive has a journey from first contact to closed deal. A CRM tracks that journey, reminds you when to follow up, automates routine outreach and keeps your pipeline organized without you manually managing every step.
    </P>
    <P>
      In 2026, the importance of a CRM extends well beyond simple organization. A powerful real estate CRM gives you ownership of your data. Unlike leads generated through third-party portals, where you compete with multiple agents for the same contact, the data in your CRM is exclusively yours. It allows you to build a sustainable business asset that you can nurture over the years, independent of any single platform.
    </P>
    <P>
      That distinction matters enormously for independent agents who cannot afford to lose leads to slow response times or disorganized pipelines.
    </P>

    <H2>Top Features to Look for in a Real Estate CRM</H2>
    <P>Not every feature on a pricing page is worth paying for. These are the ones that actually affect how many deals you close.</P>

    <H3>Lead Management</H3>
    <P>
      A great CRM should help you capture, organize and prioritize leads. Look for a tool that allows you to automatically import leads from multiple sources, including your website and social media. It should let you tag, categorize and filter leads by urgency or location and create follow-up reminders that keep nothing from slipping through the cracks.
    </P>

    <H3>Automation</H3>
    <P>
      Automation saves hours of repetitive work. The right CRM should offer drip campaigns to nurture leads over time, automated follow-up reminders and notifications, and the ability to send bulk emails and texts without manual effort each time.
    </P>

    <H3>Mobile App Support</H3>
    <P>
      A full-featured mobile app is one of the most critical features for real estate agents in 2026. Agents work in the field. A CRM that only functions well on a desktop is not used consistently, and inconsistency is where deals get lost.
    </P>
    <P>
      Where to find CRMs with strong mobile app support: Follow Up Boss, Wise Agent and Sierra Interactive all offer dedicated mobile apps. <Internal to="/">United Estates Realty</Internal> includes CRM access built into its agent platform, so agents are not paying for a separate mobile subscription on top of brokerage costs.
    </P>

    <H3>MLS Integration</H3>
    <P>
      MLS integration means your CRM connects directly to your multiple listing service feed. Instead of manually importing property details, your CRM automatically pulls listing updates, property status and syncs listing data into your database. This saves time, reduces data entry errors and improves efficiency across your entire workflow.
    </P>
    <P>
      Top Producer offers direct MLS integration with over 320 boards, a feature many CRMs do not include. It allows agents to create and send property alerts, including price changes and just-listed updates, right from within the platform.
    </P>

    <H3>Custom Workflows</H3>
    <P>
      Sales pipeline management is the process of managing the sequence of steps a prospect goes through until a deal is finalized. Your CRM should make it easy to build multiple pipelines with their own unique deal stages to match how your specific business operates, rather than forcing you into a rigid structure someone else designed.
    </P>
    <P>
      Every agency runs differently. A CRM that cannot be customized forces you to change your process to match its limitations rather than the other way around. Look for platforms that allow you to build and modify workflows without needing a developer.
    </P>

    <H2>Which CRM Works Best for Independent Real Estate Agents</H2>
    <P>
      Independent agents have different priorities from large teams. They need affordability, simplicity and tools that work from day one without a two-week onboarding process.
    </P>
    <P>
      Wise Agent is an affordable and easy-to-use CRM with a strong focus on time management and productivity. Its automated workflows streamline daily tasks, drip campaigns keep agents top of mind with leads and transaction management tools track the progress of every deal. It is a no-frills CRM that gets the job done and its clean interface makes it a strong fit for solo agents who need functionality without complexity.
    </P>
    <P>
      For agents who want a CRM included as part of their brokerage rather than as a separate monthly expense, United Estates Realty bundles a full CRM into its <Internal to="/pricing">$98 flat monthly fee</Internal>. That means no separate subscription, no setup cost and no technology fee on top of brokerage costs. For independent agents watching their overhead, that structure removes one of the biggest recurring expenses from the equation entirely.
    </P>

    <H2>Can You Customize a CRM for Your Agency's Unique Workflows</H2>
    <P>
      Yes, but not every platform makes it easy.
    </P>
    <P>
      Modern CRM systems are specifically designed to address the unique needs of real estate professionals, offering features like lead management, automation, customization, integration and scalability. The baseline expectation for what a CRM should do has gone up significantly in 2026.
    </P>
    <P>
      When evaluating customization, ask three direct questions before signing up:
    </P>
    <UL>
      <li>Can you build multiple pipelines with different stages?</li>
      <li>Can you create your own automated follow-up sequences without technical help?</li>
      <li>Can you add custom fields to contact records to capture information specific to your market?</li>
    </UL>
    <P>
      If the answer to any of those is no or requires an upgrade to a higher-tier plan, that is a meaningful limitation for an agency with workflows that do not fit a generic template.
    </P>

    <section className="mt-16">
      <Faq eyebrow="FAQ" heading="Frequently Asked Questions" items={CRM_FAQ} />
    </section>

    <P>
      At United Estates Realty, we include a full <Internal to="/software">CRM</Internal> as part of the flat $98 monthly fee because we believe agents should not have to choose between a good brokerage and good tools. If you want to see how the platform works, visit <Internal to="/">unitedestatesagent</Internal>.
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
    image: blogImage1.url,
    content: <CommissionArticle />,
    faq: COMMISSION_FAQ,
  },
  {
    slug: "best-crm-for-real-estate-agents-2026",
    title: "Best CRM for Real Estate Agents in 2026",
    description:
      "Not all real estate CRMs are worth the price. We break down the top features agents need in 2026 so you can choose the right tool without wasting time or money.",
    excerpt:
      "Not every feature on a pricing page is worth paying for. Here are the CRM features that actually affect how many deals you close in 2026.",
    date: "2026-06-20",
    readMinutes: 8,
    author: "United Estates Realty",
    image: blogImage2.url,
    content: <CrmArticle />,
    faq: CRM_FAQ,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
