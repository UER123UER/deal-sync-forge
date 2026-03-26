import { useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, IText, Line, PencilBrush, FabricImage, FabricObject, Ellipse, Group } from 'fabric';
import type { ToolMode } from './PdfToolbar';

export interface FontStyle {
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface PdfCanvasProps {
  pageImageUrl: string | null;
  pageWidth: number;
  pageHeight: number;
  activeTool: ToolMode;
  onSelectionChange: (hasSelection: boolean) => void;
  onSelectionFontChange?: (style: FontStyle | null) => void;
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
  onSelectionFontChange,
  fabricCanvasRef,
  signatureDataUrl,
  initialsDataUrl,
  onRequestSignature,
  onRequestInitials,
}: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const onCanvasReadyRef = useRef(onCanvasReady);
  const onCanvasChangeRef = useRef(onCanvasChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onSelectionFontChangeRef = useRef(onSelectionFontChange);
  const drawStateRef = useRef<{ isDrawing: boolean; startX: number; startY: number; tempObj: FabricObject | null }>({
    isDrawing: false, startX: 0, startY: 0, tempObj: null,
  });

  useEffect(() => {
    onCanvasReadyRef.current = onCanvasReady;
    onCanvasChangeRef.current = onCanvasChange;
    onSelectionChangeRef.current = onSelectionChange;
    onSelectionFontChangeRef.current = onSelectionFontChange;
  }, [onCanvasChange, onCanvasReady, onSelectionChange, onSelectionFontChange]);


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
      preserveObjectStacking: true,
      selectionBorderColor: '#2563eb',
      selectionColor: 'rgba(37, 99, 235, 0.12)',
      selectionLineWidth: 1.5,
    });
    fabricCanvasRef.current = fc;

    const reportFontStyle = () => {
      const obj = fc.getActiveObject() as any;
      if (obj && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
        onSelectionFontChangeRef.current?.({
          fontSize: obj.fontSize ?? 14,
          bold: obj.fontWeight === 'bold',
          italic: obj.fontStyle === 'italic',
          underline: !!obj.underline,
        });
      } else {
        onSelectionFontChangeRef.current?.(null);
      }
    };

    fc.on('selection:created', () => { onSelectionChangeRef.current(true); reportFontStyle(); });
    fc.on('selection:updated', () => { onSelectionChangeRef.current(true); reportFontStyle(); });
    fc.on('selection:cleared', () => { onSelectionChangeRef.current(false); onSelectionFontChangeRef.current?.(null); });

    const handleCanvasChange = () => onCanvasChangeRef.current?.();
    fc.on('path:created', handleCanvasChange);
    fc.on('object:modified', handleCanvasChange);
    fc.on('text:changed', handleCanvasChange);

    return () => {
      fc.dispose();
      fabricCanvasRef.current = null;
    };
  }, [pageWidth, pageHeight]);

  // Update tool mode + attach drag-draw handlers
  useEffect(() => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;

    const dragTools = ['line', 'highlight', 'ellipse'];
    const isDragTool = dragTools.includes(activeTool);

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

    // Drag-draw handlers for line, highlight, ellipse
    const onMouseDown = (opt: any) => {
      if (!isDragTool) return;
      const pointer = fc.getScenePoint(opt.e);
      const ds = drawStateRef.current;
      ds.isDrawing = true;
      ds.startX = pointer.x;
      ds.startY = pointer.y;

      let obj: FabricObject;
      if (activeTool === 'line') {
        obj = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#000000', strokeWidth: 2, selectable: false, evented: false,
        });
      } else if (activeTool === 'highlight') {
        obj = new Rect({
          left: pointer.x, top: pointer.y, width: 0, height: 0,
          fill: 'rgba(255, 255, 0, 0.35)', strokeWidth: 0,
          selectable: false, evented: false,
        });
        (obj as any).customType = 'highlight';
      } else {
        // ellipse
        obj = new Ellipse({
          left: pointer.x, top: pointer.y, rx: 0, ry: 0,
          fill: 'transparent', stroke: '#ef4444', strokeWidth: 2,
          selectable: false, evented: false,
        });
      }
      ds.tempObj = obj;
      fc.add(obj);
      fc.renderAll();
    };

    const onMouseMove = (opt: any) => {
      const ds = drawStateRef.current;
      if (!ds.isDrawing || !ds.tempObj) return;
      const pointer = fc.getScenePoint(opt.e);

      if (activeTool === 'line') {
        (ds.tempObj as Line).set({ x2: pointer.x, y2: pointer.y });
      } else if (activeTool === 'highlight') {
        const left = Math.min(ds.startX, pointer.x);
        const top = Math.min(ds.startY, pointer.y);
        ds.tempObj.set({
          left, top,
          width: Math.abs(pointer.x - ds.startX),
          height: Math.abs(pointer.y - ds.startY),
        });
      } else if (activeTool === 'ellipse') {
        const left = Math.min(ds.startX, pointer.x);
        const top = Math.min(ds.startY, pointer.y);
        (ds.tempObj as Ellipse).set({
          left, top,
          rx: Math.abs(pointer.x - ds.startX) / 2,
          ry: Math.abs(pointer.y - ds.startY) / 2,
        });
      }
      fc.renderAll();
    };

    const onMouseUp = () => {
      const ds = drawStateRef.current;
      if (!ds.isDrawing || !ds.tempObj) return;
      ds.tempObj.set({ selectable: true, evented: true });
      fc.setActiveObject(ds.tempObj);
      ds.isDrawing = false;
      ds.tempObj = null;
      fc.renderAll();
    };

    if (isDragTool) {
      fc.on('mouse:down', onMouseDown);
      fc.on('mouse:move', onMouseMove);
      fc.on('mouse:up', onMouseUp);
    }

    return () => {
      if (isDragTool) {
        fc.off('mouse:down', onMouseDown);
        fc.off('mouse:move', onMouseMove);
        fc.off('mouse:up', onMouseUp);
      }
    };
  }, [activeTool]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    // Skip for tools handled by drag or built-in modes
    if (['select', 'draw', 'line', 'highlight', 'ellipse'].includes(activeTool)) return;


    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text' || activeTool === 'textbox') {
      const text = new IText('Type here', {
        left: x, top: y, fontSize: 14, fontFamily: 'Arial',
        fill: '#000000', editable: true,
      });
      applySelectionStyles(text);
      fc.add(text);
      fc.setActiveObject(text);
      text.enterEditing();
    } else if (activeTool === 'strikethrough') {
      const line = new Line([x - 100, y, x + 100, y], {
        stroke: '#ef4444', strokeWidth: 2,
      });
      (line as any).customType = 'strikethrough';
      applySelectionStyles(line);
      fc.add(line);
      fc.setActiveObject(line);
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
      addDesignatedField(fc, x, y, 'MM/DD/YYYY', 'rgba(34, 197, 94, 0.3)', '#15803d', 'date', onCanvasChange);
    } else if (activeTool === 'designate-fullname') {
      addPresetTextField(fc, x, y, 'Full Name', 'Enter full name...', '#1e40af', onCanvasChange);
    } else if (activeTool === 'designate-email') {
      addPresetTextField(fc, x, y, 'Email', 'email@example.com', '#7c3aed', onCanvasChange);
    } else if (activeTool === 'designate-time') {
      addDesignatedField(fc, x, y, 'HH:MM AM/PM', 'rgba(249, 115, 22, 0.3)', '#c2410c', 'time', onCanvasChange);
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
    applySelectionStyles(fImg);
    fc.add(fImg);
    fc.setActiveObject(fImg);
    fc.renderAll();
  };
  imgEl.src = dataUrl;
}

