import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfCanvas } from '@/components/admin/PdfCanvas';
import { PdfEditorSidebar, type SidebarTab, type Signer, type SavedDocument } from '@/components/admin/PdfEditorSidebar';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import type { ToolMode } from '@/components/admin/PdfToolbar';
import { Button } from '@/components/ui/button';
import {
  Upload, ChevronLeft, ChevronRight, ArrowLeft,
  ZoomIn, ZoomOut, HelpCircle, Printer, Download, Save,
  FileText, Trash2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageData {
  imageUrl: string;
  width: number;
  height: number;
}

export default function AdminPdfEditor() {
  const navigate = useNavigate();
  const { documentId: routeDocId } = useParams<{ documentId?: string }>();
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [hasSelection, setHasSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(routeDocId || null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [initialsDataUrl, setInitialsDataUrl] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureModalMode, setSignatureModalMode] = useState<'sign' | 'initials'>('sign');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);

  // Sidebar state
  const [activeTab, setActiveTab] = useState<SidebarTab | null>('signers');
  const [signers, setSigners] = useState<Signer[]>([]);
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null);

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const annotationsPerPage = useRef<Record<number, string>>({});

  // Fetch saved documents list
  const fetchSavedDocuments = useCallback(async () => {
    const { data } = await supabase
      .from('admin_documents')
      .select('id, file_name, updated_at')
      .order('updated_at', { ascending: false });
    if (data) setSavedDocuments(data);
  }, []);

  useEffect(() => {
    fetchSavedDocuments();
  }, [fetchSavedDocuments]);

  // Load document from route param
  useEffect(() => {
    if (routeDocId) {
      loadDocument(routeDocId);
    }
  }, [routeDocId]);

  // Load cached signature/initials
  useEffect(() => {
    const sig = localStorage.getItem('admin_signature');
    const ini = localStorage.getItem('admin_initials');
    if (sig) setSignatureDataUrl(sig);
    if (ini) setInitialsDataUrl(ini);
  }, []);

  const loadDocument = async (docId: string) => {
    setIsLoading(true);
    try {
      const { data: doc, error } = await supabase
        .from('admin_documents')
        .select('*')
        .eq('id', docId)
        .single();
      if (error || !doc) throw error || new Error('Document not found');

      setDocumentId(doc.id);
      setFileName(doc.file_name);
      setStoragePath(doc.storage_path);

      // Download PDF from storage
      const { data: fileData, error: dlError } = await supabase.storage
        .from('admin-documents')
        .download(doc.storage_path);
      if (dlError || !fileData) throw dlError || new Error('Download failed');

      const arrayBuffer = await fileData.arrayBuffer();
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
        pageDataArr.push({ imageUrl: canvas.toDataURL('image/png'), width: viewport.width, height: viewport.height });
      }
      setPages(pageDataArr);
      setCurrentPage(0);

      // Restore annotations
      const annotations = (doc.annotations as Record<string, any>) || {};
      annotationsPerPage.current = {};
      Object.entries(annotations).forEach(([key, val]) => {
        annotationsPerPage.current[parseInt(key)] = typeof val === 'string' ? val : JSON.stringify(val);
      });

      // Load first page annotations after canvas initializes
      setTimeout(() => {
        const fc = fabricCanvasRef.current;
        if (fc && annotationsPerPage.current[0]) {
          fc.loadFromJSON(JSON.parse(annotationsPerPage.current[0])).then(() => {
            fc.backgroundColor = 'transparent';
            fc.renderAll();
          });
        }
      }, 300);

      toast.success(`Opened "${doc.file_name}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!storagePath) { toast.error('No document uploaded'); return; }
    setIsSaving(true);
    saveCurrentPageAnnotations();
    try {
      const allAnnotations = { ...annotationsPerPage.current };
      const designatedFields: any[] = [];
      Object.entries(allAnnotations).forEach(([pageIdx, json]) => {
        const parsed = JSON.parse(json);
        parsed.objects?.forEach((obj: any) => {
          if (obj.customType?.startsWith('designated-')) {
            designatedFields.push({ page: parseInt(pageIdx), type: obj.fieldType, left: obj.left, top: obj.top, width: obj.width, height: obj.height });
          }
        });
      });
      if (documentId) {
        await supabase.from('admin_documents').update({
          annotations: allAnnotations as any,
          designated_fields: designatedFields as any,
          updated_at: new Date().toISOString(),
        }).eq('id', documentId);
      } else {
        const { data, error } = await supabase.from('admin_documents').insert({
          file_name: fileName,
          storage_path: storagePath,
          annotations: allAnnotations as any,
          designated_fields: designatedFields as any,
        }).select().single();
        if (error) throw error;
        setDocumentId(data.id);
      }
      toast.success('Document saved');
      fetchSavedDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setIsLoading(true);
    setFileName(file.name);
    try {
      const path = `pdfs/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('admin-documents').upload(path, file);
      if (uploadError) throw uploadError;
      setStoragePath(path);

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
        pageDataArr.push({ imageUrl: canvas.toDataURL('image/png'), width: viewport.width, height: viewport.height });
      }
      setPages(pageDataArr);
      setCurrentPage(0);
      annotationsPerPage.current = {};
      setDocumentId(null);
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
      // Auto-save to Supabase on page change
      if (storagePath) {
        setTimeout(() => handleSave(), 200);
      }
    }
  };

  const handleDeleteSelection = useCallback(() => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;

    const activeObjects = fc.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => fc.remove(obj));
    fc.discardActiveObject();
    fc.renderAll();
    setHasSelection(false);

    if (pages.length > 0) {
      annotationsPerPage.current[currentPage] = JSON.stringify(fc.toJSON());
    }
  }, [currentPage, pages.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      const activeObject = fabricCanvasRef.current?.getActiveObject();
      if (!activeObject) return;

      event.preventDefault();
      handleDeleteSelection();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDeleteSelection]);

  const handleOpenDocument = (id: string) => {
    // Save current work first
    if (storagePath && pages.length > 0) {
      saveCurrentPageAnnotations();
    }
    navigate(`/admin/pdf-editor/${id}`);
    loadDocument(id);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await supabase.from('admin_documents').delete().eq('id', id);
      toast.success('Document deleted');
      fetchSavedDocuments();
      if (documentId === id) {
        setPages([]);
        setDocumentId(null);
        setFileName('');
        setStoragePath('');
        annotationsPerPage.current = {};
      }
    } catch (err: any) {
      toast.error('Delete failed');
    }
  };

  const handleAddSigner = (signer: Omit<Signer, 'id'>) => {
    setSigners((prev) => [...prev, { ...signer, id: crypto.randomUUID() }]);
  };

  const handleRemoveSigner = (id: string) => {
    setSigners((prev) => prev.filter((s) => s.id !== id));
    if (selectedSignerId === id) setSelectedSignerId(null);
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
    toast.success(`${signatureModalMode === 'sign' ? 'Signature' : 'Initials'} saved`);
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header bar */}
      <div className="h-12 border-b bg-card flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-1 ml-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(25, z - 25))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-medium min-w-[40px] text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-foreground">{fileName || 'Untitled Document'}</span>
        </div>

        <div className="flex items-center gap-1">
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()} title="Upload PDF">
            <Upload className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Help">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave} disabled={isSaving} title="Save">
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDeleteSelection}
            disabled={!hasSelection}
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button size="sm" className="ml-2 bg-[#2D5F2B] hover:bg-[#234A22] text-white gap-1">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main area: PDF + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF workspace */}
        <div className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center py-6 gap-4">
          {pages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-2xl px-4">
              <div className="text-center text-muted-foreground">
                <Upload className="w-12 h-12 opacity-40 mx-auto mb-3" />
                <p className="text-lg mb-3">Upload a PDF to get started</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Choose File'}
                </Button>
              </div>

              {savedDocuments.length > 0 && (
                <div className="w-full border rounded-lg bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Recent Documents</h3>
                  <div className="space-y-2">
                    {savedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleOpenDocument(doc.id)}
                      >
                        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.updated_at ? new Date(doc.updated_at).toLocaleString() : ''}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc.id); }}>
                          Open
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between w-full max-w-3xl px-4">
                <span className="text-sm font-medium text-foreground truncate max-w-[60%]">{fileName}</span>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage + 1} of {pages.length}
                </span>
              </div>

              {currentPageData && (
                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
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
                </div>
              )}

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

        {/* Right sidebar */}
        <PdfEditorSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          signers={signers}
          onAddSigner={handleAddSigner}
          onRemoveSigner={handleRemoveSigner}
          selectedSignerId={selectedSignerId}
          onSelectSigner={setSelectedSignerId}
          documents={fileName ? [{ name: fileName }] : []}
          savedDocuments={savedDocuments}
          onOpenDocument={handleOpenDocument}
          onDeleteDocument={handleDeleteDocument}
        />
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
