import {
  buildAdminDocumentCatalog,
  findMatchingAdminDocument,
  normalizeDocumentName,
} from './adminDocuments.js';

const SECTION_TITLES = {
  listing: 'Listing',
  contract: 'Contract',
  company: 'Company Forms',
  additional: 'Additional Forms',
};

const includesWord = (value = '', word = '') =>
  normalizeDocumentName(value).split(' ').includes(normalizeDocumentName(word));

const isLeaseProperty = (propertyType = '') => includesWord(propertyType, 'lease');
const isLandProperty = (propertyType = '') => includesWord(propertyType, 'land');
const isCondoProperty = (propertyType = '') => includesWord(propertyType, 'condo');
const isBuyerRepresentation = (representationSide = '') =>
  ['buyer', 'both'].includes(String(representationSide || '').toLowerCase());
const isSellerRepresentation = (representationSide = '') =>
  ['seller', 'both'].includes(String(representationSide || '').toLowerCase());

const DEFAULT_CHECKLIST_DEFINITIONS = [
  {
    key: 'listing_agreement',
    section: 'listing',
    name: 'Exclusive Right of Sale Listing Agreement',
    appliesTo: (context) => isSellerRepresentation(context.representationSide),
    getDocumentQueries: () => [
      'Exclusive Right of Sale Listing Agreement',
      'Exclusive Right of Sale Listing Agreement Transaction Broker',
      'Exclusive Right Of Sale Listing Agreement Single Agent',
      'Exclusive Right of Sale Listing Agreement Consent to Transition to Transaction Broker',
      'Exclusive Right of Sale Listing Agreement No Brokerage',
    ],
  },
  {
    key: 'hoa_rider',
    section: 'contract',
    name: 'Condo/HOA Rider',
    getDocumentQueries: (context) =>
      isCondoProperty(context.propertyType)
        ? [
            'CR-7_A. Condominium Rider',
            'CRSP17x.F.condo addendum',
            'Receipt of Condominium - Cooperative Documents',
            'Condo Governance',
            'CR-7_B Homeowners Association HOA - Community Disclosure',
          ]
        : [
            'CR-7_B Homeowners Association HOA - Community Disclosure',
            'CRSP17.J.HOA addendum',
            'Receipt of Condominium - Cooperative Documents',
            'Condo Governance',
            'CR-7_A. Condominium Rider',
          ],
  },
  {
    key: 'lead_paint',
    section: 'contract',
    name: 'Lead-Based Paint Disclosure',
    getDocumentQueries: () => [
      'CR-7_P. Lead Based Paint Disclosure',
      'CRSP17.U.LBP addendum',
      'Complying With the Lead-based Paint Law',
    ],
  },
  {
    key: 'property_disclosure',
    section: 'contract',
    name: 'Property Disclosure (SF or Condo)',
    getDocumentQueries: (context) =>
      isCondoProperty(context.propertyType)
        ? [
            'Sellers Property Disclosure - Condominium',
            'Sellers Property Disclosure - Residential',
            'Sellers Property Disclosure Update',
          ]
        : [
            'Sellers Property Disclosure - Residential',
            'Sellers Property Disclosure - Condominium',
            'Sellers Property Disclosure Update',
          ],
  },
  {
    key: 'property_appraiser',
    section: 'listing',
    name: 'Property Appraiser',
    appliesTo: (context) => isSellerRepresentation(context.representationSide),
  },
  {
    key: 'listing_modification',
    section: 'listing',
    name: 'Modification to Listing Agreement',
    appliesTo: (context) => isSellerRepresentation(context.representationSide),
    getDocumentQueries: () => ['Modification to Listing Agreement'],
  },
  {
    key: 'mls_active_listing',
    section: 'listing',
    name: 'MLS Listing - Active',
    appliesTo: (context) => isSellerRepresentation(context.representationSide),
  },
  {
    key: 'contract',
    section: 'contract',
    name: 'Contract',
    getDocumentQueries: (context) => {
      if (isLandProperty(context.propertyType)) {
        return ['Vacant Land Contract', 'Residential Contract for Sale and Purchase'];
      }

      if (isLeaseProperty(context.propertyType)) {
        return [
          'Contract to Lease',
          'Residential Lease for Single Family Home and Duplex',
          'Residential Lease for Apt. or Unit in Multi-Family Rental Housing other than a Duplex',
        ];
      }

      return [
        'Residential Contract for Sale and Purchase',
        'CRSP17 Contract for Residential Sale and Purchase',
        'Vacant Land Contract',
      ];
    },
  },
  {
    key: 'addendums_riders',
    section: 'contract',
    name: 'Addendums / Riders',
  },
  {
    key: 'compensation_agreement',
    section: 'contract',
    name: 'Compensation Agreement',
    getDocumentQueries: (context) =>
      isLeaseProperty(context.propertyType)
        ? [
            'Compensation Agreement -Owner-Listing Broker to Tenants Broker',
            'Compensation Agreement - Seller or Sellers Broker to Buyers Broker',
            'Commission Agreement',
          ]
        : [
            'Compensation Agreement - Seller or Sellers Broker to Buyers Broker',
            'Compensation Agreement -Owner-Listing Broker to Tenants Broker',
            'Commission Agreement',
          ],
  },
  {
    key: 'escrow_deposits',
    section: 'contract',
    name: 'Escrow Deposits',
    getDocumentQueries: () => ['Escrow Deposit Receipt Verification'],
  },
  {
    key: 'hopa_rider',
    section: 'contract',
    name: 'HOPA Rider',
    getDocumentQueries: () => [
      'CR-7_Q. Housing for Older Persons',
      'CRSP17.K.housing for older persons addendum',
    ],
  },
  {
    key: 'flood_disclosure',
    section: 'contract',
    name: 'Flood Disclosure',
    getDocumentQueries: () => ['CR-7_H. Homeowners - Flood Insurance'],
  },
  {
    key: 'wire_fraud',
    section: 'company',
    name: 'Wire Fraud Prevention Notice',
    getDocumentQueries: () => ['Wire Fraud Prevention Notice'],
  },
  {
    key: 'company_affiants',
    section: 'company',
    name: 'Company Affiants',
  },
  {
    key: 'buyer_tenant_agreement',
    section: 'company',
    name: 'Buyer/Tenant Agreement',
    appliesTo: (context) => isBuyerRepresentation(context.representationSide),
  },
  {
    key: 'buyer_broker_agreement',
    section: 'company',
    name: 'Buyer/Broker Agreement',
    appliesTo: (context) => isBuyerRepresentation(context.representationSide),
    getDocumentQueries: () => [
      'Exclusive Buyer Brokerage Agreement Transaction Broker',
      'Exclusive Buyer Brokerage Agreement Single Agent',
      'Exclusive Buyer Brokerage Agreement Consent to Transition to Transaction Broker',
      'Exclusive Buyer Brokerage Agreement No Brokerage Relationship',
      'Property Pre-touring Agreement',
    ],
  },
];

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const resolveDefinitionContext = (context = {}) => ({
  propertyType: context.propertyType || '',
  representationSide: (context.representationSide || 'seller').toLowerCase(),
});

