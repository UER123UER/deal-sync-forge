import { type ChangeEvent, useMemo, useRef } from 'react';
import { FileText, MoreHorizontal, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CHECKLIST_ITEM_DOCUMENTS_BUCKET,
  getChecklistItemDocumentDisplayName,
  useChecklistItemDocuments,
  useUploadChecklistItemDocument,
} from '@/hooks/useChecklistItemDocuments';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type DefaultChecklistDocument = {
  file_name?: string | null;
  storage_path?: string | null;
} | null | undefined;

type ChecklistDocumentRow = {
  id: string;
  bucket: string;
  fileName: string;
  storagePath: string;
  kind: 'default' | 'uploaded';
};

interface ChecklistDocumentPanelProps {
  dealId: string;
  itemId: string;
  itemName: string;
  defaultDocument?: DefaultChecklistDocument;
}

export function ChecklistDocumentPanel({
  dealId,
  itemId,
  itemName,
  defaultDocument,
}: ChecklistDocumentPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: uploadedDocuments = [],
    error: uploadedDocumentsError,
    isLoading,
  } = useChecklistItemDocuments(dealId, itemId);
  const uploadChecklistDocument = useUploadChecklistItemDocument();

  const documentRows = useMemo(() => {
    const rows: ChecklistDocumentRow[] = [];

    if (defaultDocument?.storage_path) {
      rows.push({
        id: `default-${itemId}`,
        bucket: 'admin-documents',
        fileName: defaultDocument.file_name || `${itemName}.pdf`,
        storagePath: defaultDocument.storage_path,
        kind: 'default',
      });
    }

    return rows.concat(
      uploadedDocuments.map((document) => ({
        id: `uploaded-${document.storagePath}`,
        bucket: CHECKLIST_ITEM_DOCUMENTS_BUCKET,
        fileName: getChecklistItemDocumentDisplayName(document.name),
        storagePath: document.storagePath,
        kind: 'uploaded' as const,
      }))
    );
  }, [defaultDocument?.file_name, defaultDocument?.storage_path, itemId, itemName, uploadedDocuments]);

  const openDocument = (document: ChecklistDocumentRow) => {
    const { data } = supabase.storage.from(document.bucket).getPublicUrl(document.storagePath);

    if (!data?.publicUrl) {
      toast.error('Unable to open this PDF');
      return;
    }

    window.open(data.publicUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadDocument = async (document: ChecklistDocumentRow) => {
    try {
      const { data, error } = await supabase.storage
        .from(document.bucket)
        .download(document.storagePath);

      if (error || !data) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Unable to download this PDF');
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(event.target.files || []);
    const pdfFiles = chosenFiles.filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (chosenFiles.length > 0 && pdfFiles.length === 0) {
      toast.error('Only PDF files can be uploaded here');
      event.target.value = '';
      return;
    }

    let uploadedCount = 0;

    for (const file of pdfFiles) {
      try {
        await uploadChecklistDocument.mutateAsync({ dealId, itemId, file });
        uploadedCount += 1;
      } catch (error: any) {
        toast.error(error?.message ? `Failed to upload ${file.name}: ${error.message}` : `Failed to upload ${file.name}`);
      }
    }

    if (uploadedCount > 0) {
      toast.success(uploadedCount === 1 ? 'PDF uploaded' : `${uploadedCount} PDFs uploaded`);
    }

    event.target.value = '';
  };

  return (
    <div className="border-b bg-muted/20 px-12 py-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Blank PDFs stay first. Uploaded signed PDFs are added below them.
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadChecklistDocument.isPending}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploadChecklistDocument.isPending ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        {isLoading ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">Loading PDFs...</div>
        ) : uploadedDocumentsError ? (
          <div className="px-4 py-3 text-sm text-destructive">Could not load uploaded PDFs right now.</div>
        ) : documentRows.length === 0 ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">
            No PDFs yet. Upload a signed or completed PDF for this checklist item.
          </div>
        ) : (
          documentRows.map((document, index) => (
            <div
              key={document.id}
              className={cn('flex items-center gap-3 px-4 py-3', index > 0 && 'border-t')}
            >
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground">{document.fileName}</div>
                <div className="mt-1">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium',
                      document.kind === 'default'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {document.kind === 'default' ? 'Default blank PDF' : 'Uploaded PDF'}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label={`PDF actions for ${document.fileName}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openDocument(document)}>
                    View PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadDocument(document)}>
                    Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
