import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Save, Send, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeal, useUpdateDeal } from '@/hooks/useDeals';
import { useUpdateContact } from '@/hooks/useContacts';
import { SignaturePanel } from '@/components/deal/SignaturePanel';
import { PdfEditorSidebar, type Signer, type SidebarTab } from '@/components/admin/PdfEditorSidebar';
import { PdfCanvas } from '@/components/admin/PdfCanvas';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { Canvas as FabricCanvas, IText } from 'fabric';
import type { ToolMode } from '@/components/admin/PdfToolbar';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDF_SCALE = 2.0;

// Field coordinate map — calibrated from Ahmed Mendez autofilled ERS-21tb reference
const FIELD_MAP: Record<string, { page: number; x: number; y: number; width: number; fontSize: number; fieldKey: string }> = {
  sellerName:        { page: 0, x: 55,  y: 62,  width: 480, fontSize: 11, fieldKey: 'sellerName' },
  brokerCompany:     { page: 0, x: 82,  y: 84,  width: 440, fontSize: 11, fieldKey: 'brokerCompany' },
  listingStartDate:  { page: 0, x: 72,  y: 120, width: 111, fontSize: 11, fieldKey: 'listingStartDate' },
  listingExpiration: { page: 0, x: 333, y: 120, width: 111, fontSize: 11, fieldKey: 'listingExpiration' },
  streetAddress:     { page: 0, x: 115, y: 168, width: 460, fontSize: 11, fieldKey: 'streetAddress' },
  legalDescription:  { page: 0, x: 130, y: 210, width: 400, fontSize: 11, fieldKey: 'legalDescription' },
  listPrice:         { page: 0, x: 70,  y: 276, width: 150, fontSize: 11, fieldKey: 'listPrice' },
  sellerSignatureDate1: { page: 4, x: 420, y: 18, width: 128, fontSize: 11, fieldKey: 'sellerSignatureDate1' },
  sellerPhone1:         { page: 4, x: 110, y: 37, width: 100, fontSize: 11, fieldKey: 'sellerPhone1' },
  sellerAddress:        { page: 4, x: 74,  y: 59, width: 480, fontSize: 11, fieldKey: 'sellerAddress' },
  sellerEmail:          { page: 4, x: 94,  y: 80, width: 460, fontSize: 11, fieldKey: 'sellerEmail' },
  sellerSignatureDate2: { page: 4, x: 420, y: 100, width: 128, fontSize: 11, fieldKey: 'sellerSignatureDate2' },
  sellerPhone2:         { page: 4, x: 110, y: 120, width: 100, fontSize: 11, fieldKey: 'sellerPhone2' },
  sellerAddress2:       { page: 4, x: 74,  y: 140, width: 480, fontSize: 11, fieldKey: 'sellerAddress2' },
  sellerEmail2:         { page: 4, x: 94,  y: 160, width: 460, fontSize: 11, fieldKey: 'sellerEmail2' },
  brokerName:           { page: 4, x: 200, y: 195, width: 200, fontSize: 11, fieldKey: 'brokerName' },
  brokerDate:           { page: 4, x: 420, y: 195, width: 128, fontSize: 11, fieldKey: 'brokerDate' },
  brokerFirmName:       { page: 4, x: 122, y: 217, width: 250, fontSize: 11, fieldKey: 'brokerFirmName' },
  brokerPhone:          { page: 4, x: 312, y: 217, width: 120, fontSize: 11, fieldKey: 'brokerPhone' },
  brokerAddress:        { page: 4, x: 74,  y: 239, width: 480, fontSize: 11, fieldKey: 'brokerAddress' },
};

interface PageData {
  imageUrl: string;
  width: number;
  height: number;
}

