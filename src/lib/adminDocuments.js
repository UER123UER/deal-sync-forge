const CHECKLIST_NAME_OVERRIDES = {
  'Exclusive Right of Sale Listing Agreement Transaction Broker_ERS-21tb.pdf':
    'Exclusive Right of Sale Listing Agreement',
  'Sellers Property Disclosure - Residential_SPDR-4x.pdf':
    'Sellers Property Disclosure - Residential',
  'Compensation Agreement -Owner-Listing Broker to Tenants Broker_CAOT-2.pdf':
    'Compensation Agreement - Owner/Listing Broker to Tenants Broker',
  'Compensation Agreement - Seller or Sellers Broker to Buyers Broker_CASSB-1.pdf':
    'Compensation Agreement - Seller or Sellers Broker to Buyers Broker',
  'Modification to Compensation Agreement_MCSB-1.pdf':
    'Modification to Compensation Agreement - Seller or Sellers Broker to Buyers Broker',
};

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export const stripPdfExtension = (value = '') =>
  String(value).replace(/\.pdf$/i, '').trim();

export const normalizeDocumentName = (value = '') =>
  stripPdfExtension(value)
    .toLowerCase()
    .replace(/[_.,()/-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildTokenList = (value = '') =>
  normalizeDocumentName(value)
    .split(' ')
    .filter((token) => token.length > 2);

export const formatChecklistNameFromFileName = (fileName = '') => {
  const trimmed = String(fileName).trim();
  if (!trimmed) return '';

  if (CHECKLIST_NAME_OVERRIDES[trimmed]) {
    return CHECKLIST_NAME_OVERRIDES[trimmed];
  }

  return stripPdfExtension(trimmed)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const buildAdminDocumentCatalog = (adminDocuments = []) => {
  const catalogByChecklist = new Map();

  for (const adminDocument of adminDocuments) {
    if (!adminDocument?.file_name) continue;

    const checklistName = formatChecklistNameFromFileName(adminDocument.file_name);
    const normalizedChecklistName = normalizeDocumentName(checklistName);

    if (!normalizedChecklistName || catalogByChecklist.has(normalizedChecklistName)) {
      continue;
    }

    catalogByChecklist.set(normalizedChecklistName, {
      ...adminDocument,
      checklistName,
      normalizedChecklistName,
      hasDigitalForm: true,
    });
  }

  return Array.from(catalogByChecklist.values())
    .sort((left, right) => collator.compare(left.checklistName, right.checklistName))
    .map((entry, index) => ({
      ...entry,
      sortOrder: index,
    }));
};

export const findMatchingAdminDocument = (checklistName, adminDocuments = []) => {
  const normalizedChecklistName = normalizeDocumentName(checklistName);
  const checklistTokens = buildTokenList(checklistName);

  if (!normalizedChecklistName) return null;

  let bestMatch = null;
  let bestScore = -1;

  for (const adminDocument of adminDocuments) {
    if (!adminDocument?.file_name) continue;

    const derivedChecklistName = formatChecklistNameFromFileName(adminDocument.file_name);
    const candidateNames = [
      derivedChecklistName,
      stripPdfExtension(adminDocument.file_name),
      adminDocument.file_name,
    ];

    let candidateScore = -1;

    for (const candidateName of candidateNames) {
      const normalizedCandidateName = normalizeDocumentName(candidateName);
      if (!normalizedCandidateName) continue;

      if (normalizedCandidateName === normalizedChecklistName) {
        candidateScore = 100;
        break;
      }

      if (
        normalizedCandidateName.includes(normalizedChecklistName) ||
        normalizedChecklistName.includes(normalizedCandidateName)
      ) {
        candidateScore = Math.max(candidateScore, 80);
      }

      const candidateTokens = new Set(buildTokenList(candidateName));
      const matchedTokens = checklistTokens.filter((token) => candidateTokens.has(token)).length;

      if (matchedTokens > 0) {
        const overlapScore =
          Math.round((matchedTokens / Math.max(checklistTokens.length, candidateTokens.size, 1)) * 60) +
          matchedTokens;
        candidateScore = Math.max(candidateScore, overlapScore);
      }
    }

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestMatch = {
        ...adminDocument,
        checklistName: derivedChecklistName,
      };
    }
  }

  return bestScore >= 2 ? bestMatch : null;
};
