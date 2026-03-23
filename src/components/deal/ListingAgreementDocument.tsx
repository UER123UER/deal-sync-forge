import React, { ReactNode } from 'react';

export interface ListingAgreementFields {
  sellerName: string;
  brokerName: string;
  brokerCompany: string;
  propertyAddress: string;
  legalDescription: string;
  personalProperty: string;
  occupancyStatus: string;
  tenantLeaseExpiry: string;
  listingStartDate: string;
  listingExpiration: string;
  listPrice: string;
  financingTerms: string;
  sellerFinancingAmount: string;
  sellerFinancingTerms: string;
  assumptionAmount: string;
  assumptionFee: string;
  assumptionTermYears: string;
  assumptionStartYear: string;
  assumptionRate: string;
  assumptionRateType: string;
  sellerExpensePercent: string;
  sellerExpenseAmount: string;
  commissionPercent: string;
  commissionFlat: string;
  optionFee: string;
  leaseFee: string;
  protectionPeriodDays: string;
  retainedDepositPercent: string;
  buyerBrokerCompPercent: string;
  buyerBrokerCompFlat: string;
  cancellationFee: string;
  additionalTerms: string;
  mlsNumber: string;
  sellerPhone: string;
  sellerWorkPhone: string;
  sellerFax: string;
  sellerAddress: string;
  sellerEmail: string;
  brokerPhone: string;
  brokerAddress: string;
}

export const DEFAULT_FIELDS: ListingAgreementFields = {
  sellerName: '',
  brokerName: '',
  brokerCompany: '',
  propertyAddress: '',
  legalDescription: '',
  personalProperty: '',
  occupancyStatus: 'is not',
  tenantLeaseExpiry: '',
  listingStartDate: '',
  listingExpiration: '',
  listPrice: '',
  financingTerms: '',
  sellerFinancingAmount: '',
  sellerFinancingTerms: '',
  assumptionAmount: '',
  assumptionFee: '',
  assumptionTermYears: '',
  assumptionStartYear: '',
  assumptionRate: '',
  assumptionRateType: '',
  sellerExpensePercent: '',
  sellerExpenseAmount: '',
  commissionPercent: '',
  commissionFlat: '',
  optionFee: '',
  leaseFee: '',
  protectionPeriodDays: '',
  retainedDepositPercent: '50',
  buyerBrokerCompPercent: '',
  buyerBrokerCompFlat: '',
  cancellationFee: '',
  additionalTerms: '',
  mlsNumber: '',
  sellerPhone: '',
  sellerWorkPhone: '',
  sellerFax: '',
  sellerAddress: '',
  sellerEmail: '',
  brokerPhone: '',
  brokerAddress: '',
};

interface Props {
  fields: ListingAgreementFields;
  renderField: (key: keyof ListingAgreementFields, width?: number) => ReactNode;
  signatureSection?: ReactNode;
}

