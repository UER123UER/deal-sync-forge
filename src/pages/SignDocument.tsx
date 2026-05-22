import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSignatureRequestByToken, useSignDocument } from '@/hooks/useSignatureRequests';
import { useSessionByToken } from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
import { Check, Pen, Type, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ListingAgreementDocument, ListingAgreementFields, DEFAULT_FIELDS } from '@/components/deal/ListingAgreementDocument';
import { SeoHead } from '@/components/SeoHead';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ─── Shared types ───
interface SignField {
  id: string;
  type: 'signature' | 'initials' | 'date';
  label: string;
  value: string;
  status: 'empty' | 'active' | 'completed';
}

interface StoredSessionFieldPayload {
  schemaVersion: 1;
  kind: 'interactive' | 'markup';
  tool: string;
  recipientId: string | null;
  object: Record<string, any> | null;
  signedValue: string | null;
}

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

const buildSignedSessionFieldValue = (existingValue: string | null, signedValue: string) => {
  const payload = parseStoredSessionFieldValue(existingValue);
  if (payload) {
    return JSON.stringify({
      ...payload,
      signedValue,
    });
  }

  return JSON.stringify({
    schemaVersion: 1,
    kind: 'interactive',
    tool: 'signature',
    recipientId: null,
    object: null,
    signedValue,
  } satisfies StoredSessionFieldPayload);
};

function getFieldsForRole(role: string | null | undefined): SignField[] {
  const isSeller = role?.toLowerCase().includes('seller');
  return [
    { id: isSeller ? 'seller-signature' : 'broker-signature', type: 'signature', label: 'Sign Here', value: '', status: 'empty' },
    { id: isSeller ? 'seller-initials' : 'broker-initials', type: 'initials', label: 'Initial', value: '', status: 'empty' },
    { id: isSeller ? 'seller-date' : 'broker-date', type: 'date', label: 'Date Signed', value: '', status: 'empty' },
  ];
}

