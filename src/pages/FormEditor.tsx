import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Save, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeal, useUpdateDeal } from '@/hooks/useDeals';
import { useUpdateContact } from '@/hooks/useContacts';
import { SignaturePanel } from '@/components/deal/SignaturePanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { Canvas as FabricCanvas, IText } from 'fabric';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDF_SCALE = 1.5;

// Field coordinate map — positions in PDF points (will be scaled by PDF_SCALE)
// Calibrated to "Exclusive Right Of Sale Listing Agreement Single Agent ERS-20sa"
const FIELD_MAP: Record<string, { page: number; x: number; y: number; width: number; fontSize: number; fieldKey: string }> = {
  sellerName:       { page: 0, x: 54,  y: 88,  width: 473, fontSize: 10, fieldKey: 'sellerName' },
  brokerCompany:    { page: 0, x: 121, y: 106, width: 400, fontSize: 10, fieldKey: 'brokerCompany' },
  listingStartDate: { page: 0, x: 72,  y: 147, width: 111, fontSize: 10, fieldKey: 'listingStartDate' },
  listingExpiration: { page: 0, x: 333, y: 147, width: 111, fontSize: 10, fieldKey: 'listingExpiration' },
  streetAddress:    { page: 0, x: 167, y: 235, width: 409, fontSize: 10, fieldKey: 'streetAddress' },
  streetAddress2:   { page: 0, x: 90,  y: 251, width: 486, fontSize: 10, fieldKey: 'streetAddress2' },
  legalDescription: { page: 0, x: 175, y: 268, width: 400, fontSize: 10, fieldKey: 'legalDescription' },
  listPrice:        { page: 0, x: 123, y: 376, width: 117, fontSize: 10, fieldKey: 'listPrice' },
  // Page 4 — Signature fields
  sellerSignatureDate1:  { page: 4, x: 447, y: 37, width: 128, fontSize: 10, fieldKey: 'sellerSignatureDate1' },
  sellerPhone1:          { page: 4, x: 140, y: 55, width: 95,  fontSize: 10, fieldKey: 'sellerPhone1' },
  sellerAddress:         { page: 4, x: 100, y: 75, width: 476, fontSize: 10, fieldKey: 'sellerAddress' },
  sellerEmail:           { page: 4, x: 128, y: 93, width: 448, fontSize: 10, fieldKey: 'sellerEmail' },
  sellerSignatureDate2:  { page: 4, x: 447, y: 110, width: 128, fontSize: 10, fieldKey: 'sellerSignatureDate2' },
  sellerPhone2:          { page: 4, x: 140, y: 129, width: 95,  fontSize: 10, fieldKey: 'sellerPhone2' },
  sellerAddress2:        { page: 4, x: 100, y: 148, width: 476, fontSize: 10, fieldKey: 'sellerAddress2' },
  sellerEmail2:          { page: 4, x: 128, y: 166, width: 448, fontSize: 10, fieldKey: 'sellerEmail2' },
  brokerName:            { page: 4, x: 242, y: 185, width: 172, fontSize: 10, fieldKey: 'brokerName' },
  brokerDate:            { page: 4, x: 447, y: 185, width: 128, fontSize: 10, fieldKey: 'brokerDate' },
  brokerFirmName:        { page: 4, x: 161, y: 203, width: 250, fontSize: 10, fieldKey: 'brokerFirmName' },
  brokerPhone:           { page: 4, x: 470, y: 203, width: 106, fontSize: 10, fieldKey: 'brokerPhone' },
  brokerAddress:         { page: 4, x: 100, y: 222, width: 476, fontSize: 10, fieldKey: 'brokerAddress' },
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

  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldValuesRef = useRef<Record<string, string>>({});
  const annotationsPerPage = useRef<Record<number, string>>({});

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

  const checklistItem = (deal?.checklist_items || []).find((ci: any) => ci.id === formId);

  // Build field values from deal data
  useEffect(() => {
    if (!deal) return;
    const s = dealContacts.find((c: any) => c.role === 'Seller');
    const s2 = dealContacts.filter((c: any) => c.role === 'Seller');
    const a = dealContacts.find((c: any) => c.role?.includes('Agent') || c.role?.includes('Broker'));
    const today = new Date().toLocaleDateString('en-US');
    const addr = `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`;

    fieldValuesRef.current = {
      sellerName: s ? `${s.firstName} ${s.lastName}` : '',
      brokerCompany: a?.company || '',
      listingStartDate: deal.listing_start_date || '',
      listingExpiration: deal.listing_expiration || '',
      streetAddress: deal.address || '',
      streetAddress2: `${deal.city}, ${deal.state} ${deal.zip}`,
      legalDescription: '',
      listPrice: deal.price || '',
      sellerSignatureDate1: today,
      sellerPhone1: s?.phone || '',
      sellerAddress: s ? addr : '',
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

  // Load the legal PDF from admin-documents
  useEffect(() => {
    loadPdf();
  }, []);

  const loadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      // Find the ERS listing agreement document
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
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
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

  // Render background image
  useEffect(() => {
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
  }, [pages, currentPage]);

  // Initialize Fabric canvas + place autofill fields
  useEffect(() => {
    const pageData = pages[currentPage];
    if (!pageData || !canvasElRef.current) return;

    // Dispose previous
    if (fabricCanvasRef.current) {
      // Save current page annotations before switching
      const prevJson = fabricCanvasRef.current.toJSON();
      annotationsPerPage.current[currentPage] = JSON.stringify(prevJson);
      fabricCanvasRef.current.dispose();
    }

    const fc = new FabricCanvas(canvasElRef.current, {
      width: pageData.width,
      height: pageData.height,
      selection: true,
      backgroundColor: 'transparent',
    });
    fabricCanvasRef.current = fc;

    // Check if we have saved annotations for this page
    if (annotationsPerPage.current[currentPage]) {
      fc.loadFromJSON(JSON.parse(annotationsPerPage.current[currentPage])).then(() => {
        fc.renderAll();
      });
    } else {
      // Place autofill field overlays for this page
      const fieldsForPage = Object.entries(FIELD_MAP).filter(([, f]) => f.page === currentPage);
      const values = fieldValuesRef.current;

      for (const [key, field] of fieldsForPage) {
        const value = values[field.fieldKey] || '';
        if (!value) continue;

        const text = new IText(value, {
          left: field.x * PDF_SCALE,
          top: field.y * PDF_SCALE,
          fontSize: field.fontSize * PDF_SCALE,
          fontFamily: 'Arial',
          fill: '#000080',
          editable: true,
        });
        (text as any).fieldKey = key;
        fc.add(text);
      }
      fc.renderAll();
    }

    return () => {
      // Save annotations on unmount
      if (fabricCanvasRef.current) {
        const json = fabricCanvasRef.current.toJSON();
        annotationsPerPage.current[currentPage] = JSON.stringify(json);
      }
    };
  }, [pages, currentPage]);

  const saveAnnotations = useCallback(() => {
    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON();
      annotationsPerPage.current[currentPage] = JSON.stringify(json);
    }
  }, [currentPage]);

  const changePage = (dir: number) => {
    saveAnnotations();
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

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Header */}
      <div className="h-14 bg-background border-b flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        </h1>
        <div className="flex items-center gap-2">
          {/* Page Navigation */}
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
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setSignatureOpen(true)}>
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

      {/* Signature Panel */}
      <SignaturePanel
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        documentName={checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        contacts={dealContacts}
        dealId={id || ''}
        checklistItemId={formId}
        formData={fieldValuesRef.current}
      />
    </div>
  );
}