export function ListingAgreementDocument({ fields, renderField, signatureSection }: Props) {
  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Header */}
      <div className="text-right text-xs text-muted-foreground mb-4" style={{ fontFamily: 'sans-serif' }}>
        <span className="italic">Florida Realtors®</span>
      </div>

      <h2 className="text-center text-base font-bold mb-4 tracking-wide">
        Exclusive Right of Sale Listing Agreement
      </h2>

      <p className="text-xs text-muted-foreground mb-6 text-center" style={{ fontFamily: 'sans-serif' }}>
        THIS IS A LEGALLY BINDING CONTRACT. IF NOT UNDERSTOOD, SEEK LEGAL ADVICE.
      </p>

      <div className="space-y-5 text-[13px] leading-relaxed">
        {/* Parties */}
        <p>
          This Exclusive Right of Sale Listing Agreement ("Agreement") is between{' '}
          {renderField('sellerName', 220)} ("Seller") and brokerage{' '}
          {renderField('brokerCompany', 220)} ("Broker").
        </p>

        {/* Section 1 */}
        <div>
          <p className="font-bold mb-1">1. Authority to Sell Property:</p>
          <p>
            Seller gives Broker the <strong>EXCLUSIVE RIGHT TO SELL</strong> the real and personal property
            (collectively "Property") described below, at the price and terms described below, beginning{' '}
            {renderField('listingStartDate', 130)} and terminating at 11:59 p.m. on{' '}
            {renderField('listingExpiration', 130)} ("Termination Date"). Upon full execution of a contract
            for sale and purchase of the Property, all rights and obligations of this Agreement will automatically
            extend through the date of the actual closing of the sales contract. Seller and Broker acknowledge
            that this Agreement does not guarantee a sale. This Property will be offered to any person without
            regard to race, color, religion, sex, handicap, familial status, national origin, or any other factor
            protected by federal, state, or local law. Seller certifies and represents that she/he/it is legally
            entitled to convey the Property and all improvements.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <p className="font-bold mb-1">2. Description of Property:</p>
          <p className="mb-2">
            (a) Street Address: {renderField('propertyAddress', 400)}
          </p>
          <p className="mb-2">
            Legal Description: {renderField('legalDescription', 400)}
          </p>
          <p className="mb-2">
            (b) Personal Property, including appliances: {renderField('personalProperty', 300)}
          </p>
          <p className="mb-2">
            (c) Occupancy: Property {renderField('occupancyStatus', 60)} currently occupied by a tenant.
            {fields.occupancyStatus === 'is' && (
              <> If occupied, the lease term expires {renderField('tenantLeaseExpiry', 120)}.</>
            )}
          </p>
        </div>

        {/* Section 3 */}
        <div>
          <p className="font-bold mb-1">3. Price and Terms:</p>
          <p className="mb-2">
            The property is offered for sale on the following terms or on other terms acceptable to Seller:
          </p>
          <p className="mb-2">
            (a) Price: ${renderField('listPrice', 140)}
          </p>
          <p className="mb-2">
            (b) Financing Terms: {renderField('financingTerms', 300)}
          </p>
          <p className="mb-2 ml-4">
            Seller Financing: Seller will hold a purchase money mortgage in the amount of ${renderField('sellerFinancingAmount', 120)}{' '}
            with the following terms: {renderField('sellerFinancingTerms', 250)}
          </p>
          <p className="mb-2 ml-4">
            Assumption of Existing Mortgage: Buyer may assume existing mortgage for ${renderField('assumptionAmount', 120)}{' '}
            plus an assumption fee of ${renderField('assumptionFee', 100)}. The mortgage is for a term of{' '}
            {renderField('assumptionTermYears', 40)} years beginning in {renderField('assumptionStartYear', 50)},{' '}
            at an interest rate of {renderField('assumptionRate', 40)}% {renderField('assumptionRateType', 80)}.
          </p>
          <p className="mb-2 text-xs text-muted-foreground ml-4" style={{ fontFamily: 'sans-serif' }}>
            Notice to Seller: (1) You may remain liable for an assumed mortgage for a number of years after the Property is sold. Check with your lender to determine the extent of your liability.
            (2) Extensive regulations affect Seller financed transactions. Consult with a legal or mortgage professional.
          </p>
          <p className="mb-2">
            (c) Seller Expenses: Seller will pay closing costs not to exceed {renderField('sellerExpensePercent', 40)}% of the purchase price
            or ${renderField('sellerExpenseAmount', 120)}, and any other expenses Seller agrees to pay.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <p className="font-bold mb-1">4. Broker Obligations:</p>
          <p>
            Broker agrees to make diligent and continued efforts to sell the Property in accordance with this Agreement until a sales
            contract is pending on the Property. This includes, except when not in Seller's best interests, cooperating and communicating
            with other brokers and making the property available for showings.
          </p>
        </div>

        {/* Page footer 1 */}
        <div className="border-t pt-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 1 of 6.</p>
          <p className="mt-1">ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>

        {/* Section 5 */}
        <div className="border-t pt-4">
          <p className="font-bold mb-1">5. Multiple Listing Service:</p>
          <p>
            Placing the Property in a multiple listing service (the "MLS") is beneficial to Seller because the Property will be exposed
            to a large number of potential buyers. As a MLS participant, Broker is obligated to enter the Property into the MLS within
            one (1) business day of marketing the Property to the public or as necessary to comply with local MLS rule(s). Seller
            authorizes Broker to report to the MLS this listing information and price, terms, and financing information on any resulting
            sale for use by authorized Board/Association members and MLS participants and subscribers unless Seller directs Broker
            otherwise in writing. MLS# {renderField('mlsNumber', 120)}.
          </p>
        </div>

        {/* Section 6 */}
        <div>
          <p className="font-bold mb-1">6. Broker Authority:</p>
          <p className="mb-2">Seller authorizes Broker to:</p>
          <div className="ml-4 space-y-2">
            <p>(a) Market the Property to the public, including flyers, yard signs, digital marketing on public facing websites, brokerage website displays, email blasts, multi-brokerage listing sharing networks.</p>
            <p>(b) Place appropriate transaction signs on the Property.</p>
            <p>(c) Use Seller's name in connection with marketing or advertising the Property.</p>
            <p>(d) Obtain information relating to the present mortgage(s) on the Property.</p>
            <p>(e) Provide objective comparative market analysis information to potential buyers.</p>
            <p>(f) Use a lock box system to show and access the Property. A lock box does not ensure the Property's security. Seller is advised to secure or remove valuables.</p>
          </div>
        </div>

        {/* Section 7 */}
        <div>
          <p className="font-bold mb-1">7. Seller Obligations:</p>
          <p className="mb-2">In consideration of Broker's obligations, Seller agrees to:</p>
          <div className="ml-4 space-y-2">
            <p>(a) Cooperate with Broker in carrying out the purpose of this Agreement, including referring immediately to Broker all inquiries regarding the Property's transfer.</p>
            <p>(b) Recognize Broker may be subject to additional MLS obligations and potential penalties for failure to comply.</p>
            <p>(c) Provide Broker with keys to the Property and make the Property available for showings during reasonable times.</p>
            <p>(d) Inform Broker before leasing, mortgaging, or otherwise encumbering the Property.</p>
            <p>(e) Indemnify Broker and hold Broker harmless from losses, damages, costs, and expenses of any nature, including attorney's fees.</p>
          </div>
        </div>

        {/* Page footer 2 */}
        <div className="border-t pt-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 2 of 6.</p>
          <p className="mt-1">ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>

        {/* Section 8 */}
        <div className="border-t pt-4">
          <p className="font-bold mb-1">8. Compensation:</p>
          <p className="mb-2">
            Seller will compensate Broker as specified below for procuring a buyer who is ready, willing, and able to purchase the
            Property. Seller will pay Broker as follows (plus applicable sales tax):
          </p>
          <div className="ml-4 space-y-2">
            <p>
              (a) {renderField('commissionPercent', 40)}% of the total purchase price plus ${renderField('commissionFlat', 100)},
              no later than the date of closing specified in the sales contract. However, closing is not a prerequisite for Broker's fee being earned.
            </p>
            <p>
              (b) {renderField('optionFee', 60)} ($ or %) of the consideration paid for an option, at the time an option is created.
            </p>
            <p>
              (c) {renderField('leaseFee', 60)} ($ or %) of gross lease value as a leasing fee.
            </p>
            <p>(d) Broker's fee is due in the following circumstances:</p>
            <div className="ml-4 space-y-1 text-[12px]">
              <p>(1) If any interest in the Property is transferred, whether by sale, lease, exchange, governmental action, bankruptcy, or any other means of transfer.</p>
              <p>(2) If Seller refuses or fails to sign an offer at the price and terms stated, defaults on an executed sales contract, or agrees to cancel.</p>
              <p>(3) If, within {renderField('protectionPeriodDays', 40)} days after Termination Date ("Protection Period"), Seller transfers or contracts to transfer the Property to any prospects with whom Seller, Broker, or any licensee communicated before Termination Date.</p>
            </div>
            <p>
              (e) Retained Deposits: Broker is entitled to receive {renderField('retainedDepositPercent', 40)}% (50% if left blank)
              of all deposits that Seller retains as liquidated damages for a buyer's default, not to exceed the Paragraph 8(a) fee.
            </p>
            <p className="text-xs text-muted-foreground">(f) Brokerage commissions are not set by law and are fully negotiable.</p>
          </div>
        </div>

        {/* Section 9 */}
        <div>
          <p className="font-bold mb-1">9. Cooperation with and Compensation to Other Brokers:</p>
          <p>
            Seller is advised and aware that Seller may, but is not required to, compensate a buyer's broker upon closing.
            Seller may choose to enter into a separate written agreement to pay buyer's broker or may approve Broker to pay
            buyer's broker in accordance with paragraph 10. Seller also understands:
          </p>
          <div className="ml-4 space-y-1 mt-2 text-[12px]">
            <p>(a) "Buyer's broker" may include this Broker if Broker also works with buyer on this transaction;</p>
            <p>(b) If this occurs, Broker will be entitled to the compensation in paragraph 8 for Seller services, as well as the buyer's broker compensation in paragraph 10 for buyer services;</p>
            <p>(c) Broker may receive separate compensation from buyer for services rendered to buyer by Broker.</p>
          </div>
        </div>

        {/* Page footer 3 */}
        <div className="border-t pt-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 3 of 6.</p>
          <p className="mt-1">ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>

        {/* Section 10 */}
        <div className="border-t pt-4">
          <p className="font-bold mb-1">10. Compensation to Buyer Brokers:</p>
          <p className="mb-2 text-xs text-muted-foreground">Brokerage commissions are not set by law and are fully negotiable.</p>
          <p className="mb-2">Seller approves the following:</p>
          <div className="ml-4 space-y-2">
            <p>
              (a) Seller authorizes Broker to offer compensation to buyer's broker in the amount of:{' '}
              {renderField('buyerBrokerCompPercent', 40)}% of the purchase price or ${renderField('buyerBrokerCompFlat', 100)}.
              This compensation will be set forth in a separate written agreement between Broker and buyer's broker.
            </p>
            <p>(b) No compensation will be offered to buyer's broker.</p>
          </div>
        </div>

        {/* Section 11 */}
        <div>
          <p className="font-bold mb-1">11. Brokerage Relationship:</p>
          <p className="font-bold text-center my-2">NO BROKERAGE RELATIONSHIP NOTICE</p>
          <p className="text-xs mb-2">
            FLORIDA LAW REQUIRES THAT REAL ESTATE LICENSEES WHO HAVE NO BROKERAGE RELATIONSHIP WITH A POTENTIAL
            SELLER OR BUYER DISCLOSE THEIR DUTIES TO SELLERS AND BUYERS.
          </p>
          <p className="mb-2">
            As a real estate licensee who has no brokerage relationship with you,{' '}
            {renderField('brokerName', 200)} and its associates owe to you the following duties:
          </p>
          <div className="ml-4 space-y-1">
            <p>1. Dealing honestly and fairly;</p>
            <p>2. Disclosing all known facts that materially affect the value of residential real property which are not readily observable to the buyer;</p>
            <p>3. Accounting for all funds entrusted to the licensee.</p>
          </div>
        </div>

        {/* Section 12 */}
        <div>
          <p className="font-bold mb-1">12. Conditional Termination:</p>
          <p>
            At Seller's request, Broker may agree to conditionally terminate this Agreement. If Broker agrees to conditional
            termination, Seller must sign a withdrawal agreement, reimburse Broker for all direct expenses incurred in marketing
            the Property, and pay a cancellation fee of ${renderField('cancellationFee', 100)} plus applicable sales tax.
          </p>
        </div>

        {/* Page footer 4 */}
        <div className="border-t pt-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 4 of 6.</p>
          <p className="mt-1">ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>

        {/* Section 13 */}
        <div className="border-t pt-4">
          <p className="font-bold mb-1">13. Dispute Resolution:</p>
          <p>
            This Agreement will be construed under Florida law. All controversies, claims, and other matters in question between
            the parties arising out of or relating to this Agreement or the breach thereof will be settled by first attempting mediation
            under the rules of the American Arbitration Association or other mediator agreed upon by the parties. If litigation arises
            out of this Agreement, the prevailing party will be entitled to recover reasonable attorney's fees and costs.
          </p>
        </div>

        {/* Section 14 */}
        <div>
          <p className="font-bold mb-1">14. Miscellaneous:</p>
          <p>
            This Agreement is binding on Seller's and Broker's heirs, personal representatives, administrators, successors, and assigns.
            Broker may assign this Agreement to another listing office. This Agreement is the entire agreement between Seller and Broker.
            No prior or present agreements or representations will be binding on Seller or Broker unless included in this Agreement.
            Electronic signatures are acceptable and will be binding.
          </p>
        </div>

        {/* Section 15 */}
        <div>
          <p className="font-bold mb-1">15. Additional Terms:</p>
          {renderField('additionalTerms', 600)}
        </div>

        {/* Page footer 5 */}
        <div className="border-t pt-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 5 of 6.</p>
          <p className="mt-1">ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>

        {/* Signature Page */}
        <div className="border-t pt-6">
          <p className="text-center text-[10px] text-muted-foreground mb-6" style={{ fontFamily: 'sans-serif' }}>Page 6 of 6</p>

          {signatureSection ? (
            signatureSection
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="border-b border-foreground/30 pb-1 mb-1">
                      <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Seller's Signature</span>
                    </div>
                    <div className="h-8" />
                  </div>
                  <div className="text-xs">Date: _______________</div>
                  <div className="text-xs">Home Telephone: {renderField('sellerPhone', 150)}</div>
                  <div className="text-xs">Work Telephone: {renderField('sellerWorkPhone', 150)}</div>
                  <div className="text-xs">Address: {renderField('sellerAddress', 200)}</div>
                  <div className="text-xs">Email: {renderField('sellerEmail', 200)}</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="border-b border-foreground/30 pb-1 mb-1">
                      <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Broker or Authorized Sales Associate</span>
                    </div>
                    <div className="h-8" />
                  </div>
                  <div className="text-xs">Date: _______________</div>
                  <div className="text-xs">Brokerage Firm: {renderField('brokerCompany', 200)}</div>
                  <div className="text-xs">Telephone: {renderField('brokerPhone', 150)}</div>
                  <div className="text-xs">Address: {renderField('brokerAddress', 200)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Final footer */}
        <div className="border-t pt-2 mt-6 text-[10px] text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>
          <p>ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®</p>
        </div>
      </div>
    </div>
  );
}