function addPresetTextField(
  fc: FabricCanvas, x: number, y: number,
  label: string, placeholder: string, color: string, onCanvasChange?: () => void
) {
  const w = label === 'Email' ? 200 : 220;
  const h = 32;

  const bg = new Rect({
    left: 0, top: 0, width: w, height: h,
    fill: `rgba(${color === '#1e40af' ? '30,64,175' : '124,58,237'},0.08)`,
    stroke: color, strokeWidth: 1.5,
    rx: 4, ry: 4,
  });

  const labelText = new IText(`${label}: `, {
    left: 6, top: 6, fontSize: 11, fontFamily: 'Arial',
    fill: color, fontWeight: 'bold', editable: false,
    selectable: false, evented: false,
  });

  const valueText = new IText(placeholder, {
    left: label === 'Email' ? 52 : 60, top: 7, fontSize: 11, fontFamily: 'Arial',
    fill: '#6b7280', fontStyle: 'italic', editable: true,
    selectable: false, evented: false,
  });

  const group = new Group([bg, labelText, valueText], {
    left: x, top: y,
    subTargetCheck: false,
  });
  applySelectionStyles(group);
  (group as any).customType = `designated-${label.toLowerCase().replace(' ', '')}`;
  (group as any).fieldType = label.toLowerCase().replace(' ', '');

  fc.add(group);
  fc.setActiveObject(group);
  fc.renderAll();
  onCanvasChange?.();
}

function addDesignatedField(
  fc: FabricCanvas, x: number, y: number,
  label: string, bgColor: string, textColor: string, fieldType: string
) {
  const w = fieldType === 'date' ? 120 : fieldType === 'initials' ? 100 : 160;
  const h = 30;

  const bg = new Rect({
    left: 0, top: 0, width: w, height: h,
    fill: bgColor, stroke: textColor, strokeWidth: 1.5,
    rx: 4, ry: 4,
  });

  const text = new IText(label, {
    left: 8, top: 6, fontSize: 13, fontFamily: 'Arial',
    fill: textColor, fontWeight: 'bold', editable: false,
    selectable: false, evented: false,
  });

  const group = new Group([bg, text], {
    left: x,
    top: y,
    subTargetCheck: false,
  });
  applySelectionStyles(group);
  (group as any).customType = `designated-${fieldType}`;
  (group as any).fieldType = fieldType;

  fc.add(group);
  fc.setActiveObject(group);
  fc.renderAll();
}

function applySelectionStyles(obj: FabricObject) {
  obj.set({
    borderColor: '#2563eb',
    cornerColor: '#2563eb',
    cornerStrokeColor: '#ffffff',
    cornerStyle: 'circle',
    transparentCorners: false,
    cornerSize: 10,
    padding: 4,
  });
}
