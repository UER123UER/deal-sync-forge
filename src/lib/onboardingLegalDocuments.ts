export type OnboardingDocumentKey =
  | 'independent_contractor_agreement'
  | 'policy_acknowledgment'
  | 'ach_payment_authorization';

type DocumentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type OnboardingLegalDocument = {
  key: OnboardingDocumentKey;
  title: string;
  version: string;
  preamble: string[];
  sections: DocumentSection[];
  acknowledgment: string;
};

type AchAuthorizationOptions = {
  bankName?: string | null;
  accountHolderName: string;
  accountNumberLast4: string;
  accountType: string;
};

export const AGREEMENT_ESIGN_CONSENT_TEXT =
  'I consent to receive, review, and sign these onboarding records electronically. I understand my typed name is intended to serve as my electronic signature, that the signed records will be retained by United Estates Realty, and that I may print or save a copy before signing.';

export const ACH_ESIGN_CONSENT_TEXT =
  'I consent to the electronic presentation and signature of this ACH authorization and application certification. I understand my typed name is intended to serve as my electronic signature, and that United Estates Realty will retain the signed authorization and related audit details.';

export const AGREEMENT_DOCUMENT_KEYS: OnboardingDocumentKey[] = [
  'independent_contractor_agreement',
  'policy_acknowledgment',
];

const DOCUMENT_VERSION = '2026-05-02-v1';

function formatAccountType(accountType: string) {
  if (!accountType) return 'Checking';
  return accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase();
}

