import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface SignatureStampModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
  mode: 'sign' | 'initials';
}

export function SignatureStampModal({ open, onClose, onConfirm, mode }: SignatureStampModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [tab, setTab] = useState<string>('draw');

  useEffect(() => {
    if (open && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setTypedText('');
  }, [open]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const handleConfirm = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        onConfirm(canvas.toDataURL('image/png'));
      }
    } else {
      // Generate text-based signature
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = mode === 'sign' ? 'italic 32px Georgia, serif' : '28px Georgia, serif';
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedText, 10, 40);
        onConfirm(canvas.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'sign' ? 'Create Signature' : 'Create Initials'}</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="draw" className="flex-1">Draw</TabsTrigger>
            <TabsTrigger value="type" className="flex-1">Type</TabsTrigger>
          </TabsList>
          <TabsContent value="draw" className="mt-3">
            <div className="border rounded-md bg-white relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-1 text-xs">
              Clear
            </Button>
          </TabsContent>
          <TabsContent value="type" className="mt-3">
            <Input
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={mode === 'sign' ? 'Type your full name' : 'Type your initials'}
              className="text-lg"
            />
            {typedText && (
              <div className="mt-2 p-3 border rounded bg-white">
                <span style={{ fontFamily: 'Georgia, serif', fontStyle: mode === 'sign' ? 'italic' : 'normal', fontSize: mode === 'sign' ? '28px' : '24px' }}>
                  {typedText}
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Adopt & Use</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
