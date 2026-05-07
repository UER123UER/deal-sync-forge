import {
  buildAdminDocumentCatalog,
  findMatchingAdminDocument,
  normalizeDocumentName,
  stripPdfExtension,
} from './adminDocuments.js';

const SECTION_TITLES = {
  listing: 'Listing',
  contract: 'Contract',
  company: 'Company Forms',
  additional: 'Additional Forms',
};

const includesWord = (value = '', word = '') =>
  normalizeDocumentName(value).split(' ').includes(normalizeDocumentName(word));

const includesText = (value = '', fragment = '') =>
  normalizeDocumentName(value).includes(normalizeDocumentName(fragment));

const isSaleProperty = (propertyType = '') => includesWord(propertyType, 'sale');
const isLeaseProperty = (propertyType = '') => includesWord(propertyType, 'lease');
const isLandProperty = (propertyType = '') => includesWord(propertyType, 'land');
const isCondoProperty = (propertyType = '') => includesWord(propertyType, 'condo');
const isCommercialProperty = (propertyType = '') => includesWord(propertyType, 'commercial');
const isReferralProperty = (propertyType = '') => includesWord(propertyType, 'referral');
const isSingleFamilyProperty = (propertyType = '') => includesText(propertyType, 'single family');
const isNewConstructionProperty = (propertyType = '') => includesText(propertyType, 'new construction');
const isResidentialProperty = (propertyType = '') =>
  !isCommercialProperty(propertyType) &&
  !isLandProperty(propertyType) &&
  !isReferralProperty(propertyType);
const isResidentialSaleProperty = (propertyType = '') =>
  isSaleProperty(propertyType) && isResidentialProperty(propertyType);
const isResidentialLeaseProperty = (propertyType = '') =>
  isLeaseProperty(propertyType) && isResidentialProperty(propertyType);
const supportsAssociationDocuments = (propertyType = '') =>
  isCondoProperty(propertyType) ||
  isSingleFamilyProperty(propertyType) ||
  isNewConstructionProperty(propertyType);
const isBuyerRepresentation = (representationSide = '') =>
  ['buyer', 'both'].includes(String(representationSide || '').toLowerCase());
const isSellerRepresentation = (representationSide = '') =>
  ['seller', 'both'].includes(String(representationSide || '').toLowerCase());

