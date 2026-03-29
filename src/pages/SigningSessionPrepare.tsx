import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Undo2, Redo2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfCanvas, type FontStyle } from '@/components/admin/PdfCanvas';
import { PdfEditorSidebar, type Signer, type SidebarTab } from '@/components/admin/PdfEditorSidebar';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import {
  useSigningSession, useSessionRecipients, useSessionDocuments,
  useUpdateSigningSession, useSaveSessionFields, type SessionRecipient,
} from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import type { ToolMode } from '@/components/admin/PdfToolbar';
import type { Canvas as FabricCanvas } from 'fabric';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SIGNER_COLORS = ['#4F46E5', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777'];

interface PageData { imageUrl: string; width: number; height: number; }

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
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [zoomScale, setZoomScale] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Sidebar
  const [activeTab, setActiveTab] = useState<SidebarTab>('signers');
  const [signers, setSigners] = useState<Signer[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);

  // Signature stamp modal
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stampType, setStampType] = useState<'signature' | 'initials'>('signature');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);

  // Canvas
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const annotationsPerPage = useRef<Record<number, string>>({});

  // Font
  const [fontStyle, setFontStyle] = useState<FontStyle>({ bold: false, italic: false, underline: false, size: 14 });

  // Convert recipients to signers for sidebar
  useEffect(() => {
    if (recipients) {
      const s: Signer[] = recipients.map((r, i) => ({
        id: r.id,
        name: `${r.first_name} ${r.last_name}`,
        email: r.email,
        role: r.type === 'signer' ? 'Signer' : r.type === 'reviewer' ? 'Reviewer' : 'CC',
        type: r.type as any,
        color: SIGNER_COLORS[i % SIGNER_COLORS.length],
      }));
      setSigners(s);
      if (!selectedSigner && s.length) setSelectedSigner(s[0].id);
    }
  }, [recipients]);

  // Load PDF pages from the first document (or deal doc)
  useEffect(() => {
    const loadPdf = async () => {
      // Try to load from session documents first, fall back to deal's form document
      let pdfUrl: string | null = null;
      if (sessionDocs?.length) {
        const { data } = supabase.storage.from('admin-documents').getPublicUrl(sessionDocs[0].storage_path);
        pdfUrl = data.publicUrl;
      } else {
        // Try deal form PDF
        const { data: files } = await supabase.storage.from('admin-documents').list();
        if (files?.length) {
          const { data } = supabase.storage.from('admin-documents').getPublicUrl(files[0].name);
          pdfUrl = data.publicUrl;
        }
      }
      if (!pdfUrl) return;

      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const rendered: PageData[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          rendered.push({ imageUrl: canvas.toDataURL(), width: viewport.width / 2, height: viewport.height / 2 });
        }
        setPages(rendered);
      } catch (e) {
        console.error('Failed to load PDF:', e);
      }
    };
    loadPdf();
  }, [sessionDocs]);

  const saveCurrentAnnotations = useCallback(() => {
    if (fabricCanvasRef.current) {
      annotationsPerPage.current[currentPage] = JSON.stringify(fabricCanvasRef.current.toJSON());
    }
  }, [currentPage]);

  const changePage = (newPage: number) => {
    if (newPage < 0 || newPage >= pages.length) return;
    saveCurrentAnnotations();
    setCurrentPage(newPage);
  };

  const handleCanvasReady = useCallback(() => {
    // Load annotations for current page if they exist
    if (fabricCanvasRef.current && annotationsPerPage.current[currentPage]) {
      fabricCanvasRef.current.loadFromJSON(annotationsPerPage.current[currentPage], () => {
        fabricCanvasRef.current?.renderAll();
      });
    }
  }, [currentPage]);

  const handleCanvasChange = useCallback(() => {
    saveCurrentAnnotations();
  }, [saveCurrentAnnotations]);

  // Collect designated fields from all pages
  const collectFields = () => {
    saveCurrentAnnotations();
    const fields: any[] = [];
    for (const [pageStr, json] of Object.entries(annotationsPerPage.current)) {
      const page = parseInt(pageStr);
      try {
        const data = JSON.parse(json);
        if (data.objects) {
          for (const obj of data.objects) {
            if (obj.designatedField) {
              fields.push({
                session_id: sessionId!,
                document_id: sessionDocs?.[0]?.id || null,
                recipient_id: obj.recipientId || selectedSigner,
                type: obj.designatedField,
                page,
                x: obj.left || 0,
                y: obj.top || 0,
                width: obj.width || 150,
                height: obj.height || 40,
              });
            }
          }
        }
      } catch {}
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

      // Generate signing URLs
      if (recipients?.length) {
        const urls = recipients.map(r =>
          `${window.location.origin}/sign/${r.token}`
        );
        await navigator.clipboard.writeText(urls.join('\n'));
        toast.success(`Session sent! ${urls.length} signing link(s) copied to clipboard.`);
      }

      navigate(`/transactions/${dealId}/signing-sessions`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    }
  };

  const handleStampConfirm = (dataUrl: string) => {
    if (stampType === 'signature') setSavedSignature(dataUrl);
    else setSavedInitials(dataUrl);
    setStampModalOpen(false);
  };

  if (showPreview) {
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
            <div className="text-sm"><span className="text-muted-foreground">Documents:</span> {pages.length} page(s)</div>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-medium">Recipients ({recipients?.length || 0})</h2>
            {recipients?.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SIGNER_COLORS[i % SIGNER_COLORS.length] }} />
                <span className="font-medium">{r.first_name} {r.last_name}</span>
                <span className="text-muted-foreground">{r.email}</span>
                <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize ml-auto">{r.type}</span>
              </div>
            ))}
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Fields Placed</h2>
            <p className="text-sm text-muted-foreground">{collectFields().length} field(s) placed across {pages.length} page(s)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}/signing-session/${sessionId}/setup`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium flex-1">{session?.session_name || 'Field Editor'}</span>

        {/* Signer selector */}
        {signers.length > 0 && (
          <Select value={selectedSigner || ''} onValueChange={setSelectedSigner}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Select signer" />
            </SelectTrigger>
            <SelectContent>
              {signers.map((s, i) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SIGNER_COLORS[i % SIGNER_COLORS.length] }} />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1 border rounded px-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale(z => Math.max(0.25, z - 0.25))}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs w-10 text-center">{Math.round(zoomScale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale(z => Math.min(2, z + 0.25))}>
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>

        <Button variant="default" size="sm" onClick={() => setShowPreview(true)}>
          Next &gt;
        </Button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF workspace */}
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          {pages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading document...</div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {pages.map((page, idx) => (
                <div key={idx} className="relative" style={{ width: page.width * zoomScale, height: page.height * zoomScale }}>
                  {idx === currentPage ? (
                    <PdfCanvas
                      pageImageUrl={page.imageUrl}
                      pageWidth={page.width}
                      pageHeight={page.height}
                      activeTool={activeTool}
                      onSelectionChange={() => {}}
                      onFontStyleChange={setFontStyle}
                      fabricCanvasRef={fabricCanvasRef}
                      signatureDataUrl={savedSignature}
                      initialsDataUrl={savedInitials}
                      zoomScale={zoomScale}
                      onCanvasReady={handleCanvasReady}
                      onCanvasChange={handleCanvasChange}
                    />
                  ) : (
                    <img
                      src={page.imageUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full cursor-pointer border shadow-sm"
                      onClick={() => changePage(idx)}
                      style={{ width: page.width * zoomScale, height: page.height * zoomScale }}
                    />
                  )}
                  <div className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-1 rounded">
                    Page {idx + 1} of {pages.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <PdfEditorSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          signers={signers}
          selectedSigner={selectedSigner}
          onSignerSelect={setSelectedSigner}
          onAddSigner={(s) => setSigners(prev => [...prev, s])}
          onRemoveSigner={(id) => setSigners(prev => prev.filter(s => s.id !== id))}
          savedDocuments={[]}
          currentDocName={session?.session_name || 'Document'}
          onOpenDocument={() => {}}
          onDeleteDocument={() => {}}
          mode="agent"
        />
      </div>

      <SignatureStampModal
        open={stampModalOpen}
        onOpenChange={setStampModalOpen}
        stampType={stampType}
        onConfirm={handleStampConfirm}
      />
    </div>
  );
}