// ─── Session-based signing view ───
function SessionSigningView({ token }: { token: string }) {
  const { data, isLoading, error } = useSessionByToken(token);
  // pages[i] = { url, width, height } - rendered at 1.5x scale, displayed at natural CSS px
  const [pages, setPages] = useState<{ url: string; renderScale: number; naturalW: number; naturalH: number }[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  // fields with their position data
  interface PositionedField extends SignField {
    page: number;   // 0-indexed page number
    x: number;      // left in PDF-natural pixels (at renderScale)
    y: number;      // top  in PDF-natural pixels (at renderScale)
    w: number;      // width
    h: number;      // height
  }
  interface PassiveOverlay {
    id: string;
    page: number;
    object: any;
  }
  const [fields, setFields] = useState<PositionedField[]>([]);
  const [overlays, setOverlays] = useState<PassiveOverlay[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFieldIndex, setModalFieldIndex] = useState<number | null>(null);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('type');
  const [typedName, setTypedName] = useState('');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const RENDER_SCALE = 1.5; // must match AdminPdfEditor's scale

  // Load PDF pages
  useEffect(() => {
    if (!data?.documents?.length) return;
    const loadAll = async () => {
      setPdfLoading(true);
      const allPages: { url: string; renderScale: number; naturalW: number; naturalH: number }[] = [];
      for (const doc of data.documents) {
        if (!doc.storage_path) continue;
        try {
          const { data: urlData } = supabase.storage.from('admin-documents').getPublicUrl(doc.storage_path);
          const pdf = await pdfjsLib.getDocument(urlData.publicUrl).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({ scale: RENDER_SCALE });
            const canvas = document.createElement('canvas');
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            allPages.push({
              url: canvas.toDataURL(),
              renderScale: RENDER_SCALE,
              naturalW: vp.width,   // px at renderScale
              naturalH: vp.height,
            });
          }
        } catch (err) {
          console.error('Failed to load PDF:', err);
        }
      }
      setPages(allPages);
      setPdfLoading(false);
    };
    loadAll();
  }, [data?.documents]);

  // Build positioned fields from session_fields data
  useEffect(() => {
    if (!data?.fields || fields.length > 0 || overlays.length > 0) return;

    const rawFields = data.fields;

    if (rawFields.length === 0) {
      // No fields placed - show defaults without position (below-doc fallback)
      const defaults: PositionedField[] = [
        { id: 'default-sig', type: 'signature', label: 'Sign Here', value: '', status: 'active', page: 0, x: 0, y: 0, w: 0, h: 0 },
        { id: 'default-date', type: 'date', label: 'Date Signed', value: '', status: 'empty', page: 0, x: 0, y: 0, w: 0, h: 0 },
      ];
      setFields(defaults);
      return;
    }

    const mapped: PositionedField[] = [];
    const nextOverlays: PassiveOverlay[] = [];

    rawFields.forEach((f, i) => {
      const storedPayload = parseStoredSessionFieldValue(f.value);

      if (f.type?.startsWith('markup:')) {
        const overlayObject = storedPayload?.object;
        if (!overlayObject) return;
        nextOverlays.push({
          id: f.id || `overlay-${i}`,
          page: typeof f.page === 'number' ? f.page : 0,
          object: overlayObject,
        });
        return;
      }

      const fieldRecipientId = storedPayload?.recipientId || f.recipient_id;
      if (fieldRecipientId && fieldRecipientId !== data.recipient.id) {
        return;
      }

      const storedObject = storedPayload?.object;
      const storedSignedValue =
        storedPayload?.signedValue ||
        (f.value && !f.value.trim().startsWith('{') ? f.value : '');
      const rawType = storedPayload?.tool || f.type;
      const ftype = (rawType === 'signature' || rawType === 'initials' || rawType === 'date') ? rawType : 'signature';
      const label = ftype === 'signature' ? 'Sign Here' : ftype === 'initials' ? 'Initial' : 'Date Signed';
      mapped.push({
        id: f.id || `field-${i}`,
        type: ftype,
        label,
        value: storedSignedValue,
        status: storedSignedValue ? 'completed' as const : 'empty' as const,
        page: typeof f.page === 'number' ? f.page : 0,
        x: typeof storedObject?.left === 'number' ? storedObject.left : typeof f.x === 'number' ? f.x : 0,
        y: typeof storedObject?.top === 'number' ? storedObject.top : typeof f.y === 'number' ? f.y : 0,
        w: storedObject
          ? (storedObject.width || f.width || 160) * (storedObject.scaleX || 1)
          : typeof f.width === 'number'
            ? f.width
            : 160,
        h: storedObject
          ? (storedObject.height || f.height || 40) * (storedObject.scaleY || 1)
          : typeof f.height === 'number'
            ? f.height
            : 40,
      });
    });
    // Set first unsigned field as active
    const firstUnsigned = mapped.findIndex(f => !f.value);
    if (firstUnsigned !== -1) {
      mapped[firstUnsigned].status = 'active';
    }
    setFields(mapped);
    setOverlays(nextOverlays);
  }, [data?.fields, fields.length, overlays.length]);

  const completedCount = fields.filter(f => f.status === 'completed').length;
  const allFieldsDone = fields.length > 0 && completedCount === fields.length;

  const advanceToNext = (currentIdx: number) => {
    const next = fields.findIndex((f, i) => i > currentIdx && f.status !== 'completed');
    if (next !== -1) {
      setFields(prev => prev.map((f, i) => (i === next ? { ...f, status: 'active' } : f)));
    }
  };

  const handleFieldClick = (index: number) => {
    const field = fields[index];
    if (field.status === 'completed') return;
    if (field.type === 'date') {
      const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      setFields(prev => prev.map((f, i) => (i === index ? { ...f, value: today, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    if (field.type === 'signature' && savedSignature) {
      setFields(prev => prev.map((f, i) => (i === index ? { ...f, value: savedSignature, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    if (field.type === 'initials' && savedInitials) {
      setFields(prev => prev.map((f, i) => (i === index ? { ...f, value: savedInitials, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    setModalFieldIndex(index);
    setModalOpen(true);
    setTypedName('');
    setSignMode('type');
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (modalOpen && signMode === 'draw') setTimeout(initCanvas, 100);
  }, [modalOpen, signMode, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  const stopDraw = () => { isDrawing.current = false; };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleAdoptSign = () => {
    if (modalFieldIndex === null) return;
    const field = fields[modalFieldIndex];
    let sigData = '';
    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      sigData = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) { toast.error('Please type your name'); return; }
      sigData = `typed:${typedName.trim()}`;
    }
    if (field.type === 'signature') setSavedSignature(sigData);
    if (field.type === 'initials') setSavedInitials(sigData);
    setFields(prev => prev.map((f, i) => (i === modalFieldIndex ? { ...f, value: sigData, status: 'completed' } : f)));
    setModalOpen(false);
    setModalFieldIndex(null);
    advanceToNext(modalFieldIndex);
  };

  const handleFinish = async () => {
    if (!data?.recipient) return;
    const sigField = fields.find(f => f.type === 'signature');
    try {
      const fieldUpdates = fields
        .filter((f) => f.value && !f.id.startsWith('default-'))
        .map((f) => {
          const existingField = data.fields.find((sf) => sf.id === f.id);
          return {
            id: f.id,
            value: buildSignedSessionFieldValue(existingField?.value || null, f.value),
          };
        });
      const { error: submitErr } = await supabase.functions.invoke('submit-signing-session', {
        body: {
          token,
          signatureData: sigField?.value || '',
          fields: fieldUpdates,
        },
      });
      if (submitErr) throw submitErr;

      setFinished(true);
      toast.success('Document signed successfully!');
    } catch {
      toast.error('Failed to sign document');
    }
  };

  const renderSigValue = (val: string, small = false) => {
    if (val.startsWith('typed:')) {
      return <span className={small ? 'text-lg' : 'text-2xl'} style={{ fontFamily: "'Dancing Script', cursive" }}>{val.replace('typed:', '')}</span>;
    }
    return <img src={val} alt="Signature" className={small ? 'h-8 max-w-full object-contain' : 'h-12 max-w-full object-contain'} />;
  };

  if (isLoading || pdfLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-muted-foreground">Loading document...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-xl font-semibold mb-2">Signing Data Unavailable</h1>
          <p className="text-muted-foreground">
            The signing link could not load its saved fields. Please return to the deal and send again.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-center"><h1 className="text-xl font-semibold mb-2">Document Not Found</h1><p className="text-muted-foreground">This signing link is invalid or has expired.</p></div></div>;
  }

  if (finished || data.recipient.status === 'signed') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8" /></div>
          <h1 className="text-2xl font-semibold mb-2">Document Signed!</h1>
          <p className="text-muted-foreground mb-2">You have successfully signed the document.</p>
          <p className="text-sm text-muted-foreground">You may close this window.</p>
        </div>
      </div>
    );
  }

  // Fields with no position (x===0 && y===0 && w===0) go in below-doc fallback list
  const positionedFields = fields.filter(f => f.w > 0);
  const fallbackFields = fields.filter(f => f.w === 0);
  const overlaysByPage = overlays.reduce<Record<number, PassiveOverlay[]>>((acc, overlay) => {
    if (!acc[overlay.page]) acc[overlay.page] = [];
    acc[overlay.page].push(overlay);
    return acc;
  }, {});

  const renderOverlay = (overlay: PassiveOverlay) => {
    const object = overlay.object;
    const commonStyle: React.CSSProperties = {
      position: 'absolute',
      left: object.left || 0,
      top: object.top || 0,
      pointerEvents: 'none',
      transform: object.angle ? `rotate(${object.angle}deg)` : undefined,
      transformOrigin: 'top left',
    };

    if (object.type === 'path' && Array.isArray(object.path)) {
      const d = object.path
        .map((segment: any[]) => {
          const [command, ...values] = segment;
          return `${command} ${values.join(' ')}`;
        })
        .join(' ');

      return (
        <svg
          key={overlay.id}
          style={commonStyle}
          width={(object.width || 0) * (object.scaleX || 1)}
          height={(object.height || 0) * (object.scaleY || 1)}
          viewBox={`0 0 ${object.width || 1} ${object.height || 1}`}
        >
          <path
            d={d}
            fill="none"
            stroke={object.stroke || '#000000'}
            strokeWidth={object.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (object.type === 'line') {
      const x1 = object.x1 ?? 0;
      const y1 = object.y1 ?? 0;
      const x2 = object.x2 ?? 0;
      const y2 = object.y2 ?? 0;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const width = Math.max(Math.abs(x2 - x1), 1);
      const height = Math.max(Math.abs(y2 - y1), 1);

      return (
        <svg
          key={overlay.id}
          style={{ ...commonStyle, left: (object.left || 0) + minX, top: (object.top || 0) + minY }}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <line
            x1={x1 - minX}
            y1={y1 - minY}
            x2={x2 - minX}
            y2={y2 - minY}
            stroke={object.stroke || '#000000'}
            strokeWidth={object.strokeWidth || 2}
            strokeLinecap="round"
          />
        </svg>
      );
    }

    if (object.type === 'ellipse') {
      const width = (object.rx || 0) * 2;
      const height = (object.ry || 0) * 2;
      return (
        <div
          key={overlay.id}
          style={{
            ...commonStyle,
            width,
            height,
            border: `${object.strokeWidth || 2}px solid ${object.stroke || '#ef4444'}`,
            borderRadius: '9999px',
            background: object.fill && object.fill !== 'transparent' ? object.fill : 'transparent',
          }}
        />
      );
    }

    if (object.type === 'rect') {
      return (
        <div
          key={overlay.id}
          style={{
            ...commonStyle,
            width: (object.width || 0) * (object.scaleX || 1),
            height: (object.height || 0) * (object.scaleY || 1),
            background: object.fill || 'transparent',
            border: object.stroke ? `${object.strokeWidth || 0}px solid ${object.stroke}` : undefined,
          }}
        />
      );
    }

    if (object.type === 'image' && object.src) {
      return (
        <img
          key={overlay.id}
          src={object.src}
          alt=""
          style={{
            ...commonStyle,
            width: (object.width || 0) * (object.scaleX || 1),
            height: (object.height || 0) * (object.scaleY || 1),
            objectFit: 'contain',
          }}
        />
      );
    }

    if ((object.type === 'i-text' || object.type === 'text' || object.type === 'textbox') && object.text) {
      return (
        <div
          key={overlay.id}
          style={{
            ...commonStyle,
            color: object.fill || '#000000',
            fontSize: object.fontSize || 14,
            fontFamily: object.fontFamily || 'Arial',
            fontWeight: object.fontWeight || 'normal',
            fontStyle: object.fontStyle || 'normal',
            textDecoration: object.underline ? 'underline' : undefined,
            whiteSpace: 'pre-wrap',
          }}
        >
          {object.text}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50" style={{ backgroundColor: '#4C00C2' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-white">
          <div>
            <h1 className="text-base font-semibold">{data.session.session_name}</h1>
            <p className="text-xs opacity-80">Please review and sign</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Signing as: {data.recipient.first_name} {data.recipient.last_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs opacity-80">{completedCount} of {fields.length} completed</span>
              <Progress value={(completedCount / Math.max(fields.length, 1)) * 100} className="w-24 h-1.5 bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {data.session.email_message && (
        <div className="max-w-5xl mx-auto px-6 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-800">{data.session.email_message}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* PDF pages with overlaid signing fields */}
        <div className="space-y-4">
          {pages.length === 0 && (
            <div className="bg-white shadow-lg border rounded-sm p-16 text-center text-muted-foreground">
              No document pages available.
            </div>
          )}
          {pages.map((page, pageIdx) => {
            // Fields that belong to this page
            const pageFields = positionedFields.filter(f => f.page === pageIdx);
            const pageOverlays = overlaysByPage[pageIdx] || [];
            // The image renders at naturalW × naturalH px (renderScale already applied)
            return (
              <div key={pageIdx} className="bg-white shadow-lg border rounded-sm relative" style={{ width: page.naturalW, maxWidth: '100%' }}>
                <img src={page.url} alt={`Page ${pageIdx + 1}`} style={{ width: page.naturalW, maxWidth: '100%', display: 'block' }} />
                {pageOverlays.map(renderOverlay)}
                {/* Overlaid signing field boxes at their exact admin-placed positions */}
                {pageFields.map((field) => {
                  const fieldIdx = fields.indexOf(field);
                  const isCompleted = field.status === 'completed';
                  const isActive = field.status === 'active';
                  return (
                    <div
                      key={field.id}
                      onClick={() => handleFieldClick(fieldIdx)}
                      title={field.label}
                      style={{
                        position: 'absolute',
                        left: field.x,
                        top: field.y,
                        width: field.w,
                        height: field.h,
                        cursor: isCompleted ? 'default' : 'pointer',
                        boxSizing: 'border-box',
                      }}
                      className={`transition-all duration-200 rounded flex items-center justify-center overflow-hidden
                        ${isCompleted
                          ? 'bg-green-50 border-2 border-green-400'
                          : isActive
                            ? 'bg-amber-100/90 border-2 border-amber-500 shadow-lg ring-2 ring-amber-400 animate-pulse'
                            : 'bg-amber-50/80 border-2 border-dashed border-amber-400 hover:bg-amber-100/80'
                        }`}
                    >
                      {isCompleted ? (
                        <div className="flex items-center gap-1 px-1 w-full justify-center">
                          {field.type === 'date'
                            ? <span className="text-xs font-semibold text-green-700 truncate">{field.value}</span>
                            : renderSigValue(field.value, true)
                          }
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-1">
                          {field.type === 'signature' && <Pen className="w-3 h-3 text-amber-600 shrink-0" />}
                          {field.type === 'initials' && <Type className="w-3 h-3 text-amber-600 shrink-0" />}
                          <span className="text-xs font-semibold text-amber-700 truncate">{field.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Fallback: fields with no position data (below doc) */}
        {fallbackFields.length > 0 && (
          <div className="mt-8 bg-white shadow-lg border rounded-sm p-8">
            <h2 className="text-lg font-semibold mb-4">Complete Your Signature</h2>
            <div className="space-y-3">
              {fallbackFields.map((field) => {
                const fieldIdx = fields.indexOf(field);
                const isActive = field.status === 'active';
                const isCompleted = field.status === 'completed';
                return (
                  <div
                    key={field.id}
                    onClick={() => handleFieldClick(fieldIdx)}
                    className={`relative cursor-pointer transition-all duration-300 rounded-md border-2 px-4 py-3
                      ${isCompleted ? 'bg-white border-green-400 cursor-default' : isActive ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg' : 'bg-amber-50 border-amber-300 border-dashed'}`}
                    style={{ minHeight: 56 }}
                  >
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        {field.type === 'date' ? <span className="text-sm font-medium">{field.value}</span> : renderSigValue(field.value, true)}
                        <Check className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {field.type === 'signature' && <Pen className="w-4 h-4 text-amber-600" />}
                        {field.type === 'initials' && <Type className="w-4 h-4 text-amber-600" />}
                        <span className="text-sm font-semibold text-amber-700">{field.label}</span>
                        {isActive && <ChevronDown className="w-4 h-4 text-amber-600 animate-bounce ml-auto" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {allFieldsDone && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleFinish} className="px-12 py-6 text-lg font-semibold rounded-lg shadow-xl" style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}>
              <Check className="w-5 h-5 mr-2" /> Finish Signing
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto">
          By clicking "Finish Signing", you agree that your electronic signature is the legal equivalent of your manual signature on this document.
        </p>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'Add Your Initials' : 'Adopt Your Signature'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'initials' : 'signature'} below.
            </p>
            <div className="flex gap-2 border-b pb-2">
              <button onClick={() => setSignMode('type')} className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'type' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Type className="w-3.5 h-3.5 inline mr-1.5" /> Type
              </button>
              <button onClick={() => setSignMode('draw')} className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'draw' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Pen className="w-3.5 h-3.5 inline mr-1.5" /> Draw
              </button>
            </div>
            {signMode === 'type' ? (
              <div>
                <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'Your initials' : 'Your full name'} className="w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary" style={{ fontFamily: "'Dancing Script', cursive" }} autoFocus />
                {typedName && (
                  <div className="mt-3 p-4 bg-muted/30 border rounded-md text-center">
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <p className="text-3xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{typedName}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <canvas ref={canvasRef} width={460} height={140} className="border rounded-md cursor-crosshair w-full bg-white" style={{ touchAction: 'none' }} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-1 text-xs">Clear</Button>
              </div>
            )}
            <Button onClick={handleAdoptSign} className="w-full" style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}>Adopt and Sign</Button>
          </div>
        </DialogContent>
      </Dialog>

      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}

// ─── Legacy signature-request signing view ───
export default function SignDocument() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const recipientToken = searchParams.get('recipient');
  const { data: request, isLoading: legacyLoading } = useSignatureRequestByToken(token);
  const { data: sessionData, isLoading: sessionLoading } = useSessionByToken(
    // Only try session lookup if no legacy request found yet and no recipient param
    !request && !recipientToken ? token : undefined
  );
  const signMutation = useSignDocument();

  const [fields, setFields] = useState<SignField[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFieldIndex, setModalFieldIndex] = useState<number | null>(null);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('type');
  const [typedName, setTypedName] = useState('');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Find THIS recipient: by their unique token if present, else fall back to first pending
  const currentRecipient = request?.signature_recipients?.find((r) =>
    recipientToken ? (r as any).recipient_token === recipientToken : r.status === 'pending'
  );
  const allSigned = request?.signature_recipients?.every((r) => r.status === 'signed');

  useEffect(() => {
    if (currentRecipient && fields.length === 0) {
      const f = getFieldsForRole(currentRecipient.role);
      f[0].status = 'active';
      setFields(f);
      setActiveIndex(0);
    }
  }, [currentRecipient, fields.length]);

  useEffect(() => {
    if (fields.length === 0) return;
    const active = fields[activeIndex];
    if (!active || active.status === 'completed') return;
    const el = fieldRefs.current[active.id];
    if (el) {
      setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
    }
  }, [activeIndex, fields]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (modalOpen && signMode === 'draw') setTimeout(initCanvas, 100);
  }, [modalOpen, signMode, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  const stopDraw = () => { isDrawing.current = false; };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const completedCount = fields.filter((f) => f.status === 'completed').length;
  const allFieldsDone = fields.length > 0 && completedCount === fields.length;

  const advanceToNext = (currentIdx: number) => {
    const next = fields.findIndex((f, i) => i > currentIdx && f.status !== 'completed');
    if (next !== -1) {
      setFields((prev) => prev.map((f, i) => (i === next ? { ...f, status: 'active' } : f)));
      setActiveIndex(next);
    }
  };

  const handleFieldClick = (index: number) => {
    const field = fields[index];
    if (field.status === 'completed') return;
    if (field.type === 'date') {
      const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value: today, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    if (field.type === 'signature' && savedSignature) {
      setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value: savedSignature, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    if (field.type === 'initials' && savedInitials) {
      setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value: savedInitials, status: 'completed' } : f)));
      advanceToNext(index);
      return;
    }
    setModalFieldIndex(index);
    setModalOpen(true);
    setTypedName('');
    setSignMode('type');
  };

  const handleAdoptSign = () => {
    if (modalFieldIndex === null) return;
    const field = fields[modalFieldIndex];
    let sigData = '';
    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      sigData = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) { toast.error('Please type your name'); return; }
      sigData = `typed:${typedName.trim()}`;
    }
    if (field.type === 'signature') setSavedSignature(sigData);
    if (field.type === 'initials') setSavedInitials(sigData);
    setFields((prev) => prev.map((f, i) => (i === modalFieldIndex ? { ...f, value: sigData, status: 'completed' } : f)));
    setModalOpen(false);
    setModalFieldIndex(null);
    advanceToNext(modalFieldIndex);
  };

  const handleFinish = async () => {
    if (!currentRecipient) return;
    const sigField = fields.find((f) => f.type === 'signature');
    try {
      await signMutation.mutateAsync({ recipientId: currentRecipient.id, signatureData: sigField?.value || '' });
      setFinished(true);
      toast.success('Document signed successfully!');
    } catch {
      toast.error('Failed to sign document');
    }
  };

  const renderSigValue = (val: string, small = false) => {
    if (val.startsWith('typed:')) {
      return <span className={small ? 'text-lg' : 'text-2xl'} style={{ fontFamily: "'Dancing Script', cursive" }}>{val.replace('typed:', '')}</span>;
    }
    return <img src={val} alt="Signature" className={small ? 'h-8' : 'h-12'} />;
  };

  // --- LOADING ---
  if (legacyLoading || sessionLoading) {
    return <><SeoHead title="Sign Document | United Estates Realty" description="Review and electronically sign your real estate document securely with United Estates Realty." path={`/sign/${token || ''}`} /><div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-muted-foreground">Loading document...</p></div></>;
  }

  // --- SESSION TOKEN MATCH → render session signing view ---
  if (sessionData && !request) {
    return <><SeoHead title="Sign Document | United Estates Realty" description="Review and electronically sign your real estate document securely with United Estates Realty." path={`/sign/${token || ''}`} /><SessionSigningView token={token!} /></>;
  }

  // --- LEGACY NOT FOUND ---
  if (!request) {
    return <><SeoHead title="Sign Document | United Estates Realty" description="Review and electronically sign your real estate document securely with United Estates Realty." path={`/sign/${token || ''}`} /><div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-center"><h1 className="text-xl font-semibold mb-2">Document Not Found</h1><p className="text-muted-foreground">This signing link is invalid or has expired.</p></div></div></>;
  }
  const alreadySigned = currentRecipient?.status === 'signed';

  if (finished || alreadySigned) {
    return (
      <>
        <SeoHead title="Document Signed | United Estates Realty" description="Your real estate document has been successfully signed through United Estates Realty." path={`/sign/${token || ''}`} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8" /></div>
            <h1 className="text-2xl font-semibold mb-2">Document Signed!</h1>
            <p className="text-muted-foreground mb-2">
              {alreadySigned && !finished ? 'You have already signed ' : 'You have successfully signed '}
              <strong>{request.document_name}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">You may close this window.</p>
          </div>
        </div>
      </>
    );
  }

  if (allSigned) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8" /></div>
          <h1 className="text-2xl font-semibold mb-2">All Signatures Complete</h1>
          <p className="text-muted-foreground mb-2"><strong>{request.document_name}</strong> has been fully signed.</p>
          <p className="text-sm text-muted-foreground">You may close this window.</p>
        </div>
      </div>
    );
  }

  const formData = (request.form_data || {}) as Record<string, string>;
  const docFields: ListingAgreementFields = { ...DEFAULT_FIELDS, ...formData };
  const isSeller = currentRecipient?.role?.toLowerCase().includes('seller');

  const sigField = fields.find((f) => f.type === 'signature');
  const initialField = fields.find((f) => f.type === 'initials');
  const dateField = fields.find((f) => f.type === 'date');
  const sigIdx = fields.findIndex((f) => f.type === 'signature');
  const initialIdx = fields.findIndex((f) => f.type === 'initials');
  const dateIdx = fields.findIndex((f) => f.type === 'date');

  const FieldOverlay = ({ field, index }: { field: SignField; index: number }) => {
    const isActive = field.status === 'active';
    const isCompleted = field.status === 'completed';
    return (
      <div
        ref={(el) => { fieldRefs.current[field.id] = el; }}
        onClick={() => handleFieldClick(index)}
        className={`relative cursor-pointer transition-all duration-300 rounded-md border-2 px-4 py-3 my-1
          ${isCompleted ? 'bg-white border-green-400 cursor-default' : isActive ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg' : 'bg-amber-50 border-amber-300 border-dashed'}`}
        style={{ minHeight: 56 }}
      >
        {isCompleted ? (
          <div className="flex items-center gap-2">
            {field.type === 'date' ? <span className="text-sm font-medium">{field.value}</span> : renderSigValue(field.value, true)}
            <Check className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {field.type === 'signature' && <Pen className="w-4 h-4 text-amber-600" />}
            {field.type === 'initials' && <Type className="w-4 h-4 text-amber-600" />}
            <span className="text-sm font-semibold text-amber-700">{field.label}</span>
            {isActive && <ChevronDown className="w-4 h-4 text-amber-600 animate-bounce ml-auto" />}
          </div>
        )}
      </div>
    );
  };

  const renderField = (key: keyof ListingAgreementFields) => (
    <span className="border-b-2 border-foreground/30 px-1">{docFields[key] || '___'}</span>
  );

  const signatureSection = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>Seller</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Signature</p>
              {isSeller && sigField ? <FieldOverlay field={sigField} index={sigIdx} /> : (
                <div className="border-b border-foreground/20 h-10 flex items-end">
                  {request.signature_recipients?.filter(r => r.role?.toLowerCase().includes('seller') && r.signature_data).map(r => (
                    <div key={r.id}>{r.signature_data?.startsWith('typed:') ? <span className="text-xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span> : <img src={r.signature_data!} alt="Sig" className="h-10" />}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Initials</p>
              {isSeller && initialField ? <FieldOverlay field={initialField} index={initialIdx} /> : <div className="border-b border-foreground/20 h-8" />}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Date Signed</p>
              {isSeller && dateField ? <FieldOverlay field={dateField} index={dateIdx} /> : <div className="border-b border-foreground/20 h-8" />}
            </div>
            <div className="text-xs mt-2 space-y-1">
              <p>Home Telephone: <span className="border-b border-foreground/20 px-1">{docFields.sellerPhone || '___'}</span></p>
              <p>Email: <span className="border-b border-foreground/20 px-1">{docFields.sellerEmail || '___'}</span></p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>Broker / Agent</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Signature</p>
              {!isSeller && sigField ? <FieldOverlay field={sigField} index={sigIdx} /> : (
                <div className="border-b border-foreground/20 h-10 flex items-end">
                  {request.signature_recipients?.filter(r => (r.role?.toLowerCase().includes('broker') || r.role?.toLowerCase().includes('agent')) && r.signature_data).map(r => (
                    <div key={r.id}>{r.signature_data?.startsWith('typed:') ? <span className="text-xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span> : <img src={r.signature_data!} alt="Sig" className="h-10" />}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Initials</p>
              {!isSeller && initialField ? <FieldOverlay field={initialField} index={initialIdx} /> : <div className="border-b border-foreground/20 h-8" />}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Date Signed</p>
              {!isSeller && dateField ? <FieldOverlay field={dateField} index={dateIdx} /> : <div className="border-b border-foreground/20 h-8" />}
            </div>
            <div className="text-xs mt-2 space-y-1">
              <p>Brokerage: <span className="border-b border-foreground/20 px-1">{docFields.brokerCompany || '___'}</span></p>
              <p>Telephone: <span className="border-b border-foreground/20 px-1">{docFields.brokerPhone || '___'}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50" style={{ backgroundColor: '#4C00C2' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-white">
          <div>
            <h1 className="text-base font-semibold">{request.document_name}</h1>
            <p className="text-xs opacity-80">From: {request.sender_name}</p>
          </div>
          <div className="text-right">
            {currentRecipient && <p className="text-sm font-medium">Signing as: {currentRecipient.name}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs opacity-80">{completedCount} of {fields.length} completed</span>
              <Progress value={(completedCount / Math.max(fields.length, 1)) * 100} className="w-24 h-1.5 bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {request.message && (
        <div className="max-w-5xl mx-auto px-6 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-800">{request.message}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg border rounded-sm px-16 py-14">
          <ListingAgreementDocument
            fields={docFields}
            renderField={renderField}
            signatureSection={signatureSection}
          />
        </div>

        {allFieldsDone && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleFinish} disabled={signMutation.isPending} className="px-12 py-6 text-lg font-semibold rounded-lg shadow-xl" style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}>
              <Check className="w-5 h-5 mr-2" />
              {signMutation.isPending ? 'Completing...' : 'Finish Signing'}
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto">
          By clicking "Finish Signing", you agree that your electronic signature is the legal equivalent of your manual signature on this document.
        </p>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'Add Your Initials' : 'Adopt Your Signature'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'initials' : 'signature'} below.
            </p>
            <div className="flex gap-2 border-b pb-2">
              <button onClick={() => setSignMode('type')} className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'type' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Type className="w-3.5 h-3.5 inline mr-1.5" /> Type
              </button>
              <button onClick={() => setSignMode('draw')} className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'draw' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Pen className="w-3.5 h-3.5 inline mr-1.5" /> Draw
              </button>
            </div>
            {signMode === 'type' ? (
              <div>
                <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'Your initials' : 'Your full name'} className="w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary" style={{ fontFamily: "'Dancing Script', cursive" }} autoFocus />
                {typedName && (
                  <div className="mt-3 p-4 bg-muted/30 border rounded-md text-center">
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <p className="text-3xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{typedName}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <canvas ref={canvasRef} width={460} height={140} className="border rounded-md cursor-crosshair w-full bg-white" style={{ touchAction: 'none' }} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-1 text-xs">Clear</Button>
              </div>
            )}
            <Button onClick={handleAdoptSign} className="w-full" style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}>Adopt and Sign</Button>
          </div>
        </DialogContent>
      </Dialog>

      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
