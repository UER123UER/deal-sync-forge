import { useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, IText, Line, PencilBrush, FabricImage, FabricObject } from 'fabric';
import type { ToolMode } from './PdfToolbar';

interface PdfCanvasProps {
  pageImageUrl: string | null;
  pageWidth: number;
  pageHeight: number;
  activeTool: ToolMode;
  onSelectionChange: (hasSelection: boolean) => void;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
  signatureDataUrl: string | null;
  initialsDataUrl: string | null;
  onRequestSignature: () => void;
  onRequestInitials: () => void;
}

export function PdfCanvas({
  pageImageUrl,
  pageWidth,
  pageHeight,
  activeTool,
  onSelectionChange,
  fabricCanvasRef,
  signatureDataUrl,
  initialsDataUrl,
  onRequestSignature,
  onRequestInitials,
}: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const lineStartRef = useRef<{ x: number; y: number } | null>(null);

  // Render PDF page image on background canvas
  useEffect(() => {
    if (!pageImageUrl || !bgCanvasRef.current) return;
    const bgCanvas = bgCanvasRef.current;
    bgCanvas.width = pageWidth;
    bgCanvas.height = pageHeight;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, pageWidth, pageHeight);
      ctx.drawImage(img, 0, 0, pageWidth, pageHeight);
    };
    img.src = pageImageUrl;
  }, [pageImageUrl, pageWidth, pageHeight]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasElRef.current) return;
    const fc = new FabricCanvas(canvasElRef.current, {
      width: pageWidth,
      height: pageHeight,
      selection: true,
      backgroundColor: 'transparent',
    });
    fabricCanvasRef.current = fc;

    fc.on('selection:created', () => onSelectionChange(true));
    fc.on('selection:updated', () => onSelectionChange(true));
    fc.on('selection:cleared', () => onSelectionChange(false));

    return () => {
      fc.dispose();
      fabricCanvasRef.current = null;
    };
  }, [pageWidth, pageHeight]);

  // Update tool mode
  useEffect(() => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;

    fc.isDrawingMode = activeTool === 'draw';
    if (activeTool === 'draw') {
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.width = 2;
      fc.freeDrawingBrush.color = '#000000';
    }

    const isSelectMode = activeTool === 'select';
    fc.selection = isSelectMode;
    fc.forEachObject((obj: FabricObject) => {
      obj.selectable = isSelectMode;
      obj.evented = isSelectMode;
    });

    if (!isSelectMode && activeTool !== 'draw') {
      fc.discardActiveObject();
      fc.renderAll();
    }
  }, [activeTool]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    if (activeTool === 'select' || activeTool === 'draw') return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text') {
      const text = new IText('Type here', {
        left: x, top: y, fontSize: 14, fontFamily: 'Arial',
        fill: '#000000', editable: true,
      });
      fc.add(text);
      fc.setActiveObject(text);
      text.enterEditing();
    } else if (activeTool === 'highlight') {
      const highlight = new Rect({
        left: x, top: y, width: 150, height: 20,
        fill: 'rgba(255, 255, 0, 0.35)', stroke: 'transparent',
        strokeWidth: 0,
      });
      (highlight as any).customType = 'highlight';
      fc.add(highlight);
    } else if (activeTool === 'line') {
      if (!lineStartRef.current) {
        lineStartRef.current = { x, y };
      } else {
        const line = new Line(
          [lineStartRef.current.x, lineStartRef.current.y, x, y],
          { stroke: '#000000', strokeWidth: 2 }
        );
        fc.add(line);
        lineStartRef.current = null;
      }
    } else if (activeTool === 'sign') {
      if (signatureDataUrl) {
        addImageStamp(fc, signatureDataUrl, x, y, 150, 50);
      } else {
        onRequestSignature();
      }
    } else if (activeTool === 'initials') {
      if (initialsDataUrl) {
        addImageStamp(fc, initialsDataUrl, x, y, 80, 40);
      } else {
        onRequestInitials();
      }
    } else if (activeTool === 'designate-signature') {
      addDesignatedField(fc, x, y, 'SIGN HERE', 'rgba(255, 200, 0, 0.3)', '#b45309', 'signature');
    } else if (activeTool === 'designate-initials') {
      addDesignatedField(fc, x, y, 'INITIALS', 'rgba(59, 130, 246, 0.3)', '#1d4ed8', 'initials');
    } else if (activeTool === 'designate-date') {
      addDesignatedField(fc, x, y, 'DATE', 'rgba(34, 197, 94, 0.3)', '#15803d', 'date');
    }

    fc.renderAll();
  }, [activeTool, signatureDataUrl, initialsDataUrl, onRequestSignature, onRequestInitials]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block border shadow-sm bg-white"
      style={{ width: pageWidth, height: pageHeight }}
      onClick={handleCanvasClick}
    >
      <canvas ref={bgCanvasRef} className="absolute inset-0" style={{ width: pageWidth, height: pageHeight }} />
      <canvas ref={canvasElRef} className="absolute inset-0" style={{ width: pageWidth, height: pageHeight }} />
    </div>
  );
}

function addImageStamp(fc: FabricCanvas, dataUrl: string, x: number, y: number, w: number, h: number) {
  const imgEl = new Image();
  imgEl.onload = () => {
    const fImg = new FabricImage(imgEl, {
      left: x, top: y, scaleX: w / imgEl.width, scaleY: h / imgEl.height,
    });
    fc.add(fImg);
    fc.renderAll();
  };
  imgEl.src = dataUrl;
}

function addDesignatedField(
  fc: FabricCanvas, x: number, y: number,
  label: string, bgColor: string, textColor: string, fieldType: string
) {
  const w = fieldType === 'date' ? 120 : fieldType === 'initials' ? 100 : 160;
  const h = 30;

  const bg = new Rect({
    left: x, top: y, width: w, height: h,
    fill: bgColor, stroke: textColor, strokeWidth: 1.5,
    rx: 4, ry: 4,
  });
  (bg as any).customType = `designated-${fieldType}`;
  (bg as any).fieldType = fieldType;

  const text = new IText(label, {
    left: x + 8, top: y + 6, fontSize: 13, fontFamily: 'Arial',
    fill: textColor, fontWeight: 'bold', editable: false,
    selectable: false, evented: false,
  });
  (text as any).customType = `designated-${fieldType}-label`;

  fc.add(bg);
  fc.add(text);
}
