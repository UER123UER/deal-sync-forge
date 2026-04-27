import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

// Reuse the existing public deal bucket so checklist uploads work immediately
// without waiting on a separate document bucket migration.
export const CHECKLIST_ITEM_DOCUMENTS_BUCKET = 'deal-photos';
const CHECKLIST_ITEM_DOCUMENTS_ROOT = 'checklist-documents';
const UPLOAD_NAME_SEPARATOR = '__';

export interface ChecklistItemDocument {
  name: string;
  storagePath: string;
  url: string;
}

const getChecklistItemDocumentFolder = (dealId: string, itemId: string) =>
  `${CHECKLIST_ITEM_DOCUMENTS_ROOT}/${dealId}/${itemId}`;

const buildStoredChecklistDocumentName = (fileName: string) =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${UPLOAD_NAME_SEPARATOR}${fileName}`;

export const getChecklistItemDocumentDisplayName = (storedName: string) => {
  const separatorIndex = storedName.indexOf(UPLOAD_NAME_SEPARATOR);
  return separatorIndex === -1 ? storedName : storedName.slice(separatorIndex + UPLOAD_NAME_SEPARATOR.length);
};

export function useChecklistItemDocuments(dealId: string | undefined, itemId: string | undefined) {
  return useQuery({
    queryKey: ['checklist_item_documents', dealId, itemId],
    enabled: !!dealId && !!itemId,
    queryFn: async () => {
      const folder = getChecklistItemDocumentFolder(dealId!, itemId!);
      const { data, error } = await supabase.storage
        .from(CHECKLIST_ITEM_DOCUMENTS_BUCKET)
        .list(folder, { sortBy: { column: 'created_at', order: 'desc' } });

      if (error) {
        if (error.message?.toLowerCase().includes('not found')) {
          return [] as ChecklistItemDocument[];
        }

        throw error;
      }

      return (data || [])
        .filter((entry) => !!entry.name)
        .map((entry) => {
          const storagePath = `${folder}/${entry.name}`;
          return {
            name: entry.name,
            storagePath,
            url: supabase.storage.from(CHECKLIST_ITEM_DOCUMENTS_BUCKET).getPublicUrl(storagePath).data.publicUrl,
          };
        }) as ChecklistItemDocument[];
    },
  });
}

export function useUploadChecklistItemDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      itemId,
      file,
    }: {
      dealId: string;
      itemId: string;
      file: File;
    }) => {
      const folder = getChecklistItemDocumentFolder(dealId, itemId);
      const storagePath = `${folder}/${buildStoredChecklistDocumentName(file.name)}`;
      const { error } = await supabase.storage
        .from(CHECKLIST_ITEM_DOCUMENTS_BUCKET)
        .upload(storagePath, file);

      if (error) throw error;
      return { dealId, itemId };
    },
    onSuccess: ({ dealId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_item_documents', dealId, itemId] });
    },
  });
}