const isDefinitionActive = (definition, context) => {
  if (typeof definition.appliesTo !== 'function') return true;
  return definition.appliesTo(context);
};

const getDefinitionQueries = (definition, context) => {
  if (typeof definition.getDocumentQueries === 'function') {
    return definition.getDocumentQueries(context).filter(Boolean);
  }

  return [];
};

export const getDefaultChecklistDefinitions = (context = {}) => {
  const resolvedContext = resolveDefinitionContext(context);
  return DEFAULT_CHECKLIST_DEFINITIONS.filter((definition) =>
    isDefinitionActive(definition, resolvedContext)
  );
};

const findDefinitionByChecklistName = (checklistName, context = {}) => {
  const normalizedChecklistName = normalizeDocumentName(checklistName);

  return getDefaultChecklistDefinitions(context).find(
    (definition) => normalizeDocumentName(definition.name) === normalizedChecklistName
  );
};

export const resolveChecklistAdminDocument = (
  checklistName,
  adminDocuments = [],
  context = {}
) => {
  const definition = findDefinitionByChecklistName(checklistName, context);

  if (definition) {
    const queries = getDefinitionQueries(definition, resolveDefinitionContext(context));

    for (const query of queries) {
      const directMatch = adminDocuments.find(
        (adminDocument) =>
          adminDocument?.file_name &&
          normalizeDocumentName(adminDocument.file_name) === normalizeDocumentName(query)
      );

      if (directMatch) {
        return {
          ...directMatch,
          checklistName: definition.name,
        };
      }

      const fuzzyMatch = findMatchingAdminDocument(query, adminDocuments);
      if (fuzzyMatch) {
        return {
          ...fuzzyMatch,
          checklistName: definition.name,
        };
      }
    }

    return null;
  }

  return findMatchingAdminDocument(checklistName, adminDocuments);
};

export const buildDefaultChecklistItemsForDeal = ({
  adminDocuments = [],
  propertyType = '',
  representationSide = 'seller',
} = {}) =>
  getDefaultChecklistDefinitions({ propertyType, representationSide }).map(
    (definition, index) => ({
      key: definition.key,
      name: definition.name,
      section: definition.section,
      hasDigitalForm: !!resolveChecklistAdminDocument(definition.name, adminDocuments, {
        propertyType,
        representationSide,
      }),
      sortOrder: index,
    })
  );

export const getChecklistSectionId = (checklistName, context = {}) =>
  findDefinitionByChecklistName(checklistName, context)?.section || 'additional';

export const getChecklistSectionTitle = (sectionId) =>
  SECTION_TITLES[sectionId] || SECTION_TITLES.additional;

export const buildAddableFormOptions = ({
  adminDocuments = [],
  checklistItems = [],
  propertyType = '',
  representationSide = 'seller',
} = {}) => {
  const catalog = buildAdminDocumentCatalog(adminDocuments);
  const representedFileNames = new Set();

  for (const checklistItem of checklistItems) {
    const matchedDocument = resolveChecklistAdminDocument(
      checklistItem.name,
      catalog,
      { propertyType, representationSide }
    );

    if (matchedDocument?.file_name) {
      representedFileNames.add(matchedDocument.file_name);
    }
  }

  return catalog
    .filter((catalogEntry) => !representedFileNames.has(catalogEntry.file_name))
    .sort((left, right) => collator.compare(left.checklistName, right.checklistName));
};
