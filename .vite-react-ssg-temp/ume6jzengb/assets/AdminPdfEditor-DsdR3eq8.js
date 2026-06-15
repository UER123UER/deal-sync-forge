import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect, useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas, PencilBrush, IText, Line, FabricImage, Rect, Group, Ellipse } from "fabric";
import { Trash2, Plus, ChevronDown, GripVertical, FileText, Users, List, LayoutGrid, Settings, HelpCircle, PenTool, Hash, User, Mail, CalendarDays, Clock, MousePointer2, Type, Highlighter, Minus, Pencil, Strikethrough, Circle, ArrowLeft, ZoomOut, ZoomIn, Bold, Italic, Underline, Upload, Printer, Download, Save, ChevronRight } from "lucide-react";
import { c as cn, L as Label, I as Input, B as Button, q as Accordion, r as AccordionItem, t as AccordionTrigger, v as AccordionContent, s as supabase } from "../main.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-9L1xmEk2.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-BMACWGKM.js";
import { S as ScrollArea } from "./scroll-area-krGJLbGz.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-Gt8dxHPr.js";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative inline-block border shadow-sm bg-white",
      style: { width: pageWidth, height: pageHeight },
      onClick: handleCanvasClick,
      children: [
        /* @__PURE__ */ jsx("canvas", { ref: bgCanvasRef, className: "absolute inset-0", style: { width: pageWidth, height: pageHeight } }),
        /* @__PURE__ */ jsx("canvas", { ref: canvasElRef, className: "absolute inset-0", style: { width: pageWidth, height: pageHeight } })
      ]
    }
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
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
    ...props
  }
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
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full", children: [
    activeTab && /* @__PURE__ */ jsx("div", { className: "w-full md:w-[350px] max-w-full border-l bg-card flex flex-col overflow-hidden", children: /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      activeTab === "signers" && /* @__PURE__ */ jsx(
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
        }
      ),
      activeTab === "docs" && /* @__PURE__ */ jsx(
        DocsPanel,
        {
          documents,
          savedDocuments,
          onOpenDocument,
          onDeleteDocument
        }
      ),
      activeTab === "tools" && /* @__PURE__ */ jsx(
        ToolsPanel,
        {
          activeTool,
          onToolChange,
          signers,
          selectedSignerId,
          onSelectSigner,
          agentMode: mode === "agent"
        }
      ),
      activeTab === "layouts" && /* @__PURE__ */ jsx(LayoutsPanel, {}),
      activeTab === "options" && /* @__PURE__ */ jsx(OptionsPanel, {}),
      activeTab === "feedback" && /* @__PURE__ */ jsx(FeedbackPanel, {})
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "w-[60px] bg-muted/50 border-l flex flex-col items-center py-2 gap-1", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => handleToggleTab(tab.id),
        className: cn(
          "w-12 h-12 rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
          activeTab === tab.id ? "bg-[#2D5F2B] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        ),
        title: tab.label,
        children: [
          /* @__PURE__ */ jsx(tab.icon, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { children: tab.label })
        ]
      },
      tab.id
    )) })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Signers" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Set signing order" }),
        /* @__PURE__ */ jsx(Switch, { checked: signingOrder, onCheckedChange: onSigningOrderChange })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: signers.map((s, idx) => {
      var _a;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => onSelectSigner(s.id === selectedSignerId ? null : s.id),
          className: cn(
            "flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-colors",
            s.id === selectedSignerId ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
          ),
          children: [
            signingOrder && /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold", children: idx + 1 }),
            /* @__PURE__ */ jsxs("div", { className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground", children: [
              s.firstName[0],
              ((_a = s.lastName) == null ? void 0 : _a[0]) || ""
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-foreground truncate", children: [
                s.firstName,
                " ",
                s.lastName
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
                s.role,
                " • ",
                s.email
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onRemoveSigner(s.id);
                },
                className: "text-muted-foreground hover:text-destructive",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ]
        },
        s.id
      );
    }) }),
    showAddForm ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-3 border rounded-md bg-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "First Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: newSigner.firstName,
              onChange: (e) => setNewSigner({ ...newSigner, firstName: e.target.value }),
              className: "h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Last Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: newSigner.lastName,
              onChange: (e) => setNewSigner({ ...newSigner, lastName: e.target.value }),
              className: "h-8 text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "email",
            value: newSigner.email,
            onChange: (e) => setNewSigner({ ...newSigner, email: e.target.value }),
            className: "h-8 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Role" }),
        /* @__PURE__ */ jsxs(Select, { value: newSigner.role, onValueChange: (v) => setNewSigner({ ...newSigner, role: v }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Signer Type" }),
        /* @__PURE__ */ jsxs(Select, { value: newSigner.type, onValueChange: (v) => setNewSigner({ ...newSigner, type: v }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "Remote Signer", children: "Remote Signer" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "In-Person Signer", children: "In-Person Signer" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: onAddSigner, className: "flex-1", children: "Save" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setShowAddForm(false), className: "flex-1", children: "Cancel" })
      ] })
    ] }) : /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "w-full gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
        " Add Participants ",
        /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3 ml-auto" })
      ] }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "start", className: "w-56", children: [
        /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => setShowAddForm(true), children: "Add New" }),
        /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => setShowAddForm(true), children: "Add from Contacts" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full", children: "Map Signers" })
  ] });
}
function DocsPanel({
  documents,
  savedDocuments = [],
  onOpenDocument,
  onDeleteDocument
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Current Document" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: documents.map((doc, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 border rounded-md bg-muted/30", children: [
      /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-bold", children: idx + 1 }),
      /* @__PURE__ */ jsx("span", { className: "text-sm truncate flex-1", children: doc.name })
    ] }, idx)) }),
    savedDocuments.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Saved Documents" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: savedDocuments.map((doc) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 border rounded-md bg-muted/30", children: [
        /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm truncate", children: doc.file_name }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", onClick: () => onOpenDocument == null ? void 0 : onOpenDocument(doc.id), children: /* @__PURE__ */ jsx(FileText, { className: "w-3 h-3" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0 text-destructive", onClick: () => onDeleteDocument == null ? void 0 : onDeleteDocument(doc.id), children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }) })
      ] }, doc.id)) })
    ] }),
    /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "w-full gap-2", children: [
      /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
      " Add a Document or Form"
    ] })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    signers.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { className: "text-xs mb-1.5 block", children: "Assign to Signer" }),
      /* @__PURE__ */ jsxs(
        Select,
        {
          value: selectedSignerId || "",
          onValueChange: (v) => onSelectSigner(v || null),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select signer..." }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: signers.map((s) => /* @__PURE__ */ jsxs(SelectItem, { value: s.id, children: [
              s.firstName,
              " ",
              s.lastName
            ] }, s.id)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Signer Actions" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: signerActions.map((t) => /* @__PURE__ */ jsx(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Signer Fields" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: signerFields.map((t) => /* @__PURE__ */ jsx(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label)) })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Markup" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: markupTools.map((t) => /* @__PURE__ */ jsx(ToolButton, { ...t, active: activeTool === t.mode, onClick: () => onToolChange(t.mode) }, t.label)) })
    ] })
  ] });
}
function ToolButton({ icon: Icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors text-left",
        active ? "bg-[#2D5F2B] text-white border-[#2D5F2B]" : "bg-card text-foreground border-border hover:bg-muted/50"
      ),
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: label })
      ]
    }
  );
}
function LayoutsPanel() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Layouts" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Predefined field layouts coming soon." })
  ] });
}
function OptionsPanel() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Options" }),
    /* @__PURE__ */ jsxs(Accordion, { type: "multiple", className: "w-full", children: [
      /* @__PURE__ */ jsxs(AccordionItem, { value: "signature", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm", children: "Change Signature" }),
        /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Update your signature or initials style." }) })
      ] }),
      /* @__PURE__ */ jsxs(AccordionItem, { value: "signing-details", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm", children: "Signing Details" }),
        /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Configure signing PINs and authentication." }) })
      ] }),
      /* @__PURE__ */ jsxs(AccordionItem, { value: "expiration", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm", children: "Expiration Dates" }),
        /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Set document expiration date and time." }) })
      ] }),
      /* @__PURE__ */ jsxs(AccordionItem, { value: "reminders", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm", children: "Reminders" }),
        /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Configure automatic reminder emails." }) })
      ] }),
      /* @__PURE__ */ jsxs(AccordionItem, { value: "clear", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-sm", children: "Clear Signing Fields" }),
        /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx(Button, { variant: "destructive", size: "sm", children: "Clear All Fields" }) })
      ] })
    ] })
  ] });
}
function FeedbackPanel() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Feedback" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Have questions or feedback? Let us know." }),
    /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full", children: "Send Feedback" })
  ] });
}
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex min-h-11 items-center justify-center rounded-md border bg-muted/40 p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-semibold ring-offset-background transition-[background-color,color,box-shadow] duration-150 ease-out data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: mode === "sign" ? "Create Signature" : "Create Initials" }) }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "draw", className: "flex-1", children: "Draw" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "type", className: "flex-1", children: "Type" })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "draw", className: "mt-3", children: [
        /* @__PURE__ */ jsx("div", { className: "border rounded-md bg-white relative", children: /* @__PURE__ */ jsx(
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
          }
        ) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: clearCanvas, className: "mt-1 text-xs", children: "Clear" })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "type", className: "mt-3", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            value: typedText,
            onChange: (e) => setTypedText(e.target.value),
            placeholder: mode === "sign" ? "Type your full name" : "Type your initials",
            className: "text-lg"
          }
        ),
        typedText && /* @__PURE__ */ jsx("div", { className: "mt-2 p-3 border rounded bg-white", children: /* @__PURE__ */ jsx("span", { style: { fontFamily: "Georgia, serif", fontStyle: mode === "sign" ? "italic" : "normal", fontSize: mode === "sign" ? "28px" : "24px" }, children: typedText }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: handleConfirm, children: "Adopt & Use" })
    ] })
  ] }) });
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "h-12 border-b bg-card flex items-center px-4 gap-3 shrink-0", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 ml-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setZoom((z) => Math.max(25, z - 25)), title: "Zoom out (Ctrl/⌘ -)", children: /* @__PURE__ */ jsx(ZoomOut, { className: "w-3.5 h-3.5" }) }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium min-w-[40px] text-center", children: [
          zoom,
          "%"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setZoom((z) => Math.min(200, z + 25)), title: "Zoom in (Ctrl/⌘ +)", children: /* @__PURE__ */ jsx(ZoomIn, { className: "w-3.5 h-3.5" }) })
      ] }),
      selectedFontStyle && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 ml-2 border-l pl-2", children: [
        /* @__PURE__ */ jsx(
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
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: selectedFontStyle.bold ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ bold: !selectedFontStyle.bold }),
            title: "Bold (Ctrl+B)",
            children: /* @__PURE__ */ jsx(Bold, { className: "w-3.5 h-3.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: selectedFontStyle.italic ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ italic: !selectedFontStyle.italic }),
            title: "Italic (Ctrl+I)",
            children: /* @__PURE__ */ jsx(Italic, { className: "w-3.5 h-3.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: selectedFontStyle.underline ? "default" : "ghost",
            size: "icon",
            className: "h-7 w-7",
            onClick: () => applyFontStyle({ underline: !selectedFontStyle.underline }),
            title: "Underline (Ctrl+U)",
            children: /* @__PURE__ */ jsx(Underline, { className: "w-3.5 h-3.5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground", children: fileName || "Untitled Document" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "application/pdf", className: "hidden", onChange: handleUpload }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        }, title: "Upload PDF", children: /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Help", children: /* @__PURE__ */ jsx(HelpCircle, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Print", children: /* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Download", children: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-8 gap-1.5 px-3 font-medium",
            onClick: handleSave,
            disabled: isSaving,
            title: "Save (Ctrl+S)",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "w-3.5 h-3.5" }),
              isSaving ? "Saving..." : "Save"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: handleDeleteSelection,
            disabled: !hasSelection,
            title: "Delete selected",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            className: "ml-2 bg-[#2D5F2B] hover:bg-[#234A22] text-white gap-1",
            disabled: !storagePath || isSaving,
            onClick: handleSave,
            title: "Save document and prepare to send",
            children: [
              "Next ",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto bg-muted/30 flex flex-col items-center py-6 gap-4", children: pages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-2xl px-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Upload, { className: "w-12 h-12 opacity-40 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg mb-3", children: "Upload a PDF to get started" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          }, disabled: isLoading, children: isLoading ? "Loading..." : "Choose File" })
        ] }),
        savedDocuments.length > 0 && /* @__PURE__ */ jsxs("div", { className: "w-full border rounded-lg bg-card p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-3", children: "Recent Documents" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: savedDocuments.map((doc) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors",
              onClick: () => handleOpenDocument(doc.id),
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-muted-foreground shrink-0" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: doc.file_name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: doc.updated_at ? new Date(doc.updated_at).toLocaleString() : "" })
                ] }),
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  handleOpenDocument(doc.id);
                }, children: "Open" })
              ]
            },
            doc.id
          )) })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between w-full max-w-3xl px-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground truncate max-w-[60%]", children: fileName }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            currentPage + 1,
            " of ",
            pages.length
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-6", children: pages.map((page, idx) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Page ",
            idx + 1
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: { transform: `scale(${zoom / 100})`, transformOrigin: "top center" },
              onClick: () => {
                if (idx !== currentPage) {
                  registerCanvasChange(currentPage);
                  setCurrentPage(idx);
                }
              },
              children: idx === currentPage ? /* @__PURE__ */ jsx(
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
                }
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: "relative border shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all",
                  style: { width: page.width, height: page.height },
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: page.imageUrl,
                      alt: `Page ${idx + 1}`,
                      style: { width: page.width, height: page.height, display: "block" }
                    }
                  )
                }
              )
            }
          )
        ] }, idx)) })
      ] }) }),
      /* @__PURE__ */ jsx(
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
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      SignatureStampModal,
      {
        open: signatureModalOpen,
        onClose: () => setSignatureModalOpen(false),
        onConfirm: handleSignatureConfirm,
        mode: signatureModalMode
      }
    )
  ] });
}
export {
  AdminPdfEditor as default
};