const DEFAULT_CHECKLIST_DEFINITIONS = [
  {
    key: 'listing_agreement',
    section: 'listing',
    name: (context) => {
      if (isLandProperty(context.propertyType)) {
        return 'Vacant Land Listing Agreement';
      }

      if (isResidentialLeaseProperty(context.propertyType)) {
        return 'Lease Listing Agreement';
      }

      if (isCommercialProperty(context.propertyType) && isLeaseProperty(context.propertyType)) {
        return 'Exclusive Right to Lease - Commercial';
      }

      if (isCommercialProperty(context.propertyType)) {
        return 'Exclusive Right of Sale Listing Agreement - Commercial';
      }

      return 'Exclusive Right of Sale Listing Agreement';
    },
    aliases: ['Listing Agreement'],
    appliesTo: (context) =>
      isSellerRepresentation(context.representationSide) &&
      !isReferralProperty(context.propertyType),
    getDocumentQueries: (context) => {
      if (isLandProperty(context.propertyType)) {
        return ['Vacant Land Listing Agreement'];
      }

      if (isResidentialLeaseProperty(context.propertyType)) {
        return [];
      }

      if (isCommercialProperty(context.propertyType) && isLeaseProperty(context.propertyType)) {
        return ['Exclusive Right to Lease - Commercial'];
      }

      if (isCommercialProperty(context.propertyType)) {
        return [
          'Exclusive Right of Sale Listing Agreement Commercial',
          'Exclusive Right of Sale Listing Agreement - Commercial',
        ];
      }

      return [
        'Exclusive Right of Sale Listing Agreement Transaction Broker',
        'Exclusive Right of Sale Listing Agreement',
        'Exclusive Right Of Sale Listing Agreement Single Agent',
        'Exclusive Right of Sale Listing Agreement Consent to Transition to Transaction Broker',
        'Exclusive Right of Sale Listing Agreement No Brokerage',
      ];
    },
  },
  {
    key: 'association_rider',
    section: 'contract',
    name: (context) =>
      isCondoProperty(context.propertyType) ? 'Condominium Rider' : 'HOA Rider',
    aliases: ['Condo/HOA Rider'],
    appliesTo: (context) => supportsAssociationDocuments(context.propertyType),
    getDocumentQueries: (context) =>
      isCondoProperty(context.propertyType)
        ? [
            'CR-7_A. Condominium Rider',
            'CRSP17x.F.condo addendum',
            'Receipt of Condominium - Cooperative Documents',
            'Condo Governance',
          ]
        : [
            'CR-7_B Homeowners Association HOA - Community Disclosure',
            'CRSP17.J.HOA addendum',
          ],
  },
  {
    key: 'lead_paint',
    section: 'contract',
    name: 'Lead-Based Paint Disclosure',
    appliesTo: (context) =>
      isResidentialProperty(context.propertyType) &&
      !isNewConstructionProperty(context.propertyType),
    getDocumentQueries: () => [
      'CR-7_P. Lead Based Paint Disclosure',
      'CRSP17.U.LBP addendum',
      'Complying With the Lead-based Paint Law',
    ],
  },
  {
    key: 'property_disclosure',
    section: 'contract',
    name: (context) => {
      if (isLandProperty(context.propertyType)) {
        return 'Vacant Land Disclosure Statement';
      }

      if (isCondoProperty(context.propertyType)) {
        return 'Sellers Property Disclosure - Condominium';
      }

      return 'Sellers Property Disclosure - Residential';
    },
    aliases: ['Property Disclosure (SF or Condo)', 'Property Disclosure'],
    appliesTo: (context) =>
      isResidentialProperty(context.propertyType) || isLandProperty(context.propertyType),
    getDocumentQueries: (context) => {
      if (isLandProperty(context.propertyType)) {
        return ['Vacant Land Disclosure Statement'];
      }

      return isCondoProperty(context.propertyType)
        ? [
            'Sellers Property Disclosure - Condominium',
            'Sellers Property Disclosure - Residential',
            'Sellers Property Disclosure Update',
          ]
        : [
            'Sellers Property Disclosure - Residential',
            'Sellers Property Disclosure - Condominium',
            'Sellers Property Disclosure Update',
          ];
    },
  },
  {
    key: 'property_appraiser',
    section: 'listing',
    name: 'Property Appraiser',
    appliesTo: (context) =>
      isSellerRepresentation(context.representationSide) &&
      isSaleProperty(context.propertyType) &&
      !isReferralProperty(context.propertyType),
  },
  {
    key: 'listing_modification',
    section: 'listing',
    name: 'Modification to Listing Agreement',
    appliesTo: (context) =>
      isSellerRepresentation(context.representationSide) &&
      !isReferralProperty(context.propertyType),
    getDocumentQueries: () => ['Modification to Listing Agreement'],
  },
  {
    key: 'mls_active_listing',
    section: 'listing',
    name: 'MLS Listing - Active',
    appliesTo: (context) =>
      isSellerRepresentation(context.representationSide) &&
      !isReferralProperty(context.propertyType),
  },
  {
    key: 'contract',
    section: 'contract',
    name: (context) => {
      if (isLandProperty(context.propertyType)) {
        return 'Vacant Land Contract';
      }

      if (isCommercialProperty(context.propertyType) && isLeaseProperty(context.propertyType)) {
        return 'Commercial Lease / Contract to Lease';
      }

      if (isCommercialProperty(context.propertyType)) {
        return 'Commercial Contract';
      }

      if (isLeaseProperty(context.propertyType) && isCondoProperty(context.propertyType)) {
        return 'Residential Lease - Condo';
      }

      if (isLeaseProperty(context.propertyType) && isSingleFamilyProperty(context.propertyType)) {
        return 'Residential Lease - Single Family Home';
      }

      if (isLeaseProperty(context.propertyType)) {
        return 'Contract to Lease';
      }

      return 'Residential Contract for Sale and Purchase';
    },
    aliases: ['Contract'],
    appliesTo: (context) => !isReferralProperty(context.propertyType),
    getDocumentQueries: (context) => {
      if (isLandProperty(context.propertyType)) {
        return ['Vacant Land Contract'];
      }

      if (isCommercialProperty(context.propertyType) && isLeaseProperty(context.propertyType)) {
        return ['Contract to Lease'];
      }

      if (isCommercialProperty(context.propertyType)) {
        return ['Commercial Contract'];
      }

      if (isLeaseProperty(context.propertyType) && isCondoProperty(context.propertyType)) {
        return [
          'Residential Lease for Apt. or Unit in Multi-Family Rental Housing other than a Duplex',
          'Contract to Lease',
        ];
      }

      if (isLeaseProperty(context.propertyType) && isSingleFamilyProperty(context.propertyType)) {
        return [
          'Residential Lease for Single Family Home and Duplex',
          'Contract to Lease',
        ];
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
      ];
    },
  },
  {
    key: 'addendums_riders',
    section: 'contract',
    name: 'Addendums / Riders',
    appliesTo: (context) => !isReferralProperty(context.propertyType),
  },
  {
    key: 'compensation_agreement',
    section: 'contract',
    name: (context) =>
      isLeaseProperty(context.propertyType)
        ? 'Compensation Agreement - Owner/Listing Broker to Tenants Broker'
        : 'Compensation Agreement - Seller or Sellers Broker to Buyers Broker',
    aliases: ['Compensation Agreement'],
    appliesTo: (context) => !isReferralProperty(context.propertyType),
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
    appliesTo: (context) => !isReferralProperty(context.propertyType),
    getDocumentQueries: () => ['Escrow Deposit Receipt Verification'],
  },
  {
    key: 'insulation_disclosure',
    section: 'contract',
    name: 'Insulation Disclosure for New Residence',
    appliesTo: (context) => isNewConstructionProperty(context.propertyType),
    getDocumentQueries: () => [
      'CR-7_O. Insulation Disclosure for New Residence',
      'CRSP17.M. insulation disclosure addendum',
    ],
  },
  {
    key: 'hopa_rider',
    section: 'contract',
    name: 'HOPA Rider',
    appliesTo: (context) => isResidentialProperty(context.propertyType),
    getDocumentQueries: () => [
      'CR-7_Q. Housing for Older Persons',
      'CRSP17.K.housing for older persons addendum',
    ],
  },
  {
    key: 'flood_disclosure',
    section: 'contract',
    name: 'Flood Disclosure',
    appliesTo: (context) => isResidentialProperty(context.propertyType),
    getDocumentQueries: () => ['CR-7_H. Homeowners - Flood Insurance'],
  },
  {
    key: 'referral_agreement',
    section: 'contract',
    name: 'Referral Agreement',
    appliesTo: (context) => isReferralProperty(context.propertyType),
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
    appliesTo: (context) =>
      isBuyerRepresentation(context.representationSide) &&
      !isReferralProperty(context.propertyType),
  },
  {
    key: 'buyer_broker_agreement',
    section: 'company',
    name: 'Buyer/Broker Agreement',
    appliesTo: (context) =>
      isBuyerRepresentation(context.representationSide) &&
      !isReferralProperty(context.propertyType),
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

const getDefinitionName = (definition, context) =>
  typeof definition.name === 'function' ? definition.name(context) : definition.name;

const getDefinitionAliases = (definition, context) => {
  if (typeof definition.aliases === 'function') {
    return definition.aliases(context).filter(Boolean);
  }

  return (definition.aliases || []).filter(Boolean);
};

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

const getCandidateDocumentNames = (adminDocument = {}) =>
  [
    adminDocument.checklistName,
    stripPdfExtension(adminDocument.file_name),
    adminDocument.file_name,
  ].filter(Boolean);

const doesAdminDocumentMatchQuery = (query, adminDocument) => {
  const normalizedQuery = normalizeDocumentName(query);

  if (!normalizedQuery) return false;

  return getCandidateDocumentNames(adminDocument).some((candidateName) => {
    const normalizedCandidateName = normalizeDocumentName(candidateName);

    return (
      normalizedCandidateName === normalizedQuery ||
      normalizedCandidateName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedCandidateName)
    );
  });
};

const getAdminDocumentsForDefinition = (definition, adminDocuments, context) => {
  const matchesByFileName = new Map();
  const queries = getDefinitionQueries(definition, context);

  for (const query of queries) {
    const exactMatches = adminDocuments.filter((adminDocument) =>
      doesAdminDocumentMatchQuery(query, adminDocument)
    );

    for (const match of exactMatches) {
      if (match?.file_name && !matchesByFileName.has(match.file_name)) {
        matchesByFileName.set(match.file_name, match);
      }
    }

    if (exactMatches.length > 0) continue;
  }

  return Array.from(matchesByFileName.values());
};

export const getDefaultChecklistDefinitions = (context = {}) => {
  const resolvedContext = resolveDefinitionContext(context);
  return DEFAULT_CHECKLIST_DEFINITIONS.filter((definition) => {
    return isDefinitionActive(definition, resolvedContext);
  }).map((definition) => ({
    ...definition,
    name: getDefinitionName(definition, resolvedContext),
  }));
};

const findDefinitionByChecklistName = (checklistName, context = {}) => {
  const normalizedChecklistName = normalizeDocumentName(checklistName);

  return getDefaultChecklistDefinitions(context).find((definition) => {
    const candidateNames = [definition.name, ...getDefinitionAliases(definition, context)];
    return candidateNames.some(
      (candidateName) => normalizeDocumentName(candidateName) === normalizedChecklistName
    );
  });
};

export const resolveChecklistAdminDocument = (
  checklistName,
  adminDocuments = [],
  context = {}
) => {
  const definition = findDefinitionByChecklistName(checklistName, context);

  if (definition) {
    const matches = getAdminDocumentsForDefinition(
      definition,
      adminDocuments,
      resolveDefinitionContext(context)
    );

    if (matches[0]) {
      return {
        ...matches[0],
        checklistName: definition.name,
      };
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
  const resolvedContext = { propertyType, representationSide };

  for (const checklistItem of checklistItems) {
    const definition = findDefinitionByChecklistName(checklistItem.name, resolvedContext);

    if (definition) {
      const definitionMatches = getAdminDocumentsForDefinition(
        definition,
        catalog,
        resolveDefinitionContext(resolvedContext)
      );

      for (const matchedDocument of definitionMatches) {
        if (matchedDocument?.file_name) {
          representedFileNames.add(matchedDocument.file_name);
        }
      }

      continue;
    }

    const matchedDocument = resolveChecklistAdminDocument(checklistItem.name, catalog, resolvedContext);
    if (matchedDocument?.file_name) {
      representedFileNames.add(matchedDocument.file_name);
    }
  }

  return catalog
    .filter((catalogEntry) => !representedFileNames.has(catalogEntry.file_name))
    .sort((left, right) => collator.compare(left.checklistName, right.checklistName));
};
