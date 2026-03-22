import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSignatureRequestByToken, useSignDocument } from '@/hooks/useSignatureRequests';
import { Check, Pen, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function SignDocument() {
  const { token } = useParams<{ token: string }>();
  const { data: request, isLoading } = useSignatureRequestByToken(token);
  const signMutation = useSignDocument();

  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [signed, setSigned] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Find current signer (first pending recipient)
  const currentRecipient = request?.signature_recipients?.find((r) => r.status === 'pending');
  const allSigned = request?.signature_recipients?.every((r) => r.status === 'signed');

  useEffect(() => {
    if (currentRecipient && !selectedRecipientId) {
      setSelectedRecipientId(currentRecipient.id);
    }
  }, [currentRecipient, selectedRecipientId]);

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
    if (mode === 'draw') initCanvas();
  }, [mode, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
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

  const handleSign = async () => {
    if (!selectedRecipientId) return;

    let signatureData = '';
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) { toast.error('Please type your name'); return; }
      signatureData = `typed:${typedName.trim()}`;
    }

    try {
      await signMutation.mutateAsync({ recipientId: selectedRecipientId, signatureData });
      setSigned(true);
      toast.success('Document signed successfully!');
    } catch {
      toast.error('Failed to sign document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Document Not Found</h1>
          <p className="text-muted-foreground">This signing link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (signed || allSigned) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Document Signed!</h1>
          <p className="text-muted-foreground mb-2">
            You have successfully signed <strong>{request.document_name}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">You may close this window.</p>
        </div>
      </div>
    );
  }

  const formData = request.form_data || {};

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Sign Document</h1>
            <p className="text-sm opacity-80">{request.document_name}</p>
          </div>
          <div className="text-right text-sm opacity-80">
            <p>From: {request.sender_name}</p>
            {currentRecipient && <p>Signing as: {currentRecipient.name}</p>}
          </div>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="max-w-4xl mx-auto px-6 py-3 bg-info-light border-b">
          <p className="text-sm text-foreground">{request.message}</p>
        </div>
      )}

      {/* Document Preview */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-background shadow-sm border rounded px-16 py-12 mb-8" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          <h2 className="text-center text-lg font-bold mb-1 tracking-wide">EXCLUSIVE RIGHT OF SALE LISTING AGREEMENT</h2>
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
              <span className="border-b-2 border-foreground/30 px-1">{formData.propertyAddress || '___'}</span> ("Property"), including all improvements thereon and all rights appurtenant thereto.
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

            {/* Signature lines with any existing signatures */}
            <div className="mt-12 pt-8 border-t space-y-8">
              <div className="flex gap-8">
                <div className="flex-1">
                  <div className="border-b border-foreground/30 pb-1 mb-1">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Seller Signature</span>
                  </div>
                  {request.signature_recipients?.filter(r => r.role?.includes('Seller') && r.signature_data).map(r => (
                    <div key={r.id} className="my-2">
                      {r.signature_data?.startsWith('typed:') ? (
                        <span className="text-2xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span>
                      ) : (
                        <img src={r.signature_data!} alt="Signature" className="h-12" />
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Date: _______________</div>
                </div>
                <div className="flex-1">
                  <div className="border-b border-foreground/30 pb-1 mb-1">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Broker Signature</span>
                  </div>
                  {request.signature_recipients?.filter(r => r.role?.includes('Broker') || r.role?.includes('Agent')).filter(r => r.signature_data).map(r => (
                    <div key={r.id} className="my-2">
                      {r.signature_data?.startsWith('typed:') ? (
                        <span className="text-2xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{r.signature_data.replace('typed:', '')}</span>
                      ) : (
                        <img src={r.signature_data!} alt="Signature" className="h-12" />
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Date: _______________</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        {currentRecipient && (
          <div className="bg-background shadow-sm border rounded p-8">
            <h3 className="text-lg font-semibold text-foreground mb-1">Sign Here</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Signing as <strong>{currentRecipient.name}</strong> ({currentRecipient.role || 'Signer'})
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <Button variant={mode === 'draw' ? 'default' : 'outline'} size="sm" onClick={() => setMode('draw')} className="gap-1.5">
                <Pen className="w-3.5 h-3.5" /> Draw
              </Button>
              <Button variant={mode === 'type' ? 'default' : 'outline'} size="sm" onClick={() => setMode('type')} className="gap-1.5">
                <Type className="w-3.5 h-3.5" /> Type
              </Button>
            </div>

            {mode === 'draw' ? (
              <div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="border rounded-md cursor-crosshair w-full"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-2 text-xs">
                  Clear
                </Button>
              </div>
            ) : (
              <div>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                />
                {typedName && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <p className="text-3xl" style={{ fontFamily: "'Dancing Script', cursive" }}>{typedName}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Button onClick={handleSign} disabled={signMutation.isPending} className="gap-1.5">
                <Check className="w-4 h-4" /> {signMutation.isPending ? 'Signing...' : 'Sign & Complete'}
              </Button>
              <p className="text-xs text-muted-foreground">
                By clicking "Sign & Complete", you agree that your electronic signature is the legal equivalent of your manual signature.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Font for cursive */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}
