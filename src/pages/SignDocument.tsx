import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSignatureRequestByToken, useSignDocument } from '@/hooks/useSignatureRequests';
import { Check, Pen, Type, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

// Field types for the signing flow
interface SignField {
  id: string;
  type: 'signature' | 'initials' | 'date';
  label: string;
  value: string;
  status: 'empty' | 'active' | 'completed';
}

function getFieldsForRole(role: string | null | undefined): SignField[] {
  const isSeller = role?.toLowerCase().includes('seller');
  return [
    {
      id: isSeller ? 'seller-signature' : 'broker-signature',
      type: 'signature',
      label: 'Sign Here',
      value: '',
      status: 'empty',
    },
    {
      id: isSeller ? 'seller-initials' : 'broker-initials',
      type: 'initials',
      label: 'Initial',
      value: '',
      status: 'empty',
    },
    {
      id: isSeller ? 'seller-date' : 'broker-date',
      type: 'date',
      label: 'Date Signed',
      value: '',
      status: 'empty',
    },
  ];
}

export default function SignDocument() {
  const { token } = useParams<{ token: string }>();
  const { data: request, isLoading } = useSignatureRequestByToken(token);
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

  const currentRecipient = request?.signature_recipients?.find((r) => r.status === 'pending');
  const allSigned = request?.signature_recipients?.every((r) => r.status === 'signed');

  // Initialize fields based on recipient role
  useEffect(() => {
    if (currentRecipient && fields.length === 0) {
      const f = getFieldsForRole(currentRecipient.role);
      f[0].status = 'active';
      setFields(f);
      setActiveIndex(0);
    }
  }, [currentRecipient, fields.length]);

  // Auto-scroll to active field
  useEffect(() => {
    if (fields.length === 0) return;
    const active = fields[activeIndex];
    if (!active || active.status === 'completed') return;
    const el = fieldRefs.current[active.id];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [activeIndex, fields]);

  // Canvas setup
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
    if (modalOpen && signMode === 'draw') {
      setTimeout(initCanvas, 100);
    }
  }, [modalOpen, signMode, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
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
      // Auto-fill date immediately
      const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, value: today, status: 'completed' } : f))
      );
      advanceToNext(index);
      return;
    }

    // Check if we already have a saved signature/initials
    if (field.type === 'signature' && savedSignature) {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, value: savedSignature, status: 'completed' } : f))
      );
      advanceToNext(index);
      return;
    }
    if (field.type === 'initials' && savedInitials) {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, value: savedInitials, status: 'completed' } : f))
      );
      advanceToNext(index);
      return;
    }

    // Open modal
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

    // Save for reuse
    if (field.type === 'signature') setSavedSignature(sigData);
    if (field.type === 'initials') setSavedInitials(sigData);

    setFields((prev) =>
      prev.map((f, i) => (i === modalFieldIndex ? { ...f, value: sigData, status: 'completed' } : f))
    );

    setModalOpen(false);
    setModalFieldIndex(null);
    advanceToNext(modalFieldIndex);
  };

  const handleFinish = async () => {
    if (!currentRecipient) return;
    const sigField = fields.find((f) => f.type === 'signature');
    const sigData = sigField?.value || '';

    try {
      await signMutation.mutateAsync({ recipientId: currentRecipient.id, signatureData: sigData });
      setFinished(true);
      toast.success('Document signed successfully!');
    } catch {
      toast.error('Failed to sign document');
    }
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Document Not Found</h1>
          <p className="text-muted-foreground">This signing link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (finished || allSigned) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Document Signed!</h1>
          <p className="text-muted-foreground mb-2">
            You have successfully signed <strong>{request.document_name}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">You may close this window.</p>
        </div>
      </div>
    );
  }

  const formData = request.form_data || {};

  // Render a signature value (typed or drawn)
  const renderSigValue = (val: string, small = false) => {
    if (val.startsWith('typed:')) {
      const name = val.replace('typed:', '');
      return (
        <span className={small ? 'text-lg' : 'text-2xl'} style={{ fontFamily: "'Dancing Script', cursive" }}>
          {name}
        </span>
      );
    }
    return <img src={val} alt="Signature" className={small ? 'h-8' : 'h-12'} />;
  };

  // Overlay field component
  const FieldOverlay = ({ field, index }: { field: SignField; index: number }) => {
    const isEmpty = field.status === 'empty';
    const isActive = field.status === 'active';
    const isCompleted = field.status === 'completed';

    return (
      <div
        ref={(el) => { fieldRefs.current[field.id] = el; }}
        onClick={() => handleFieldClick(index)}
        className={`
          relative cursor-pointer transition-all duration-300 rounded-md border-2 px-4 py-3 my-1
          ${isCompleted
            ? 'bg-white border-green-400 cursor-default'
            : isActive
              ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg animate-pulse'
              : isEmpty
                ? 'bg-amber-50 border-amber-300 border-dashed'
                : ''
          }
        `}
        style={{ minHeight: 56 }}
      >
        {isCompleted ? (
          <div className="flex items-center gap-2">
            {field.type === 'date' ? (
              <span className="text-sm font-medium">{field.value}</span>
            ) : (
              renderSigValue(field.value, true)
            )}
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

  // Get fields by section
  const sigField = fields.find((f) => f.type === 'signature');
  const initialField = fields.find((f) => f.type === 'initials');
  const dateField = fields.find((f) => f.type === 'date');
  const sigIdx = fields.findIndex((f) => f.type === 'signature');
  const initialIdx = fields.findIndex((f) => f.type === 'initials');
  const dateIdx = fields.findIndex((f) => f.type === 'date');
  const isSeller = currentRecipient?.role?.toLowerCase().includes('seller');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* DocuSign-style header */}
      <div className="sticky top-0 z-50" style={{ backgroundColor: '#4C00C2' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-white">
          <div>
            <h1 className="text-base font-semibold">{request.document_name}</h1>
            <p className="text-xs opacity-80">From: {request.sender_name}</p>
          </div>
          <div className="text-right">
            {currentRecipient && (
              <p className="text-sm font-medium">Signing as: {currentRecipient.name}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs opacity-80">{completedCount} of {fields.length} completed</span>
              <Progress value={(completedCount / Math.max(fields.length, 1)) * 100} className="w-24 h-1.5 bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Message banner */}
      {request.message && (
        <div className="max-w-5xl mx-auto px-6 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-800">{request.message}</p>
        </div>
      )}

      {/* Document area */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div
          className="bg-white shadow-lg border rounded-sm px-16 py-14 relative"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {/* Contract content */}
          <h2 className="text-center text-lg font-bold mb-1 tracking-wide">
            EXCLUSIVE RIGHT OF SALE LISTING AGREEMENT
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-8" style={{ fontFamily: 'sans-serif' }}>
            THIS IS A LEGALLY BINDING CONTRACT. IF NOT UNDERSTOOD, SEEK LEGAL ADVICE.
          </p>

          <div className="space-y-6 text-sm leading-relaxed">
            <p>
              <strong>1. PARTIES.</strong> This Exclusive Right of Sale Listing Agreement ("Agreement") is entered into between{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.sellerName || '___'}</span> ("Seller") and{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.brokerName || '___'}</span> of{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.brokerCompany || '___'}</span> ("Broker").
            </p>
            <p>
              <strong>2. PROPERTY.</strong> Seller hereby lists with Broker the property located at{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.propertyAddress || '___'}</span> ("Property"),
              including all improvements thereon and all rights appurtenant thereto.
            </p>
            <p>
              <strong>3. LISTING PERIOD.</strong> This Agreement shall commence on{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.listingStartDate || '___'}</span> and shall expire on{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.listingExpiration || '___'}</span>.
            </p>
            <p>
              <strong>4. LISTING PRICE.</strong> Seller authorizes Broker to offer the Property for sale at a listing price of{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.listPrice || '___'}</span>.
            </p>
            <p>
              <strong>5. BROKER'S COMPENSATION.</strong> Seller agrees to pay Broker a commission of{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.commissionRate || '___'}</span>% of the gross sales price.
            </p>
            <p>
              <strong>6. MLS AUTHORIZATION.</strong> Seller authorizes Broker to submit this listing to the MLS (MLS#:{' '}
              <span className="border-b-2 border-foreground/30 px-1">{formData.mlsNumber || '___'}</span>).
            </p>
            <p><strong>7. SELLER'S REPRESENTATIONS.</strong> Seller represents that Seller has full authority to execute this Agreement and to sell the Property.</p>
            <p><strong>8. BROKER'S DUTIES.</strong> Broker agrees to use reasonable efforts to market the Property.</p>

            {/* Signature section with overlays embedded in the document */}
            <div className="mt-12 pt-8 border-t">
              <div className="grid grid-cols-2 gap-8">
                {/* Seller column */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>
                    Seller
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Signature</p>
                      {isSeller && sigField ? (
                        <FieldOverlay field={sigField} index={sigIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-10 flex items-end">
                          {request.signature_recipients?.filter(r => r.role?.toLowerCase().includes('seller') && r.signature_data).map(r => (
                            <div key={r.id}>
                              {r.signature_data?.startsWith('typed:') ? (
                                <span className="text-xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span>
                              ) : (
                                <img src={r.signature_data!} alt="Signature" className="h-10" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Initials</p>
                      {isSeller && initialField ? (
                        <FieldOverlay field={initialField} index={initialIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-8" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Date Signed</p>
                      {isSeller && dateField ? (
                        <FieldOverlay field={dateField} index={dateIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-8" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Broker column */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>
                    Broker / Agent
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Signature</p>
                      {!isSeller && sigField ? (
                        <FieldOverlay field={sigField} index={sigIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-10 flex items-end">
                          {request.signature_recipients?.filter(r => (r.role?.toLowerCase().includes('broker') || r.role?.toLowerCase().includes('agent'))).filter(r => r.signature_data).map(r => (
                            <div key={r.id}>
                              {r.signature_data?.startsWith('typed:') ? (
                                <span className="text-xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span>
                              ) : (
                                <img src={r.signature_data!} alt="Signature" className="h-10" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Initials</p>
                      {!isSeller && initialField ? (
                        <FieldOverlay field={initialField} index={initialIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-8" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: 'sans-serif' }}>Date Signed</p>
                      {!isSeller && dateField ? (
                        <FieldOverlay field={dateField} index={dateIdx} />
                      ) : (
                        <div className="border-b border-foreground/20 h-8" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Finish CTA */}
        {allFieldsDone && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleFinish}
              disabled={signMutation.isPending}
              className="px-12 py-6 text-lg font-semibold rounded-lg shadow-xl"
              style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}
            >
              <Check className="w-5 h-5 mr-2" />
              {signMutation.isPending ? 'Completing...' : 'Finish Signing'}
            </Button>
          </div>
        )}

        {/* Legal disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto">
          By clicking "Finish Signing", you agree that your electronic signature is the legal equivalent of your manual signature on this document.
        </p>
      </div>

      {/* Signature / Initials Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials'
                ? 'Add Your Initials'
                : 'Adopt Your Signature'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your {modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'initials' : 'signature'} below. It will be applied to this and future fields.
            </p>

            {/* Mode tabs */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setSignMode('type')}
                className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'type' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Type className="w-3.5 h-3.5 inline mr-1.5" /> Type
              </button>
              <button
                onClick={() => setSignMode('draw')}
                className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === 'draw' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Pen className="w-3.5 h-3.5 inline mr-1.5" /> Draw
              </button>
            </div>

            {signMode === 'type' ? (
              <div>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={modalFieldIndex !== null && fields[modalFieldIndex]?.type === 'initials' ? 'Your initials' : 'Your full name'}
                  className="w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                  autoFocus
                />
                {typedName && (
                  <div className="mt-3 p-4 bg-muted/30 border rounded-md text-center">
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <p className="text-3xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{typedName}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  className="border rounded-md cursor-crosshair w-full bg-white"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-1 text-xs">
                  Clear
                </Button>
              </div>
            )}

            <Button onClick={handleAdoptSign} className="w-full" style={{ backgroundColor: '#F5C518', color: '#1a1a2e' }}>
              Adopt and Sign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
