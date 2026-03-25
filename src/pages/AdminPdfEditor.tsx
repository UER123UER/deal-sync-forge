import { useState, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfToolbar, type ToolMode } from '@/components/admin/PdfToolbar';
import { PdfCanvas } from '@/components/admin/PdfCanvas';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import { Button } from '@/components/ui/button';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageData {
  imageUrl: string;
  width: number;
  height: number;
}

export default function AdminPdfEditor() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [hasSelection, setHasSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [initialsDataUrl, setInitialsDataUrl] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureModalMode, setSignatureModalMode] = useState<'sign' | 'initials'>('sign');
  const [isLoading, setIsLoading] = useState(false);

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store annotations per page
  const annotationsPerPage = useRef<Record<number, string>>({});

  const saveCurrentPageAnnotations = useCallback(() => {
    const fc = fabricCanvasRef.current;
    if (fc && pages.length > 0) {
      annotationsPerPage.current[currentPage] = JSON.stringify(fc.toJSON());
    }
  }, [currentPage, pages.length]);

  const loadPageAnnotations = useCallback((pageIndex: number) => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const saved = annotationsPerPage.current[pageIndex];
    if (saved) {
      fc.loadFromJSON(JSON.parse(saved)).then(() => {
        fc.backgroundColor = 'transparent';
        fc.renderAll();
      });
    } else {
      fc.clear();
      fc.backgroundColor = 'transparent';
      fc.renderAll();
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      // Upload to Supabase storage
      const path = `pdfs/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('admin-documents')
        .upload(path, file);
      if (uploadError) throw uploadError;
      setStoragePath(path);

      // Render PDF pages
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const scale = 1.5;
      const pageDataArr: PageData[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageDataArr.push({
          imageUrl: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(pageDataArr);
      setCurrentPage(0);
      annotationsPerPage.current = {};
      toast.success(`Loaded ${pdf.numPages} page(s)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const changePage = (dir: number) => {
    saveCurrentPageAnnotations();
    const next = currentPage + dir;
    if (next >= 0 && next < pages.length) {
      setCurrentPage(next);
      setTimeout(() => loadPageAnnotations(next), 100);
    }
  };

  const handleDelete = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const active = fc.getActiveObjects();
    active.forEach((obj) => fc.remove(obj));
    fc.discardActiveObject();
    fc.renderAll();
  };

  const handleUndo = () => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const objects = fc.getObjects();
    if (objects.length > 0) {
      fc.remove(objects[objects.length - 1]);
      fc.renderAll();
    }
  };

  const handleSave = async () => {
    if (!storagePath) {
      toast.error('No document uploaded');
      return;
    }
    setIsSaving(true);
    saveCurrentPageAnnotations();

    try {
      const allAnnotations = { ...annotationsPerPage.current };
      // Collect designated fields
      const designatedFields: any[] = [];
      Object.entries(allAnnotations).forEach(([pageIdx, json]) => {
        const parsed = JSON.parse(json);
        parsed.objects?.forEach((obj: any) => {
          if (obj.customType?.startsWith('designated-')) {
            designatedFields.push({
              page: parseInt(pageIdx),
              type: obj.fieldType,
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
            });
          }
        });
      });

      if (documentId) {
        await (supabase as any).from('admin_documents').update({
          annotations: allAnnotations,
          designated_fields: designatedFields,
          updated_at: new Date().toISOString(),
        }).eq('id', documentId);
      } else {
        const { data, error } = await (supabase as any).from('admin_documents').insert({
          file_name: fileName,
          storage_path: storagePath,
          annotations: allAnnotations,
          designated_fields: designatedFields,
        }).select().single();
        if (error) throw error;
        setDocumentId(data.id);
      }

      toast.success('Document saved');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToClient = () => {
    toast.info('Send to Client — coming soon! Save first to persist your annotations.');
  };

  const handleSignatureConfirm = (dataUrl: string) => {
    if (signatureModalMode === 'sign') {
      setSignatureDataUrl(dataUrl);
      localStorage.setItem('admin_signature', dataUrl);
    } else {
      setInitialsDataUrl(dataUrl);
      localStorage.setItem('admin_initials', dataUrl);
    }
    setSignatureModalOpen(false);
    toast.success(`${signatureModalMode === 'sign' ? 'Signature' : 'Initials'} saved — click on the PDF to place it`);
  };

  // Load cached signature/initials from localStorage on mount
  useState(() => {
    const sig = localStorage.getItem('admin_signature');
    const ini = localStorage.getItem('admin_initials');
    if (sig) setSignatureDataUrl(sig);
    if (ini) setInitialsDataUrl(ini);
  });

  const currentPageData = pages[currentPage];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin PDF Editor</h1>
          {fileName && <p className="text-xs text-muted-foreground mt-0.5">{fileName}</p>}
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="gap-2">
            <Upload className="w-4 h-4" />
            {isLoading ? 'Loading...' : 'Upload PDF'}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {pages.length > 0 && (
        <PdfToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onDelete={handleDelete}
          onUndo={handleUndo}
          onSave={handleSave}
          onSendToClient={handleSendToClient}
          hasSelection={hasSelection}
          isSaving={isSaving}
        />
      )}

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-muted/50 flex flex-col items-center py-6 gap-4">
        {pages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Upload className="w-12 h-12 opacity-40" />
            <p className="text-lg">Upload a PDF to get started</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              Choose File
            </Button>
          </div>
        ) : (
          <>
            {currentPageData && (
              <PdfCanvas
                pageImageUrl={currentPageData.imageUrl}
                pageWidth={currentPageData.width}
                pageHeight={currentPageData.height}
                activeTool={activeTool}
                onSelectionChange={setHasSelection}
                fabricCanvasRef={fabricCanvasRef}
                signatureDataUrl={signatureDataUrl}
                initialsDataUrl={initialsDataUrl}
                onRequestSignature={() => { setSignatureModalMode('sign'); setSignatureModalOpen(true); }}
                onRequestInitials={() => { setSignatureModalMode('initials'); setSignatureModalOpen(true); }}
              />
            )}
            {/* Page navigation */}
            {pages.length > 1 && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => changePage(-1)} disabled={currentPage === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <Button variant="outline" size="sm" onClick={() => changePage(1)} disabled={currentPage === pages.length - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <SignatureStampModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onConfirm={handleSignatureConfirm}
        mode={signatureModalMode}
      />
    </div>
  );
}
