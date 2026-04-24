import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAdminDocumentCatalog,
  normalizeDocumentName,
} from '../src/lib/adminDocuments.js';
import { buildDefaultChecklistItemsForDeal } from '../src/lib/checklistCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultPdfDirectory = 'C:/Users/efact/Downloads/docs/combined_pdfs';

const encodeStoragePath = (value) => value.split('/').map(encodeURIComponent).join('/');

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const parseEnvFile = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
};

const createSupabaseClient = ({ supabaseUrl, supabaseKey }) => {
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const request = async (relativePath, options = {}) => {
    const response = await fetch(`${supabaseUrl}${relativePath}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  return {
    async listAdminDocuments() {
      return (
        (await request(
          '/rest/v1/admin_documents?select=id,file_name,storage_path,annotations,designated_fields,updated_at&order=file_name.asc'
        )) || []
      );
    },

    async insertAdminDocument(payload) {
      return request('/rest/v1/admin_documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });
    },

    async updateAdminDocument(id, payload) {
      return request(`/rest/v1/admin_documents?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });
    },

    async deleteAdminDocuments(ids) {
      for (const group of chunk(ids, 50)) {
        await request(`/rest/v1/admin_documents?id=in.(${group.join(',')})`, {
          method: 'DELETE',
        });
      }
    },

    async listDeals() {
      return (
        (await request('/rest/v1/deals?select=id,address,property_type,representation_side&order=created_at.asc')) || []
      );
    },

    async listChecklistItems() {
      return (
        (await request(
          '/rest/v1/checklist_items?select=id,deal_id,name,sort_order,has_digital_form&order=deal_id.asc,sort_order.asc'
        )) || []
      );
    },

    async insertChecklistItems(payload) {
      return request('/rest/v1/checklist_items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });
    },

    async updateChecklistItem(id, payload) {
      return request(`/rest/v1/checklist_items?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });
    },

    async deleteChecklistItems(ids) {
      for (const group of chunk(ids, 50)) {
        await request(`/rest/v1/checklist_items?id=in.(${group.join(',')})`, {
          method: 'DELETE',
        });
      }
    },

    async listReferencedChecklistItemIds() {
      const rows =
        (await request('/rest/v1/signature_requests?select=checklist_item_id')) || [];

      return new Set(
        rows
          .map((row) => row.checklist_item_id)
          .filter(Boolean)
      );
    },

    async uploadPdf(storagePath, buffer) {
      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/admin-documents/${encodeStoragePath(storagePath)}`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/pdf',
            'x-upsert': 'true',
          },
          body: buffer,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Storage upload failed for ${storagePath}: ${response.status} ${response.statusText} ${errorText}`);
      }

      return response.text();
    },
  };
};

const hasAnnotationData = (value) => {
  if (!value) return false;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return false;
};

const chooseDocumentToKeep = (documents, desiredStoragePath) =>
  [...documents].sort((left, right) => {
    const leftScore =
      Number(left.storage_path === desiredStoragePath) * 100 +
      Number(hasAnnotationData(left.annotations)) * 10 +
      Number(hasAnnotationData(left.designated_fields)) * 5;
    const rightScore =
      Number(right.storage_path === desiredStoragePath) * 100 +
      Number(hasAnnotationData(right.annotations)) * 10 +
      Number(hasAnnotationData(right.designated_fields)) * 5;

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return new Date(right.updated_at || 0).getTime() - new Date(left.updated_at || 0).getTime();
  })[0];

const buildManifest = async (pdfDirectory) => {
  const entries = await fs.readdir(pdfDirectory, { withFileTypes: true });
  const pdfFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));

  const adminDocumentCatalog = buildAdminDocumentCatalog(
    pdfFiles.map((fileName) => ({
      file_name: fileName,
      storage_path: `catalog/${fileName}`,
    }))
  );

  return adminDocumentCatalog.map((entry) => ({
    ...entry,
    localPath: path.join(pdfDirectory, entry.file_name),
  }));
};

const syncAdminDocuments = async ({ manifest, supabase, dryRun }) => {
  const existingDocuments = await supabase.listAdminDocuments();
  const documentsByFileName = new Map();

  for (const adminDocument of existingDocuments) {
    const collection = documentsByFileName.get(adminDocument.file_name) || [];
    collection.push(adminDocument);
    documentsByFileName.set(adminDocument.file_name, collection);
  }

  const keptDocumentIds = new Set();

  for (const entry of manifest) {
    const fileBuffer = await fs.readFile(entry.localPath);

    if (!dryRun) {
      await supabase.uploadPdf(entry.storage_path, fileBuffer);
    }

    const existingForFile = documentsByFileName.get(entry.file_name) || [];
    const documentToKeep = existingForFile.length
      ? chooseDocumentToKeep(existingForFile, entry.storage_path)
      : null;

    if (documentToKeep) {
      keptDocumentIds.add(documentToKeep.id);

      if (!dryRun && documentToKeep.storage_path !== entry.storage_path) {
        await supabase.updateAdminDocument(documentToKeep.id, {
          storage_path: entry.storage_path,
          updated_at: new Date().toISOString(),
        });
      }

      continue;
    }

    if (!dryRun) {
      const insertedRows = await supabase.insertAdminDocument({
        file_name: entry.file_name,
        storage_path: entry.storage_path,
      });

      for (const row of insertedRows || []) {
        keptDocumentIds.add(row.id);
      }
    }
  }

  const desiredFileNames = new Set(manifest.map((entry) => entry.file_name));
  const extraDocumentIds = existingDocuments
    .filter((adminDocument) => {
      if (!desiredFileNames.has(adminDocument.file_name)) return true;
      return !keptDocumentIds.has(adminDocument.id);
    })
    .map((adminDocument) => adminDocument.id);

  if (extraDocumentIds.length && !dryRun) {
    await supabase.deleteAdminDocuments(extraDocumentIds);
  }

  return {
    existingCount: existingDocuments.length,
    removedCount: extraDocumentIds.length,
  };
};

const syncChecklistItems = async ({ manifest, supabase, dryRun }) => {
  const [deals, checklistItems, referencedChecklistItemIds] = await Promise.all([
    supabase.listDeals(),
    supabase.listChecklistItems(),
    supabase.listReferencedChecklistItemIds(),
  ]);

  const checklistItemsByDealId = new Map();

  for (const checklistItem of checklistItems) {
    const collection = checklistItemsByDealId.get(checklistItem.deal_id) || [];
    collection.push(checklistItem);
    checklistItemsByDealId.set(checklistItem.deal_id, collection);
  }

  for (const deal of deals) {
    const existingItems = checklistItemsByDealId.get(deal.id) || [];
    const usedItemIds = new Set();
    const inserts = [];
    const defaultChecklist = buildDefaultChecklistItemsForDeal({
      adminDocuments: manifest,
      propertyType: deal.property_type,
      representationSide: deal.representation_side,
    });

    for (const entry of defaultChecklist) {
      const normalizedChecklistName = normalizeDocumentName(entry.name);
      const matchingItem = existingItems.find(
        (item) =>
          !usedItemIds.has(item.id) &&
          normalizeDocumentName(item.name) === normalizedChecklistName
      );

      if (matchingItem) {
        usedItemIds.add(matchingItem.id);

        const needsUpdate =
          matchingItem.name !== entry.name ||
          matchingItem.sort_order !== entry.sortOrder ||
          matchingItem.has_digital_form !== entry.hasDigitalForm;

        if (needsUpdate && !dryRun) {
          await supabase.updateChecklistItem(matchingItem.id, {
            name: entry.name,
            sort_order: entry.sortOrder,
            has_digital_form: entry.hasDigitalForm,
          });
        }

        continue;
      }

      inserts.push({
        deal_id: deal.id,
        name: entry.name,
        has_digital_form: entry.hasDigitalForm,
        sort_order: entry.sortOrder,
      });
    }

    if (inserts.length && !dryRun) {
      await supabase.insertChecklistItems(inserts);
    }

    const removableItems = existingItems.filter(
      (item) => !usedItemIds.has(item.id) && !referencedChecklistItemIds.has(item.id)
    );

    if (removableItems.length && !dryRun) {
      await supabase.deleteChecklistItems(removableItems.map((item) => item.id));
    }

    const protectedLeftovers = existingItems.filter(
      (item) => !usedItemIds.has(item.id) && referencedChecklistItemIds.has(item.id)
    );

    if (protectedLeftovers.length) {
      console.warn(
        `Skipped deleting ${protectedLeftovers.length} referenced checklist item(s) on deal "${deal.address}".`
      );
    }
  }
};

const verifyCounts = async (supabase) => {
  const [adminDocuments, deals, checklistItems] = await Promise.all([
    supabase.listAdminDocuments(),
    supabase.listDeals(),
    supabase.listChecklistItems(),
  ]);

  const checklistItemsByDealId = new Map();

  for (const checklistItem of checklistItems) {
    const collection = checklistItemsByDealId.get(checklistItem.deal_id) || [];
    collection.push(checklistItem);
    checklistItemsByDealId.set(checklistItem.deal_id, collection);
  }

  return {
    adminDocumentCount: adminDocuments.length,
    checklistCounts: deals.map((deal) => ({
      address: deal.address,
      count: (checklistItemsByDealId.get(deal.id) || []).length,
    })),
  };
};

const main = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const skipDocuments = process.argv.includes('--skip-documents');
  const pdfDirectory =
    process.env.PDF_DIR ||
    process.argv.find((arg) => arg.startsWith('--pdf-dir='))?.split('=')[1] ||
    defaultPdfDirectory;

  const env = await parseEnvFile(path.join(repoRoot, '.env'));
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or publishable key in .env');
  }

  const manifest = await buildManifest(pdfDirectory);
  const uniqueChecklistCount = new Set(
    manifest.map((entry) => normalizeDocumentName(entry.checklistName))
  ).size;

  if (manifest.length !== 137) {
    throw new Error(`Expected 137 PDFs, found ${manifest.length} in ${pdfDirectory}`);
  }

  if (uniqueChecklistCount !== 137) {
    throw new Error(`Expected 137 unique checklist names, found ${uniqueChecklistCount}`);
  }

  const supabase = createSupabaseClient({ supabaseUrl, supabaseKey });

  console.log(`Syncing ${manifest.length} PDFs from ${pdfDirectory}${dryRun ? ' (dry run)' : ''}${skipDocuments ? ' [skip documents]' : ''}...`);

  const documentSyncResult = skipDocuments
    ? { skipped: true }
    : await syncAdminDocuments({ manifest, supabase, dryRun });
  await syncChecklistItems({ manifest, supabase, dryRun });
  const verification = await verifyCounts(supabase);

  console.log(
    JSON.stringify(
      {
        dryRun,
        skipDocuments,
        documentSyncResult,
        verification,
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