export function getIndependentContractorAgreementDocument(): OnboardingLegalDocument {
  return {
    key: 'independent_contractor_agreement',
    title: 'Independent Contractor Agreement',
    version: DOCUMENT_VERSION,
    preamble: [
      'This Independent Contractor Agreement ("Agreement") is entered into as of the date signed below, by and between United Estates Realty, a Florida licensed real estate brokerage ("Broker"), and the undersigned licensed real estate sales associate or broker associate ("Associate").',
    ],
    sections: [
      {
        title: '1. Relationship of the Parties',
        paragraphs: [
          'Associate is engaged as an independent contractor and not as an employee, partner, or joint venturer of Broker. Broker shall exercise no control over the manner or method by which Associate performs services, except as required by Florida real estate law.',
          'Associate shall have no authority to bind Broker in any contract or obligation and is solely responsible for all federal, state, and local taxes arising from compensation received under this Agreement.',
        ],
      },
      {
        title: '2. Florida License Requirement',
        paragraphs: [
          'Associate represents and warrants that they hold a current, active Florida real estate license in good standing with the Florida Department of Business and Professional Regulation (DBPR), are not subject to pending disciplinary action, and will notify Broker immediately in writing of any change in license status.',
        ],
      },
      {
        title: '3. Compensation',
        bullets: [
          'Associate retains one hundred percent (100%) of all gross commissions earned on transactions closed by Associate, subject only to deductions required by law or court order.',
          'Associate shall pay Broker a flat monthly fee of $98.00 due on the 1st day of each calendar month via ACH bank draft from the designated bank account on file, unless the fee is waived by an approved promo code or written brokerage authorization.',
          'Failure to maintain valid ACH information on file, or failure to cure a failed ACH draft within ten (10) calendar days, constitutes a material breach of this Agreement.',
          'Associate may earn a $20.00 monthly referral bonus for each qualifying active associate personally referred to Broker while both parties remain active and in good standing.',
          'Commissions shall be disbursed to Associate within five (5) business days of Broker receiving and clearing commission funds from the closing agent or title company.',
        ],
      },
      {
        title: '4. Errors & Omissions Insurance',
        paragraphs: [
          'Broker shall provide group Errors and Omissions (E&O) insurance coverage for Associate activities conducted under Broker\'s license, subject to the terms, conditions, exclusions, and limits of the policy in effect at the time of any claim.',
          'Coverage does not extend to intentional misconduct, fraud, criminal acts, activities outside the scope of Associate\'s Florida license, or independent business activities unrelated to real estate transactions under Broker.',
        ],
      },
      {
        title: '5. Associate Responsibilities',
        bullets: [
          'Maintain an active Florida real estate license at all times.',
          'Comply with all Florida real estate laws, DBPR rules, MLS rules, and the NAR Code of Ethics if REALTOR member status applies.',
          'Conduct all real estate activities exclusively under Broker\'s license as required by Florida Statute Section 475.',
          'Pay all personal business expenses, including MLS dues, board dues, marketing, and technology costs.',
          'Comply with all federal and state consumer protection, telemarketing, privacy, anti-money laundering, and communications laws referenced in this Agreement.',
        ],
      },
      {
        title: '6. Broker Responsibilities',
        bullets: [
          'Maintain an active Florida real estate broker\'s license.',
          'Provide Associate use of the United Estates Realty trade name and broker\'s license for lawful real estate transactions.',
          'Provide reasonable supervision as required by Florida law.',
          'Remit commissions under the timing stated above and maintain E&O coverage as described in this Agreement.',
        ],
      },
      {
        title: '7. Expenses',
        paragraphs: [
          'Associate is solely responsible for all personal business expenses unless reimbursement is expressly stated in a separate written addendum signed by both parties.',
        ],
      },
      {
        title: '8. Advertising & Marketing Compliance',
        paragraphs: [
          'All advertising, signage, digital content, and marketing materials must clearly display the United Estates Realty name and Florida broker license number as required by Florida law and DBPR Rule 61J2-10.025.',
          'Associate may not advertise under any other brokerage name and is individually responsible for compliance with CAN-SPAM, TCPA, and all applicable state advertising laws.',
        ],
      },
      {
        title: '9. Legal Compliance — Consumer Protection & Communications Laws',
        bullets: [
          'National Do Not Call Registry / TCPA: Associate shall scrub solicitation lists against the National Do Not Call Registry and any applicable state list, maintain an internal do-not-call list, honor opt-out requests within thirty (30) days, and bear all compliance costs.',
          'Telephone Consumer Protection Act: Associate shall not use auto-dialers, artificial voice, or prerecorded calls or texts where prior express written consent is required, and remains solely liable for TCPA claims and statutory damages.',
          'CAN-SPAM Act: All commercial email must include accurate routing information, a non-deceptive subject line, a valid physical mailing address, a clear opt-out mechanism, and timely processing of opt-out requests.',
          'Florida Telemarketing Act: Associate shall comply with registration, timing, disclosure, and other telemarketing rules applicable in Florida.',
          'Fair Housing: Associate shall not discriminate against any protected class and must report any Fair Housing allegation or complaint to Broker immediately in writing.',
          'FDUTPA: Associate shall not engage in any unfair, deceptive, or unconscionable trade practice and remains individually responsible for claims arising from their conduct.',
          'Privacy and Gramm-Leach-Bliley: Associate shall not misuse, disclose, or sell nonpublic personal information except as required to complete the transaction for which it was provided.',
          'AML / FinCEN: Associate shall report suspicious transaction activity, potential fraud, or money laundering concerns to Broker immediately.',
          'Social Media and Digital Marketing: Associate shall comply with FTC Endorsement Guides, DBPR rules, and all platform-specific advertising requirements.',
        ],
      },
      {
        title: '10. Indemnification',
        paragraphs: [
          'Associate agrees to indemnify, defend, and hold harmless United Estates Realty, its broker, officers, agents, and assigns from any claim, demand, loss, damage, liability, cost, or expense, including reasonable attorney\'s fees, arising out of Associate\'s violation of law, negligent or intentional acts or omissions, breach of this Agreement, or individual real estate activities.',
          'This indemnification obligation expressly includes TCPA, CAN-SPAM, Do Not Call, Fair Housing, FDUTPA, and similar consumer-protection claims, and survives termination of this Agreement.',
        ],
      },
      {
        title: '11. Limitation of Broker Liability',
        paragraphs: [
          'Broker\'s liability to Associate shall not exceed the total monthly fees paid by Associate to Broker during the three (3) calendar months immediately preceding the event giving rise to the claim. Broker shall not be liable for indirect, consequential, incidental, special, or punitive damages, nor for regulatory fines or judgments arising from Associate\'s individual conduct.',
        ],
      },
      {
        title: '12. Commission Handling — Florida Law',
        paragraphs: [
          'All commissions and compensation related to real estate transactions must flow through Broker\'s escrow or operating account as required by Florida Statute Section 475. Associate may not receive commission payments directly from buyers, sellers, landlords, tenants, closing agents, or title companies.',
        ],
      },
      {
        title: '13. Confidentiality',
        paragraphs: [
          'Associate shall maintain the confidentiality of client information, Broker\'s proprietary systems, agent referral data, and non-public business information obtained during affiliation. This obligation survives termination indefinitely.',
        ],
      },
      {
        title: '14. Termination',
        bullets: [
          'Either party may terminate this Agreement upon fourteen (14) days prior written notice.',
          'Upon termination, Associate\'s right to use Broker\'s name and license number immediately ceases.',
          'Commissions on transactions under binding contract before termination remain payable upon closing under the commission section of this Agreement.',
          'Referral bonuses cease immediately upon termination.',
          'Associate shall promptly transfer active listings and pending transactions to Broker or Broker\'s designee.',
          'Broker-provided E&O coverage ceases on the effective termination date.',
          'Associate\'s ACH authorization is revoked once all outstanding monthly fees are paid in full.',
        ],
      },
      {
        title: '15. Governing Law & Dispute Resolution',
        paragraphs: [
          'This Agreement shall be governed by the laws of the State of Florida. Any dispute shall first be submitted to non-binding mediation in the county where Broker\'s principal office is located. If mediation is unsuccessful, disputes shall be resolved by binding arbitration under American Arbitration Association rules, and the prevailing party shall be entitled to reasonable attorney\'s fees and costs.',
        ],
      },
      {
        title: '16. Entire Agreement & Severability',
        paragraphs: [
          'This Agreement, together with any signed addenda, constitutes the entire agreement of the parties and supersedes prior discussions or agreements. If any provision is found unenforceable, the remaining provisions continue in full force. Modifications must be in writing and signed by both parties.',
        ],
      },
    ],
    acknowledgment:
      'By signing below, each party acknowledges they have read, understand, and voluntarily agree to the terms of this Agreement, including the indemnification and legal compliance obligations in Sections 9 and 10.',
  };
}

