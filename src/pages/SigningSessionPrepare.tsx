import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Redo2, Undo2, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfCanvas } from '@/components/admin/PdfCanvas';
import { PdfEditorSidebar, type Signer, type SidebarTab } from '@/components/admin/PdfEditorSidebar';
import { SignatureStampModal } from '@/components/admin/SignatureStampModal';
import {
  fetchSigningSessionByToken,
  useSigningSession,
  useSessionRecipients,
  useSessionDocuments,
  useSessionFields,
  useUpdateSigningSession,
  useSaveSessionFields,
  type SessionField,
} from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import type { ToolMode } from '@/components/admin/PdfToolbar';
import type { Canvas as FabricCanvas } from 'fabric';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const SIGNER_COLORS = ['#4F46E5', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777'];
const EMPTY_CANVAS_SNAPSHOT = JSON.stringify({ version: '6.7.1', objects: [] });

interface PageData {
  imageUrl: string;
  width: number;
  height: number;
}

interface StoredSessionFieldPayload {
  schemaVersion: 1;
  kind: 'interactive' | 'markup';
  tool: string;
  recipientId: string | null;
  object: Record<string, any> | null;
  signedValue: string | null;
}

const INTERACTIVE_FIELD_TYPES = new Set(['signature', 'initials', 'date', 'fullname', 'email', 'time']);
const MARKUP_TYPE_PREFIX = 'markup:';

const isInteractiveFieldType = (type: string | null | undefined) =>
  !!type && INTERACTIVE_FIELD_TYPES.has(type);

const isMarkupFieldType = (type: string | null | undefined) =>
  !!type && type.startsWith(MARKUP_TYPE_PREFIX);

const parseStoredSessionFieldValue = (value: string | null): StoredSessionFieldPayload | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;

    if ('object' in parsed || 'signedValue' in parsed || 'tool' in parsed || 'kind' in parsed) {
      return {
        schemaVersion: 1,
        kind: parsed.kind === 'interactive' ? 'interactive' : 'markup',
        tool: typeof parsed.tool === 'string' ? parsed.tool : 'object',
        recipientId: typeof parsed.recipientId === 'string' ? parsed.recipientId : null,
        object:
          parsed.object && typeof parsed.object === 'object' ? parsed.object as Record<string, any> : null,
        signedValue: typeof parsed.signedValue === 'string' ? parsed.signedValue : null,
      };
    }

    return {
      schemaVersion: 1,
      kind: 'markup',
      tool: typeof (parsed as any).customType === 'string' ? (parsed as any).customType : typeof (parsed as any).type === 'string' ? (parsed as any).type : 'object',
      recipientId: typeof (parsed as any).recipientId === 'string' ? (parsed as any).recipientId : null,
      object: parsed as Record<string, any>,
      signedValue: null,
    };
  } catch {
    return null;
  }
};

const buildStoredSessionFieldValue = (payload: StoredSessionFieldPayload) =>
  JSON.stringify(payload);

const getDesignatedFieldLabel = (type: string) => {
  switch (type) {
    case 'signature':
      return 'SIGN HERE';
    case 'initials':
      return 'INITIALS';
    case 'date':
      return 'MM/DD/YYYY';
    case 'time':
      return 'HH:MM AM/PM';
    default:
      return type;
  }
};

const getDesignatedFieldColors = (type: string) => {
  switch (type) {
    case 'signature':
      return {
        bgColor: 'rgba(255, 200, 0, 0.3)',
        textColor: '#b45309',
      };
    case 'initials':
      return {
        bgColor: 'rgba(59, 130, 246, 0.3)',
        textColor: '#1d4ed8',
      };
    case 'date':
      return {
        bgColor: 'rgba(34, 197, 94, 0.3)',
        textColor: '#15803d',
      };
    case 'time':
      return {
        bgColor: 'rgba(249, 115, 22, 0.3)',
        textColor: '#c2410c',
      };
    default:
      return {
        bgColor: 'rgba(209, 213, 219, 0.3)',
        textColor: '#374151',
      };
  }
};

