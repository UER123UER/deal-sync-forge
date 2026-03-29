import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfCanvas } from '@/components/admin/PdfCanvas';
import { PdfEditorSidebar, type Signer, type SidebarTab } from '@/components/admin/PdfEditorSidebar';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import {
  useSigningSession,
  useSessionRecipients,
  useSessionDocuments,
  useUpdateSigningSession,
  useSaveSessionFields,
} from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import type { ToolMode } from '@/components/admin/PdfToolbar';
import type { Canvas as FabricCanvas } from 'fabric';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SIGNER_COLORS = ['#4F46E5', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777'];

interface PageData {
  imageUrl: string;
  width: number;
  height: number;
}

export default function SigningSessionPrepare() {
  const { id: dealId, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSigningSession(sessionId);
  const { data: recipients } = useSessionRecipients(sessionId);
  const { data: sessionDocs } = useSessionDocuments(sessionId);
  const updateSession = useUpdateSigningSession();
  const saveFields = useSaveSessionFields();

  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [zoomScale, setZoomScale] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const [activeTab, setActiveTab] = useState<SidebarTab>('signers');
  const [signers, setSigners] = useState<Signer[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);

  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stampType, setStampType] = useState<'sign' | 'initials'>('sign');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const annotationsByDocument = useRef<Record<string, Record<number, string>>>({});

  const currentDocument =
    sessionDocs?.find((doc) => doc.id === currentDocumentId) || sessionDocs?.[0] || null;

  useEffect(() => {
    if (!recipients) return;

    const nextSigners: Signer[] = recipients.map((recipient) => ({
      id: recipient.id,
      firstName: recipient.first_name,
      lastName: recipient.last_name,
      email: recipient.email,
      role:
        recipient.type === 'signer'
          ? 'Signer'
          : recipient.type === 'reviewer'
            ? 'Reviewer'
            : 'CC',
      type: recipient.type,
    }));

    setSigners(nextSigners);
    if (!selectedSigner && nextSigners.length > 0) {
      setSelectedSigner(nextSigners[0].id);
    }
  }, [recipients, selectedSigner]);

  useEffect(() => {
    if (!sessionDocs?.length) {
      setCurrentDocumentId(null);
      return;
    }

    setCurrentDocumentId((previousId) => {
      if (previousId && sessionDocs.some((doc) => doc.id === previousId)) {
        return previousId;
      }
      return sessionDocs[0].id;
    });
  }, [sessionDocs]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!currentDocument) {
        setPages([]);
        setCurrentPage(0);
        setDocumentError('No documents in this signing session yet.');
        return;
      }

      if (!currentDocument.storage_path) {
        setPages([]);
        setCurrentPage(0);
        setDocumentError(`"${currentDocument.name}" does not have a linked PDF yet.`);
        return;
      }

      setDocumentLoading(true);
      setDocumentError(null);
      setCurrentPage(0);

      try {
        const { data } = supabase.storage
          .from('admin-documents')
          .getPublicUrl(currentDocument.storage_path);
        const pdf = await pdfjsLib.getDocument(data.publicUrl).promise;
        const renderedPages: PageData[] = [];

        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (!context) continue;

          await page.render({ canvasContext: context, viewport }).promise;
          renderedPages.push({
            imageUrl: canvas.toDataURL(),
            width: viewport.width / 2,
            height: viewport.height / 2,
          });
        }

        setPages(renderedPages);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        setPages([]);
        setDocumentError(`Failed to load "${currentDocument.name}".`);
      } finally {
        setDocumentLoading(false);
      }
    };

    loadPdf();
  }, [currentDocument]);

  const saveCurrentAnnotations = useCallback(() => {
    if (!fabricCanvasRef.current || !currentDocumentId) return;

    if (!annotationsByDocument.current[currentDocumentId]) {
      annotationsByDocument.current[currentDocumentId] = {};
    }

    annotationsByDocument.current[currentDocumentId][currentPage] = JSON.stringify(
      fabricCanvasRef.current.toJSON()
    );
  }, [currentDocumentId, currentPage]);

  const changePage = (newPage: number) => {
    if (newPage < 0 || newPage >= pages.length) return;
    saveCurrentAnnotations();
    setCurrentPage(newPage);
  };

  const changeDocument = (documentId: string) => {
    if (documentId === currentDocumentId) return;
    saveCurrentAnnotations();
    setCurrentDocumentId(documentId);
  };

  const handleCanvasReady = useCallback(() => {
    if (!fabricCanvasRef.current || !currentDocumentId) return;

    const pageAnnotations = annotationsByDocument.current[currentDocumentId]?.[currentPage];
    if (!pageAnnotations) return;

    fabricCanvasRef.current.loadFromJSON(pageAnnotations, () => {
      fabricCanvasRef.current?.renderAll();
    });
  }, [currentDocumentId, currentPage]);

  const handleCanvasChange = useCallback(() => {
    saveCurrentAnnotations();
  }, [saveCurrentAnnotations]);

  const collectFields = () => {
    saveCurrentAnnotations();
    const fields: Array<{
      session_id: string;
      document_id: string | null;
      recipient_id: string | null;
      type: string;
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    for (const document of sessionDocs || []) {
      const documentAnnotations = annotationsByDocument.current[document.id];
      if (!documentAnnotations) continue;

      for (const [pageKey, json] of Object.entries(documentAnnotations)) {
        try {
          const parsed = JSON.parse(json);
          if (!parsed.objects) continue;

          for (const object of parsed.objects) {
            if (!object.designatedField) continue;

            fields.push({
              session_id: sessionId!,
              document_id: document.id,
              recipient_id: object.recipientId || selectedSigner,
              type: object.designatedField,
              page: parseInt(pageKey, 10),
              x: object.left || 0,
              y: object.top || 0,
              width: (object.width || 150) * (object.scaleX || 1),
              height: (object.height || 40) * (object.scaleY || 1),
            });
          }
        } catch {
          // Ignore invalid annotation snapshots.
        }
      }
    }

    return fields;
  };

  const handleSend = async () => {
    try {
      const fields = collectFields();
      if (fields.length > 0) {
        await saveFields.mutateAsync({ session_id: sessionId!, fields });
      }

      await updateSession.mutateAsync({
        id: sessionId!,
        status: 'in_progress',
        date_sent: new Date().toISOString(),
      });

      if (recipients?.length) {
        const urls = recipients.map((recipient) => `${window.location.origin}/sign/${recipient.token}`);
        await navigator.clipboard.writeText(urls.join('\n'));
        toast.success(`Session sent! ${urls.length} signing link(s) copied to clipboard.`);
      }

      navigate(`/transactions/${dealId}/signing-sessions`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send');
    }
  };

  const handleStampConfirm = (dataUrl: string) => {
    if (stampType === 'sign') setSavedSignature(dataUrl);
    else setSavedInitials(dataUrl);
    setStampModalOpen(false);
  };

  if (showPreview) {
    const fields = collectFields();
    const linkedDocumentCount = (sessionDocs || []).filter((doc) => !!doc.storage_path).length;

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Review & Send</h1>
          </div>
          <Button onClick={handleSend} disabled={saveFields.isPending || updateSession.isPending}>
            <Send className="w-4 h-4 mr-2" /> Send for Signature
          </Button>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-medium">Session Summary</h2>
            <div className="text-sm"><span className="text-muted-foreground">Subject:</span> {session?.session_name}</div>
            <div className="text-sm"><span className="text-muted-foreground">Message:</span> {session?.email_message}</div>
            <div className="text-sm">
              <span className="text-muted-foreground">Documents:</span> {sessionDocs?.length || 0} selected, {linkedDocumentCount} linked
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-medium">Session Documents</h2>
            {(sessionDocs || []).map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{document.name}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  document.storage_path ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {document.storage_path ? 'Ready' : 'Needs linked PDF'}
                </span>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-medium">Recipients ({recipients?.length || 0})</h2>
            {recipients?.map((recipient, index) => (
              <div key={recipient.id} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SIGNER_COLORS[index % SIGNER_COLORS.length] }} />
                <span className="font-medium">{recipient.first_name} {recipient.last_name}</span>
                <span className="text-muted-foreground">{recipient.email}</span>
                <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize ml-auto">{recipient.type}</span>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Fields Placed</h2>
            <p className="text-sm text-muted-foreground">{fields.length} field(s) placed across {sessionDocs?.length || 0} document(s)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b px-4 py-2 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}/signing-session/${sessionId}/setup`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium flex-1">{session?.session_name || 'Field Editor'}</span>

        {sessionDocs && sessionDocs.length > 1 && (
          <Select value={currentDocumentId || ''} onValueChange={changeDocument}>
            <SelectTrigger className="w-64 h-8 text-xs">
              <SelectValue placeholder="Select document" />
            </SelectTrigger>
            <SelectContent>
              {sessionDocs.map((document) => (
                <SelectItem key={document.id} value={document.id}>
                  {document.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {signers.length > 0 && (
          <Select value={selectedSigner || ''} onValueChange={setSelectedSigner}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Select signer" />
            </SelectTrigger>
            <SelectContent>
              {signers.map((signer, index) => (
                <SelectItem key={signer.id} value={signer.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SIGNER_COLORS[index % SIGNER_COLORS.length] }} />
                    {signer.firstName} {signer.lastName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1 border rounded px-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale((value) => Math.max(0.25, value - 0.25))}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs w-10 text-center">{Math.round(zoomScale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale((value) => Math.min(2, value + 0.25))}>
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>

        <Button variant="default" size="sm" onClick={() => setShowPreview(true)}>
          Next &gt;
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          {documentLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading document...</div>
          ) : pages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {documentError || 'No document selected.'}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {pages.map((page, index) => (
                <div
                  key={`${currentDocumentId || 'document'}-${index}`}
                  className="relative"
                  style={{ width: page.width * zoomScale, height: page.height * zoomScale }}
                >
                  {index === currentPage ? (
                    <PdfCanvas
                      pageImageUrl={page.imageUrl}
                      pageWidth={page.width}
                      pageHeight={page.height}
                      activeTool={activeTool}
                      onSelectionChange={() => {}}
                      fabricCanvasRef={fabricCanvasRef}
                      signatureDataUrl={savedSignature}
                      initialsDataUrl={savedInitials}
                      onRequestSignature={() => {
                        setStampType('sign');
                        setStampModalOpen(true);
                      }}
                      onRequestInitials={() => {
                        setStampType('initials');
                        setStampModalOpen(true);
                      }}
                      zoomScale={zoomScale}
                      onCanvasReady={handleCanvasReady}
                      onCanvasChange={handleCanvasChange}
                    />
                  ) : (
                    <img
                      src={page.imageUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full cursor-pointer border shadow-sm"
                      onClick={() => changePage(index)}
                      style={{ width: page.width * zoomScale, height: page.height * zoomScale }}
                    />
                  )}
                  <div className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-1 rounded">
                    Page {index + 1} of {pages.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PdfEditorSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          signers={signers}
          selectedSignerId={selectedSigner}
          onSelectSigner={setSelectedSigner}
          onAddSigner={(signer) => setSigners((previous) => [...previous, { ...signer, id: crypto.randomUUID() }])}
          onRemoveSigner={(signerId) => setSigners((previous) => previous.filter((signer) => signer.id !== signerId))}
          documents={(sessionDocs || []).map((document) => ({
            name: document.id === currentDocumentId ? `${document.name} (Active)` : document.name,
          }))}
          savedDocuments={[]}
          onOpenDocument={changeDocument}
          onDeleteDocument={() => {}}
          mode="agent"
        />
      </div>

      <SignatureStampModal
        open={stampModalOpen}
        onClose={() => setStampModalOpen(false)}
        onConfirm={handleStampConfirm}
        mode={stampType}
      />
    </div>
  );
}