export function getPolicyAcknowledgmentDocument(): OnboardingLegalDocument {
  return {
    key: 'policy_acknowledgment',
    title: 'Policy Acknowledgment & Code of Conduct',
    version: DOCUMENT_VERSION,
    preamble: [
      'All associates affiliated with United Estates Realty ("Broker") must read and comply with the following policies as a condition of affiliation. Violation of any policy may result in immediate termination of the Independent Contractor Agreement and may be reported to the DBPR.',
    ],
    sections: [
      {
        title: '1. License Compliance',
        paragraphs: [
          'Associates must maintain an active Florida real estate license at all times. Any lapse, suspension, revocation, or voluntary inactivation requires immediate written notice to Broker and automatically suspends authority to conduct real estate activities under Broker\'s license.',
        ],
      },
      {
        title: '2. Compliance with Florida & Federal Law',
        bullets: [
          'Florida Statute Chapter 475 and Florida Administrative Code Chapter 61J2.',
          'NAR Code of Ethics, if REALTOR member status applies.',
          'Federal and Florida Fair Housing laws.',
          'Telephone Consumer Protection Act (TCPA) and National Do Not Call rules.',
          'Florida Telemarketing Act and CAN-SPAM Act.',
          'Florida Deceptive and Unfair Trade Practices Act (FDUTPA).',
          'Gramm-Leach-Bliley privacy requirements.',
          'FTC Endorsement Guides for social media and testimonials.',
          'Applicable anti-money laundering / FinCEN obligations and all MLS rules.',
        ],
      },
      {
        title: '3. Do Not Call & Telemarketing Compliance',
        paragraphs: [
          'Associates are individually responsible for telemarketing compliance, including scrubbing calling lists against the National DNC Registry, maintaining an internal DNC list, honoring opt-out requests within 30 days, respecting legal calling hours, providing accurate caller ID information, and avoiding robocalls or auto-dialed calls where prior express written consent is required.',
        ],
      },
      {
        title: '4. Email & CAN-SPAM Compliance',
        paragraphs: [
          'Every commercial email sent by Associate must accurately identify the sender, use a non-deceptive subject line, include a valid physical mailing address, include a clear unsubscribe mechanism, and process opt-out requests within 10 business days. Associate shall not email any person who has opted out.',
        ],
      },
      {
        title: '5. Monthly Fee & ACH Payment Policy',
        paragraphs: [
          'The $98.00 monthly fee is due on the 1st of each calendar month via ACH bank draft unless waived by an approved promo code or written brokerage authorization. ACH is the sole accepted payment method when a monthly fee is owed. Associate must maintain current, valid banking information on file whenever ACH billing applies. A failed ACH draft not cured within ten (10) calendar days constitutes a material breach, and no proration is provided for partial months.',
        ],
      },
      {
        title: '6. E&O Insurance',
        paragraphs: [
          'Broker provides group E&O insurance for Associate activities conducted under Broker\'s license. Coverage does not extend to intentional misconduct, fraud, criminal acts, or activities outside the scope of Associate\'s Florida license. Associate shall cooperate with claim investigations and immediately notify Broker in writing of any potential claim or complaint.',
        ],
      },
      {
        title: '7. Commission Handling — Florida Law',
        paragraphs: [
          'All commissions must flow through Broker\'s account as required by Florida law. Associate may not receive commission payments directly from any party. Violation is grounds for immediate termination and DBPR reporting.',
        ],
      },
      {
        title: '8. Advertising & Marketing',
        paragraphs: [
          'All advertising must display the United Estates Realty name and Florida broker license number as required by DBPR Rule 61J2-10.025. Associates may not advertise under any other broker\'s license. Digital advertising and social media content must also comply with TCPA, CAN-SPAM, FTC Endorsement Guides, and Florida advertising rules.',
        ],
      },
      {
        title: '9. Fair Housing',
        paragraphs: [
          'Associates shall not discriminate on the basis of race, color, national origin, religion, sex, familial status, disability, or any other protected characteristic, and must report any Fair Housing complaint or allegation to Broker immediately in writing.',
        ],
      },
      {
        title: '10. Client Privacy & Data Security',
        paragraphs: [
          'Associates shall protect client personal and financial information, avoid storage of client data on unsecured devices or platforms, avoid unauthorized disclosures, and report any data breach involving client information to Broker immediately.',
        ],
      },
      {
        title: '11. Anti-Money Laundering',
        paragraphs: [
          'Associates must comply with AML and FinCEN rules and must not knowingly participate in a transaction involving criminal proceeds. Suspicious activity, fraud, or structuring concerns must be reported to Broker immediately in writing.',
        ],
      },
      {
        title: '12. Indemnification of Broker',
        paragraphs: [
          'Associate agrees to indemnify, defend, and hold harmless United Estates Realty and its broker from claims, fines, penalties, damages, or costs, including attorney\'s fees, arising from Associate\'s individual conduct, including TCPA, CAN-SPAM, DNC, Fair Housing, FDUTPA, advertising, privacy, or regulatory violations. This obligation survives termination.',
        ],
      },
      {
        title: '13. Post-Termination Obligations',
        bullets: [
          'Cease use of Broker\'s name, license number, and branding immediately.',
          'Transfer active listings and pending transactions.',
          'Return Broker-provided materials.',
          'Disclose pending disputes or potential claims.',
          'Commissions on contracts executed before termination remain governed by the Independent Contractor Agreement.',
        ],
      },
      {
        title: '14. Social Media & Professional Conduct',
        paragraphs: [
          'Associates shall not make false, misleading, defamatory, or disparaging statements about United Estates Realty, other associates, clients, or competitors. Professional social media profiles must disclose affiliation with United Estates Realty and comply with Broker branding guidelines and Florida advertising rules.',
        ],
      },
    ],
    acknowledgment:
      'I certify that I have received, read, and fully understand all policies set forth above. I voluntarily agree to comply with these policies as a condition of my affiliation with United Estates Realty. I understand that violation of any policy may result in immediate termination of my Independent Contractor Agreement, without prejudice to any other remedy available to Broker, and may be reported to applicable regulatory authorities.',
  };
}