const buildInteractiveCanvasObject = (field: SessionField) => {
  if (field.type === 'fullname' || field.type === 'email') {
    const label = field.type === 'fullname' ? 'Full Name' : 'Email';
    const color = field.type === 'fullname' ? '#1e40af' : '#7c3aed';
    const fill = field.type === 'fullname' ? 'rgba(30,64,175,0.08)' : 'rgba(124,58,237,0.08)';

    return {
      type: 'group',
      left: field.x,
      top: field.y,
      width: field.width,
      height: field.height,
      scaleX: 1,
      scaleY: 1,
      customType: `designated-${field.type}`,
      fieldType: field.type,
      recipientId: field.recipient_id,
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: field.width,
          height: field.height,
          fill,
          stroke: color,
          strokeWidth: 1.5,
          rx: 4,
          ry: 4,
        },
        {
          type: 'i-text',
          left: 6,
          top: 6,
          text: `${label}: `,
          fontSize: 11,
          fontFamily: 'Arial',
          fill: color,
          fontWeight: 'bold',
          editable: false,
          selectable: false,
          evented: false,
        },
        {
          type: 'i-text',
          left: field.type === 'email' ? 52 : 60,
          top: 7,
          text: field.type === 'email' ? 'email@example.com' : 'Enter full name...',
          fontSize: 11,
          fontFamily: 'Arial',
          fill: '#6b7280',
          fontStyle: 'italic',
          editable: true,
          selectable: false,
          evented: false,
        },
      ],
    };
  }

  const { bgColor, textColor } = getDesignatedFieldColors(field.type);

  return {
    type: 'group',
    left: field.x,
    top: field.y,
    width: field.width,
    height: field.height,
    scaleX: 1,
    scaleY: 1,
    customType: `designated-${field.type}`,
    fieldType: field.type,
    recipientId: field.recipient_id,
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: field.width,
        height: field.height,
        fill: bgColor,
        stroke: textColor,
        strokeWidth: 1.5,
        rx: 4,
        ry: 4,
      },
      {
        type: 'i-text',
        left: 8,
        top: 6,
        text: getDesignatedFieldLabel(field.type),
        fontSize: 13,
        fontFamily: 'Arial',
        fill: textColor,
        fontWeight: 'bold',
        editable: false,
        selectable: false,
        evented: false,
      },
    ],
  };
};

const buildCanvasSnapshotFromFields = (fields: SessionField[]) => {
  const objects = fields
    .map((field) => {
      const storedPayload = parseStoredSessionFieldValue(field.value);

      if (storedPayload?.object) {
        return storedPayload.object;
      }

      if (isInteractiveFieldType(field.type)) {
        return buildInteractiveCanvasObject(field);
      }

      return null;
    })
    .filter(Boolean);

  return JSON.stringify({
    version: '6.7.1',
    objects,
  });
};