export default function FormEditor() {
  const { id, formId } = useParams<{ id: string; formId: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();
  const updateContact = useUpdateContact();
  const [signatureOpen, setSignatureOpen] = useState(false);

  // Signature prep mode
  const [signaturePrepMode, setSignaturePrepMode] = useState(false);
  // Stored recipient data from the initial panel
  const [recipientData, setRecipientData] = useState<{ to: string[]; subject: string; message: string } | null>(null);
  const [signaturePanelMode, setSignaturePanelMode] = useState<'collect' | 'send'>('collect');
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>('signers');
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null);
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stampModalMode, setStampModalMode] = useState<'sign' | 'initials'>('sign');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [initialsDataUrl, setInitialsDataUrl] = useState<string | null>(null);
  const [designatedFields, setDesignatedFields] = useState<Array<{ type: string; x: number; y: number; page: number; width: number; height: number; signerId?: string }>>([]);

  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Autofill mode refs
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldValuesRef = useRef<Record<string, string>>({});
  const annotationsPerPage = useRef<Record<number, string>>({});
  const prevPageRef = useRef<number>(0);

  // Prep mode canvas ref (used by PdfCanvas component)
  const prepFabricCanvasRef = useRef<FabricCanvas | null>(null);
  const prepAnnotationsPerPage = useRef<Record<number, string>>({});

  const dealContacts = (deal?.deal_contacts || []).map((dc: any) => ({
    id: dc.contact?.id || dc.contact_id,
    role: dc.role || '',
    firstName: dc.contact?.first_name || '',
    lastName: dc.contact?.last_name || '',
    email: dc.contact?.email || '',
    phone: dc.contact?.phone || '',
    company: dc.contact?.company || '',
    commission: dc.contact?.commission || '',
  }));

  const signers: Signer[] = dealContacts.map((c: any) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    role: c.role,
    type: 'Remote Signer',
  }));

  const checklistItem = (deal?.checklist_items || []).find((ci: any) => ci.id === formId);

  // Build field values from deal data
  useEffect(() => {
    if (!deal) return;
    const s = dealContacts.find((c: any) => c.role === 'Seller');
    const s2 = dealContacts.filter((c: any) => c.role === 'Seller');
    const a = dealContacts.find((c: any) => c.role?.includes('Agent') || c.role?.includes('Broker'));
    const today = new Date().toLocaleDateString('en-US');
    const fullAddr = `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`;

    fieldValuesRef.current = {
      sellerName: s ? `${s.firstName} ${s.lastName}` : '',
      brokerCompany: a?.company || '',
      listingStartDate: deal.listing_start_date || '',
      listingExpiration: deal.listing_expiration || '',
      streetAddress: fullAddr,
      legalDescription: '',
      listPrice: deal.price ? Number(deal.price).toLocaleString('en-US') : '',
      sellerSignatureDate1: today,
      sellerPhone1: s?.phone || '',
      sellerAddress: s ? fullAddr : '',
      sellerEmail: s?.email || '',
      sellerSignatureDate2: today,
      sellerPhone2: s2[1]?.phone || '',
      sellerAddress2: '',
      sellerEmail2: s2[1]?.email || '',
      brokerName: a ? `${a.firstName} ${a.lastName}` : '',
      brokerDate: today,
      brokerFirmName: a?.company || '',
      brokerPhone: a?.phone || '',
      brokerAddress: '',
    };
  }, [deal]);

  // Load the legal PDF
  useEffect(() => {
    loadPdf();
  }, []);

  const loadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const { data: docs, error } = await supabase
        .from('admin_documents')
        .select('*')
        .or('file_name.ilike.%ERS%,file_name.ilike.%Listing Agreement%,file_name.ilike.%Exclusive Right%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!docs || docs.length === 0) {
        setPdfError('No listing agreement PDF found. Please upload one in the Admin PDF Editor first.');
        setPdfLoading(false);
        return;
      }

      const doc = docs[0];
      const { data: fileData, error: dlError } = await supabase.storage
        .from('admin-documents')
        .download(doc.storage_path);

      if (dlError) throw dlError;

      const arrayBuffer = await fileData.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const renderedPages: PageData[] = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: PDF_SCALE });
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);
        await page.render({ canvasContext: ctx, viewport }).promise;
        renderedPages.push({
          imageUrl: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(renderedPages);
      setCurrentPage(0);
    } catch (err: any) {
      console.error('PDF load error:', err);
      setPdfError(`Failed to load PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // ── AUTOFILL MODE: Render background image ──
  useEffect(() => {
    if (signaturePrepMode) return;
    const pageData = pages[currentPage];
    if (!pageData || !bgCanvasRef.current) return;
    const bgCanvas = bgCanvasRef.current;
    bgCanvas.width = pageData.width;
    bgCanvas.height = pageData.height;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, pageData.width, pageData.height);
      ctx.drawImage(img, 0, 0, pageData.width, pageData.height);
    };
    img.src = pageData.imageUrl;
  }, [pages, currentPage, signaturePrepMode]);

  // ── AUTOFILL MODE: Initialize Fabric canvas + place autofill fields ──
  useEffect(() => {
    if (signaturePrepMode) return;
    const pageData = pages[currentPage];
    if (!pageData || !canvasElRef.current) return;

    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON();
      annotationsPerPage.current[prevPageRef.current] = JSON.stringify(json);
      fabricCanvasRef.current.dispose();
    }

    const fc = new FabricCanvas(canvasElRef.current, {
      width: pageData.width,
      height: pageData.height,
      selection: true,
      backgroundColor: 'transparent',
    });
    fabricCanvasRef.current = fc;
    prevPageRef.current = currentPage;

    if (annotationsPerPage.current[currentPage]) {
      fc.loadFromJSON(JSON.parse(annotationsPerPage.current[currentPage])).then(() => {
        fc.renderAll();
      });
    } else {
      const fieldsForPage = Object.entries(FIELD_MAP).filter(([, f]) => f.page === currentPage);
      const values = fieldValuesRef.current;

      for (const [key, field] of fieldsForPage) {
        const value = values[field.fieldKey] || '';
        if (!value) continue;

        const text = new IText(value, {
          left: field.x * PDF_SCALE,
          top: field.y * PDF_SCALE,
          fontSize: field.fontSize * PDF_SCALE,
          fontFamily: 'Helvetica, Arial, sans-serif',
          fill: '#000000',
          editable: true,
        });
        (text as any).fieldKey = key;
        fc.add(text);
      }
      fc.renderAll();
    }

    return () => {
      if (fabricCanvasRef.current) {
        const json = fabricCanvasRef.current.toJSON();
        annotationsPerPage.current[currentPage] = JSON.stringify(json);
      }
    };
  }, [pages, currentPage, signaturePrepMode]);

  const saveAnnotations = useCallback(() => {
    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON();
      annotationsPerPage.current[currentPage] = JSON.stringify(json);
    }
  }, [currentPage]);

  const changePage = (dir: number) => {
    if (!signaturePrepMode) saveAnnotations();
    // Save prep mode annotations
    if (signaturePrepMode && prepFabricCanvasRef.current) {
      const json = prepFabricCanvasRef.current.toJSON();
      prepAnnotationsPerPage.current[currentPage] = JSON.stringify(json);
    }
    const next = currentPage + dir;
    if (next >= 0 && next < pages.length) {
      setCurrentPage(next);
    }
  };

  const handleClose = () => navigate(`/transactions/${id}`);

  const handleSave = async () => {
    saveAnnotations();
    toast.success('Form annotations saved');
  };

  // ── SIGNATURE PREP MODE handlers ──
  const handleSendForSignature = () => {
    saveAnnotations();
    setSignaturePanelMode('collect');
    setSignatureOpen(true);
  };

  const handleContinueToPrep = (data: { to: string[]; subject: string; message: string }) => {
    setRecipientData(data);
    setSignatureOpen(false);
    setSignaturePrepMode(true);
    setActiveTool('select');
    setSidebarTab('signers');
  };

  const handleExitPrepMode = () => {
    setSignaturePrepMode(false);
    setActiveTool('select');
    setSidebarTab(null);
    setRecipientData(null);
  };

  const collectDesignatedFields = (): Array<{ type: string; x: number; y: number; page: number; width: number; height: number; signerId?: string }> => {
    // Save current page annotations first
    if (prepFabricCanvasRef.current) {
      const json = prepFabricCanvasRef.current.toJSON();
      prepAnnotationsPerPage.current[currentPage] = JSON.stringify(json);
    }

    const fields: Array<{ type: string; x: number; y: number; page: number; width: number; height: number; signerId?: string }> = [];
    
    for (const [pageIdx, jsonStr] of Object.entries(prepAnnotationsPerPage.current)) {
      try {
        const parsed = JSON.parse(jsonStr);
        const objects = parsed.objects || [];
        for (const obj of objects) {
          if (obj.customType && obj.customType.startsWith('designated-') && !obj.customType.endsWith('-label')) {
            fields.push({
              type: obj.fieldType || obj.customType.replace('designated-', ''),
              x: obj.left,
              y: obj.top,
              page: parseInt(pageIdx),
              width: obj.width || 160,
              height: obj.height || 30,
              signerId: selectedSignerId || undefined,
            });
          }
        }
      } catch {
        // skip invalid JSON
      }
    }

    return fields;
  };

  const handleFinalSend = () => {
    const fields = collectDesignatedFields();
    setDesignatedFields(fields);
    setSignaturePanelMode('send');
    setSignatureOpen(true);
  };

  const handleStampConfirm = (dataUrl: string) => {
    if (stampModalMode === 'sign') {
      setSignatureDataUrl(dataUrl);
    } else {
      setInitialsDataUrl(dataUrl);
    }
    setStampModalOpen(false);
  };

  // ── PREP MODE: restore annotations when switching pages ──
  useEffect(() => {
    if (!signaturePrepMode) return;
    const fc = prepFabricCanvasRef.current;
    if (!fc) return;
    
    const savedJson = prepAnnotationsPerPage.current[currentPage];
    if (savedJson) {
      fc.loadFromJSON(JSON.parse(savedJson)).then(() => {
        fc.renderAll();
      });
    }
  }, [currentPage, signaturePrepMode]);

  if (isLoading || pdfLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-destructive">{pdfError}</p>
        <Button variant="outline" onClick={handleClose}>Go Back</Button>
      </div>
    );
  }

  const pageData = pages[currentPage];

  // ━━━ SIGNATURE PREP MODE RENDER ━━━
  if (signaturePrepMode) {
    return (
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Prep Header */}
        <div className="h-14 bg-background border-b flex items-center px-6 flex-shrink-0">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 mr-4" onClick={handleExitPrepMode}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <h1 className="text-sm font-semibold text-foreground truncate flex-1">
            Prepare for Signing — {checklistItem?.name || 'Listing Agreement'}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={currentPage === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {pages.length}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={currentPage === pages.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button size="sm" className="text-xs gap-1.5" onClick={handleFinalSend}>
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>

        {/* Prep Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Canvas area */}
          <div className="flex-1 overflow-auto py-8">
            <div className="flex justify-center">
              {pageData && (
                <PdfCanvas
                  pageImageUrl={pageData.imageUrl}
                  pageWidth={pageData.width}
                  pageHeight={pageData.height}
                  activeTool={activeTool}
                  onSelectionChange={() => {}}
                  fabricCanvasRef={prepFabricCanvasRef}
                  signatureDataUrl={signatureDataUrl}
                  initialsDataUrl={initialsDataUrl}
                  onRequestSignature={() => { setStampModalMode('sign'); setStampModalOpen(true); }}
                  onRequestInitials={() => { setStampModalMode('initials'); setStampModalOpen(true); }}
                />
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <PdfEditorSidebar
            mode="agent"
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            signers={signers}
            onAddSigner={() => {}}
            onRemoveSigner={() => {}}
            selectedSignerId={selectedSignerId}
            onSelectSigner={setSelectedSignerId}
            documents={[{ name: checklistItem?.name || 'Listing Agreement' }]}
          />
        </div>

        {/* Stamp Modal */}
        <SignatureStampModal
          open={stampModalOpen}
          onClose={() => setStampModalOpen(false)}
          mode={stampModalMode}
          onConfirm={handleStampConfirm}
        />

        {/* Signature Panel */}
        <SignaturePanel
          open={signatureOpen}
          onClose={() => setSignatureOpen(false)}
          documentName={checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
          contacts={dealContacts}
          dealId={id || ''}
          checklistItemId={formId}
          formData={fieldValuesRef.current}
          designatedFields={designatedFields}
          mode={signaturePanelMode}
          onContinue={handleContinueToPrep}
        />
      </div>
    );
  }

  // ━━━ AUTOFILL MODE RENDER ━━━
  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Header */}
      <div className="h-14 bg-background border-b flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-4">
            <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={currentPage === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {pages.length}
            </span>
            <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={currentPage === pages.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleSendForSignature}>
            <Send className="w-3.5 h-3.5" /> Send for Signature
          </Button>
          <Button size="sm" className="text-xs gap-1.5" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
          <button onClick={handleClose} className="p-2 rounded-md hover:bg-muted transition-colors ml-2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div className="flex-1 overflow-auto py-8">
        <div className="flex justify-center">
          {pageData && (
            <div
              ref={containerRef}
              className="relative inline-block border shadow-sm bg-white"
              style={{ width: pageData.width, height: pageData.height }}
            >
              <canvas
                ref={bgCanvasRef}
                className="absolute inset-0"
                style={{ width: pageData.width, height: pageData.height }}
              />
              <canvas
                ref={canvasElRef}
                className="absolute inset-0"
                style={{ width: pageData.width, height: pageData.height }}
              />
            </div>
          )}
        </div>
      </div>
      {/* Signature Panel (collect mode from autofill view) */}
      <SignaturePanel
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        documentName={checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        contacts={dealContacts}
        dealId={id || ''}
        checklistItemId={formId}
        formData={fieldValuesRef.current}
        designatedFields={designatedFields}
        mode={signaturePanelMode}
        onContinue={handleContinueToPrep}
      />
    </div>
  );
}