export function getAchPaymentAuthorizationDocument(options: AchAuthorizationOptions): OnboardingLegalDocument {
  const accountType = formatAccountType(options.accountType);
  const bankLabel = options.bankName?.trim() ? options.bankName.trim() : 'Bank name not provided';

  return {
    key: 'ach_payment_authorization',
    title: 'ACH Payment Authorization & Application Certification',
    version: DOCUMENT_VERSION,
    preamble: [
      'The sole payment method accepted by United Estates Realty is ACH bank draft. By signing this authorization, Associate authorizes United Estates Realty to initiate recurring monthly ACH debit entries of $98.00 from the designated bank account on the 1st day of each calendar month.',
      'This authorization remains in effect until terminated in writing by either party with at least ten (10) business days\' notice before the next scheduled draft date.',
    ],
    sections: [
      {
        title: 'Authorized Account Details',
        bullets: [
          `Bank Name: ${bankLabel}`,
          `Account Holder Name: ${options.accountHolderName}`,
          `Account Type: ${accountType}`,
          `Account Ending In: ${options.accountNumberLast4}`,
        ],
      },
      {
        title: 'ACH Terms',
        paragraphs: [
          'Associate authorizes United Estates Realty to debit the designated account for $98.00 on the 1st of each month.',
          'If a payment is returned for insufficient funds or any other reason, Associate is responsible for returned item fees and must cure the failed payment within ten (10) calendar days to avoid breach of the Independent Contractor Agreement.',
        ],
      },
      {
        title: 'Application Certification',
        paragraphs: [
          'By signing below, Associate certifies that all information provided during onboarding is true, accurate, and complete; that Associate has read and agrees to the Independent Contractor Agreement and Policy Acknowledgment; that Associate authorizes ACH debits as stated above; and that any material misrepresentation may result in rejection or termination of affiliation.',
        ],
      },
    ],
    acknowledgment:
      'I authorize United Estates Realty to initiate recurring ACH debit entries as stated above and certify that the information I provided during onboarding is true, accurate, and complete.',
  };
}

export function getAgreementDocuments() {
  return [getIndependentContractorAgreementDocument(), getPolicyAcknowledgmentDocument()];
}

export function buildDocumentBody(document: OnboardingLegalDocument) {
  const sectionBlocks = document.sections.map((section) => {
    const lines = [section.title];

    if (section.paragraphs?.length) {
      lines.push(...section.paragraphs);
    }

    if (section.bullets?.length) {
      lines.push(...section.bullets.map((bullet) => `- ${bullet}`));
    }

    return lines.join('\n');
  });

  return [
    `${document.title}`,
    `Version: ${document.version}`,
    '',
    ...document.preamble,
    '',
    ...sectionBlocks,
    '',
    'Acknowledgment',
    document.acknowledgment,
  ].join('\n\n');
}