export default function SigningSessionPrepare() {
  const { id: dealId, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSigningSession(sessionId);
  const { data: recipients } = useSessionRecipients(sessionId);
  const { data: sessionDocs } = useSessionDocuments(sessionId);
  const { data: sessionFields, refetch: refetchSessionFields } = useSessionFields(sessionId);
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
  const [previewSaving, setPreviewSaving] = useState(false);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  const [activeTab, setActiveTab] = useState<SidebarTab>('signers');
  const [signers, setSigners] = useState<Signer[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);

  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stampType, setStampType] = useState<'sign' | 'initials'>('sign');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const annotationsByDocument = useRef<Record<string, Record<number, string>>>({});
  const historyByDocument = useRef<
    Record<string, Record<number, { snapshots: string[]; index: number }>>
  >({});
  const hydratedSavedFieldsRef = useRef(false);
  const isApplyingHistoryRef = useRef(false);

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
        const RENDER_SCALE = 1.5; // must match SessionSigningView so x/y positions align

        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (!context) continue;

          await page.render({ canvasContext: context, viewport }).promise;
          renderedPages.push({
            imageUrl: canvas.toDataURL(),
            width: viewport.width,   // canvas IS the natural display size at RENDER_SCALE
            height: viewport.height,
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

  // Custom props that Fabric.js won't serialize unless explicitly listed
  const FABRIC_CUSTOM_PROPS = ['fieldType', 'customType', 'recipientId'];

  const updateHistoryControls = useCallback((documentId?: string | null, pageIndex?: number) => {
    if (!documentId && !currentDocumentId) {
      setHistoryState({ canUndo: false, canRedo: false });
      return;
    }

    const resolvedDocumentId = documentId || currentDocumentId;
    const resolvedPageIndex = pageIndex ?? currentPage;
    const entry = resolvedDocumentId
      ? historyByDocument.current[resolvedDocumentId]?.[resolvedPageIndex]
      : null;

    setHistoryState({
      canUndo: !!entry && entry.index > 0,
      canRedo: !!entry && entry.index < entry.snapshots.length - 1,
    });
  }, [currentDocumentId, currentPage]);

  const ensureHistoryEntry = useCallback((documentId: string, pageIndex: number, initialSnapshot: string) => {
    if (!historyByDocument.current[documentId]) {
      historyByDocument.current[documentId] = {};
    }

    if (!historyByDocument.current[documentId][pageIndex]) {
      historyByDocument.current[documentId][pageIndex] = {
        snapshots: [initialSnapshot],
        index: 0,
      };
    }

    return historyByDocument.current[documentId][pageIndex];
  }, []);

  const getCanvasSnapshot = useCallback(() => {
    if (!fabricCanvasRef.current) return EMPTY_CANVAS_SNAPSHOT;
    return JSON.stringify(fabricCanvasRef.current.toObject(FABRIC_CUSTOM_PROPS));
  }, []);

  const saveCurrentAnnotations = useCallback(() => {
    if (!currentDocumentId) return;

    if (!annotationsByDocument.current[currentDocumentId]) {
      annotationsByDocument.current[currentDocumentId] = {};
    }

    annotationsByDocument.current[currentDocumentId][currentPage] = getCanvasSnapshot();
  }, [currentDocumentId, currentPage, getCanvasSnapshot]);

  const pushHistorySnapshot = useCallback((snapshot: string, documentId?: string | null, pageIndex?: number) => {
    const resolvedDocumentId = documentId || currentDocumentId;
    if (!resolvedDocumentId) return;

    const resolvedPageIndex = pageIndex ?? currentPage;
    const entry = ensureHistoryEntry(resolvedDocumentId, resolvedPageIndex, snapshot);
    const currentSnapshot = entry.snapshots[entry.index];

    if (currentSnapshot === snapshot) {
      updateHistoryControls(resolvedDocumentId, resolvedPageIndex);
      return;
    }

    entry.snapshots = entry.snapshots.slice(0, entry.index + 1);
    entry.snapshots.push(snapshot);
    entry.index = entry.snapshots.length - 1;
    updateHistoryControls(resolvedDocumentId, resolvedPageIndex);
  }, [currentDocumentId, currentPage, ensureHistoryEntry, updateHistoryControls]);

  const loadSnapshotIntoCanvas = useCallback((snapshot: string) => {
    if (!fabricCanvasRef.current) return;

    isApplyingHistoryRef.current = true;
    fabricCanvasRef.current.loadFromJSON(snapshot, () => {
      fabricCanvasRef.current?.renderAll();
      isApplyingHistoryRef.current = false;
    });
  }, []);

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

    const pageAnnotations =
      annotationsByDocument.current[currentDocumentId]?.[currentPage] || EMPTY_CANVAS_SNAPSHOT;
    ensureHistoryEntry(currentDocumentId, currentPage, pageAnnotations);
    updateHistoryControls(currentDocumentId, currentPage);

    if (pageAnnotations === EMPTY_CANVAS_SNAPSHOT) return;

    loadSnapshotIntoCanvas(pageAnnotations);
  }, [currentDocumentId, currentPage, ensureHistoryEntry, loadSnapshotIntoCanvas, updateHistoryControls]);

  const handleCanvasChange = useCallback(() => {
    if (isApplyingHistoryRef.current || !currentDocumentId) return;

    const snapshot = getCanvasSnapshot();

    if (!annotationsByDocument.current[currentDocumentId]) {
      annotationsByDocument.current[currentDocumentId] = {};
    }

    annotationsByDocument.current[currentDocumentId][currentPage] = snapshot;
    pushHistorySnapshot(snapshot, currentDocumentId, currentPage);
  }, [currentDocumentId, currentPage, getCanvasSnapshot, pushHistorySnapshot]);

  const handleUndo = useCallback(() => {
    if (!currentDocumentId) return;

    const entry = historyByDocument.current[currentDocumentId]?.[currentPage];
    if (!entry || entry.index === 0) return;

    entry.index -= 1;
    const snapshot = entry.snapshots[entry.index];

    if (!annotationsByDocument.current[currentDocumentId]) {
      annotationsByDocument.current[currentDocumentId] = {};
    }

    annotationsByDocument.current[currentDocumentId][currentPage] = snapshot;
    loadSnapshotIntoCanvas(snapshot);
    updateHistoryControls(currentDocumentId, currentPage);
  }, [currentDocumentId, currentPage, loadSnapshotIntoCanvas, updateHistoryControls]);

  const handleRedo = useCallback(() => {
    if (!currentDocumentId) return;

    const entry = historyByDocument.current[currentDocumentId]?.[currentPage];
    if (!entry || entry.index >= entry.snapshots.length - 1) return;

    entry.index += 1;
    const snapshot = entry.snapshots[entry.index];

    if (!annotationsByDocument.current[currentDocumentId]) {
      annotationsByDocument.current[currentDocumentId] = {};
    }

    annotationsByDocument.current[currentDocumentId][currentPage] = snapshot;
    loadSnapshotIntoCanvas(snapshot);
    updateHistoryControls(currentDocumentId, currentPage);
  }, [currentDocumentId, currentPage, loadSnapshotIntoCanvas, updateHistoryControls]);

  useEffect(() => {
    if (hydratedSavedFieldsRef.current) return;
    if (!sessionDocs?.length || !sessionFields) return;

    const nextAnnotations: Record<string, Record<number, string>> = {};

    for (const document of sessionDocs) {
      const fieldsForDocument = sessionFields.filter((field) => field.document_id === document.id);
      if (!fieldsForDocument.length) continue;

      const pageMap: Record<number, string> = {};
      const pagesForDocument = Array.from(new Set(fieldsForDocument.map((field) => field.page)));

      for (const page of pagesForDocument) {
        const fieldsForPage = fieldsForDocument.filter((field) => field.page === page);
        if (!fieldsForPage.length) continue;
        pageMap[page] = buildCanvasSnapshotFromFields(fieldsForPage);
      }

      if (Object.keys(pageMap).length) {
        nextAnnotations[document.id] = pageMap;
      }
    }

    annotationsByDocument.current = nextAnnotations;
    hydratedSavedFieldsRef.current = true;

    const currentPageAnnotations = currentDocumentId
      ? nextAnnotations[currentDocumentId]?.[currentPage]
      : null;

    if (currentPageAnnotations && fabricCanvasRef.current) {
      loadSnapshotIntoCanvas(currentPageAnnotations);
    }
  }, [currentDocumentId, currentPage, loadSnapshotIntoCanvas, sessionDocs, sessionFields]);

  useEffect(() => {
    updateHistoryControls();
  }, [currentDocumentId, currentPage, updateHistoryControls]);

  const collectFields = () => {
    saveCurrentAnnotations();
    const fields: Omit<SessionField, 'id' | 'created_at'>[] = [];

    for (const document of sessionDocs || []) {
      const documentAnnotations = annotationsByDocument.current[document.id];
      if (!documentAnnotations) continue;

      for (const [pageKey, json] of Object.entries(documentAnnotations)) {
        try {
          const parsed = JSON.parse(json);
          if (!parsed.objects) continue;

          for (const object of parsed.objects) {
            const fieldType = object.fieldType || object.designatedField;
            const objectType = object.customType || object.type || 'object';
            const baseField = {
              session_id: sessionId!,
              document_id: document.id,
              page: parseInt(pageKey, 10),
              x: object.left || 0,
              y: object.top || 0,
              width: (object.width || 150) * (object.scaleX || 1),
              height: (object.height || 40) * (object.scaleY || 1),
            };

            if (fieldType) {
              const recipientId = object.recipientId || selectedSigner || null;
              fields.push({
                ...baseField,
                recipient_id: recipientId,
                type: fieldType,
                value: buildStoredSessionFieldValue({
                  schemaVersion: 1,
                  kind: 'interactive',
                  tool: fieldType,
                  recipientId,
                  object,
                  signedValue: null,
                }),
              });
              continue;
            }

            fields.push({
              ...baseField,
              recipient_id: null,
              type: `${MARKUP_TYPE_PREFIX}${objectType}`,
              value: buildStoredSessionFieldValue({
                schemaVersion: 1,
                kind: 'markup',
                tool: objectType,
                recipientId: null,
                object,
                signedValue: null,
              }),
            });
          }
        } catch {
          // Ignore invalid annotation snapshots.
        }
      }
    }

    return fields;
  };

  const saveFieldsToSession = useCallback(async () => {
    const fields = collectFields();
    await saveFields.mutateAsync({ session_id: sessionId!, fields });
    return fields;
  }, [collectFields, saveFields, sessionId]);

  const handleNext = async () => {
    try {
      setPreviewSaving(true);
      const fields = await saveFieldsToSession();
      const persistedFields = await refetchSessionFields();
      const interactiveFieldCount = fields.filter((field) => INTERACTIVE_FIELD_TYPES.has(field.type)).length;
      const persistedInteractiveFieldCount = (persistedFields.data || []).filter((field) =>
        INTERACTIVE_FIELD_TYPES.has(field.type)
      ).length;

      if (interactiveFieldCount > 0 && persistedInteractiveFieldCount === 0) {
        throw new Error('Fields were not saved to Supabase');
      }

      setShowPreview(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save fields');
    } finally {
      setPreviewSaving(false);
    }
  };

  const handleSend = async () => {
    try {
      const fields = await saveFieldsToSession();

      const publicRecipient = recipients?.find((recipient) => recipient.type === 'signer' || recipient.type === 'reviewer') || recipients?.[0] || null;
      if (publicRecipient?.token) {
        const publicSession = await fetchSigningSessionByToken(publicRecipient.token);
        const interactiveFieldCount = fields.filter((field) => INTERACTIVE_FIELD_TYPES.has(field.type)).length;
        const publicInteractiveFieldCount = (publicSession?.fields || []).filter((field) =>
          INTERACTIVE_FIELD_TYPES.has(field.type)
        ).length;

        if (interactiveFieldCount > 0 && publicInteractiveFieldCount === 0) {
          throw new Error('Signing fields were not readable from the public signing link');
        }
      }

      await updateSession.mutateAsync({
        id: sessionId!,
        status: 'in_progress',
        date_sent: new Date().toISOString(),
      });

      // Send emails via Edge Function
      if (recipients?.length) {
        const emailRecipients = recipients
          .filter((r) => r.type === 'signer' || r.type === 'reviewer')
          .map((r) => ({
            email: r.email,
            firstName: r.first_name,
            lastName: r.last_name,
            signingUrl: `${window.location.origin}/sign/${r.token}`,
          }));

        if (emailRecipients.length > 0) {
          const { error } = await supabase.functions.invoke('send-signing-email', {
            body: {
              recipients: emailRecipients,
              subject: session?.session_name ? `Signature Required: ${session.session_name}` : 'Signature Required',
              sessionName: session?.session_name || 'Signing Session',
              signingLinks: true,
              emailMessage: session?.email_message || 'You have been requested to review and sign documents.',
            },
          });

          if (error) {
            console.error('Email send error:', error);
            toast.warning('Session sent but emails may not have been delivered. Signing links copied to clipboard.');
          } else {
            toast.success(`Session sent! Signing emails delivered to ${emailRecipients.length} recipient(s).`);
          }
        }

        // Also copy links to clipboard as backup
        const urls = recipients.map((r) => `${window.location.origin}/sign/${r.token}`);
        try {
          await navigator.clipboard.writeText(urls.join('\n'));
        } catch {
          // Clipboard not available, that's OK
        }
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleUndo}
            disabled={!historyState.canUndo}
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRedo}
            disabled={!historyState.canRedo}
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 className="w-3 h-3" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale((value) => Math.max(0.25, value - 0.25))}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs w-10 text-center">{Math.round(zoomScale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomScale((value) => Math.min(2, value + 0.25))}>
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleNext}
          disabled={previewSaving || saveFields.isPending}
        >
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
                      assignedRecipientId={selectedSigner}
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
