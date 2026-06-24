import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import * as React from "react";
import { useRef, useEffect, useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas, PencilBrush, IText, Line, FabricImage, Rect, Group, Ellipse } from "fabric";
import { Trash2, Plus, ChevronDown, GripVertical, FileText, Users, List, LayoutGrid, Settings, HelpCircle, PenTool, Hash, User, Mail, CalendarDays, Clock, MousePointer2, Type, Highlighter, Minus, Pencil, Strikethrough, Circle, ArrowLeft, ZoomOut, ZoomIn, Bold, Italic, Underline, Upload, Printer, Download, Save, ChevronRight } from "lucide-react";
import { c as cn, L as Label, I as Input, B as Button, q as Accordion, r as AccordionItem, t as AccordionTrigger, v as AccordionContent, s as supabase } from "../main.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-z1c4sRu8.js";
import { S as ScrollArea } from "./scroll-area-aYSY-tkZ.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-BhAZyUdo.js";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { toast } from "sonner";
import "vite-react-ssg";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-scroll-area";
function PdfCanvas({
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
  assignedRecipientId,
  onCanvasReady,
  onCanvasChange
}) {
  const containerRef = useRef(null);
  const canvasElRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const onCanvasReadyRef = useRef(onCanvasReady);
  const onCanvasChangeRef = useRef(onCanvasChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onSelectionFontChangeRef = useRef(onSelectionFontChange);
  const drawStateRef = useRef({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempObj: null
  });
  useEffect(() => {
    onCanvasReadyRef.current = onCanvasReady;
    onCanvasChangeRef.current = onCanvasChange;
    onSelectionChangeRef.current = onSelectionChange;
    onSelectionFontChangeRef.current = onSelectionFontChange;
  }, [onCanvasChange, onCanvasReady, onSelectionChange, onSelectionFontChange]);
  useEffect(() => {
    if (!pageImageUrl || !bgCanvasRef.current) return;
    const bgCanvas = bgCanvasRef.current;
    bgCanvas.width = pageWidth;
    bgCanvas.height = pageHeight;
    const ctx = bgCanvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, pageWidth, pageHeight);
      ctx.drawImage(img, 0, 0, pageWidth, pageHeight);
    };
    img.src = pageImageUrl;
  }, [pageImageUrl, pageWidth, pageHeight]);
  useEffect(() => {
    if (!canvasElRef.current) return;
    const fc = new Canvas(canvasElRef.current, {
      width: pageWidth,
      height: pageHeight,
      selection: true,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
      selectionBorderColor: "#2563eb",
      selectionColor: "rgba(37, 99, 235, 0.12)",
      selectionLineWidth: 1.5
    });
    fabricCanvasRef.current = fc;
    const reportFontStyle = () => {
      var _a, _b;
      const obj = fc.getActiveObject();
      if (obj && (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text")) {
        (_a = onSelectionFontChangeRef.current) == null ? void 0 : _a.call(onSelectionFontChangeRef, {
          fontSize: obj.fontSize ?? 14,
          bold: obj.fontWeight === "bold",
          italic: obj.fontStyle === "italic",
          underline: !!obj.underline
        });
      } else {
        (_b = onSelectionFontChangeRef.current) == null ? void 0 : _b.call(onSelectionFontChangeRef, null);
      }
    };
    fc.on("selection:created", () => {
      onSelectionChangeRef.current(true);
      reportFontStyle();
    });
    fc.on("selection:updated", () => {
      onSelectionChangeRef.current(true);
      reportFontStyle();
    });
    fc.on("selection:cleared", () => {
      var _a;
      onSelectionChangeRef.current(false);
      (_a = onSelectionFontChangeRef.current) == null ? void 0 : _a.call(onSelectionFontChangeRef, null);
    });
    const handleCanvasChange = () => {
      var _a;
      return (_a = onCanvasChangeRef.current) == null ? void 0 : _a.call(onCanvasChangeRef);
    };
    fc.on("path:created", handleCanvasChange);
    fc.on("object:modified", handleCanvasChange);
    fc.on("object:added", handleCanvasChange);
    fc.on("object:removed", handleCanvasChange);
    fc.on("text:changed", handleCanvasChange);
    requestAnimationFrame(() => {
      var _a;
      (_a = onCanvasReadyRef.current) == null ? void 0 : _a.call(onCanvasReadyRef);
    });
    return () => {
      fc.dispose();
      fabricCanvasRef.current = null;
    };
  }, [pageWidth, pageHeight]);
  useEffect(() => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const dragTools = ["line", "highlight", "ellipse"];
    const isDragTool = dragTools.includes(activeTool);
    fc.isDrawingMode = activeTool === "draw";
    if (activeTool === "draw") {
      fc.freeDrawingBrush = new PencilBrush(fc);
      fc.freeDrawingBrush.width = 2;
      fc.freeDrawingBrush.color = "#000000";
    }
    const isSelectMode = activeTool === "select";
    fc.selection = isSelectMode;
    fc.forEachObject((obj) => {
      obj.selectable = isSelectMode;
      obj.evented = isSelectMode;
    });
    if (!isSelectMode && activeTool !== "draw") {
      fc.discardActiveObject();
      fc.renderAll();
    }
    const onMouseDown = (opt) => {
      if (!isDragTool) return;
      const pointer = fc.getScenePoint(opt.e);
      const ds = drawStateRef.current;
      ds.isDrawing = true;
      ds.startX = pointer.x;
      ds.startY = pointer.y;
      let obj;
      if (activeTool === "line") {
        obj = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: "#000000",
          strokeWidth: 2,
          selectable: false,
          evented: false
        });
      } else if (activeTool === "highlight") {
        obj = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "rgba(255, 255, 0, 0.35)",
          strokeWidth: 0,
          selectable: false,
          evented: false
        });
        obj.customType = "highlight";
      } else {
        obj = new Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: "transparent",
          stroke: "#ef4444",
          strokeWidth: 2,
          selectable: false,
          evented: false
        });
      }
      ds.tempObj = obj;
      fc.add(obj);
      fc.renderAll();
    };
    const onMouseMove = (opt) => {
      const ds = drawStateRef.current;
      if (!ds.isDrawing || !ds.tempObj) return;
      const pointer = fc.getScenePoint(opt.e);
      if (activeTool === "line") {
        ds.tempObj.set({ x2: pointer.x, y2: pointer.y });
      } else if (activeTool === "highlight") {
        const left = Math.min(ds.startX, pointer.x);
        const top = Math.min(ds.startY, pointer.y);
        ds.tempObj.set({
          left,
          top,
          width: Math.abs(pointer.x - ds.startX),
          height: Math.abs(pointer.y - ds.startY)
        });
      } else if (activeTool === "ellipse") {
        const left = Math.min(ds.startX, pointer.x);
        const top = Math.min(ds.startY, pointer.y);
        ds.tempObj.set({
          left,
          top,
          rx: Math.abs(pointer.x - ds.startX) / 2,
          ry: Math.abs(pointer.y - ds.startY) / 2
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
      fc.on("mouse:down", onMouseDown);
      fc.on("mouse:move", onMouseMove);
      fc.on("mouse:up", onMouseUp);
    }
    return () => {
      if (isDragTool) {
        fc.off("mouse:down", onMouseDown);
        fc.off("mouse:move", onMouseMove);
        fc.off("mouse:up", onMouseUp);
      }
    };
  }, [activeTool]);
  const handleCanvasClick = useCallback((e) => {
    var _a;
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    if (["select", "draw", "line", "highlight", "ellipse"].includes(activeTool)) return;
    const rect = (_a = containerRef.current) == null ? void 0 : _a.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (activeTool === "text" || activeTool === "textbox") {
      const text = new IText("Type here", {
        left: x,
        top: y,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#000000",
        editable: true
      });
      applySelectionStyles(text);
      fc.add(text);
      fc.setActiveObject(text);
      text.enterEditing();
    } else if (activeTool === "strikethrough") {
      const line = new Line([x - 100, y, x + 100, y], {
        stroke: "#ef4444",
        strokeWidth: 2
      });
      line.customType = "strikethrough";
      applySelectionStyles(line);
      fc.add(line);
      fc.setActiveObject(line);
    } else if (activeTool === "sign") {
      if (signatureDataUrl) {
        addImageStamp(fc, signatureDataUrl, x, y, 150, 50, assignedRecipientId);
      } else {
        onRequestSignature();
      }
    } else if (activeTool === "initials") {
      if (initialsDataUrl) {
        addImageStamp(fc, initialsDataUrl, x, y, 80, 40, assignedRecipientId);
      } else {
        onRequestInitials();
      }
    } else if (activeTool === "designate-signature") {
      addDesignatedField(fc, x, y, "SIGN HERE", "rgba(255, 200, 0, 0.3)", "#b45309", "signature", assignedRecipientId, onCanvasChange);
    } else if (activeTool === "designate-initials") {
      addDesignatedField(fc, x, y, "INITIALS", "rgba(59, 130, 246, 0.3)", "#1d4ed8", "initials", assignedRecipientId, onCanvasChange);
    } else if (activeTool === "designate-date") {
      addDesignatedField(fc, x, y, "MM/DD/YYYY", "rgba(34, 197, 94, 0.3)", "#15803d", "date", assignedRecipientId, onCanvasChange);
    } else if (activeTool === "designate-fullname") {
      addPresetTextField(fc, x, y, "Full Name", "Enter full name...", "#1e40af", assignedRecipientId, onCanvasChange);
    } else if (activeTool === "designate-email") {
      addPresetTextField(fc, x, y, "Email", "email@example.com", "#7c3aed", assignedRecipientId, onCanvasChange);
    } else if (activeTool === "designate-time") {
      addDesignatedField(fc, x, y, "HH:MM AM/PM", "rgba(249, 115, 22, 0.3)", "#c2410c", "time", assignedRecipientId, onCanvasChange);
    }
    fc.renderAll();
  }, [activeTool, assignedRecipientId, signatureDataUrl, initialsDataUrl, onRequestSignature, onRequestInitials]);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: containerRef,
      className: "relative inline-block border shadow-sm bg-white",
      style: { width: pageWidth, height: pageHeight },
      onClick: handleCanvasClick,
      children: [
        /* @__PURE__ */ jsxDEV("canvas", { ref: bgCanvasRef, className: "absolute inset-0", style: { width: pageWidth, height: pageHeight } }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfCanvas.tsx",
          lineNumber: 311,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("canvas", { ref: canvasElRef, className: "absolute inset-0", style: { width: pageWidth, height: pageHeight } }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfCanvas.tsx",
          lineNumber: 312,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/dev-server/src/components/admin/PdfCanvas.tsx",
      lineNumber: 305,
      columnNumber: 5
    },
    this
  );
}
function addImageStamp(fc, dataUrl, x, y, w, h, recipientId) {
  const imgEl = new Image();
  imgEl.onload = () => {
    const fImg = new FabricImage(imgEl, {
      left: x,
      top: y,
      scaleX: w / imgEl.width,
      scaleY: h / imgEl.height
    });
    fImg.recipientId = recipientId || null;
    applySelectionStyles(fImg);
    fc.add(fImg);
    fc.setActiveObject(fImg);
    fc.renderAll();
  };
  imgEl.src = dataUrl;
}
function addPresetTextField(fc, x, y, label, placeholder, color, recipientId, onCanvasChange) {
  const w = label === "Email" ? 200 : 220;
  const h = 32;
  const bg = new Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill: `rgba(${color === "#1e40af" ? "30,64,175" : "124,58,237"},0.08)`,
    stroke: color,
    strokeWidth: 1.5,
    rx: 4,
    ry: 4
  });
  const labelText = new IText(`${label}: `, {
    left: 6,
    top: 6,
    fontSize: 11,
    fontFamily: "Arial",
    fill: color,
    fontWeight: "bold",
    editable: false,
    selectable: false,
    evented: false
  });
  const valueText = new IText(placeholder, {
    left: label === "Email" ? 52 : 60,
    top: 7,
    fontSize: 11,
    fontFamily: "Arial",
    fill: "#6b7280",
    fontStyle: "italic",
    editable: true,
    selectable: false,
    evented: false
  });
  const group = new Group([bg, labelText, valueText], {
    left: x,
    top: y,
    subTargetCheck: false
  });
  applySelectionStyles(group);
  group.customType = `designated-${label.toLowerCase().replace(" ", "")}`;
  group.fieldType = label.toLowerCase().replace(" ", "");
  group.recipientId = recipientId || null;
  fc.add(group);
  fc.setActiveObject(group);
  fc.renderAll();
  onCanvasChange == null ? void 0 : onCanvasChange();
}
function addDesignatedField(fc, x, y, label, bgColor, textColor, fieldType, recipientId, onCanvasChange) {
  const w = fieldType === "date" ? 120 : fieldType === "initials" ? 100 : 160;
  const h = 30;
  const bg = new Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill: bgColor,
    stroke: textColor,
    strokeWidth: 1.5,
    rx: 4,
    ry: 4
  });
  const text = new IText(label, {
    left: 8,
    top: 6,
    fontSize: 13,
    fontFamily: "Arial",
    fill: textColor,
    fontWeight: "bold",
    editable: false,
    selectable: false,
    evented: false
  });
  const group = new Group([bg, text], {
    left: x,
    top: y,
    subTargetCheck: false
  });
  applySelectionStyles(group);
  group.customType = `designated-${fieldType}`;
  group.fieldType = fieldType;
  group.recipientId = recipientId || null;
  fc.add(group);
  fc.setActiveObject(group);
  fc.renderAll();
  onCanvasChange == null ? void 0 : onCanvasChange();
}
function applySelectionStyles(obj) {
  obj.set({
    borderColor: "#2563eb",
    cornerColor: "#2563eb",
    cornerStrokeColor: "#ffffff",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 10,
    padding: 4
  });
}
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxDEV(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/components/ui/switch.tsx",
        lineNumber: 18,
        columnNumber: 5
      },
      void 0
    )
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/switch.tsx",
    lineNumber: 10,
    columnNumber: 3
  },
  void 0
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/separator.tsx",
    lineNumber: 10,
    columnNumber: 3
  },
  void 0
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
const allTabs = [
  { id: "signers", icon: Users, label: "Signers" },
  { id: "docs", icon: FileText, label: "Docs" },
  { id: "tools", icon: List, label: "Tools" },
  { id: "layouts", icon: LayoutGrid, label: "Layouts" },
  { id: "options", icon: Settings, label: "Options" },
  { id: "feedback", icon: HelpCircle, label: "Feedback" }
];
const agentTabs = ["signers", "docs", "tools", "layouts", "options"];
const ROLES = ["Seller", "Buyer", "Agent", "Broker", "Attorney", "Other"];
function PdfEditorSidebar({
  activeTab,
  onTabChange,
  activeTool,
  onToolChange,
  signers,
  onAddSigner,
  onRemoveSigner,
  selectedSignerId,
  onSelectSigner,
  documents,
  savedDocuments = [],
  onOpenDocument,
  onDeleteDocument,
  mode = "admin"
}) {
  const tabs = mode === "agent" ? allTabs.filter((t) => agentTabs.includes(t.id)) : allTabs;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSigner, setNewSigner] = useState({ firstName: "", lastName: "", email: "", role: "Seller", type: "Remote Signer" });
  const [signingOrder, setSigningOrder] = useState(false);
  const handleToggleTab = (tab) => {
    onTabChange(activeTab === tab ? null : tab);
  };
  const handleAddSigner = () => {
    if (!newSigner.firstName || !newSigner.email) return;
    onAddSigner(newSigner);
    setNewSigner({ firstName: "", lastName: "", email: "", role: "Seller", type: "Remote Signer" });
    setShowAddForm(false);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "flex h-full", children: [
    activeTab && /* @__PURE__ */ jsxDEV("div", { className: "w-full md:w-[350px] max-w-full border-l bg-card flex flex-col overflow-hidden", children: /* @__PURE__ */ jsxDEV(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { className: "p-4", children: [
      activeTab === "signers" && /* @__PURE__ */ jsxDEV(
        SignersPanel,
        {
          signers,
          signingOrder,
          onSigningOrderChange: setSigningOrder,
          selectedSignerId,
          onSelectSigner,
          onRemoveSigner,
          showAddForm,
          setShowAddForm,
          newSigner,
          setNewSigner,
          onAddSigner: handleAddSigner
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 107,
          columnNumber: 17
        },
        this
      ),
      activeTab === "docs" && /* @__PURE__ */ jsxDEV(
        DocsPanel,
        {
          documents,
          savedDocuments,
          onOpenDocument,
          onDeleteDocument
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 122,
          columnNumber: 17
        },
        this
      ),
      activeTab === "tools" && /* @__PURE__ */ jsxDEV(
        ToolsPanel,
        {
          activeTool,
          onToolChange,
          signers,
          selectedSignerId,
          onSelectSigner,
          agentMode: mode === "agent"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 130,
          columnNumber: 17
        },
        this
      ),
      activeTab === "layouts" && /* @__PURE__ */ jsxDEV(LayoutsPanel, {}, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 139,
        columnNumber: 43
      }, this),
      activeTab === "options" && /* @__PURE__ */ jsxDEV(OptionsPanel, {}, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 140,
        columnNumber: 43
      }, this),
      activeTab === "feedback" && /* @__PURE__ */ jsxDEV(FeedbackPanel, {}, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 141,
        columnNumber: 44
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 105,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 104,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 103,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "w-[60px] bg-muted/50 border-l flex flex-col items-center py-2 gap-1", children: tabs.map((tab) => /* @__PURE__ */ jsxDEV(
      "button",
      {
        onClick: () => handleToggleTab(tab.id),
        className: cn(
          "w-12 h-12 rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
          activeTab === tab.id ? "bg-[#2D5F2B] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        ),
        title: tab.label,
        children: [
          /* @__PURE__ */ jsxDEV(tab.icon, { className: "w-5 h-5" }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 161,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { children: tab.label }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 162,
            columnNumber: 13
          }, this)
        ]
      },
      tab.id,
      true,
      {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 150,
        columnNumber: 11
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 148,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 100,
    columnNumber: 5
  }, this);
}
function SignersPanel({
  signers,
  signingOrder,
  onSigningOrderChange,
  selectedSignerId,
  onSelectSigner,
  onRemoveSigner,
  showAddForm,
  setShowAddForm,
  newSigner,
  setNewSigner,
  onAddSigner
}) {
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Signers" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 192,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "Set signing order" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 194,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Switch, { checked: signingOrder, onCheckedChange: onSigningOrderChange }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 195,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 193,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 191,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: signers.map((s, idx) => {
      var _a;
      return /* @__PURE__ */ jsxDEV(
        "div",
        {
          onClick: () => onSelectSigner(s.id === selectedSignerId ? null : s.id),
          className: cn(
            "flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-colors",
            s.id === selectedSignerId ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
          ),
          children: [
            signingOrder && /* @__PURE__ */ jsxDEV("span", { className: "w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold", children: idx + 1 }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 210,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground", children: [
              s.firstName[0],
              ((_a = s.lastName) == null ? void 0 : _a[0]) || ""
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 214,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-foreground truncate", children: [
                s.firstName,
                " ",
                s.lastName
              ] }, void 0, true, {
                fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
                lineNumber: 218,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground truncate", children: [
                s.role,
                " • ",
                s.email
              ] }, void 0, true, {
                fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
                lineNumber: 219,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 217,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onRemoveSigner(s.id);
                },
                className: "text-muted-foreground hover:text-destructive",
                children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
                  lineNumber: 225,
                  columnNumber: 15
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
                lineNumber: 221,
                columnNumber: 13
              },
              this
            )
          ]
        },
        s.id,
        true,
        {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 201,
          columnNumber: 11
        },
        this
      );
    }) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 199,
      columnNumber: 7
    }, this),
    showAddForm ? /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 p-3 border rounded-md bg-muted/30", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "First Name" }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 235,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              value: newSigner.firstName,
              onChange: (e) => setNewSigner({ ...newSigner, firstName: e.target.value }),
              className: "h-8 text-sm"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 236,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 234,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Last Name" }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 243,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              value: newSigner.lastName,
              onChange: (e) => setNewSigner({ ...newSigner, lastName: e.target.value }),
              className: "h-8 text-sm"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 244,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 242,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 233,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Email" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 252,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            type: "email",
            value: newSigner.email,
            onChange: (e) => setNewSigner({ ...newSigner, email: e.target.value }),
            className: "h-8 text-sm"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 253,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 251,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Role" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 261,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Select, { value: newSigner.role, onValueChange: (v) => setNewSigner({ ...newSigner, role: v }), children: [
          /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 263,
            columnNumber: 54
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 263,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ jsxDEV(SelectItem, { value: r, children: r }, r, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 265,
            columnNumber: 35
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 264,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 262,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 260,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Signer Type" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 270,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Select, { value: newSigner.type, onValueChange: (v) => setNewSigner({ ...newSigner, type: v }), children: [
          /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 272,
            columnNumber: 54
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 272,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SelectContent, { children: [
            /* @__PURE__ */ jsxDEV(SelectItem, { value: "Remote Signer", children: "Remote Signer" }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 274,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(SelectItem, { value: "In-Person Signer", children: "In-Person Signer" }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 275,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 273,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 271,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 269,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: onAddSigner, className: "flex-1", children: "Save" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 280,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", variant: "outline", onClick: () => setShowAddForm(false), className: "flex-1", children: "Cancel" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 281,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 279,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 232,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
      /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full gap-2", children: [
        /* @__PURE__ */ jsxDEV(Plus, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 288,
          columnNumber: 15
        }, this),
        " Add Participants ",
        /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-3 h-3 ml-auto" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 288,
          columnNumber: 61
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 287,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 286,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(DropdownMenuContent, { align: "start", className: "w-56", children: [
        /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => setShowAddForm(true), children: "Add New" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 292,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => setShowAddForm(true), children: "Add from Contacts" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 293,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 291,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 285,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full", children: "Map Signers" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 298,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 190,
    columnNumber: 5
  }, this);
}
function DocsPanel({
  documents,
  savedDocuments = [],
  onOpenDocument,
  onDeleteDocument
}) {
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Current Document" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 316,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: documents.map((doc, idx) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 p-2 border rounded-md bg-muted/30", children: [
      /* @__PURE__ */ jsxDEV(GripVertical, { className: "w-4 h-4 text-muted-foreground" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 320,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-bold", children: idx + 1 }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 321,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "text-sm truncate flex-1", children: doc.name }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 322,
        columnNumber: 13
      }, this)
    ] }, idx, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 319,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 317,
      columnNumber: 7
    }, this),
    savedDocuments.length > 0 && /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(Separator, {}, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 329,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Saved Documents" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 330,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: savedDocuments.map((doc) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 p-2 border rounded-md bg-muted/30", children: [
        /* @__PURE__ */ jsxDEV(FileText, { className: "w-4 h-4 text-muted-foreground shrink-0" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 334,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm truncate", children: doc.file_name }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 336,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground", children: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "" }, void 0, false, {
            fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
            lineNumber: 337,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 335,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", onClick: () => onOpenDocument == null ? void 0 : onOpenDocument(doc.id), children: /* @__PURE__ */ jsxDEV(FileText, { className: "w-3 h-3" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 342,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 341,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0 text-destructive", onClick: () => onDeleteDocument == null ? void 0 : onDeleteDocument(doc.id), children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3 h-3" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 345,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 344,
          columnNumber: 17
        }, this)
      ] }, doc.id, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 333,
        columnNumber: 15
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 331,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 328,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full gap-2", children: [
      /* @__PURE__ */ jsxDEV(Plus, { className: "w-4 h-4" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 354,
        columnNumber: 9
      }, this),
      " Add a Document or Form"
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 353,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 315,
    columnNumber: 5
  }, this);
}
function ToolsPanel({
  activeTool,
  onToolChange,
  signers,
  selectedSignerId,
  onSelectSigner,
  agentMode = false
}) {
  const signerActions = [
    { mode: "designate-signature", icon: PenTool, label: "Sign Here" },
    { mode: "designate-initials", icon: Hash, label: "Initials" }
  ];
  const signerFields = [
    { mode: "designate-fullname", icon: User, label: "Full Name" },
    { mode: "designate-email", icon: Mail, label: "Email Address" },
    { mode: "designate-date", icon: CalendarDays, label: "Auto Date" },
    { mode: "designate-time", icon: Clock, label: "Auto Time" }
  ];
  const markupTools = [
    { mode: "select", icon: MousePointer2, label: "Select" },
    { mode: "text", icon: Type, label: "Text Box" },
    { mode: "highlight", icon: Highlighter, label: "Highlight" },
    { mode: "line", icon: Minus, label: "Line" },
    { mode: "draw", icon: Pencil, label: "Freehand" },
    { mode: "strikethrough", icon: Strikethrough, label: "Strikethrough" },
    { mode: "ellipse", icon: Circle, label: "Ellipse" }
  ];
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-5", children: [
    signers.length > 0 && /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV(Label, { className: "text-xs mb-1.5 block", children: "Assign to Signer" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 397,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        Select,
        {
          value: selectedSignerId || "",
          onValueChange: (v) => onSelectSigner(v || null),
          children: [
            /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Select signer..." }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 402,
              columnNumber: 52
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 402,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(SelectContent, { children: signers.map((s) => /* @__PURE__ */ jsxDEV(SelectItem, { value: s.id, children: [
              s.firstName,
              " ",
              s.lastName
            ] }, s.id, true, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 405,
              columnNumber: 17
            }, this)) }, void 0, false, {
              fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
              lineNumber: 403,
              columnNumber: 13
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 398,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 396,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Signer Actions" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 414,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: signerActions.map((t) => /* @__PURE__ */ jsxDEV(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 417,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 415,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 413,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Signer Fields" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 424,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: signerFields.map((t) => /* @__PURE__ */ jsxDEV(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 427,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 425,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 423,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Separator, {}, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 432,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Markup" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 435,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: markupTools.map((t) => /* @__PURE__ */ jsxDEV(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 438,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 436,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 434,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 393,
    columnNumber: 5
  }, this);
}
function ToolButton({ icon: Icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxDEV(
    "button",
    {
      onClick,
      className: cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors text-left",
        active ? "bg-[#2D5F2B] text-white border-[#2D5F2B]" : "bg-card text-foreground border-border hover:bg-muted/50"
      ),
      children: [
        /* @__PURE__ */ jsxDEV(Icon, { className: "w-4 h-4 shrink-0" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 457,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "truncate", children: label }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 458,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 448,
      columnNumber: 5
    },
    this
  );
}
function LayoutsPanel() {
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Layouts" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 466,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Predefined field layouts coming soon." }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 467,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 465,
    columnNumber: 5
  }, this);
}
function OptionsPanel() {
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Options" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 475,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Accordion, { type: "multiple", className: "w-full", children: [
      /* @__PURE__ */ jsxDEV(AccordionItem, { value: "signature", children: [
        /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-sm", children: "Change Signature" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 478,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(AccordionContent, { children: /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Update your signature or initials style." }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 480,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 479,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 477,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(AccordionItem, { value: "signing-details", children: [
        /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-sm", children: "Signing Details" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 484,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(AccordionContent, { children: /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Configure signing PINs and authentication." }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 486,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 485,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 483,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(AccordionItem, { value: "expiration", children: [
        /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-sm", children: "Expiration Dates" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 490,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(AccordionContent, { children: /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Set document expiration date and time." }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 492,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 491,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 489,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(AccordionItem, { value: "reminders", children: [
        /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-sm", children: "Reminders" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 496,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(AccordionContent, { children: /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Configure automatic reminder emails." }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 498,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 497,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 495,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(AccordionItem, { value: "clear", children: [
        /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-sm", children: "Clear Signing Fields" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 502,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(AccordionContent, { children: /* @__PURE__ */ jsxDEV(Button, { variant: "destructive", size: "sm", children: "Clear All Fields" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 504,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
          lineNumber: 503,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
        lineNumber: 501,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 476,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 474,
    columnNumber: 5
  }, this);
}
function FeedbackPanel() {
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Feedback" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 515,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Have questions or feedback? Let us know." }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 516,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full", children: "Send Feedback" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
      lineNumber: 517,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/PdfEditorSidebar.tsx",
    lineNumber: 514,
    columnNumber: 5
  }, this);
}
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex min-h-11 items-center justify-center rounded-md border bg-muted/40 p-1 text-muted-foreground",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/tabs.tsx",
    lineNumber: 12,
    columnNumber: 3
  },
  void 0
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-semibold ring-offset-background transition-[background-color,color,box-shadow] duration-150 ease-out data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/tabs.tsx",
    lineNumber: 27,
    columnNumber: 3
  },
  void 0
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/tabs.tsx",
    lineNumber: 42,
    columnNumber: 3
  },
  void 0
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
function SignatureStampModal({ open, onClose, onConfirm, mode }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [tab, setTab] = useState("draw");
  useEffect(() => {
    if (open && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setTypedText("");
  }, [open]);
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const stopDraw = () => setIsDrawing(false);
  const handleConfirm = () => {
    if (tab === "draw") {
      const canvas = canvasRef.current;
      if (canvas) {
        onConfirm(canvas.toDataURL("image/png"));
      }
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 80;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = mode === "sign" ? "italic 32px Georgia, serif" : "28px Georgia, serif";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "middle";
        ctx.fillText(typedText, 10, 40);
        onConfirm(canvas.toDataURL("image/png"));
      }
    }
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  return /* @__PURE__ */ jsxDEV(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: mode === "sign" ? "Create Signature" : "Create Initials" }, void 0, false, {
      fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
      lineNumber: 91,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
      lineNumber: 90,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxDEV(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsxDEV(TabsTrigger, { value: "draw", className: "flex-1", children: "Draw" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 95,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(TabsTrigger, { value: "type", className: "flex-1", children: "Type" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 96,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
        lineNumber: 94,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(TabsContent, { value: "draw", className: "mt-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "border rounded-md bg-white relative", children: /* @__PURE__ */ jsxDEV(
          "canvas",
          {
            ref: canvasRef,
            width: 400,
            height: 120,
            className: "w-full cursor-crosshair",
            onMouseDown: startDraw,
            onMouseMove: draw,
            onMouseUp: stopDraw,
            onMouseLeave: stopDraw
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
            lineNumber: 100,
            columnNumber: 15
          },
          this
        ) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 99,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: clearCanvas, className: "mt-1 text-xs", children: "Clear" }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 111,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
        lineNumber: 98,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(TabsContent, { value: "type", className: "mt-3", children: [
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            value: typedText,
            onChange: (e) => setTypedText(e.target.value),
            placeholder: mode === "sign" ? "Type your full name" : "Type your initials",
            className: "text-lg"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
            lineNumber: 116,
            columnNumber: 13
          },
          this
        ),
        typedText && /* @__PURE__ */ jsxDEV("div", { className: "mt-2 p-3 border rounded bg-white", children: /* @__PURE__ */ jsxDEV("span", { style: { fontFamily: "Georgia, serif", fontStyle: mode === "sign" ? "italic" : "normal", fontSize: mode === "sign" ? "28px" : "24px" }, children: typedText }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 124,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
          lineNumber: 123,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
        lineNumber: 115,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
      lineNumber: 93,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(DialogFooter, { children: [
      /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: onClose, children: "Cancel" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
        lineNumber: 132,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { onClick: handleConfirm, children: "Adopt & Use" }, void 0, false, {
        fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
        lineNumber: 133,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
      lineNumber: 131,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
    lineNumber: 89,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/components/admin/SignatureStampModal.tsx",
    lineNumber: 88,
    columnNumber: 5
  }, this);
}
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
function AdminPdfEditor() {
  const navigate = useNavigate();
  const { documentId: routeDocId } = useParams();
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTool, setActiveTool] = useState("select");
  const [hasSelection, setHasSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [documentId, setDocumentId] = useState(routeDocId || null);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [initialsDataUrl, setInitialsDataUrl] = useState(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureModalMode, setSignatureModalMode] = useState("sign");
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [canvasReadyTick, setCanvasReadyTick] = useState(0);
  useState(false);
  useState(false);
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [activeTab, setActiveTab] = useState("signers");
  const [signers, setSigners] = useState([]);
  const [selectedSignerId, setSelectedSignerId] = useState(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const annotationsPerPage = useRef({});
  const fetchSavedDocuments = useCallback(async () => {
    const { data } = await supabase.from("admin_documents").select("id, file_name, updated_at").order("updated_at", { ascending: false });
    if (data) setSavedDocuments(data);
  }, []);
  useEffect(() => {
    fetchSavedDocuments();
  }, [fetchSavedDocuments]);
  useEffect(() => {
    if (routeDocId) {
      loadDocument(routeDocId);
    }
  }, [routeDocId]);
  useEffect(() => {
    const sig = localStorage.getItem("admin_signature");
    const ini = localStorage.getItem("admin_initials");
    if (sig) setSignatureDataUrl(sig);
    if (ini) setInitialsDataUrl(ini);
  }, []);
  const loadDocument = async (docId) => {
    setIsLoading(true);
    try {
      const { data: doc, error } = await supabase.from("admin_documents").select("*").eq("id", docId).single();
      if (error || !doc) throw error || new Error("Document not found");
      setDocumentId(doc.id);
      setFileName(doc.file_name);
      setStoragePath(doc.storage_path);
      const { data: fileData, error: dlError } = await supabase.storage.from("admin-documents").download(doc.storage_path);
      if (dlError || !fileData) throw dlError || new Error("Download failed");
      const arrayBuffer = await fileData.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const scale = 1.5;
      const pageDataArr = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageDataArr.push({ imageUrl: canvas.toDataURL("image/png"), width: viewport.width, height: viewport.height });
      }
      setPages(pageDataArr);
      setCurrentPage(0);
      const annotations = doc.annotations || {};
      annotationsPerPage.current = {};
      Object.entries(annotations).forEach(([key, val]) => {
        annotationsPerPage.current[parseInt(key)] = typeof val === "string" ? val : JSON.stringify(val);
      });
      setTimeout(() => {
        const fc = fabricCanvasRef.current;
        if (fc && annotationsPerPage.current[0]) {
          fc.loadFromJSON(JSON.parse(annotationsPerPage.current[0])).then(() => {
            fc.backgroundColor = "transparent";
            fc.renderAll();
          });
        }
      }, 300);
      toast.success(`Opened "${doc.file_name}"`);
    } catch (err) {
      toast.error(err.message || "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };
  const FABRIC_CUSTOM_PROPS = ["fieldType", "customType", "recipientId"];
  const saveCurrentPageAnnotations = useCallback(() => {
    const fc = fabricCanvasRef.current;
    if (fc && pages.length > 0) {
      annotationsPerPage.current[currentPage] = JSON.stringify(fc.toObject(FABRIC_CUSTOM_PROPS));
    }
  }, [currentPage, pages.length]);
  useCallback((pageIndex) => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const saved = annotationsPerPage.current[pageIndex];
    if (saved) {
      fc.loadFromJSON(JSON.parse(saved)).then(() => {
        fc.backgroundColor = "transparent";
        fc.renderAll();
      });
    } else {
      fc.clear();
      fc.backgroundColor = "transparent";
      fc.renderAll();
    }
  }, []);
  const handleSave = async () => {
    if (!storagePath) {
      toast.error("No document uploaded");
      return;
    }
    setIsSaving(true);
    saveCurrentPageAnnotations();
    try {
      const allAnnotations = { ...annotationsPerPage.current };
      const designatedFields = [];
      Object.entries(allAnnotations).forEach(([pageIdx, json]) => {
        var _a;
        const parsed = JSON.parse(json);
        (_a = parsed.objects) == null ? void 0 : _a.forEach((obj) => {
          var _a2;
          if ((_a2 = obj.customType) == null ? void 0 : _a2.startsWith("designated-")) {
            designatedFields.push({ page: parseInt(pageIdx), type: obj.fieldType, left: obj.left, top: obj.top, width: obj.width, height: obj.height });
          }
        });
      });
      if (documentId) {
        await supabase.from("admin_documents").update({
          annotations: allAnnotations,
          designated_fields: designatedFields,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", documentId);
      } else {
        const { data, error } = await supabase.from("admin_documents").insert({
          file_name: fileName,
          storage_path: storagePath,
          annotations: allAnnotations,
          designated_fields: designatedFields
        }).select().single();
        if (error) throw error;
        setDocumentId(data.id);
      }
      toast.success("Document saved");
      fetchSavedDocuments();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };
  const handleUpload = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setIsLoading(true);
    setFileName(file.name);
    try {
      const path = `pdfs/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("admin-documents").upload(path, file);
      if (uploadError) throw uploadError;
      setStoragePath(path);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const scale = 1.5;
      const pageDataArr = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageDataArr.push({ imageUrl: canvas.toDataURL("image/png"), width: viewport.width, height: viewport.height });
      }
      setPages(pageDataArr);
      setCurrentPage(0);
      annotationsPerPage.current = {};
      setDocumentId(null);
      toast.success(`Loaded ${pdf.numPages} page(s)`);
    } catch (err) {
      toast.error(err.message || "Failed to load PDF");
    } finally {
      setIsLoading(false);
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
      annotationsPerPage.current[currentPage] = JSON.stringify(fc.toObject(FABRIC_CUSTOM_PROPS));
    }
  }, [currentPage, pages.length]);
  const registerCanvasChange = useCallback((pageIdx) => {
    const fc = fabricCanvasRef.current;
    if (fc && pages.length > 0) {
      annotationsPerPage.current[pageIdx] = JSON.stringify(fc.toObject(FABRIC_CUSTOM_PROPS));
    }
  }, [pages.length]);
  const handleUndo = useCallback(() => {
  }, []);
  const handleRedo = useCallback(() => {
  }, []);
  const applyFontStyle = useCallback((patch) => {
    const fc = fabricCanvasRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    const updates = {};
    if (patch.fontSize !== void 0) updates.fontSize = patch.fontSize;
    if (patch.bold !== void 0) updates.fontWeight = patch.bold ? "bold" : "normal";
    if (patch.italic !== void 0) updates.fontStyle = patch.italic ? "italic" : "normal";
    if (patch.underline !== void 0) updates.underline = patch.underline;
    obj.set(updates);
    fc.renderAll();
    setSelectedFontStyle((prev) => prev ? { ...prev, ...patch } : null);
    registerCanvasChange(currentPage);
  }, [currentPage, registerCanvasChange]);
  useEffect(() => {
    const onKeyDown = (event) => {
      var _a, _b, _c, _d, _e;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target == null ? void 0 : target.isContentEditable)) {
        return;
      }
      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
      const isRedo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && event.shiftKey || event.ctrlKey && event.key.toLowerCase() === "y";
      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }
      if (isRedo) {
        event.preventDefault();
        handleRedo();
        return;
      }
      const isZoomIn = (event.metaKey || event.ctrlKey) && (event.key === "=" || event.key === "+");
      const isZoomOut = (event.metaKey || event.ctrlKey) && event.key === "-";
      if (isZoomIn) {
        event.preventDefault();
        setZoom((z) => Math.min(200, z + 25));
        return;
      }
      if (isZoomOut) {
        event.preventDefault();
        setZoom((z) => Math.max(25, z - 25));
        return;
      }
      const activeObj = (_a = fabricCanvasRef.current) == null ? void 0 : _a.getActiveObject();
      if (activeObj && (activeObj.type === "i-text" || activeObj.type === "textbox" || activeObj.type === "text")) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
          event.preventDefault();
          const isBold = activeObj.fontWeight === "bold";
          activeObj.set({ fontWeight: isBold ? "normal" : "bold" });
          (_b = fabricCanvasRef.current) == null ? void 0 : _b.renderAll();
          setSelectedFontStyle((prev) => prev ? { ...prev, bold: !isBold } : null);
          registerCanvasChange(currentPage);
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
          event.preventDefault();
          const isItalic = activeObj.fontStyle === "italic";
          activeObj.set({ fontStyle: isItalic ? "normal" : "italic" });
          (_c = fabricCanvasRef.current) == null ? void 0 : _c.renderAll();
          setSelectedFontStyle((prev) => prev ? { ...prev, italic: !isItalic } : null);
          registerCanvasChange(currentPage);
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
          event.preventDefault();
          const isUnderlined = !!activeObj.underline;
          activeObj.set({ underline: !isUnderlined });
          (_d = fabricCanvasRef.current) == null ? void 0 : _d.renderAll();
          setSelectedFontStyle((prev) => prev ? { ...prev, underline: !isUnderlined } : null);
          registerCanvasChange(currentPage);
          return;
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        const activeObject = (_e = fabricCanvasRef.current) == null ? void 0 : _e.getActiveObject();
        if (!activeObject) return;
        event.preventDefault();
        handleDeleteSelection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPage, handleDeleteSelection, handleRedo, handleUndo, registerCanvasChange, applyFontStyle]);
  const handleOpenDocument = (id) => {
    if (storagePath && pages.length > 0) {
      saveCurrentPageAnnotations();
    }
    navigate(`/admin/pdf-editor/${id}`);
    loadDocument(id);
  };
  const handleDeleteDocument = async (id) => {
    try {
      await supabase.from("admin_documents").delete().eq("id", id);
      toast.success("Document deleted");
      fetchSavedDocuments();
      if (documentId === id) {
        setPages([]);
        setDocumentId(null);
        setFileName("");
        setStoragePath("");
        annotationsPerPage.current = {};
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };
  const handleAddSigner = (signer) => {
    setSigners((prev) => [...prev, { ...signer, id: crypto.randomUUID() }]);
  };
  const handleRemoveSigner = (id) => {
    setSigners((prev) => prev.filter((s) => s.id !== id));
    if (selectedSignerId === id) setSelectedSignerId(null);
  };
  const handleSignatureConfirm = (dataUrl) => {
    if (signatureModalMode === "sign") {
      setSignatureDataUrl(dataUrl);
      localStorage.setItem("admin_signature", dataUrl);
    } else {
      setInitialsDataUrl(dataUrl);
      localStorage.setItem("admin_initials", dataUrl);
    }
    setSignatureModalOpen(false);
    toast.success(`${signatureModalMode === "sign" ? "Signature" : "Initials"} saved`);
  };
  pages[currentPage];
  return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col h-screen bg-background", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-12 border-b bg-card flex items-center px-4 gap-3 shrink-0", children: [
      /* @__PURE__ */ jsxDEV("button", { onClick: () => navigate(-1), className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxDEV(ArrowLeft, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 439,
          columnNumber: 11
        }, this),
        " Back"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 438,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 ml-4", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setZoom((z) => Math.max(25, z - 25)), title: "Zoom out (Ctrl/⌘ -)", children: /* @__PURE__ */ jsxDEV(ZoomOut, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 444,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 443,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-medium min-w-[40px] text-center", children: [
          zoom,
          "%"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 446,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setZoom((z) => Math.min(200, z + 25)), title: "Zoom in (Ctrl/⌘ +)", children: /* @__PURE__ */ jsxDEV(ZoomIn, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 448,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 447,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 442,
        columnNumber: 9
      }, this),
      selectedFontStyle && /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 ml-2 border-l pl-2", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "number",
            min: 6,
            max: 144,
            value: selectedFontStyle.fontSize,
            onChange: (e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 6 && v <= 144) applyFontStyle({ fontSize: v });
            },
            className: "w-14 h-7 text-xs border rounded px-1 text-center bg-background",
            title: "Font size"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 455,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: selectedFontStyle.bold ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ bold: !selectedFontStyle.bold }),
            title: "Bold (Ctrl+B)",
            children: /* @__PURE__ */ jsxDEV(Bold, { className: "w-3.5 h-3.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 474,
              columnNumber: 15
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 467,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: selectedFontStyle.italic ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ italic: !selectedFontStyle.italic }),
            title: "Italic (Ctrl+I)",
            children: /* @__PURE__ */ jsxDEV(Italic, { className: "w-3.5 h-3.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 483,
              columnNumber: 15
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 476,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: selectedFontStyle.underline ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ underline: !selectedFontStyle.underline }),
            title: "Underline (Ctrl+U)",
            children: /* @__PURE__ */ jsxDEV(Underline, { className: "w-3.5 h-3.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 492,
              columnNumber: 15
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 485,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 454,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 text-center", children: /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium text-foreground", children: fileName || "Untitled Document" }, void 0, false, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 498,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 497,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxDEV("input", { ref: fileInputRef, type: "file", accept: "application/pdf", className: "hidden", onChange: handleUpload }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 502,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        }, title: "Upload PDF", children: /* @__PURE__ */ jsxDEV(Upload, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 504,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 503,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Help", children: /* @__PURE__ */ jsxDEV(HelpCircle, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 507,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 506,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Print", children: /* @__PURE__ */ jsxDEV(Printer, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 510,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 509,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Download", children: /* @__PURE__ */ jsxDEV(Download, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 513,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 512,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-8 gap-1.5 px-3 font-medium",
            onClick: handleSave,
            disabled: isSaving,
            title: "Save (Ctrl+S)",
            children: [
              /* @__PURE__ */ jsxDEV(Save, { className: "w-3.5 h-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                lineNumber: 523,
                columnNumber: 13
              }, this),
              isSaving ? "Saving..." : "Save"
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 515,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: handleDeleteSelection,
            disabled: !hasSelection,
            title: "Delete selected",
            children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-4 h-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 534,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 526,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            size: "sm",
            className: "ml-2 bg-[#2D5F2B] hover:bg-[#234A22] text-white gap-1",
            disabled: !storagePath || isSaving,
            onClick: handleSave,
            title: "Save document and prepare to send",
            children: [
              "Next ",
              /* @__PURE__ */ jsxDEV(ChevronRight, { className: "w-3.5 h-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                lineNumber: 543,
                columnNumber: 18
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 536,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 501,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
      lineNumber: 437,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto bg-muted/30 flex flex-col items-center py-6 gap-4", children: pages.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-2xl px-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxDEV(Upload, { className: "w-12 h-12 opacity-40 mx-auto mb-3" }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 555,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-lg mb-3", children: "Upload a PDF to get started" }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 556,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          }, disabled: isLoading, children: isLoading ? "Loading..." : "Choose File" }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 557,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 554,
          columnNumber: 15
        }, this),
        savedDocuments.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "w-full border rounded-lg bg-card p-4", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground mb-3", children: "Recent Documents" }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 564,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: savedDocuments.map((doc) => /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors",
              onClick: () => handleOpenDocument(doc.id),
              children: [
                /* @__PURE__ */ jsxDEV(FileText, { className: "w-5 h-5 text-muted-foreground shrink-0" }, void 0, false, {
                  fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                  lineNumber: 572,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium truncate", children: doc.file_name }, void 0, false, {
                    fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                    lineNumber: 574,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: doc.updated_at ? new Date(doc.updated_at).toLocaleString() : "" }, void 0, false, {
                    fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                    lineNumber: 575,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                  lineNumber: 573,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  handleOpenDocument(doc.id);
                }, children: "Open" }, void 0, false, {
                  fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                  lineNumber: 579,
                  columnNumber: 25
                }, this)
              ]
            },
            doc.id,
            true,
            {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 567,
              columnNumber: 23
            },
            this
          )) }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 565,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 563,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 553,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between w-full max-w-3xl px-4", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium text-foreground truncate max-w-[60%]", children: fileName }, void 0, false, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 591,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            currentPage + 1,
            " of ",
            pages.length
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 592,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 590,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center gap-6", children: pages.map((page, idx) => /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center gap-1", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            idx + 1
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
            lineNumber: 601,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              style: { transform: `scale(${zoom / 100})`, transformOrigin: "top center" },
              onClick: () => {
                if (idx !== currentPage) {
                  registerCanvasChange(currentPage);
                  setCurrentPage(idx);
                }
              },
              children: idx === currentPage ? /* @__PURE__ */ jsxDEV(
                PdfCanvas,
                {
                  pageImageUrl: page.imageUrl,
                  pageWidth: page.width,
                  pageHeight: page.height,
                  activeTool,
                  onSelectionChange: setHasSelection,
                  onSelectionFontChange: setSelectedFontStyle,
                  fabricCanvasRef,
                  signatureDataUrl,
                  initialsDataUrl,
                  zoomScale: zoom / 100,
                  onCanvasReady: () => setCanvasReadyTick((tick) => tick + 1),
                  onCanvasChange: () => registerCanvasChange(currentPage),
                  onRequestSignature: () => {
                    setSignatureModalMode("sign");
                    setSignatureModalOpen(true);
                  },
                  onRequestInitials: () => {
                    setSignatureModalMode("initials");
                    setSignatureModalOpen(true);
                  }
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                  lineNumber: 612,
                  columnNumber: 25
                },
                this
              ) : /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "relative border shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all",
                  style: { width: page.width, height: page.height },
                  children: /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      src: page.imageUrl,
                      alt: `Page ${idx + 1}`,
                      style: { width: page.width, height: page.height, display: "block" }
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                      lineNumber: 633,
                      columnNumber: 27
                    },
                    this
                  )
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
                  lineNumber: 629,
                  columnNumber: 25
                },
                this
              )
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
              lineNumber: 602,
              columnNumber: 21
            },
            this
          )
        ] }, idx, true, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 600,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 598,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 589,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 551,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        PdfEditorSidebar,
        {
          activeTab,
          onTabChange: setActiveTab,
          activeTool,
          onToolChange: setActiveTool,
          signers,
          onAddSigner: handleAddSigner,
          onRemoveSigner: handleRemoveSigner,
          selectedSignerId,
          onSelectSigner: setSelectedSignerId,
          documents: fileName ? [{ name: fileName }] : [],
          savedDocuments,
          onOpenDocument: handleOpenDocument,
          onDeleteDocument: handleDeleteDocument
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
          lineNumber: 649,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
      lineNumber: 549,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      SignatureStampModal,
      {
        open: signatureModalOpen,
        onClose: () => setSignatureModalOpen(false),
        onConfirm: handleSignatureConfirm,
        mode: signatureModalMode
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
        lineNumber: 666,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/AdminPdfEditor.tsx",
    lineNumber: 435,
    columnNumber: 5
  }, this);
}
export {
  AdminPdfEditor as default
};
