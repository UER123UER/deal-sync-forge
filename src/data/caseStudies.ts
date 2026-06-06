export interface CaseStudy {
  slug: string;
  agentName: string;
  city: string;
  headlineResult: string;
  summary: string;
  label: string;
  snapshot: {
    agent: string;
    location: string;
    experience: string;
    situation: string;
    result: string;
  };
  story: string[];
  whatChanged: string[];
  advice: string;
  disclaimer: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "marcus-reed-commission-fees",
    agentName: "Marcus Reed",
    city: "Houston, Texas",
    headlineResult:
      "Stopped Losing 30% of His Commission to Fees and Finally Kept What He Earned",
    summary:
      "A Houston solo agent eliminated unnecessary fee layers after switching to United Estates Realty, keeping significantly more of every deal he closed.",
    label: "Real Agent Story | Solo Agent | Houston, Texas, USA",
    snapshot: {
      agent: "Marcus Reed",
      location: "Houston, Texas",
      experience: "6 years as a solo real estate agent",
      situation:
        "Paying monthly fees, transaction fees, commission splits, and add-on charges across multiple platforms",
      result:
        "Switched to United Estates Realty and eliminated unnecessary fee layers, keeping significantly more of every deal he closed",
    },
    story: [
      "Marcus Reed had been a real estate agent in Houston for six years. By any measure, he was good at his job. His clients trusted him. His referrals were growing. His pipeline was full.",
      "But every month when he sat down to review his earnings, the same sinking feeling came back.",
      "The numbers never added up the way they should.",
      "It started with the monthly subscription. One platform for listings. Another for client management. Another for communication. Each one billed separately. Each one justified with a free trial that quietly became a recurring charge.",
      "Then came the transaction fees. Every time Marcus closed a deal he sourced, negotiated, and delivered entirely on his own, a percentage was automatically deducted by the platform. No explanation. No negotiation. Just gone.",
      "Then the commission split. A cut taken by a company that had no involvement in the deal whatsoever. No calls made. No clients met. No work done. Just a hand waiting at the finish line.",
      '"I remember closing a strong deal one Friday and feeling excited," Marcus recalls. "Then I did the math on what I was actually taking home after all the fees. It was nowhere near what I had earned. I felt like I had worked the entire week for someone else."',
      "Marcus spent an entire weekend mapping out every fee he was paying across every platform. The total stopped him cold.",
      "He was handing over a significant portion of his annual income not to a business partner, not to a team member, but to platforms and tools that simply charged because they could.",
      "He started looking for an alternative. Not just a cheaper tool, but a fundamentally different approach. One built by someone who understood what it actually felt like to be on the other side of those fees.",
      "That is when Marcus found United Estates Realty.",
    ],
    whatChanged: [
      "The difference was immediate, not just in cost, but in philosophy. United Estates Realty was not built by a tech company looking for multiple revenue streams from agents. It was built by an agent who had lived through the same frustration Marcus was feeling.",
      "No transaction fees eating into every closed deal.",
      "No commission splits taken by a platform that did none of the work.",
      "No surprise charges for features that should have been standard from day one.",
      "One straightforward system built around how agents actually work.",
      '"For the first time in years, I felt like my earnings were actually mine," Marcus says. "I closed the same number of deals the next month and kept noticeably more than I ever had before. That is not a small thing; that is the difference between a good year and a great one."',
    ],
    advice:
      '"Do the math. Seriously, sit down and add up every fee you are paying across every platform you use. Most agents I know have never done this because they are too busy working. When you finally see the full number, you will understand exactly why I made the switch."',
    disclaimer:
      "This case study is based on real experiences from within the real estate industry. The name and identifying details have been changed to protect the individual's privacy. The challenges, frustrations, and outcomes described reflect genuine experiences of real estate agents using United Estates Realty.",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
