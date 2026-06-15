import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect, Component } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { B as Button, c as cn, L as Label, I as Input } from "../main.mjs";
import { C as Checkbox } from "./checkbox-D50hG86N.js";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { S as ScrollArea } from "./scroll-area-krGJLbGz.js";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ArrowLeft, LayoutGrid, ChevronDown, Undo2, Redo2, ZoomOut, ZoomIn, Loader2, Check, Keyboard, Download, ImagePlus, X, User, Users, Type, Trash2, Lock, LockOpen, Link2Off, Link2, Copy, Maximize2, PencilLine } from "lucide-react";
import { c as useDeal } from "./useDeals-CMdNuTy4.js";
import { c as TEMPLATES, u as useDealPhotos, a as useUploadDealPhoto, g as getDefaultTemplateData, m as mergeMarketingBlockTransforms, D as DEFAULT_TEMPLATE_VISIBILITY, l as loadMarketingRecents, s as saveMarketingRecents, C as CANVAS_DIMENSIONS, d as createMarketingPhotoBlock } from "./useDealPhotos-DSVN1rUD.js";
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
import "@radix-ui/react-checkbox";
import "@radix-ui/react-scroll-area";
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
const LEFT_PANEL_WIDTH = 260;
const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = "#a855f7";
function waitForImageToLoad(image) {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const handleDone = () => {
      image.removeEventListener("load", handleDone);
      image.removeEventListener("error", handleDone);
      resolve();
    };
    image.addEventListener("load", handleDone, { once: true });
    image.addEventListener("error", handleDone, { once: true });
  });
}
async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map((image) => waitForImageToLoad(image)));
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to convert image blob to data URL."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image blob."));
    reader.readAsDataURL(blob);
  });
}
async function inlineImagesForExport(sourceRoot, cloneRoot) {
  const sourceImages = Array.from(sourceRoot.querySelectorAll("img"));
  const cloneImages = Array.from(cloneRoot.querySelectorAll("img"));
  await Promise.all(
    cloneImages.map(async (cloneImage, index) => {
      const sourceImage = sourceImages[index];
      const source = (sourceImage == null ? void 0 : sourceImage.currentSrc) || (sourceImage == null ? void 0 : sourceImage.getAttribute("src")) || cloneImage.getAttribute("src");
      if (!source || source.startsWith("data:")) {
        return;
      }
      cloneImage.loading = "eager";
      cloneImage.decoding = "sync";
      try {
        const response = await fetch(source, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Image fetch failed with ${response.status}`);
        }
        const blob = await response.blob();
        cloneImage.src = await blobToDataUrl(blob);
      } catch (error) {
        console.warn("Failed to inline export image:", source, error);
      }
      await waitForImageToLoad(cloneImage);
    })
  );
}
async function exportNodeToPng(node, exportW, exportH) {
  await waitForImages(node);
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.style.top = "0";
  wrapper.style.width = `${exportW}px`;
  wrapper.style.height = `${exportH}px`;
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "0";
  wrapper.style.zIndex = "-1";
  const clone = node.cloneNode(true);
  clone.style.width = `${exportW}px`;
  clone.style.height = `${exportH}px`;
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  try {
    await inlineImagesForExport(node, clone);
    await waitForImages(clone);
    return await toPng(clone, {
      width: exportW,
      height: exportH,
      pixelRatio: 2,
      cacheBust: true
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}
function computeSnap(block, proposed, canvasW, canvasH, allRects, threshold = SNAP_THRESHOLD) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const bCX = proposed.left + proposed.width / 2;
  const bCY = proposed.top + proposed.height / 2;
  const bR = proposed.left + proposed.width;
  const bB = proposed.top + proposed.height;
  const guides = [];
  const spacingGuides = [];
  let snapDX = 0;
  let snapDY = 0;
  const dCX = bCX - cx;
  const dCY = bCY - cy;
  if (Math.abs(dCX) < threshold) {
    snapDX = -dCX;
    guides.push({ type: "v", pos: cx, label: "Center" });
  }
  if (Math.abs(dCY) < threshold) {
    snapDY = -dCY;
    guides.push({ type: "h", pos: cy, label: "Center" });
  }
  if (Math.abs(proposed.left + snapDX) < threshold) {
    snapDX = -proposed.left;
    guides.push({ type: "v", pos: 0 });
  }
  if (Math.abs(bR + snapDX - canvasW) < threshold) {
    snapDX = canvasW - bR;
    guides.push({ type: "v", pos: canvasW });
  }
  if (Math.abs(proposed.top + snapDY) < threshold) {
    snapDY = -proposed.top;
    guides.push({ type: "h", pos: 0 });
  }
  if (Math.abs(bB + snapDY - canvasH) < threshold) {
    snapDY = canvasH - bB;
    guides.push({ type: "h", pos: canvasH });
  }
  const others = Object.entries(allRects).filter(([k]) => k !== block);
  for (const [key, rect] of others) {
    if (!rect) continue;
    const oCX = rect.left + rect.width / 2;
    const oCY = rect.top + rect.height / 2;
    const oR = rect.left + rect.width;
    const oB = rect.top + rect.height;
    const hCases = [
      [bCY, oCY],
      // center-center
      [proposed.top, rect.top],
      // top-top
      [bB, oB],
      // bottom-bottom
      [proposed.top, oB],
      // top to bottom
      [bB, rect.top]
      // bottom to top
    ];
    for (const [bVal, oVal] of hCases) {
      const d = bVal - oVal;
      if (Math.abs(d + snapDY) < threshold && Math.abs(d) < threshold * 2) {
        snapDY = -d;
        guides.push({ type: "h", pos: oVal, source: key });
        break;
      }
    }
    const vCases = [
      [bCX, oCX],
      // center-center
      [proposed.left, rect.left],
      // left-left
      [bR, oR],
      // right-right
      [proposed.left, oR],
      // left to right edge
      [bR, rect.left]
      // right to left edge
    ];
    for (const [bVal, oVal] of vCases) {
      const d = bVal - oVal;
      if (Math.abs(d + snapDX) < threshold && Math.abs(d) < threshold * 2) {
        snapDX = -d;
        guides.push({ type: "v", pos: oVal, source: key });
        break;
      }
    }
  }
  const snappedLeft = proposed.left + snapDX;
  const snappedTop = proposed.top + snapDY;
  const snappedCX = snappedLeft + proposed.width / 2;
  const snappedCY = snappedTop + proposed.height / 2;
  const snappedR = snappedLeft + proposed.width;
  const snappedB = snappedTop + proposed.height;
  const rawGaps = [];
  for (const [, rect] of others) {
    if (!rect) continue;
    const oR = rect.left + rect.width;
    const oB = rect.top + rect.height;
    const oCY = rect.top + rect.height / 2;
    const oCX = rect.left + rect.width / 2;
    const xOverlap = snappedLeft < oR && snappedR > rect.left;
    const yOverlap = snappedTop < oB && snappedB > rect.top;
    if (!yOverlap) {
      if (oR <= snappedLeft) {
        rawGaps.push({ axis: "x", from: oR, to: snappedLeft, center: (snappedCY + oCY) / 2, value: snappedLeft - oR });
      } else if (rect.left >= snappedR) {
        rawGaps.push({ axis: "x", from: snappedR, to: rect.left, center: (snappedCY + oCY) / 2, value: rect.left - snappedR });
      }
    }
    if (!xOverlap) {
      if (oB <= snappedTop) {
        rawGaps.push({ axis: "y", from: oB, to: snappedTop, center: (snappedCX + oCX) / 2, value: snappedTop - oB });
      } else if (rect.top >= snappedB) {
        rawGaps.push({ axis: "y", from: snappedB, to: rect.top, center: (snappedCX + oCX) / 2, value: rect.top - snappedB });
      }
    }
  }
  const NEAR_EQUAL = threshold * 1.5;
  const xGaps = rawGaps.filter((g) => g.axis === "x" && g.value >= 2);
  const yGaps = rawGaps.filter((g) => g.axis === "y" && g.value >= 2);
  function findEqualGroups(gaps) {
    const groups = /* @__PURE__ */ new Map();
    for (const g of gaps) {
      const rounded = Math.round(g.value);
      let matched = false;
      for (const [key, group] of groups) {
        if (Math.abs(key - rounded) <= NEAR_EQUAL) {
          group.push(g);
          matched = true;
          break;
        }
      }
      if (!matched) groups.set(rounded, [g]);
    }
    return groups;
  }
  function isCentered(gaps) {
    if (gaps.length !== 2) return false;
    return Math.abs(gaps[0].value - gaps[1].value) <= NEAR_EQUAL;
  }
  function buildSpacingGuides(gaps) {
    if (gaps.length === 0) return [];
    const groups = findEqualGroups(gaps);
    const meaningfulGroups = [...groups.values()].filter((g) => g.length >= 2);
    const centered = isCentered(gaps);
    if (meaningfulGroups.length === 0 && !centered) return [];
    const result = [];
    const usedGaps = centered ? gaps : meaningfulGroups.flat();
    for (const g of usedGaps) {
      const reason = centered ? "centered" : "equal";
      result.push({ ...g, showLabel: true, reason });
    }
    return result;
  }
  spacingGuides.push(...buildSpacingGuides(xGaps));
  spacingGuides.push(...buildSpacingGuides(yGaps));
  return { x: snapDX, y: snapDY, guides, spacingGuides };
}
const HISTORY_LIMIT = 100;
const CATEGORY_COLORS = {
  "Just Listed": "bg-emerald-100 text-emerald-800",
  "Open House": "bg-green-100 text-green-800",
  "Coming Soon": "bg-amber-100 text-amber-800",
  "Just Sold": "bg-rose-100 text-rose-800",
  "Price Cut": "bg-red-100 text-red-800",
  "Under Contract": "bg-blue-100 text-blue-800"
};
const TYPE_LABELS = {
  flyer: "Flyer",
  post: "Social Post",
  story: "Story"
};
const HEADLINE_STYLE_LABELS = {
  h1: { name: "Serif Split", desc: "Large italic + bold hero" },
  h2: { name: "Editorial", desc: "Uppercase gold tracking" },
  h3: { name: "Classic", desc: "Clean serif single line" }
};
const MARKETING_BLOCK_LABELS = {
  logo: "Logo",
  photo: "Photo",
  headline: "Headline",
  address: "Address",
  price: "Price",
  stats: "Beds / Baths / Sq Ft",
  description: "Description",
  agent: "Agent info"
};
function isCustomTextBlock(block) {
  return block.startsWith("custom-text-");
}
function isPhotoCanvasBlock(block) {
  return block.startsWith("photo-item-");
}
function getPhotoBlockId(block) {
  return isPhotoCanvasBlock(block) ? block.replace("photo-item-", "") : null;
}
function getCustomTextBlockId(block) {
  return isCustomTextBlock(block) ? block.replace("custom-text-", "") : null;
}
function getBlockLabel(block, customTextBlocks, photoBlocks) {
  if (isCustomTextBlock(block)) {
    const customTextId = getCustomTextBlockId(block);
    const customText = customTextBlocks.find((entry) => entry.id === customTextId);
    const preview = customText == null ? void 0 : customText.text.trim();
    return preview ? `Text: ${preview.slice(0, 18)}` : "Custom Text";
  }
  if (isPhotoCanvasBlock(block)) {
    const photoBlockId = getPhotoBlockId(block);
    const index = photoBlocks.findIndex((entry) => entry.id === photoBlockId);
    return index >= 0 ? `Photo ${index + 1}` : "Photo";
  }
  return MARKETING_BLOCK_LABELS[block] ?? "Block";
}
const ZOOM_PRESETS = [0.5, 0.75, 1];
function makePosterPhotoBlock(src, canvasWidth, canvasHeight, existingCount, preferredLeft, preferredTop, forcedId) {
  const block = createMarketingPhotoBlock(
    src,
    canvasWidth,
    canvasHeight,
    existingCount,
    preferredLeft,
    preferredTop
  );
  return forcedId ? { ...block, id: forcedId } : block;
}
function getDefaultPhotoBlocks(photos, canvasWidth, canvasHeight) {
  if (photos.length === 0) return [];
  return [
    makePosterPhotoBlock(photos[0], canvasWidth, canvasHeight, 0)
  ];
}
function clampPhotoPosition(block, canvasWidth, canvasHeight, left, top) {
  const padding = 16;
  const maxLeft = Math.max(padding, canvasWidth - block.width - padding);
  const maxTop = Math.max(padding, canvasHeight - block.height - padding);
  return {
    ...block,
    left: Math.min(maxLeft, Math.max(padding, Math.round(left))),
    top: Math.min(maxTop, Math.max(padding, Math.round(top)))
  };
}
function VisibilityLabel({
  htmlFor,
  label,
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor, className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: label }),
    /* @__PURE__ */ jsxs("label", { htmlFor, className: "inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground cursor-pointer", children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          id: htmlFor,
          checked,
          onCheckedChange: (next) => onCheckedChange(next === true)
        }
      ),
      "Show"
    ] })
  ] });
}
function OptionCard({
  label,
  description,
  active,
  icon: Icon,
  preview,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "rounded-2xl border p-3 text-left transition-all hover:border-foreground/25 hover:bg-muted/40",
        active ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border bg-background"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2.5 flex h-10 items-center justify-center rounded-xl bg-muted/40", children: preview ?? (Icon ? /* @__PURE__ */ jsx(Icon, { className: cn("h-5 w-5", active ? "text-primary" : "text-foreground") }) : null) }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold text-foreground leading-tight", children: label }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[10px] leading-3.5 text-muted-foreground", children: description })
      ]
    }
  );
}
class TemplateErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: (error == null ? void 0 : error.message) ?? "Unknown render error" };
  }
  componentDidCatch(error, info) {
    console.error("[TemplateErrorBoundary] Template render failed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fef2f2",
            color: "#991b1b",
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            gap: 8,
            padding: 24,
            textAlign: "center"
          },
          children: [
            /* @__PURE__ */ jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
            ] }),
            /* @__PURE__ */ jsx("strong", { children: "Template failed to render" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#b91c1c", maxWidth: 320 }, children: this.state.message }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => this.setState({ hasError: false, message: "" }),
                style: {
                  marginTop: 4,
                  padding: "4px 12px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12
                },
                children: "Retry"
              }
            )
          ]
        }
      );
    }
    return this.props.children;
  }
}
function MarketingEditor() {
  var _a;
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = searchParams.get("template") || TEMPLATES[0].id;
  const navigate = useNavigate();
  const { data: deal } = useDeal(id);
  const { data: dealPhotos = [] } = useDealPhotos(id);
  const uploadDealPhoto = useUploadDealPhoto();
  const canvasRef = useRef(null);
  const canvasViewportRef = useRef(null);
  const previewShellRef = useRef(null);
  const photoInputRef = useRef(null);
  const scaleRef = useRef(1);
  const interactionRef = useRef(null);
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const [hist, setHist] = useState({
    stack: [getDefaultTemplateData(void 0, template.category)],
    index: 0
  });
  const data = hist.stack[hist.index] ?? getDefaultTemplateData(void 0, template.category);
  const canvasW = data.canvasWidth || 1080;
  const canvasH = data.canvasHeight || 1080;
  const [viewportWidth, setViewportWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1440);
  const [canvasViewportSize, setCanvasViewportSize] = useState({ width: 0, height: 0 });
  const isCompactEditor = viewportWidth < 1280;
  const isMobileEditor = viewportWidth < 768;
  const setData = useCallback((updater) => {
    setHist((h) => {
      const current = h.stack[h.index];
      const next = typeof updater === "function" ? updater(current) : updater;
      const base = h.stack.slice(0, h.index + 1);
      const newStack = [...base, next].slice(-HISTORY_LIMIT);
      return { stack: newStack, index: newStack.length - 1 };
    });
  }, []);
  const replaceCurrentData = useCallback((updater) => {
    setHist((h) => {
      const current = h.stack[h.index];
      const next = typeof updater === "function" ? updater(current) : updater;
      const stack = [...h.stack];
      stack[h.index] = next;
      return { stack, index: h.index };
    });
  }, []);
  const hydrateTemplateData = useCallback((base, incoming) => {
    var _a2;
    const merged = {
      ...base,
      ...incoming ?? {}
    };
    const canvasWidth = (incoming == null ? void 0 : incoming.canvasWidth) ?? base.canvasWidth ?? 1080;
    const canvasHeight = (incoming == null ? void 0 : incoming.canvasHeight) ?? base.canvasHeight ?? 1080;
    const libraryPhotos = (incoming == null ? void 0 : incoming.photos) ?? base.photos ?? [];
    const hasExplicitPhotoBlocks = Array.isArray(incoming == null ? void 0 : incoming.photoBlocks);
    const photoBlocks = hasExplicitPhotoBlocks ? (incoming == null ? void 0 : incoming.photoBlocks) ?? [] : getDefaultPhotoBlocks(libraryPhotos, canvasWidth, canvasHeight);
    const blockTransforms = mergeMarketingBlockTransforms(incoming == null ? void 0 : incoming.blockTransforms);
    if (!hasExplicitPhotoBlocks && photoBlocks.length > 0) {
      photoBlocks.forEach((photoBlock, index) => {
        const oldKey = `photo-${index}`;
        const nextKey = `photo-item-${photoBlock.id}`;
        if (blockTransforms[oldKey] && !blockTransforms[nextKey]) {
          blockTransforms[nextKey] = blockTransforms[oldKey];
        }
      });
    }
    return {
      ...merged,
      visibility: {
        ...DEFAULT_TEMPLATE_VISIBILITY,
        ...(incoming == null ? void 0 : incoming.visibility) ?? {}
      },
      blockTransforms,
      photoBlocks,
      customTextBlocks: (incoming == null ? void 0 : incoming.customTextBlocks) ?? base.customTextBlocks ?? [],
      groupedBlockKeys: (incoming == null ? void 0 : incoming.groupedBlockKeys) ?? base.groupedBlockKeys ?? [],
      agents: ((_a2 = incoming == null ? void 0 : incoming.agents) == null ? void 0 : _a2.length) ? incoming.agents : [{
        name: (incoming == null ? void 0 : incoming.agentName) ?? base.agentName,
        title: (incoming == null ? void 0 : incoming.agentTitle) ?? base.agentTitle,
        phone: (incoming == null ? void 0 : incoming.agentPhone) ?? base.agentPhone,
        email: (incoming == null ? void 0 : incoming.agentEmail) ?? base.agentEmail
      }],
      // Ensure canvas dimension fields always exist (backwards compat)
      canvasDimensionId: (incoming == null ? void 0 : incoming.canvasDimensionId) ?? base.canvasDimensionId ?? "square",
      canvasWidth,
      canvasHeight
    };
  }, []);
  const canUndo = hist.index > 0;
  const canRedo = hist.index < hist.stack.length - 1;
  const handleUndo = useCallback(() => {
    setHist((h) => h.index > 0 ? { ...h, index: h.index - 1 } : h);
  }, []);
  const handleRedo = useCallback(() => {
    setHist((h) => h.index < h.stack.length - 1 ? { ...h, index: h.index + 1 } : h);
  }, []);
  const [recents, setRecents] = useState(
    () => id ? loadMarketingRecents(id) : []
  );
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveStatusTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!id) return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const entries = loadMarketingRecents(id).filter((e) => e.templateId !== templateId);
      const updated = [{ templateId, data, lastEdited: Date.now() }, ...entries];
      const saved = saveMarketingRecents(id, updated);
      if (saved) {
        setRecents(updated);
      } else {
        toast.error("Auto-save failed - browser storage is full. Try clearing old designs.");
      }
      setSaveStatus("saved");
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2e3);
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, id, templateId]);
  const [photosInitialized, setPhotosInitialized] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [studioBasicsOpen, setStudioBasicsOpen] = useState(true);
  const [studioAgentsOpen, setStudioAgentsOpen] = useState(true);
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [ohOpen, setOhOpen] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [personalPhotos, setPersonalPhotos] = useState([]);
  useState(false);
  const personalPhotoInputRef = useRef(null);
  const [renamingId, setRenamingId] = useState(null);
  useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [lockedBlocks, setLockedBlocks] = useState(/* @__PURE__ */ new Set());
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [blockRects, setBlockRects] = useState({});
  const [showShortcuts, setShowShortcuts] = useState(false);
  const pendingDeleteRef = useRef(null);
  const [alignGuides, setAlignGuides] = useState([]);
  const [spacingGuides, setSpacingGuides] = useState([]);
  const [dragHud, setDragHud] = useState(null);
  const [showDimensionPicker, setShowDimensionPicker] = useState(false);
  const [compactToolsOpen, setCompactToolsOpen] = useState(false);
  const [customW, setCustomW] = useState("1080");
  const [customH, setCustomH] = useState("1080");
  const [lockAspect, setLockAspect] = useState(false);
  const customAspectRef = useRef(1);
  useCallback((entryTemplateId) => {
    if (!id) return;
    const before = [...recents];
    const updated = recents.filter((e) => e.templateId !== entryTemplateId);
    saveMarketingRecents(id, updated);
    setRecents(updated);
    pendingDeleteRef.current = { id: entryTemplateId, entries: before };
    toast("Design removed", {
      action: {
        label: "Undo",
        onClick: () => {
          var _a2;
          if (((_a2 = pendingDeleteRef.current) == null ? void 0 : _a2.id) === entryTemplateId) {
            saveMarketingRecents(id, before);
            setRecents(before);
            pendingDeleteRef.current = null;
          }
        }
      },
      duration: 5e3
    });
  }, [id, recents]);
  useCallback((entry) => {
    var _a2;
    if (!id) return;
    const copyId = `${entry.templateId}-copy-${Date.now()}`;
    const copy = {
      ...entry,
      templateId: copyId,
      customName: `${entry.customName || ((_a2 = TEMPLATES.find((t) => t.id === entry.templateId)) == null ? void 0 : _a2.name) || "Design"} (Copy)`,
      lastEdited: Date.now()
    };
    const updated = [copy, ...recents];
    saveMarketingRecents(id, updated);
    setRecents(updated);
    toast.success("Design duplicated");
  }, [id, recents]);
  useCallback((entryTemplateId, newName) => {
    if (!id) return;
    const updated = recents.map(
      (e) => e.templateId === entryTemplateId ? { ...e, customName: newName } : e
    );
    saveMarketingRecents(id, updated);
    setRecents(updated);
    setRenamingId(null);
  }, [id, recents]);
  useCallback(async (entry) => {
    const t = TEMPLATES.find((t2) => t2.id === entry.templateId);
    if (!t) return;
    const exportW = entry.data.canvasWidth || t.width;
    const exportH = entry.data.canvasHeight || t.height;
    const toastId = toast.loading("Preparing download…");
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    root.render(t.render(entry.data, false));
    await new Promise((r) => setTimeout(r, 200));
    try {
      const exportTarget = container.firstElementChild;
      if (!exportTarget) {
        throw new Error("Unable to render recent design for export.");
      }
      const dataUrl = await exportNodeToPng(exportTarget, exportW, exportH);
      const link = document.createElement("a");
      link.download = `${(entry.customName || t.name).replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Download failed", { id: toastId });
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  }, []);
  useCallback((entry) => {
    if (!id) return;
    const url = `${window.location.origin}/transactions/${id}/marketing?template=${entry.templateId}`;
    window.open(url, "_blank");
  }, [id]);
  useEffect(() => {
    if (deal) {
      const saved = id ? loadMarketingRecents(id).find((r) => r.templateId === templateId) : null;
      if (saved) {
        setHist({
          stack: [hydrateTemplateData(getDefaultTemplateData(deal, template.category), saved.data)],
          index: 0
        });
      } else {
        setData((prev) => {
          const nextPhotos = prev.photos;
          return {
            ...getDefaultTemplateData(deal, template.category),
            photos: nextPhotos,
            photoBlocks: getDefaultPhotoBlocks(nextPhotos, prev.canvasWidth || 1080, prev.canvasHeight || 1080)
          };
        });
      }
    }
  }, [deal, templateId, template.category, hydrateTemplateData]);
  useEffect(() => {
    if (!photosInitialized && dealPhotos.length > 0) {
      const saved = id ? loadMarketingRecents(id).find((r) => r.templateId === templateId) : null;
      if (!saved) {
        setData((prev) => {
          const nextPhotos = dealPhotos.map((p) => p.url);
          return {
            ...prev,
            photos: nextPhotos,
            photoBlocks: prev.photoBlocks.length > 0 ? prev.photoBlocks : getDefaultPhotoBlocks(nextPhotos, prev.canvasWidth || 1080, prev.canvasHeight || 1080)
          };
        });
      }
      setPhotosInitialized(true);
    }
  }, [dealPhotos, photosInitialized, id, templateId]);
  const updateField = useCallback((field, value) => {
    setData((prev) => {
      var _a2;
      if (!field.startsWith("agent")) {
        return { ...prev, [field]: value };
      }
      const agents = ((_a2 = prev.agents) == null ? void 0 : _a2.length) ? [...prev.agents] : [{
        name: prev.agentName,
        title: prev.agentTitle,
        phone: prev.agentPhone,
        email: prev.agentEmail
      }];
      const firstAgent = { ...agents[0] };
      if (field === "agentName") firstAgent.name = value;
      if (field === "agentTitle") firstAgent.title = value;
      if (field === "agentPhone") firstAgent.phone = value;
      if (field === "agentEmail") firstAgent.email = value;
      agents[0] = firstAgent;
      return {
        ...prev,
        [field]: value,
        agents
      };
    });
  }, [setData]);
  const visibility = {
    ...DEFAULT_TEMPLATE_VISIBILITY,
    ...data.visibility ?? {}
  };
  const groupedBlocks = new Set(data.groupedBlockKeys ?? []);
  const selectedCustomTextId = selectedBlock ? getCustomTextBlockId(selectedBlock) : null;
  const selectedCustomTextBlock = selectedCustomTextId ? data.customTextBlocks.find((entry) => entry.id === selectedCustomTextId) ?? null : null;
  const selectedPhotoFitMode = selectedBlock && isPhotoCanvasBlock(selectedBlock) ? (() => {
    var _a2, _b;
    const photoBlockId = getPhotoBlockId(selectedBlock);
    const photoIndex = data.photoBlocks.findIndex((entry) => entry.id === photoBlockId);
    return ((_b = (_a2 = data.blockTransforms) == null ? void 0 : _a2[selectedBlock]) == null ? void 0 : _b.fitMode) ?? (photoIndex === 0 ? "cover" : "contain");
  })() : null;
  const updateVisibility = useCallback((field, checked) => {
    setData((prev) => ({
      ...prev,
      visibility: {
        ...DEFAULT_TEMPLATE_VISIBILITY,
        ...prev.visibility ?? {},
        [field]: checked
      }
    }));
  }, [setData]);
  const setHeadlineStyle = useCallback((headlineStyle) => {
    setData((prev) => ({ ...prev, headlineStyle }));
  }, [setData]);
  const setAgentLayout = useCallback((agentLayout) => {
    setData((prev) => ({ ...prev, agentLayout }));
  }, [setData]);
  const applyCanvasDimension = useCallback((dim) => {
    setData((prev) => ({
      ...prev,
      canvasDimensionId: dim.id,
      canvasWidth: dim.width,
      canvasHeight: dim.height
    }));
    if (dim.id === "custom") {
      setCustomW(String(dim.width));
      setCustomH(String(dim.height));
    }
    setShowDimensionPicker(false);
  }, [setData]);
  const applyCustomDimension = useCallback(() => {
    const w = Math.max(100, Math.min(4096, parseInt(customW, 10) || 1080));
    const h = Math.max(100, Math.min(4096, parseInt(customH, 10) || 1080));
    setData((prev) => ({
      ...prev,
      canvasDimensionId: "custom",
      canvasWidth: w,
      canvasHeight: h
    }));
    setShowDimensionPicker(false);
  }, [customW, customH, setData]);
  const updateBlockTransforms = useCallback((updates, replace = false) => {
    const applyUpdate = replace ? replaceCurrentData : setData;
    applyUpdate((prev) => {
      const nextTransforms = { ...prev.blockTransforms ?? {} };
      Object.entries(updates).forEach(([blockKey, patch]) => {
        const block = blockKey;
        const current = nextTransforms[block] ?? { x: 0, y: 0, scale: 1, fitMode: "cover" };
        nextTransforms[block] = {
          ...current,
          ...patch
        };
      });
      return {
        ...prev,
        blockTransforms: nextTransforms
      };
    });
  }, [replaceCurrentData, setData]);
  const updateBlockTransform = useCallback((block, nextTransform, replace = false) => {
    updateBlockTransforms({ [block]: nextTransform }, replace);
  }, [updateBlockTransforms]);
  const setPhotoFitMode = useCallback((block, fitMode) => {
    if (!isPhotoCanvasBlock(block)) return;
    updateBlockTransforms({ [block]: { fitMode } });
  }, [updateBlockTransforms]);
  const resetSelectedBlock = useCallback(() => {
    if (!selectedBlock) return;
    setData((prev) => {
      const nextTransforms = { ...prev.blockTransforms ?? {} };
      delete nextTransforms[selectedBlock];
      return {
        ...prev,
        blockTransforms: nextTransforms
      };
    });
  }, [selectedBlock, setData]);
  const toggleLockBlock = useCallback((block) => {
    setLockedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(block)) {
        next.delete(block);
        toast.success("Block unlocked");
      } else {
        next.add(block);
        toast("Block locked - position is frozen");
      }
      return next;
    });
  }, []);
  const duplicateBlock = useCallback((block) => {
    var _a2;
    if (isCustomTextBlock(block)) {
      const customTextId = getCustomTextBlockId(block);
      if (!customTextId) return;
      const newId = `text-${Date.now()}`;
      const newBlockKey = `custom-text-${newId}`;
      const currentTransform = (_a2 = data.blockTransforms) == null ? void 0 : _a2[block];
      setData((prev) => {
        const original = prev.customTextBlocks.find((entry) => entry.id === customTextId);
        if (!original) return prev;
        return {
          ...prev,
          customTextBlocks: [...prev.customTextBlocks, { id: newId, text: original.text }],
          blockTransforms: {
            ...prev.blockTransforms,
            [newBlockKey]: {
              x: ((currentTransform == null ? void 0 : currentTransform.x) ?? 0) + 24,
              y: ((currentTransform == null ? void 0 : currentTransform.y) ?? 0) + 24,
              scale: (currentTransform == null ? void 0 : currentTransform.scale) ?? 1
            }
          }
        };
      });
      setSelectedBlock(newBlockKey);
      toast.success("Text box duplicated");
      return;
    }
    toast("Template blocks can't be duplicated - use Reset to clear position");
  }, [data.blockTransforms, setData]);
  const deleteBlock = useCallback((block) => {
    if (isPhotoCanvasBlock(block)) {
      const photoBlockId = getPhotoBlockId(block);
      if (!photoBlockId) return;
      setData((prev) => {
        const nextTransforms = { ...prev.blockTransforms ?? {} };
        delete nextTransforms[block];
        return {
          ...prev,
          photoBlocks: prev.photoBlocks.filter((entry) => entry.id !== photoBlockId),
          groupedBlockKeys: prev.groupedBlockKeys.filter((entry) => entry !== block),
          blockTransforms: nextTransforms
        };
      });
      setLockedBlocks((prev) => {
        const next = new Set(prev);
        next.delete(block);
        return next;
      });
      setSelectedBlock(null);
      toast.success("Photo removed from poster");
      return;
    }
    if (isCustomTextBlock(block)) {
      const customTextId = getCustomTextBlockId(block);
      if (!customTextId) return;
      setData((prev) => {
        const nextTransforms = { ...prev.blockTransforms ?? {} };
        delete nextTransforms[block];
        return {
          ...prev,
          customTextBlocks: prev.customTextBlocks.filter((entry) => entry.id !== customTextId),
          groupedBlockKeys: prev.groupedBlockKeys.filter((entry) => entry !== block),
          blockTransforms: nextTransforms
        };
      });
      setLockedBlocks((prev) => {
        const next = new Set(prev);
        next.delete(block);
        return next;
      });
      setSelectedBlock(null);
      toast.success("Custom text removed");
      return;
    }
    const visibilityKey = block === "agent" || block === "photo" ? null : block;
    if (!visibilityKey) return;
    setData((prev) => ({
      ...prev,
      groupedBlockKeys: prev.groupedBlockKeys.filter((entry) => entry !== block),
      visibility: { ...prev.visibility, [visibilityKey]: false }
    }));
    setSelectedBlock(null);
    toast("Block hidden", {
      action: {
        label: "Undo",
        onClick: () => setData((prev) => ({
          ...prev,
          visibility: { ...prev.visibility, [visibilityKey]: true }
        }))
      },
      duration: 5e3
    });
  }, [setData]);
  const toggleGroupBlock = useCallback((block) => {
    setData((prev) => {
      const next = new Set(prev.groupedBlockKeys ?? []);
      if (next.has(block)) {
        next.delete(block);
        toast("Ungrouped");
      } else {
        next.add(block);
        toast(next.size > 1 ? `${next.size} blocks will move together` : "Block added to group");
      }
      return {
        ...prev,
        groupedBlockKeys: Array.from(next)
      };
    });
  }, [setData]);
  const addCustomTextBlock = useCallback(() => {
    const customTextId = `text-${Date.now()}`;
    const blockKey = `custom-text-${customTextId}`;
    setData((prev) => {
      const cw = prev.canvasWidth || 1080;
      const ch = prev.canvasHeight || 1080;
      const fontScale = cw / 1080;
      const stackOffset = Math.round(72 * fontScale);
      return {
        ...prev,
        customTextBlocks: [
          ...prev.customTextBlocks,
          {
            id: customTextId,
            text: "Custom text"
          }
        ],
        blockTransforms: {
          ...prev.blockTransforms ?? {},
          [blockKey]: {
            x: Math.round(cw * 0.08),
            y: Math.round(ch * 0.1) + prev.customTextBlocks.length * stackOffset,
            scale: 1
          }
        }
      };
    });
    setSelectedBlock(blockKey);
    toast.success("Custom text box added");
  }, [setData]);
  const updateCustomTextBlock = useCallback((blockId, text) => {
    setData((prev) => ({
      ...prev,
      customTextBlocks: prev.customTextBlocks.map(
        (entry) => entry.id === blockId ? { ...entry, text } : entry
      )
    }));
  }, [setData]);
  const addPhotoBlock = useCallback((src, options) => {
    const blockId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const blockKey = `photo-item-${blockId}`;
    setData((prev) => {
      const canvasWidth = prev.canvasWidth || 1080;
      const canvasHeight = prev.canvasHeight || 1080;
      const nextBlock = makePosterPhotoBlock(
        src,
        canvasWidth,
        canvasHeight,
        prev.photoBlocks.length,
        options == null ? void 0 : options.preferredLeft,
        options == null ? void 0 : options.preferredTop,
        blockId
      );
      return {
        ...prev,
        photoBlocks: [...prev.photoBlocks, nextBlock]
      };
    });
    if ((options == null ? void 0 : options.select) !== false) {
      setSelectedBlock(blockKey);
    }
    if (options == null ? void 0 : options.toastMessage) {
      toast.success(options.toastMessage);
    }
  }, [setData]);
  const handlePhotoUpload = useCallback(async (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    e.target.value = "";
    if (!id) {
      const url = URL.createObjectURL(file);
      setData((prev) => {
        const nextPhotos = [url, ...prev.photos];
        return {
          ...prev,
          photos: nextPhotos,
          photoBlocks: prev.photoBlocks.length > 0 ? prev.photoBlocks : getDefaultPhotoBlocks(nextPhotos, prev.canvasWidth || 1080, prev.canvasHeight || 1080)
        };
      });
      toast.warning("Photo added locally only - open this template from a deal to save photos permanently.");
      return;
    }
    setUploadingPhoto(true);
    try {
      await uploadDealPhoto.mutateAsync({ dealId: id, file });
      toast.success("Photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }, [id, uploadDealPhoto, setData]);
  useEffect(() => {
    if (!photosInitialized || dealPhotos.length === 0) return;
    setData((prev) => {
      const supabaseUrls = dealPhotos.map((p) => p.url);
      const hasNew = supabaseUrls.some((u) => !prev.photos.includes(u));
      if (!hasNew) return prev;
      const blobUrls = prev.photos.filter((u) => u.startsWith("blob:"));
      const nextPhotos = [...supabaseUrls, ...blobUrls];
      return {
        ...prev,
        photos: nextPhotos,
        photoBlocks: prev.photoBlocks.length > 0 ? prev.photoBlocks : getDefaultPhotoBlocks(nextPhotos, prev.canvasWidth || 1080, prev.canvasHeight || 1080)
      };
    });
  }, [dealPhotos]);
  const removePhoto = useCallback((index) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  }, [setData]);
  const handlePersonalPhotoUpload = useCallback((e) => {
    const fileList = e.target.files;
    const fileArray = fileList ? Array.from(fileList) : [];
    e.target.value = "";
    if (fileArray.length === 0) return;
    const urls = fileArray.map((f) => URL.createObjectURL(f));
    setPersonalPhotos((prev) => [...urls, ...prev]);
    setData((prev) => ({
      ...prev,
      photoBlocks: prev.photoBlocks.length > 0 ? prev.photoBlocks : getDefaultPhotoBlocks(urls, prev.canvasWidth || 1080, prev.canvasHeight || 1080)
    }));
    toast.success(urls.length === 1 ? "Photo added to library" : `${urls.length} photos added to library`);
  }, [setData]);
  const removePersonalPhoto = useCallback((index) => {
    setPersonalPhotos((prev) => {
      const removed = prev[index];
      const stillPlaced = removed ? data.photoBlocks.some((block) => block.src === removed) : false;
      if ((removed == null ? void 0 : removed.startsWith("blob:")) && !stillPlaced) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  }, [data.photoBlocks]);
  const handleCanvasPhotoDrop = useCallback((e) => {
    var _a2;
    e.preventDefault();
    const photoUrl = e.dataTransfer.getData("text/photo-url");
    if (photoUrl) {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropX = (e.clientX - canvasRect.left) / (scaleRef.current || 1);
      const dropY = (e.clientY - canvasRect.top) / (scaleRef.current || 1);
      const previewBlock = makePosterPhotoBlock(photoUrl, canvasW, canvasH, data.photoBlocks.length);
      const positionedBlock = clampPhotoPosition(
        previewBlock,
        canvasW,
        canvasH,
        dropX - previewBlock.width / 2,
        dropY - previewBlock.height / 2
      );
      addPhotoBlock(photoUrl, {
        preferredLeft: positionedBlock.left,
        preferredTop: positionedBlock.top,
        toastMessage: "Photo added to poster"
      });
      return;
    }
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        const canvasRect = (_a2 = canvasRef.current) == null ? void 0 : _a2.getBoundingClientRect();
        const dropX = canvasRect ? (e.clientX - canvasRect.left) / (scaleRef.current || 1) : canvasW / 2;
        const dropY = canvasRect ? (e.clientY - canvasRect.top) / (scaleRef.current || 1) : canvasH / 2;
        setPersonalPhotos((prev) => [url, ...prev]);
        const previewBlock = makePosterPhotoBlock(url, canvasW, canvasH, data.photoBlocks.length);
        const positionedBlock = clampPhotoPosition(
          previewBlock,
          canvasW,
          canvasH,
          dropX - previewBlock.width / 2,
          dropY - previewBlock.height / 2
        );
        addPhotoBlock(url, {
          preferredLeft: positionedBlock.left,
          preferredTop: positionedBlock.top,
          toastMessage: "Photo dropped onto poster"
        });
      }
    }
  }, [addPhotoBlock, canvasH, canvasW, data.photoBlocks.length, setData]);
  const handleCanvasPhotoDragOver = useCallback((e) => {
    if (e.dataTransfer.types.includes("text/photo-url") || e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    const toastId = toast.loading("Exporting image…");
    const exportW = data.canvasWidth || 1080;
    const exportH = data.canvasHeight || 1080;
    try {
      const dataUrl = await exportNodeToPng(canvasRef.current, exportW, exportH);
      const link = document.createElement("a");
      link.download = `${template.name.replace(/\s+/g, "-").toLowerCase()}-${data.address.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed - please try again.", { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [template, data.address]);
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const updateViewportSize = () => {
      setCanvasViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight
      });
    };
    updateViewportSize();
    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isCompactEditor]);
  const canvasPadding = isMobileEditor ? 24 : 64;
  const maxCanvasWidth = Math.max((canvasViewportSize.width || 600) - canvasPadding, 240);
  const maxCanvasHeight = Math.max((canvasViewportSize.height || 600) - canvasPadding, 240);
  const naturalScale = Math.min(maxCanvasWidth / canvasW, maxCanvasHeight / canvasH, 1);
  const scale = naturalScale * zoom;
  scaleRef.current = scale;
  const measureBlocks = useCallback(() => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const divisor = scaleRef.current || 1;
    const nextRects = {};
    canvasRef.current.querySelectorAll("[data-marketing-block]").forEach((element) => {
      const block = element.dataset.marketingBlock;
      if (!block) return;
      const rect = element.getBoundingClientRect();
      nextRects[block] = {
        left: (rect.left - canvasRect.left) / divisor,
        top: (rect.top - canvasRect.top) / divisor,
        width: rect.width / divisor,
        height: rect.height / divisor
      };
    });
    setBlockRects(nextRects);
    setSelectedBlock((current) => current && !nextRects[current] ? null : current);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(measureBlocks);
    return () => window.cancelAnimationFrame(frame);
  }, [measureBlocks, data, templateId, scale]);
  useEffect(() => {
    const handleResize = () => measureBlocks();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureBlocks]);
  useEffect(() => {
    if (!canvasRef.current) return;
    const images = Array.from(canvasRef.current.querySelectorAll("img"));
    const handleLoad = () => measureBlocks();
    images.forEach((image) => {
      if (image.complete) {
        handleLoad();
      } else {
        image.addEventListener("load", handleLoad);
      }
    });
    return () => {
      images.forEach((image) => image.removeEventListener("load", handleLoad));
    };
  }, [measureBlocks, data.photos, templateId]);
  const blockRectsRef = useRef({});
  const liveOverlayRef = useRef({});
  const [, forceOverlayUpdate] = useState(0);
  useEffect(() => {
    blockRectsRef.current = blockRects;
  }, [blockRects]);
  const canvasSizeRef = useRef({ w: canvasW, h: canvasH });
  useEffect(() => {
    canvasSizeRef.current = { w: canvasW, h: canvasH };
  }, [canvasW, canvasH]);
  const getInteractionTargets = useCallback((block) => {
    const rects = blockRectsRef.current;
    const groupedTargetKeys = groupedBlocks.has(block) ? (data.groupedBlockKeys ?? []).filter((entry) => rects[entry] && !lockedBlocks.has(entry)) : [block];
    const targetKeys = groupedTargetKeys.length > 0 ? groupedTargetKeys : [block];
    return targetKeys.map((entry) => {
      var _a2;
      const baseRect = rects[entry];
      if (!baseRect) return null;
      const currentTransform = (_a2 = data.blockTransforms) == null ? void 0 : _a2[entry];
      return {
        block: entry,
        startTransform: {
          x: (currentTransform == null ? void 0 : currentTransform.x) ?? 0,
          y: (currentTransform == null ? void 0 : currentTransform.y) ?? 0,
          scale: (currentTransform == null ? void 0 : currentTransform.scale) ?? 1
        },
        baseRect
      };
    }).filter((entry) => Boolean(entry));
  }, [data.blockTransforms, data.groupedBlockKeys, groupedBlocks, lockedBlocks]);
  useEffect(() => {
    const handlePointerMove = (event) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      event.preventDefault();
      setIsDraggingBlock(true);
      const divisor = scaleRef.current || 1;
      const dx = (event.clientX - interaction.startClientX) / divisor;
      const dy = (event.clientY - interaction.startClientY) / divisor;
      if (interaction.mode === "move") {
        const rawX = interaction.startTransform.x + dx;
        const rawY = interaction.startTransform.y + dy;
        const baseRect = interaction.baseRect;
        const proposedLeft = baseRect.left + (rawX - interaction.startTransform.x);
        const proposedTop = baseRect.top + (rawY - interaction.startTransform.y);
        const proposed = {
          left: proposedLeft,
          top: proposedTop,
          width: baseRect.width,
          height: baseRect.height
        };
        const snap = computeSnap(
          interaction.block,
          proposed,
          canvasSizeRef.current.w,
          canvasSizeRef.current.h,
          blockRectsRef.current
        );
        const snappedX = rawX + snap.x;
        const snappedY = rawY + snap.y;
        const deltaX = snappedX - interaction.startTransform.x;
        const deltaY = snappedY - interaction.startTransform.y;
        const updates = {};
        interaction.targets.forEach((target) => {
          updates[target.block] = {
            ...target.startTransform,
            x: target.startTransform.x + deltaX,
            y: target.startTransform.y + deltaY
          };
        });
        updateBlockTransforms(updates, interaction.committed);
        interaction.committed = true;
        interaction.targets.forEach((target) => {
          const base = target.baseRect;
          liveOverlayRef.current[target.block] = {
            left: base.left + deltaX,
            top: base.top + deltaY,
            width: base.width,
            height: base.height
          };
        });
        forceOverlayUpdate((n) => n + 1);
        setAlignGuides(snap.guides);
        setSpacingGuides(snap.spacingGuides);
        setDragHud({ x: Math.round(snappedX), y: Math.round(snappedY) });
        return;
      }
      setAlignGuides([]);
      setSpacingGuides([]);
      const isGroupedInteraction = interaction.targets.length > 1;
      if (isGroupedInteraction) {
        const baseScaleSize = Math.max(interaction.baseRect.width, interaction.baseRect.height, 120);
        const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const ratio = Math.min(3, Math.max(0.35, (baseScaleSize + dominantDelta) / baseScaleSize));
        const updates = {};
        interaction.targets.forEach((target) => {
          updates[target.block] = {
            ...target.startTransform,
            scale: Number.isFinite(target.startTransform.scale * ratio) ? Math.min(3, Math.max(0.35, target.startTransform.scale * ratio)) : target.startTransform.scale
          };
        });
        updateBlockTransforms(updates, interaction.committed);
      } else {
        const baseSize = Math.max(interaction.baseRect.width, interaction.baseRect.height, 120);
        const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const nextScale = Math.min(
          3,
          Math.max(0.35, interaction.startTransform.scale * ((baseSize + dominantDelta) / baseSize))
        );
        updateBlockTransform(
          interaction.block,
          {
            ...interaction.startTransform,
            scale: Number.isFinite(nextScale) ? nextScale : interaction.startTransform.scale
          },
          interaction.committed
        );
      }
      interaction.committed = true;
    };
    const handlePointerEnd = () => {
      interactionRef.current = null;
      liveOverlayRef.current = {};
      setAlignGuides([]);
      setSpacingGuides([]);
      setDragHud(null);
      setIsDraggingBlock(false);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [getInteractionTargets, updateBlockTransform, updateBlockTransforms]);
  useEffect(() => {
    setSelectedBlock(null);
  }, [templateId]);
  useEffect(() => {
    setCustomW(String(data.canvasWidth || 1080));
    setCustomH(String(data.canvasHeight || 1080));
  }, [data.canvasWidth, data.canvasHeight]);
  useEffect(() => {
    const onKey = (e) => {
      var _a2, _b;
      const mod = e.metaKey || e.ctrlKey;
      const tag = (_a2 = e.target) == null ? void 0 : _a2.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ((_b = e.target) == null ? void 0 : _b.isContentEditable);
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (mod && e.key === "z" && e.shiftKey || mod && e.key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (isInput) return;
      if (e.key === "Escape") {
        setSelectedBlock(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlock) {
        e.preventDefault();
        if (isCustomTextBlock(selectedBlock) || isPhotoCanvasBlock(selectedBlock)) {
          deleteBlock(selectedBlock);
          return;
        }
        resetSelectedBlock();
        return;
      }
      if (selectedBlock && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const nudge = e.shiftKey ? 10 : 1;
        const targets = getInteractionTargets(selectedBlock);
        const updates = {};
        targets.forEach((target) => {
          let nx = target.startTransform.x;
          let ny = target.startTransform.y;
          if (e.key === "ArrowUp") ny -= nudge;
          if (e.key === "ArrowDown") ny += nudge;
          if (e.key === "ArrowLeft") nx -= nudge;
          if (e.key === "ArrowRight") nx += nudge;
          updates[target.block] = {
            ...target.startTransform,
            x: nx,
            y: ny
          };
        });
        updateBlockTransforms(updates);
        return;
      }
      if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)));
        return;
      }
      if (e.key === "-") {
        setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2)));
        return;
      }
      if (e.key === "0") {
        setZoom(1);
        return;
      }
      if (e.key === "?") {
        setShowShortcuts((s) => !s);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data.blockTransforms, deleteBlock, getInteractionTargets, handleRedo, handleUndo, resetSelectedBlock, selectedBlock, updateBlockTransforms]);
  const beginBlockInteraction = useCallback((event, block, mode) => {
    var _a2;
    event.preventDefault();
    event.stopPropagation();
    setSelectedBlock(block);
    const effectiveLocked = lockedBlocks.has(block);
    if (effectiveLocked) return;
    const currentTransform = (_a2 = data.blockTransforms) == null ? void 0 : _a2[block];
    const baseRect = blockRects[block] ?? { left: 0, top: 0, width: 220, height: 220 };
    const targets = getInteractionTargets(block);
    interactionRef.current = {
      block,
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTransform: {
        x: (currentTransform == null ? void 0 : currentTransform.x) ?? 0,
        y: (currentTransform == null ? void 0 : currentTransform.y) ?? 0,
        scale: (currentTransform == null ? void 0 : currentTransform.scale) ?? 1
      },
      baseRect,
      targets,
      committed: false
    };
  }, [blockRects, data.blockTransforms, getInteractionTargets, lockedBlocks]);
  return /* @__PURE__ */ jsxs("div", { className: "h-screen flex flex-col bg-muted/20", children: [
    /* @__PURE__ */ jsx("div", { className: "shrink-0 border-b bg-background px-3 py-3 sm:px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate(`/transactions/${id}?tab=Marketing`), children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        isCompactEditor ? /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "gap-1.5",
            onClick: () => setCompactToolsOpen((open) => !open),
            children: [
              /* @__PURE__ */ jsx(LayoutGrid, { className: "h-3.5 w-3.5" }),
              compactToolsOpen ? "Hide Tools" : "Tools"
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "truncate font-semibold text-sm", children: template.name }),
          /* @__PURE__ */ jsx("span", { className: cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", CATEGORY_COLORS[template.category]), children: template.category }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            TYPE_LABELS[template.type],
            " · ",
            canvasW,
            "×",
            canvasH
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-1 sm:justify-end sm:pb-0", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowDimensionPicker(true),
            className: "flex items-center gap-1.5 h-8 px-3 rounded-md border bg-background text-xs font-medium hover:bg-muted transition-colors",
            title: "Change canvas dimensions",
            children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: "border-2 border-foreground/70 rounded-sm bg-muted/40",
                  style: {
                    display: "inline-block",
                    width: Math.round(14 * Math.min(1, canvasW / canvasH)),
                    height: Math.round(14 * Math.min(1, canvasH / canvasW)),
                    minWidth: 8,
                    minHeight: 8
                  }
                }
              ) }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: ((_a = CANVAS_DIMENSIONS.find((d) => d.id === data.canvasDimensionId)) == null ? void 0 : _a.aspectLabel) ?? `${canvasW}×${canvasH}` }),
              !isMobileEditor ? /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
                canvasW,
                "×",
                canvasH
              ] }) : null,
              /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 text-muted-foreground" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 border rounded-md px-1", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7",
              onClick: handleUndo,
              disabled: !canUndo,
              title: "Undo (Ctrl+Z)",
              children: /* @__PURE__ */ jsx(Undo2, { className: "h-3.5 w-3.5" })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7",
              onClick: handleRedo,
              disabled: !canRedo,
              title: "Redo (Ctrl+Shift+Z)",
              children: /* @__PURE__ */ jsx(Redo2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 border rounded-md px-1", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "Zoom out (-)", onClick: () => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2))), children: /* @__PURE__ */ jsx(ZoomOut, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: ZOOM_PRESETS.map((p) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setZoom(p),
              className: cn(
                "h-5 px-1.5 rounded text-[10px] font-medium transition-colors",
                Math.abs(zoom - p) < 0.01 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              ),
              title: `Set zoom to ${Math.round(p * 100)}%`,
              children: [
                Math.round(p * 100),
                "%"
              ]
            },
            p
          )) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "Zoom in (+)", onClick: () => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2))), children: /* @__PURE__ */ jsx(ZoomIn, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: cn(
          "flex items-center gap-1 text-[11px] font-medium transition-all duration-300",
          saveStatus === "idle" ? "opacity-0 pointer-events-none" : "opacity-100",
          saveStatus === "saved" ? "text-emerald-600" : "text-muted-foreground"
        ), children: [
          saveStatus === "saving" && /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
          saveStatus === "saved" && /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }),
          saveStatus === "saving" ? "Saving…" : "Saved"
        ] }),
        !isMobileEditor ? /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 text-muted-foreground",
            onClick: () => setShowShortcuts(true),
            title: "Keyboard shortcuts (?)",
            children: /* @__PURE__ */ jsx(Keyboard, { className: "h-3.5 w-3.5" })
          }
        ) : null,
        /* @__PURE__ */ jsxs(Button, { onClick: handleExport, size: "sm", disabled: exporting, className: "gap-2", children: [
          exporting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          exporting ? "Exporting…" : isMobileEditor ? "PNG" : "Download PNG"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: cn("flex flex-1 overflow-hidden", isCompactEditor && "flex-col"), children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "shrink-0 bg-background flex flex-col",
            isCompactEditor ? compactToolsOpen ? "h-[min(26rem,44vh)] w-full border-b" : "hidden" : "border-r"
          ),
          style: isCompactEditor ? void 0 : { width: LEFT_PANEL_WIDTH },
          children: /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "pb-3 border-b mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-foreground", children: "Property Photos" }),
                dealPhotos.length > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-muted-foreground", children: [
                  dealPhotos.length,
                  " from deal"
                ] }) : null
              ] }),
              /* @__PURE__ */ jsx("input", { ref: photoInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handlePhotoUpload }),
              data.photos.length === 0 ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    var _a2;
                    return (_a2 = photoInputRef.current) == null ? void 0 : _a2.click();
                  },
                  disabled: uploadingPhoto,
                  className: "w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed",
                  children: uploadingPhoto ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }),
                    /* @__PURE__ */ jsx("span", { children: "Uploading…" })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ImagePlus, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: "Click to add photo" })
                  ] })
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                data.photos.map((src, i) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "relative group cursor-grab active:cursor-grabbing",
                    draggable: true,
                    onClick: () => addPhotoBlock(src, { toastMessage: "Photo added to poster" }),
                    onDragStart: (e) => {
                      e.dataTransfer.setData("text/photo-url", src);
                      e.dataTransfer.effectAllowed = "copy";
                    },
                    children: [
                      /* @__PURE__ */ jsx("img", { src, alt: "", className: "w-16 h-16 object-cover rounded border" }),
                      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", children: /* @__PURE__ */ jsx(ImagePlus, { className: "h-3 w-3 text-white drop-shadow" }) }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: (event) => {
                            event.stopPropagation();
                            removePhoto(i);
                          },
                          className: "absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                          children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
                        }
                      )
                    ]
                  },
                  src + i
                )),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      var _a2;
                      return (_a2 = photoInputRef.current) == null ? void 0 : _a2.click();
                    },
                    disabled: uploadingPhoto,
                    className: "w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50",
                    children: uploadingPhoto ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pb-4 border-b mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-foreground", children: "Personal Photos" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Click or drag onto poster" })
              ] }),
              /* @__PURE__ */ jsx("input", { ref: personalPhotoInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handlePersonalPhotoUpload }),
              personalPhotos.length === 0 ? /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    var _a2;
                    return (_a2 = personalPhotoInputRef.current) == null ? void 0 : _a2.click();
                  },
                  className: "w-full h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs",
                  children: [
                    /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Add any photo" })
                  ]
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                personalPhotos.map((src, i) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "relative group cursor-grab active:cursor-grabbing",
                    draggable: true,
                    onClick: () => addPhotoBlock(src, { toastMessage: "Photo added to poster" }),
                    onDragStart: (e) => {
                      e.dataTransfer.setData("text/photo-url", src);
                      e.dataTransfer.effectAllowed = "copy";
                    },
                    children: [
                      /* @__PURE__ */ jsx("img", { src, alt: "", className: "w-16 h-16 object-cover rounded border" }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: (event) => {
                            event.stopPropagation();
                            removePersonalPhoto(i);
                          },
                          className: "absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                          children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
                        }
                      )
                    ]
                  },
                  src + i
                )),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      var _a2;
                      return (_a2 = personalPhotoInputRef.current) == null ? void 0 : _a2.click();
                    },
                    className: "w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors",
                    children: /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Collapsible, { open: studioBasicsOpen, onOpenChange: setStudioBasicsOpen, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Style & Layout",
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${studioBasicsOpen ? "rotate-180" : ""}` })
              ] }),
              /* @__PURE__ */ jsxs(CollapsibleContent, { className: "space-y-3 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Headline Style" }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1.5", children: ["h1", "h2", "h3"].map((hs) => {
                    const meta = HEADLINE_STYLE_LABELS[hs];
                    return /* @__PURE__ */ jsx(
                      OptionCard,
                      {
                        label: meta.name,
                        description: meta.desc,
                        preview: hs === "h1" ? /* @__PURE__ */ jsx("span", { className: cn("font-serif text-2xl italic leading-none", data.headlineStyle === "h1" ? "text-primary" : "text-foreground"), children: "Aa" }) : hs === "h2" ? /* @__PURE__ */ jsx("span", { className: cn("text-sm font-bold uppercase tracking-[0.25em] leading-none", data.headlineStyle === "h2" ? "text-primary" : "text-foreground"), children: "AA" }) : /* @__PURE__ */ jsx("span", { className: cn("font-serif text-2xl font-medium leading-none", data.headlineStyle === "h3" ? "text-primary" : "text-foreground"), children: "Aa" }),
                        active: data.headlineStyle === hs,
                        onClick: () => setHeadlineStyle(hs)
                      },
                      hs
                    );
                  }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Photo Canvas" }),
                  /* @__PURE__ */ jsx("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] leading-4 text-muted-foreground", children: "Start with one photo. Drag any photo onto the poster or click a thumbnail to add another one. Move and resize each photo independently." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Collapsible, { open: studioAgentsOpen, onOpenChange: setStudioAgentsOpen, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Agents",
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${studioAgentsOpen ? "rotate-180" : ""}` })
              ] }),
              /* @__PURE__ */ jsx(CollapsibleContent, { className: "space-y-2 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsx(
                  OptionCard,
                  {
                    label: "Single",
                    description: "One agent footer",
                    icon: User,
                    active: data.agentLayout === "single",
                    onClick: () => setAgentLayout("single")
                  }
                ),
                /* @__PURE__ */ jsx(
                  OptionCard,
                  {
                    label: "Multi-Agent",
                    description: "All deal agents",
                    icon: Users,
                    active: data.agentLayout === "multi",
                    onClick: () => setAgentLayout("multi")
                  }
                )
              ] }) })
            ] }),
            selectedBlock ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-muted/25 px-3 py-3 text-[11px] leading-4 text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 rounded-xl border bg-background px-2.5 py-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Selected" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-foreground", children: getBlockLabel(selectedBlock, data.customTextBlocks, data.photoBlocks) })
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[11px]", onClick: resetSelectedBlock, children: "Reset" })
              ] }),
              selectedPhotoFitMode ? /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-xl border bg-background px-2.5 py-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Photo Fit" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-2 gap-1.5", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: selectedPhotoFitMode === "cover" ? "default" : "outline",
                      size: "sm",
                      className: "h-7 text-[11px]",
                      onClick: () => setPhotoFitMode(selectedBlock, "cover"),
                      children: "Fill"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: selectedPhotoFitMode === "contain" ? "default" : "outline",
                      size: "sm",
                      className: "h-7 text-[11px]",
                      onClick: () => setPhotoFitMode(selectedBlock, "contain"),
                      children: "Fit"
                    }
                  )
                ] })
              ] }) : null
            ] }) : null,
            /* @__PURE__ */ jsxs(Collapsible, { defaultOpen: true, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Custom Text",
                /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" })
              ] }),
              /* @__PURE__ */ jsxs(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "h-8 w-full justify-start gap-2 text-xs", onClick: addCustomTextBlock, children: [
                  /* @__PURE__ */ jsx(Type, { className: "h-3.5 w-3.5" }),
                  "Add Text Box"
                ] }),
                data.customTextBlocks.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: data.customTextBlocks.map((entry, index) => {
                    const blockKey = `custom-text-${entry.id}`;
                    const selected = selectedBlock === blockKey;
                    return /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSelectedBlock(blockKey),
                        className: cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                          selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground"
                        ),
                        children: entry.text.trim() ? `${index + 1}. ${entry.text.trim().slice(0, 18)}` : `Text ${index + 1}`
                      },
                      entry.id
                    );
                  }) }),
                  selectedCustomTextBlock ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-background p-3 space-y-2.5", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Text content" }),
                      /* @__PURE__ */ jsx(
                        Textarea,
                        {
                          value: selectedCustomTextBlock.text,
                          onChange: (event) => updateCustomTextBlock(selectedCustomTextBlock.id, event.target.value),
                          className: "mt-1 text-xs",
                          rows: 3
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-8 w-full justify-start gap-2 text-xs text-red-600 hover:text-red-700",
                        onClick: () => deleteBlock(`custom-text-${selectedCustomTextBlock.id}`),
                        children: [
                          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                          "Remove Text Box"
                        ]
                      }
                    )
                  ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground", children: "Select a text box on the canvas to edit its text here." })
                ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground", children: "Add a custom text box if you want text that is not tied to the template fields." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Collapsible, { open: basicsOpen, onOpenChange: setBasicsOpen, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Property Details",
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${basicsOpen ? "rotate-180" : ""}` })
              ] }),
              /* @__PURE__ */ jsxs(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-headline",
                      label: "Headline",
                      checked: visibility.headline,
                      onCheckedChange: (checked) => updateVisibility("headline", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.headline, onChange: (e) => updateField("headline", e.target.value), className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-address",
                      label: "Address",
                      checked: visibility.address,
                      onCheckedChange: (checked) => updateVisibility("address", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.address, onChange: (e) => updateField("address", e.target.value), className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "City" }),
                    /* @__PURE__ */ jsx(Input, { value: data.city, onChange: (e) => updateField("city", e.target.value), className: "mt-1 h-7 text-xs" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "State" }),
                    /* @__PURE__ */ jsx(Input, { value: data.state, onChange: (e) => updateField("state", e.target.value), className: "mt-1 h-7 text-xs" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Zip" }),
                    /* @__PURE__ */ jsx(Input, { value: data.zip, onChange: (e) => updateField("zip", e.target.value), className: "mt-1 h-7 text-xs" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-price",
                      label: "Price",
                      checked: visibility.price,
                      onCheckedChange: (checked) => updateVisibility("price", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.price, onChange: (e) => updateField("price", e.target.value), placeholder: "$595,000", className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "col-span-3", children: /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-stats",
                      label: "Beds / Baths / Sq Ft",
                      checked: visibility.stats,
                      onCheckedChange: (checked) => updateVisibility("stats", checked)
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Beds" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        min: "0",
                        max: "99",
                        step: "1",
                        value: data.beds,
                        onChange: (e) => updateField("beds", e.target.value),
                        className: "mt-1 h-7 text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Baths" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        min: "0",
                        max: "99",
                        step: "0.5",
                        value: data.baths,
                        onChange: (e) => updateField("baths", e.target.value),
                        className: "mt-1 h-7 text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Sq Ft" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: data.sqft,
                        onChange: (e) => updateField("sqft", e.target.value),
                        placeholder: "2,500",
                        className: "mt-1 h-7 text-xs"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-description",
                      label: "Description",
                      checked: visibility.description,
                      onCheckedChange: (checked) => updateVisibility("description", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Textarea, { value: data.description, onChange: (e) => updateField("description", e.target.value), className: "mt-1 text-xs", rows: 3 })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Collapsible, { open: agentOpen, onOpenChange: setAgentOpen, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Agent Info",
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${agentOpen ? "rotate-180" : ""}` })
              ] }),
              /* @__PURE__ */ jsxs(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-name",
                      label: "Name",
                      checked: visibility.agentName,
                      onCheckedChange: (checked) => updateVisibility("agentName", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.agentName, onChange: (e) => updateField("agentName", e.target.value), className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-title",
                      label: "Title",
                      checked: visibility.agentTitle,
                      onCheckedChange: (checked) => updateVisibility("agentTitle", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.agentTitle, onChange: (e) => updateField("agentTitle", e.target.value), className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-phone",
                      label: "Phone",
                      checked: visibility.agentPhone,
                      onCheckedChange: (checked) => updateVisibility("agentPhone", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.agentPhone, onChange: (e) => updateField("agentPhone", e.target.value), className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-email",
                      label: "Email",
                      checked: visibility.agentEmail,
                      onCheckedChange: (checked) => updateVisibility("agentEmail", checked)
                    }
                  ),
                  /* @__PURE__ */ jsx(Input, { value: data.agentEmail, onChange: (e) => updateField("agentEmail", e.target.value), className: "mt-1 h-7 text-xs" })
                ] })
              ] })
            ] }),
            template.category === "Open House" && /* @__PURE__ */ jsxs(Collapsible, { open: ohOpen, onOpenChange: setOhOpen, children: [
              /* @__PURE__ */ jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Open House Details",
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${ohOpen ? "rotate-180" : ""}` })
              ] }),
              /* @__PURE__ */ jsxs(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Date" }),
                  /* @__PURE__ */ jsx(Input, { value: data.openHouseDate, onChange: (e) => updateField("openHouseDate", e.target.value), placeholder: "Saturday, March 22", className: "mt-1 h-7 text-xs" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Time" }),
                  /* @__PURE__ */ jsx(Input, { value: data.openHouseTime, onChange: (e) => updateField("openHouseTime", e.target.value), placeholder: "1:00 PM – 4:00 PM", className: "mt-1 h-7 text-xs" })
                ] })
              ] })
            ] })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: canvasViewportRef,
          className: "relative flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] p-3 [background-size:20px_20px] sm:p-4 lg:p-8",
          onDragOver: handleCanvasPhotoDragOver,
          onDrop: handleCanvasPhotoDrop,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease",
                  marginTop: 0
                },
                children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    ref: previewShellRef,
                    className: "relative shadow-2xl",
                    style: { width: canvasW, height: canvasH },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          ref: canvasRef,
                          style: { width: canvasW, height: canvasH },
                          children: /* @__PURE__ */ jsx(TemplateErrorBoundary, { children: template.render(data, false) })
                        }
                      ),
                      (alignGuides.length > 0 || spacingGuides.length > 0) && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 30 }, children: [
                        alignGuides.map((guide, i) => guide.type === "v" ? /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "absolute top-0 bottom-0",
                            style: {
                              left: guide.pos,
                              width: 1,
                              background: GUIDE_COLOR,
                              opacity: 0.9,
                              boxShadow: `0 0 3px ${GUIDE_COLOR}`
                            },
                            children: guide.label && /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: "absolute text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap",
                                style: {
                                  top: canvasH / 2 - 10,
                                  left: 4,
                                  background: GUIDE_COLOR,
                                  color: "#fff",
                                  fontSize: 11
                                },
                                children: guide.label
                              }
                            )
                          },
                          `v-${i}`
                        ) : /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "absolute left-0 right-0",
                            style: {
                              top: guide.pos,
                              height: 1,
                              background: GUIDE_COLOR,
                              opacity: 0.9,
                              boxShadow: `0 0 3px ${GUIDE_COLOR}`
                            },
                            children: guide.label && /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: "absolute text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap",
                                style: {
                                  left: canvasW / 2 - 25,
                                  top: 4,
                                  background: GUIDE_COLOR,
                                  color: "#fff",
                                  fontSize: 11
                                },
                                children: guide.label
                              }
                            )
                          },
                          `h-${i}`
                        )),
                        spacingGuides.map((sg, i) => {
                          const gapPx = Math.round(sg.value);
                          if (gapPx < 2) return null;
                          const color = "#f59e0b";
                          const labelText = sg.reason === "centered" ? `= ${gapPx}` : `= ${gapPx}`;
                          if (sg.axis === "x") {
                            const midY = sg.center;
                            const midX = (sg.from + sg.to) / 2;
                            const gapW = sg.to - sg.from;
                            return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: sg.from, top: midY - 0.5, width: gapW, height: 1, background: color, opacity: 0.9 } }),
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: sg.from, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 } }),
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: sg.to - 1, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 } }),
                              sg.showLabel && /* @__PURE__ */ jsx("span", { style: {
                                position: "absolute",
                                left: midX,
                                top: midY - 16,
                                transform: "translateX(-50%)",
                                background: color,
                                color: "#fff",
                                fontSize: 9,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                padding: "1px 4px",
                                borderRadius: 3,
                                whiteSpace: "nowrap",
                                letterSpacing: "0.02em"
                              }, children: labelText })
                            ] }, `sg-x-${i}`);
                          } else {
                            const midX = sg.center;
                            const midY = (sg.from + sg.to) / 2;
                            const gapH = sg.to - sg.from;
                            return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: sg.from, left: midX - 0.5, width: 1, height: gapH, background: color, opacity: 0.9 } }),
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: sg.from, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 } }),
                              /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: sg.to - 1, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 } }),
                              sg.showLabel && /* @__PURE__ */ jsx("span", { style: {
                                position: "absolute",
                                top: midY,
                                left: midX + 6,
                                transform: "translateY(-50%)",
                                background: color,
                                color: "#fff",
                                fontSize: 9,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                padding: "1px 4px",
                                borderRadius: 3,
                                whiteSpace: "nowrap",
                                letterSpacing: "0.02em"
                              }, children: labelText })
                            ] }, `sg-y-${i}`);
                          }
                        })
                      ] }),
                      dragHud && /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "absolute pointer-events-none",
                          style: {
                            bottom: 10,
                            right: 10,
                            zIndex: 40,
                            background: "rgba(0,0,0,0.72)",
                            color: "#fff",
                            fontSize: 11,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 5,
                            letterSpacing: "0.02em",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.1)"
                          },
                          children: [
                            "X ",
                            dragHud.x > 0 ? "+" : "",
                            dragHud.x,
                            "   Y ",
                            dragHud.y > 0 ? "+" : "",
                            dragHud.y
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "absolute inset-0",
                          onPointerDown: (event) => {
                            if (event.target === event.currentTarget) {
                              setSelectedBlock(null);
                            }
                          },
                          children: Object.entries(blockRects).map(([blockKey, measuredRect]) => {
                            var _a2, _b, _c, _d;
                            if (!measuredRect) return null;
                            const block = blockKey;
                            const rect = liveOverlayRef.current[block] ?? measuredRect;
                            const selected = selectedBlock === block;
                            const isPhotoBlock = isPhotoCanvasBlock(block);
                            const isLocked = lockedBlocks.has(block);
                            const isGrouped = groupedBlocks.has(block);
                            const isCustomTextSelection = isCustomTextBlock(block);
                            const visibilityKey = block === "agent" || block === "photo" || isCustomTextSelection || isPhotoBlock ? null : block;
                            const canDelete = visibilityKey !== null || isCustomTextSelection || isPhotoBlock;
                            return /* @__PURE__ */ jsxs(
                              "div",
                              {
                                className: cn(
                                  "absolute group/block",
                                  isPhotoBlock ? "rounded-md" : "rounded-xl",
                                  // Only animate when NOT dragging - during drag we want instant position
                                  !isDraggingBlock && "transition-all",
                                  selected && isLocked ? "border-2 border-amber-400 bg-amber-400/5 shadow-[0_0_0_1px_rgba(255,255,255,0.95)]" : selected ? "border-2 border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(255,255,255,0.95)]" : isLocked ? "border border-amber-400/40 hover:border-amber-400/70" : "border border-transparent hover:border-primary/50 hover:bg-primary/5"
                                ),
                                style: {
                                  left: rect.left,
                                  top: rect.top,
                                  width: rect.width,
                                  height: rect.height
                                },
                                children: [
                                  /* @__PURE__ */ jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: cn(
                                        "absolute inset-0",
                                        isPhotoBlock ? "rounded-md" : "rounded-xl",
                                        isLocked ? "cursor-not-allowed" : "cursor-move"
                                      ),
                                      onPointerDown: (event) => beginBlockInteraction(event, block, "move"),
                                      "aria-label": `Move ${getBlockLabel(block, data.customTextBlocks, data.photoBlocks)}`
                                    }
                                  ),
                                  selected && !isDraggingBlock && /* @__PURE__ */ jsxs(
                                    "div",
                                    {
                                      className: "absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-xl border bg-background/95 shadow-xl backdrop-blur-sm px-1 py-1",
                                      style: { bottom: "100%", marginBottom: 8, zIndex: 50, pointerEvents: "auto", whiteSpace: "nowrap" },
                                      onPointerDown: (e) => e.stopPropagation(),
                                      children: [
                                        /* @__PURE__ */ jsx("span", { className: "px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide select-none", children: getBlockLabel(block, data.customTextBlocks, data.photoBlocks) }),
                                        isPhotoBlock ? /* @__PURE__ */ jsxs(Fragment, { children: [
                                          /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-border mx-0.5" }),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Fill frame",
                                              onClick: () => setPhotoFitMode(block, "cover"),
                                              className: cn(
                                                "flex items-center justify-center h-7 px-2 rounded-lg text-[10px] font-semibold transition-colors",
                                                (((_b = (_a2 = data.blockTransforms) == null ? void 0 : _a2[block]) == null ? void 0 : _b.fitMode) ?? "cover") === "cover" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              children: "Fill"
                                            }
                                          ),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Show full photo",
                                              onClick: () => setPhotoFitMode(block, "contain"),
                                              className: cn(
                                                "flex items-center justify-center h-7 px-2 rounded-lg text-[10px] font-semibold transition-colors",
                                                (((_d = (_c = data.blockTransforms) == null ? void 0 : _c[block]) == null ? void 0 : _d.fitMode) ?? "cover") === "contain" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              children: "Fit"
                                            }
                                          ),
                                          /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-border mx-0.5" }),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: isLocked ? "Unlock block" : "Lock block",
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isLocked ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              onClick: () => toggleLockBlock(block),
                                              children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(LockOpen, { className: "h-3.5 w-3.5" })
                                            }
                                          ),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Reset block position",
                                              onClick: resetSelectedBlock,
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsx(Undo2, { className: "h-3.5 w-3.5" })
                                            }
                                          ),
                                          /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-border mx-0.5" }),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Remove photo from poster",
                                              onClick: () => deleteBlock(block),
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors",
                                              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                                            }
                                          )
                                        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                                          /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-border mx-0.5" }),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: isGrouped ? "Remove from group" : "Add to group",
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isGrouped ? "bg-violet-100 text-violet-600 hover:bg-violet-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              onClick: () => toggleGroupBlock(block),
                                              children: isGrouped ? /* @__PURE__ */ jsx(Link2Off, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Link2, { className: "h-3.5 w-3.5" })
                                            }
                                          ),
                                          /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: isLocked ? "Unlock block" : "Lock block",
                                              onClick: () => toggleLockBlock(block),
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isLocked ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(LockOpen, { className: "h-3.5 w-3.5" })
                                            }
                                          ),
                                          isCustomTextSelection ? /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Duplicate text box",
                                              onClick: () => duplicateBlock(block),
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" })
                                            }
                                          ) : /* @__PURE__ */ jsx(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Reset block position",
                                              onClick: resetSelectedBlock,
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsx(Undo2, { className: "h-3.5 w-3.5" })
                                            }
                                          ),
                                          canDelete && /* @__PURE__ */ jsxs(Fragment, { children: [
                                            /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-border mx-0.5" }),
                                            /* @__PURE__ */ jsx(
                                              "button",
                                              {
                                                type: "button",
                                                title: "Hide block",
                                                onClick: () => deleteBlock(block),
                                                className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors",
                                                children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                                              }
                                            )
                                          ] })
                                        ] })
                                      ]
                                    }
                                  ),
                                  /* @__PURE__ */ jsxs("div", { className: cn(
                                    "pointer-events-none absolute left-2 top-2 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm transition-opacity flex items-center gap-1",
                                    selected || isLocked ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
                                  ), children: [
                                    isLocked && /* @__PURE__ */ jsx(Lock, { className: "h-2.5 w-2.5 text-amber-500" }),
                                    isGrouped && /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5 text-violet-500" }),
                                    getBlockLabel(block, data.customTextBlocks, data.photoBlocks)
                                  ] }),
                                  !isLocked && /* @__PURE__ */ jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: cn(
                                        "absolute bottom-0 right-0 h-5 w-5 translate-x-1/2 translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm transition-opacity cursor-se-resize flex items-center justify-center",
                                        selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
                                      ),
                                      onPointerDown: (event) => beginBlockInteraction(event, block, "resize"),
                                      "aria-label": `Resize ${getBlockLabel(block, data.customTextBlocks, data.photoBlocks)}`,
                                      title: "Drag to resize",
                                      children: /* @__PURE__ */ jsx(Maximize2, { className: "h-2.5 w-2.5 text-primary-foreground" })
                                    }
                                  )
                                ]
                              },
                              block
                            );
                          })
                        }
                      )
                    ]
                  }
                )
              }
            ),
            !isMobileEditor ? /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute bottom-4 right-4", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground/50", children: [
              /* @__PURE__ */ jsx(Keyboard, { className: "h-3 w-3" }),
              "Press ",
              /* @__PURE__ */ jsx("kbd", { className: "rounded bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-foreground/60", children: "?" }),
              " for shortcuts"
            ] }) }) : null
          ]
        }
      )
    ] }),
    showDimensionPicker && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm",
        onClick: () => setShowDimensionPicker(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-2xl border shadow-2xl p-6 w-[480px] max-w-[95vw]",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Canvas Size" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Choose your posting format or set a custom size" })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowDimensionPicker(false), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 mb-5", children: CANVAS_DIMENSIONS.filter((d) => d.id !== "custom").map((dim) => {
                const isActive = data.canvasDimensionId === dim.id;
                const previewMaxSize = 36;
                const previewW = dim.width >= dim.height ? previewMaxSize : Math.round(previewMaxSize * dim.width / dim.height);
                const previewH = dim.height >= dim.width ? previewMaxSize : Math.round(previewMaxSize * dim.height / dim.width);
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => applyCanvasDimension(dim),
                    className: cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:bg-muted/40",
                      isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                    ),
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: cn(
                            "rounded border-2",
                            isActive ? "border-primary bg-primary/20" : "border-muted-foreground/40 bg-muted/30"
                          ),
                          style: { width: previewW, height: previewH }
                        }
                      ) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: dim.label }),
                          /* @__PURE__ */ jsx("span", { className: cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          ), children: dim.aspectLabel })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: dim.sublabel }),
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground/60 mt-0.5", children: dim.platform })
                      ] }),
                      isActive && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary shrink-0" })
                    ]
                  },
                  dim.id
                );
              }) }),
              /* @__PURE__ */ jsxs("div", { className: cn(
                "rounded-xl border-2 p-4 transition-all",
                data.canvasDimensionId === "custom" ? "border-primary bg-primary/5" : "border-border"
              ), children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                  /* @__PURE__ */ jsx(PencilLine, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: "Custom Size" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground ml-auto", children: "px" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block", children: "Width" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        min: "100",
                        max: "4096",
                        value: customW,
                        onChange: (e) => {
                          setCustomW(e.target.value);
                          if (lockAspect) {
                            const w = parseInt(e.target.value, 10);
                            if (!isNaN(w)) setCustomH(String(Math.round(w / customAspectRef.current)));
                          }
                        },
                        className: "h-8 text-xs",
                        placeholder: "1080"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        const newLocked = !lockAspect;
                        if (newLocked) {
                          const w = parseInt(customW, 10) || 1080;
                          const h = parseInt(customH, 10) || 1080;
                          customAspectRef.current = w / h;
                        }
                        setLockAspect(newLocked);
                      },
                      className: cn(
                        "mt-5 h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                        lockAspect ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground hover:border-foreground/50"
                      ),
                      title: lockAspect ? "Aspect ratio locked" : "Lock aspect ratio",
                      children: lockAspect ? /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
                        /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
                      ] }) : /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
                        /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block", children: "Height" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        min: "100",
                        max: "4096",
                        value: customH,
                        onChange: (e) => {
                          setCustomH(e.target.value);
                          if (lockAspect) {
                            const h = parseInt(e.target.value, 10);
                            if (!isNaN(h)) setCustomW(String(Math.round(h * customAspectRef.current)));
                          }
                        },
                        className: "h-8 text-xs",
                        placeholder: "1080"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-3", children: [
                  { label: "LinkedIn Banner", w: 1584, h: 396 },
                  { label: "Twitter Header", w: 1500, h: 500 },
                  { label: "Email Header", w: 600, h: 200 },
                  { label: "Flyer", w: 816, h: 1056 }
                ].map(({ label, w, h }) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setCustomW(String(w));
                      setCustomH(String(h));
                      setLockAspect(false);
                    },
                    className: "text-[9px] px-2 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                    children: [
                      label,
                      " (",
                      w,
                      "×",
                      h,
                      ")"
                    ]
                  },
                  label
                )) }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    className: "w-full mt-3 h-8 text-xs",
                    onClick: applyCustomDimension,
                    children: [
                      "Apply ",
                      customW,
                      "×",
                      customH
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-3 text-center", children: "Changing size resets block positions · Export uses the exact pixel dimensions" })
            ]
          }
        )
      }
    ),
    showShortcuts && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm",
        onClick: () => setShowShortcuts(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background rounded-2xl border shadow-2xl p-6 w-80 max-w-sm",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Keyboard, { className: "h-4 w-4" }),
                  "Keyboard Shortcuts"
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowShortcuts(false), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Editing" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: [
                    { keys: ["⌘", "Z"], desc: "Undo" },
                    { keys: ["⌘", "⇧", "Z"], desc: "Redo" },
                    { keys: ["Del"], desc: "Reset selected block" },
                    { keys: ["Esc"], desc: "Deselect block" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground", children: desc }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k)) })
                  ] }, desc)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Block Movement" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: [
                    { keys: ["↑↓←→"], desc: "Nudge 1px" },
                    { keys: ["⇧", "↑↓←→"], desc: "Nudge 10px" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground", children: desc }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k)) })
                  ] }, desc)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "View" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: [
                    { keys: ["+"], desc: "Zoom in" },
                    { keys: ["-"], desc: "Zoom out" },
                    { keys: ["0"], desc: "Reset zoom to 100%" },
                    { keys: ["?"], desc: "Toggle this panel" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground", children: desc }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsx("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k)) })
                  ] }, desc)) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-4 text-center", children: "Click anywhere outside to close" })
            ]
          }
        )
      }
    )
  ] });
}
export {
  MarketingEditor as default
};
