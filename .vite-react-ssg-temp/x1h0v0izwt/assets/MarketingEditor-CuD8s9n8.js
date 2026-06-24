import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useRef, useState, useCallback, useEffect, Component } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { B as Button, c as cn, L as Label, I as Input } from "../main.mjs";
import { C as Checkbox } from "./checkbox-B7kHRerZ.js";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { S as ScrollArea } from "./scroll-area-aYSY-tkZ.js";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ArrowLeft, LayoutGrid, ChevronDown, Undo2, Redo2, ZoomOut, ZoomIn, Loader2, Check, Keyboard, Download, ImagePlus, X, User, Users, Type, Trash2, Lock, LockOpen, Link2Off, Link2, Copy, Maximize2, PencilLine } from "lucide-react";
import { c as useDeal } from "./useDeals-CMdNuTy4.js";
import { c as TEMPLATES, u as useDealPhotos, a as useUploadDealPhoto, g as getDefaultTemplateData, m as mergeMarketingBlockTransforms, D as DEFAULT_TEMPLATE_VISIBILITY, l as loadMarketingRecents, s as saveMarketingRecents, C as CANVAS_DIMENSIONS, d as createMarketingPhotoBlock } from "./useDealPhotos-DeFyjJO4.js";
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxDEV(Label, { htmlFor, className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: label }, void 0, false, {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 598,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("label", { htmlFor, className: "inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground cursor-pointer", children: [
      /* @__PURE__ */ jsxDEV(
        Checkbox,
        {
          id: htmlFor,
          checked,
          onCheckedChange: (next) => onCheckedChange(next === true)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 602,
          columnNumber: 9
        },
        this
      ),
      "Show"
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 601,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
    lineNumber: 597,
    columnNumber: 5
  }, this);
}
function OptionCard({
  label,
  description,
  active,
  icon: Icon,
  preview,
  onClick
}) {
  return /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "rounded-2xl border p-3 text-left transition-all hover:border-foreground/25 hover:bg-muted/40",
        active ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border bg-background"
      ),
      children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-2.5 flex h-10 items-center justify-center rounded-xl bg-muted/40", children: preview ?? (Icon ? /* @__PURE__ */ jsxDEV(Icon, { className: cn("h-5 w-5", active ? "text-primary" : "text-foreground") }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 638,
          columnNumber: 29
        }, this) : null) }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 637,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold text-foreground leading-tight", children: label }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 640,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-0.5 text-[10px] leading-3.5 text-muted-foreground", children: description }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 641,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 629,
      columnNumber: 5
    },
    this
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
      return /* @__PURE__ */ jsxDEV(
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
            /* @__PURE__ */ jsxDEV("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "12", r: "10" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 686,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("line", { x1: "12", y1: "8", x2: "12", y2: "12" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 686,
                columnNumber: 46
              }, this),
              /* @__PURE__ */ jsxDEV("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 686,
                columnNumber: 85
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 685,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("strong", { children: "Template failed to render" }, void 0, false, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 688,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 11, color: "#b91c1c", maxWidth: 320 }, children: this.state.message }, void 0, false, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 689,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV(
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
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 690,
                columnNumber: 11
              },
              this
            )
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 668,
          columnNumber: 9
        },
        this
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
  return /* @__PURE__ */ jsxDEV("div", { className: "h-screen flex flex-col bg-muted/20", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "shrink-0 border-b bg-background px-3 py-3 sm:px-4", children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex min-w-0 flex-1 items-center gap-2 sm:gap-3", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", onClick: () => navigate(`/transactions/${id}?tab=Marketing`), children: /* @__PURE__ */ jsxDEV(ArrowLeft, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 1965,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 1964,
          columnNumber: 11
        }, this),
        isCompactEditor ? /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "gap-1.5",
            onClick: () => setCompactToolsOpen((open) => !open),
            children: [
              /* @__PURE__ */ jsxDEV(LayoutGrid, { className: "h-3.5 w-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 1974,
                columnNumber: 15
              }, this),
              compactToolsOpen ? "Hide Tools" : "Tools"
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 1968,
            columnNumber: 13
          },
          this
        ) : null,
        /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "truncate font-semibold text-sm", children: template.name }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 1980,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", CATEGORY_COLORS[template.category]), children: template.category }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 1981,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            TYPE_LABELS[template.type],
            " · ",
            canvasW,
            "×",
            canvasH
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 1984,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 1979,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 1978,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
        lineNumber: 1963,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-1 sm:justify-end sm:pb-0", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setShowDimensionPicker(true),
            className: "flex items-center gap-1.5 h-8 px-3 rounded-md border bg-background text-xs font-medium hover:bg-muted transition-colors",
            title: "Change canvas dimensions",
            children: [
              /* @__PURE__ */ jsxDEV("span", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(
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
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2e3,
                  columnNumber: 15
                },
                this
              ) }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 1999,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: ((_a = CANVAS_DIMENSIONS.find((d) => d.id === data.canvasDimensionId)) == null ? void 0 : _a.aspectLabel) ?? `${canvasW}×${canvasH}` }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2011,
                columnNumber: 13
              }, this),
              !isMobileEditor ? /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-foreground", children: [
                canvasW,
                "×",
                canvasH
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2014,
                columnNumber: 32
              }, this) : null,
              /* @__PURE__ */ jsxDEV(ChevronDown, { className: "h-3 w-3 text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2015,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 1993,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-0.5 border rounded-md px-1", children: [
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7",
              onClick: handleUndo,
              disabled: !canUndo,
              title: "Undo (Ctrl+Z)",
              children: /* @__PURE__ */ jsxDEV(Undo2, { className: "h-3.5 w-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2025,
                columnNumber: 15
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2020,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7",
              onClick: handleRedo,
              disabled: !canRedo,
              title: "Redo (Ctrl+Shift+Z)",
              children: /* @__PURE__ */ jsxDEV(Redo2, { className: "h-3.5 w-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2032,
                columnNumber: 15
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2027,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2019,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 border rounded-md px-1", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "Zoom out (-)", onClick: () => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2))), children: /* @__PURE__ */ jsxDEV(ZoomOut, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2039,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2038,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-0.5", children: ZOOM_PRESETS.map((p) => /* @__PURE__ */ jsxDEV(
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
            p,
            true,
            {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2044,
              columnNumber: 17
            },
            this
          )) }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2042,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", title: "Zoom in (+)", onClick: () => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2))), children: /* @__PURE__ */ jsxDEV(ZoomIn, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2060,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2059,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2037,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: cn(
          "flex items-center gap-1 text-[11px] font-medium transition-all duration-300",
          saveStatus === "idle" ? "opacity-0 pointer-events-none" : "opacity-100",
          saveStatus === "saved" ? "text-emerald-600" : "text-muted-foreground"
        ), children: [
          saveStatus === "saving" && /* @__PURE__ */ jsxDEV(Loader2, { className: "h-3 w-3 animate-spin" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2070,
            columnNumber: 41
          }, this),
          saveStatus === "saved" && /* @__PURE__ */ jsxDEV(Check, { className: "h-3 w-3" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2071,
            columnNumber: 40
          }, this),
          saveStatus === "saving" ? "Saving…" : "Saved"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2065,
          columnNumber: 11
        }, this),
        !isMobileEditor ? /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 text-muted-foreground",
            onClick: () => setShowShortcuts(true),
            title: "Keyboard shortcuts (?)",
            children: /* @__PURE__ */ jsxDEV(Keyboard, { className: "h-3.5 w-3.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2082,
              columnNumber: 15
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2077,
            columnNumber: 13
          },
          this
        ) : null,
        /* @__PURE__ */ jsxDEV(Button, { onClick: handleExport, size: "sm", disabled: exporting, className: "gap-2", children: [
          exporting ? /* @__PURE__ */ jsxDEV(Loader2, { className: "h-4 w-4 animate-spin" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2087,
            columnNumber: 26
          }, this) : /* @__PURE__ */ jsxDEV(Download, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2087,
            columnNumber: 73
          }, this),
          exporting ? "Exporting…" : isMobileEditor ? "PNG" : "Download PNG"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2086,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
        lineNumber: 1991,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 1962,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 1961,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: cn("flex flex-1 overflow-hidden", isCompactEditor && "flex-col"), children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: cn(
            "shrink-0 bg-background flex flex-col",
            isCompactEditor ? compactToolsOpen ? "h-[min(26rem,44vh)] w-full border-b" : "hidden" : "border-r"
          ),
          style: isCompactEditor ? void 0 : { width: LEFT_PANEL_WIDTH },
          children: /* @__PURE__ */ jsxDEV(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { className: "p-3 space-y-1", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "pb-3 border-b mb-2", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold text-foreground", children: "Property Photos" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2113,
                  columnNumber: 21
                }, this),
                dealPhotos.length > 0 ? /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] text-muted-foreground", children: [
                  dealPhotos.length,
                  " from deal"
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2115,
                  columnNumber: 23
                }, this) : null
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2112,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("input", { ref: photoInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handlePhotoUpload }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2118,
                columnNumber: 19
              }, this),
              data.photos.length === 0 ? /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => {
                    var _a2;
                    return (_a2 = photoInputRef.current) == null ? void 0 : _a2.click();
                  },
                  disabled: uploadingPhoto,
                  className: "w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed",
                  children: uploadingPhoto ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                    /* @__PURE__ */ jsxDEV(Loader2, { className: "h-5 w-5 animate-spin" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2126,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { children: "Uploading…" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2126,
                      columnNumber: 73
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2126,
                    columnNumber: 27
                  }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
                    /* @__PURE__ */ jsxDEV(ImagePlus, { className: "h-5 w-5" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2127,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { children: "Click to add photo" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2127,
                      columnNumber: 62
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2127,
                    columnNumber: 27
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2120,
                  columnNumber: 21
                },
                this
              ) : /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1.5", children: [
                data.photos.map((src, i) => /* @__PURE__ */ jsxDEV(
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
                      /* @__PURE__ */ jsxDEV("img", { src, alt: "", className: "w-16 h-16 object-cover rounded border" }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2143,
                        columnNumber: 27
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 left-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", children: /* @__PURE__ */ jsxDEV(ImagePlus, { className: "h-3 w-3 text-white drop-shadow" }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2145,
                        columnNumber: 29
                      }, this) }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2144,
                        columnNumber: 27
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          onClick: (event) => {
                            event.stopPropagation();
                            removePhoto(i);
                          },
                          className: "absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                          children: /* @__PURE__ */ jsxDEV(X, { className: "h-2.5 w-2.5" }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2154,
                            columnNumber: 29
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2147,
                          columnNumber: 27
                        },
                        this
                      )
                    ]
                  },
                  src + i,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2133,
                    columnNumber: 25
                  },
                  this
                )),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => {
                      var _a2;
                      return (_a2 = photoInputRef.current) == null ? void 0 : _a2.click();
                    },
                    disabled: uploadingPhoto,
                    className: "w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50",
                    children: uploadingPhoto ? /* @__PURE__ */ jsxDEV(Loader2, { className: "h-4 w-4 animate-spin" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2163,
                      columnNumber: 43
                    }, this) : /* @__PURE__ */ jsxDEV(ImagePlus, { className: "h-4 w-4" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2163,
                      columnNumber: 90
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2158,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2131,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2111,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "pb-4 border-b mb-2", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold text-foreground", children: "Personal Photos" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2172,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] text-muted-foreground", children: "Click or drag onto poster" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2173,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2171,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("input", { ref: personalPhotoInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handlePersonalPhotoUpload }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2175,
                columnNumber: 19
              }, this),
              personalPhotos.length === 0 ? /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => {
                    var _a2;
                    return (_a2 = personalPhotoInputRef.current) == null ? void 0 : _a2.click();
                  },
                  className: "w-full h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs",
                  children: [
                    /* @__PURE__ */ jsxDEV(ImagePlus, { className: "h-4 w-4" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2181,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { children: "Add any photo" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2182,
                      columnNumber: 23
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2177,
                  columnNumber: 21
                },
                this
              ) : /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1.5", children: [
                personalPhotos.map((src, i) => /* @__PURE__ */ jsxDEV(
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
                      /* @__PURE__ */ jsxDEV("img", { src, alt: "", className: "w-16 h-16 object-cover rounded border" }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2197,
                        columnNumber: 27
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          onClick: (event) => {
                            event.stopPropagation();
                            removePersonalPhoto(i);
                          },
                          className: "absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                          children: /* @__PURE__ */ jsxDEV(X, { className: "h-2.5 w-2.5" }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2205,
                            columnNumber: 29
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2198,
                          columnNumber: 27
                        },
                        this
                      )
                    ]
                  },
                  src + i,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2187,
                    columnNumber: 25
                  },
                  this
                )),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => {
                      var _a2;
                      return (_a2 = personalPhotoInputRef.current) == null ? void 0 : _a2.click();
                    },
                    className: "w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors",
                    children: /* @__PURE__ */ jsxDEV(ImagePlus, { className: "h-4 w-4" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2213,
                      columnNumber: 25
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2209,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2185,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2170,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Collapsible, { open: studioBasicsOpen, onOpenChange: setStudioBasicsOpen, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Style & Layout",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${studioBasicsOpen ? "rotate-180" : ""}` }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2223,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2221,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-3 pb-4", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Headline Style" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2227,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-1.5", children: ["h1", "h2", "h3"].map((hs) => {
                    const meta = HEADLINE_STYLE_LABELS[hs];
                    return /* @__PURE__ */ jsxDEV(
                      OptionCard,
                      {
                        label: meta.name,
                        description: meta.desc,
                        preview: hs === "h1" ? /* @__PURE__ */ jsxDEV("span", { className: cn("font-serif text-2xl italic leading-none", data.headlineStyle === "h1" ? "text-primary" : "text-foreground"), children: "Aa" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2237,
                          columnNumber: 47
                        }, this) : hs === "h2" ? /* @__PURE__ */ jsxDEV("span", { className: cn("text-sm font-bold uppercase tracking-[0.25em] leading-none", data.headlineStyle === "h2" ? "text-primary" : "text-foreground"), children: "AA" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2238,
                          columnNumber: 49
                        }, this) : /* @__PURE__ */ jsxDEV("span", { className: cn("font-serif text-2xl font-medium leading-none", data.headlineStyle === "h3" ? "text-primary" : "text-foreground"), children: "Aa" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2239,
                          columnNumber: 35
                        }, this),
                        active: data.headlineStyle === hs,
                        onClick: () => setHeadlineStyle(hs)
                      },
                      hs,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2232,
                        columnNumber: 29
                      },
                      this
                    );
                  }) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2228,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2226,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Photo Canvas" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2250,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] leading-4 text-muted-foreground", children: "Start with one photo. Drag any photo onto the poster or click a thumbnail to add another one. Move and resize each photo independently." }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2251,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2249,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2225,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2220,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Collapsible, { open: studioAgentsOpen, onOpenChange: setStudioAgentsOpen, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Agents",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${studioAgentsOpen ? "rotate-180" : ""}` }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2262,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2260,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-2 pb-4", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxDEV(
                  OptionCard,
                  {
                    label: "Single",
                    description: "One agent footer",
                    icon: User,
                    active: data.agentLayout === "single",
                    onClick: () => setAgentLayout("single")
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2266,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  OptionCard,
                  {
                    label: "Multi-Agent",
                    description: "All deal agents",
                    icon: Users,
                    active: data.agentLayout === "multi",
                    onClick: () => setAgentLayout("multi")
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2273,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2265,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2264,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2259,
              columnNumber: 17
            }, this),
            selectedBlock ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-2xl border bg-muted/25 px-3 py-3 text-[11px] leading-4 text-muted-foreground", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-2 rounded-xl border bg-background px-2.5 py-2", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Selected" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2288,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold text-foreground", children: getBlockLabel(selectedBlock, data.customTextBlocks, data.photoBlocks) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2289,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2287,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[11px]", onClick: resetSelectedBlock, children: "Reset" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2291,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2286,
                columnNumber: 21
              }, this),
              selectedPhotoFitMode ? /* @__PURE__ */ jsxDEV("div", { className: "mt-2 rounded-xl border bg-background px-2.5 py-2", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Photo Fit" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2297,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "mt-2 grid grid-cols-2 gap-1.5", children: [
                  /* @__PURE__ */ jsxDEV(
                    Button,
                    {
                      type: "button",
                      variant: selectedPhotoFitMode === "cover" ? "default" : "outline",
                      size: "sm",
                      className: "h-7 text-[11px]",
                      onClick: () => setPhotoFitMode(selectedBlock, "cover"),
                      children: "Fill"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2299,
                      columnNumber: 27
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(
                    Button,
                    {
                      type: "button",
                      variant: selectedPhotoFitMode === "contain" ? "default" : "outline",
                      size: "sm",
                      className: "h-7 text-[11px]",
                      onClick: () => setPhotoFitMode(selectedBlock, "contain"),
                      children: "Fit"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2308,
                      columnNumber: 27
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2298,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2296,
                columnNumber: 23
              }, this) : null
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2285,
              columnNumber: 19
            }, this) : null,
            /* @__PURE__ */ jsxDEV(Collapsible, { defaultOpen: true, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Custom Text",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: "h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2326,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2324,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxDEV(Button, { type: "button", variant: "outline", size: "sm", className: "h-8 w-full justify-start gap-2 text-xs", onClick: addCustomTextBlock, children: [
                  /* @__PURE__ */ jsxDEV(Type, { className: "h-3.5 w-3.5" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2330,
                    columnNumber: 23
                  }, this),
                  "Add Text Box"
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2329,
                  columnNumber: 21
                }, this),
                data.customTextBlocks.length > 0 ? /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1.5", children: data.customTextBlocks.map((entry, index) => {
                    const blockKey = `custom-text-${entry.id}`;
                    const selected = selectedBlock === blockKey;
                    return /* @__PURE__ */ jsxDEV(
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
                      entry.id,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2341,
                        columnNumber: 31
                      },
                      this
                    );
                  }) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2336,
                    columnNumber: 25
                  }, this),
                  selectedCustomTextBlock ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-background p-3 space-y-2.5", children: [
                    /* @__PURE__ */ jsxDEV("div", { children: [
                      /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Text content" }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2361,
                        columnNumber: 31
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        Textarea,
                        {
                          value: selectedCustomTextBlock.text,
                          onChange: (event) => updateCustomTextBlock(selectedCustomTextBlock.id, event.target.value),
                          className: "mt-1 text-xs",
                          rows: 3
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2362,
                          columnNumber: 31
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2360,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-8 w-full justify-start gap-2 text-xs text-red-600 hover:text-red-700",
                        onClick: () => deleteBlock(`custom-text-${selectedCustomTextBlock.id}`),
                        children: [
                          /* @__PURE__ */ jsxDEV(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2376,
                            columnNumber: 31
                          }, this),
                          "Remove Text Box"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2369,
                        columnNumber: 29
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2359,
                    columnNumber: 27
                  }, this) : /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground", children: "Select a text box on the canvas to edit its text here." }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2381,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2335,
                  columnNumber: 23
                }, this) : /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground", children: "Add a custom text box if you want text that is not tied to the template fields." }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2387,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2328,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2323,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Collapsible, { open: basicsOpen, onOpenChange: setBasicsOpen, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Property Details",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${basicsOpen ? "rotate-180" : ""}` }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2398,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2396,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-headline",
                      label: "Headline",
                      checked: visibility.headline,
                      onCheckedChange: (checked) => updateVisibility("headline", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2402,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.headline, onChange: (e) => updateField("headline", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2408,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2401,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-address",
                      label: "Address",
                      checked: visibility.address,
                      onCheckedChange: (checked) => updateVisibility("address", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2411,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.address, onChange: (e) => updateField("address", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2417,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2410,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-1.5", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "City" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2421,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: data.city, onChange: (e) => updateField("city", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2422,
                      columnNumber: 25
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2420,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "State" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2425,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: data.state, onChange: (e) => updateField("state", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2426,
                      columnNumber: 25
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2424,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Zip" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2429,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: data.zip, onChange: (e) => updateField("zip", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2430,
                      columnNumber: 25
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2428,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2419,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-price",
                      label: "Price",
                      checked: visibility.price,
                      onCheckedChange: (checked) => updateVisibility("price", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2434,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.price, onChange: (e) => updateField("price", e.target.value), placeholder: "$595,000", className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2440,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2433,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-1.5", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "col-span-3", children: /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-stats",
                      label: "Beds / Baths / Sq Ft",
                      checked: visibility.stats,
                      onCheckedChange: (checked) => updateVisibility("stats", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2444,
                      columnNumber: 25
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2443,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Beds" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2452,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      Input,
                      {
                        type: "number",
                        min: "0",
                        max: "99",
                        step: "1",
                        value: data.beds,
                        onChange: (e) => updateField("beds", e.target.value),
                        className: "mt-1 h-7 text-xs"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2453,
                        columnNumber: 25
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2451,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Baths" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2461,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      Input,
                      {
                        type: "number",
                        min: "0",
                        max: "99",
                        step: "0.5",
                        value: data.baths,
                        onChange: (e) => updateField("baths", e.target.value),
                        className: "mt-1 h-7 text-xs"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2462,
                        columnNumber: 25
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2460,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Sq Ft" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2470,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      Input,
                      {
                        value: data.sqft,
                        onChange: (e) => updateField("sqft", e.target.value),
                        placeholder: "2,500",
                        className: "mt-1 h-7 text-xs"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2471,
                        columnNumber: 25
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2469,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2442,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-description",
                      label: "Description",
                      checked: visibility.description,
                      onCheckedChange: (checked) => updateVisibility("description", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2480,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Textarea, { value: data.description, onChange: (e) => updateField("description", e.target.value), className: "mt-1 text-xs", rows: 3 }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2486,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2479,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2400,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2395,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Collapsible, { open: agentOpen, onOpenChange: setAgentOpen, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Agent Info",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${agentOpen ? "rotate-180" : ""}` }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2495,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2493,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-name",
                      label: "Name",
                      checked: visibility.agentName,
                      onCheckedChange: (checked) => updateVisibility("agentName", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2499,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.agentName, onChange: (e) => updateField("agentName", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2505,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2498,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-title",
                      label: "Title",
                      checked: visibility.agentTitle,
                      onCheckedChange: (checked) => updateVisibility("agentTitle", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2508,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.agentTitle, onChange: (e) => updateField("agentTitle", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2514,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2507,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-phone",
                      label: "Phone",
                      checked: visibility.agentPhone,
                      onCheckedChange: (checked) => updateVisibility("agentPhone", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2517,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.agentPhone, onChange: (e) => updateField("agentPhone", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2523,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2516,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(
                    VisibilityLabel,
                    {
                      htmlFor: "marketing-show-agent-email",
                      label: "Email",
                      checked: visibility.agentEmail,
                      onCheckedChange: (checked) => updateVisibility("agentEmail", checked)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 2526,
                      columnNumber: 23
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.agentEmail, onChange: (e) => updateField("agentEmail", e.target.value), className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2532,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2525,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2497,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2492,
              columnNumber: 17
            }, this),
            template.category === "Open House" && /* @__PURE__ */ jsxDEV(Collapsible, { open: ohOpen, onOpenChange: setOhOpen, children: [
              /* @__PURE__ */ jsxDEV(CollapsibleTrigger, { className: "flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t", children: [
                "Open House Details",
                /* @__PURE__ */ jsxDEV(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${ohOpen ? "rotate-180" : ""}` }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2542,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2540,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(CollapsibleContent, { className: "space-y-2.5 pb-4", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Date" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2546,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.openHouseDate, onChange: (e) => updateField("openHouseDate", e.target.value), placeholder: "Saturday, March 22", className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2547,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2545,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Time" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2550,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: data.openHouseTime, onChange: (e) => updateField("openHouseTime", e.target.value), placeholder: "1:00 PM – 4:00 PM", className: "mt-1 h-7 text-xs" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2551,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 2549,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2544,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2539,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2109,
            columnNumber: 13
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 2108,
            columnNumber: 11
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2096,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          ref: canvasViewportRef,
          className: "relative flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] p-3 [background-size:20px_20px] sm:p-4 lg:p-8",
          onDragOver: handleCanvasPhotoDragOver,
          onDrop: handleCanvasPhotoDrop,
          children: [
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                style: {
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease",
                  marginTop: 0
                },
                children: /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    ref: previewShellRef,
                    className: "relative shadow-2xl",
                    style: { width: canvasW, height: canvasH },
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        "div",
                        {
                          ref: canvasRef,
                          style: { width: canvasW, height: canvasH },
                          children: /* @__PURE__ */ jsxDEV(TemplateErrorBoundary, { children: template.render(data, false) }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2585,
                            columnNumber: 17
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2581,
                          columnNumber: 15
                        },
                        this
                      ),
                      (alignGuides.length > 0 || spacingGuides.length > 0) && /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 30 }, children: [
                        alignGuides.map((guide, i) => guide.type === "v" ? /* @__PURE__ */ jsxDEV(
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
                            children: guide.label && /* @__PURE__ */ jsxDEV(
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
                              },
                              void 0,
                              false,
                              {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2608,
                                columnNumber: 27
                              },
                              this
                            )
                          },
                          `v-${i}`,
                          false,
                          {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2596,
                            columnNumber: 23
                          },
                          this
                        ) : /* @__PURE__ */ jsxDEV(
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
                            children: guide.label && /* @__PURE__ */ jsxDEV(
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
                              },
                              void 0,
                              false,
                              {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2635,
                                columnNumber: 27
                              },
                              this
                            )
                          },
                          `h-${i}`,
                          false,
                          {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 2623,
                            columnNumber: 23
                          },
                          this
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
                            return /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: sg.from, top: midY - 0.5, width: gapW, height: 1, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2668,
                                columnNumber: 27
                              }, this),
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: sg.from, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2670,
                                columnNumber: 27
                              }, this),
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: sg.to - 1, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2671,
                                columnNumber: 27
                              }, this),
                              sg.showLabel && /* @__PURE__ */ jsxDEV("span", { style: {
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
                              }, children: labelText }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2674,
                                columnNumber: 29
                              }, this)
                            ] }, `sg-x-${i}`, true, {
                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                              lineNumber: 2666,
                              columnNumber: 25
                            }, this);
                          } else {
                            const midX = sg.center;
                            const midY = (sg.from + sg.to) / 2;
                            const gapH = sg.to - sg.from;
                            return /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: sg.from, left: midX - 0.5, width: 1, height: gapH, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2701,
                                columnNumber: 27
                              }, this),
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: sg.from, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2703,
                                columnNumber: 27
                              }, this),
                              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: sg.to - 1, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 } }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2704,
                                columnNumber: 27
                              }, this),
                              sg.showLabel && /* @__PURE__ */ jsxDEV("span", { style: {
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
                              }, children: labelText }, void 0, false, {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2707,
                                columnNumber: 29
                              }, this)
                            ] }, `sg-y-${i}`, true, {
                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                              lineNumber: 2699,
                              columnNumber: 25
                            }, this);
                          }
                        })
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 2592,
                        columnNumber: 17
                      }, this),
                      dragHud && /* @__PURE__ */ jsxDEV(
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
                        },
                        void 0,
                        true,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2734,
                          columnNumber: 17
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
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
                            return /* @__PURE__ */ jsxDEV(
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
                                  /* @__PURE__ */ jsxDEV(
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
                                    },
                                    void 0,
                                    false,
                                    {
                                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                      lineNumber: 2805,
                                      columnNumber: 23
                                    },
                                    this
                                  ),
                                  selected && !isDraggingBlock && /* @__PURE__ */ jsxDEV(
                                    "div",
                                    {
                                      className: "absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-xl border bg-background/95 shadow-xl backdrop-blur-sm px-1 py-1",
                                      style: { bottom: "100%", marginBottom: 8, zIndex: 50, pointerEvents: "auto", whiteSpace: "nowrap" },
                                      onPointerDown: (e) => e.stopPropagation(),
                                      children: [
                                        /* @__PURE__ */ jsxDEV("span", { className: "px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide select-none", children: getBlockLabel(block, data.customTextBlocks, data.photoBlocks) }, void 0, false, {
                                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                          lineNumber: 2824,
                                          columnNumber: 27
                                        }, this),
                                        isPhotoBlock ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                                          /* @__PURE__ */ jsxDEV("div", { className: "w-px h-4 bg-border mx-0.5" }, void 0, false, {
                                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                            lineNumber: 2830,
                                            columnNumber: 31
                                          }, this),
                                          /* @__PURE__ */ jsxDEV(
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
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2831,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          /* @__PURE__ */ jsxDEV(
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
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2844,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          /* @__PURE__ */ jsxDEV("div", { className: "w-px h-4 bg-border mx-0.5" }, void 0, false, {
                                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                            lineNumber: 2857,
                                            columnNumber: 31
                                          }, this),
                                          /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: isLocked ? "Unlock block" : "Lock block",
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isLocked ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              onClick: () => toggleLockBlock(block),
                                              children: isLocked ? /* @__PURE__ */ jsxDEV(Lock, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2870,
                                                columnNumber: 45
                                              }, this) : /* @__PURE__ */ jsxDEV(LockOpen, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2870,
                                                columnNumber: 80
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2859,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Reset block position",
                                              onClick: resetSelectedBlock,
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsxDEV(Undo2, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2878,
                                                columnNumber: 33
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2872,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          /* @__PURE__ */ jsxDEV("div", { className: "w-px h-4 bg-border mx-0.5" }, void 0, false, {
                                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                            lineNumber: 2880,
                                            columnNumber: 31
                                          }, this),
                                          /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Remove photo from poster",
                                              onClick: () => deleteBlock(block),
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors",
                                              children: /* @__PURE__ */ jsxDEV(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2887,
                                                columnNumber: 33
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2881,
                                              columnNumber: 31
                                            },
                                            this
                                          )
                                        ] }, void 0, true, {
                                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                          lineNumber: 2829,
                                          columnNumber: 29
                                        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
                                          /* @__PURE__ */ jsxDEV("div", { className: "w-px h-4 bg-border mx-0.5" }, void 0, false, {
                                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                            lineNumber: 2892,
                                            columnNumber: 31
                                          }, this),
                                          /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: isGrouped ? "Remove from group" : "Add to group",
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isGrouped ? "bg-violet-100 text-violet-600 hover:bg-violet-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              onClick: () => toggleGroupBlock(block),
                                              children: isGrouped ? /* @__PURE__ */ jsxDEV(Link2Off, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2905,
                                                columnNumber: 46
                                              }, this) : /* @__PURE__ */ jsxDEV(Link2, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2905,
                                                columnNumber: 85
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2894,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: isLocked ? "Unlock block" : "Lock block",
                                              onClick: () => toggleLockBlock(block),
                                              className: cn(
                                                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                                                isLocked ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                              ),
                                              children: isLocked ? /* @__PURE__ */ jsxDEV(Lock, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2919,
                                                columnNumber: 45
                                              }, this) : /* @__PURE__ */ jsxDEV(LockOpen, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2919,
                                                columnNumber: 80
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2908,
                                              columnNumber: 31
                                            },
                                            this
                                          ),
                                          isCustomTextSelection ? /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Duplicate text box",
                                              onClick: () => duplicateBlock(block),
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsxDEV(Copy, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2929,
                                                columnNumber: 35
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2923,
                                              columnNumber: 33
                                            },
                                            this
                                          ) : /* @__PURE__ */ jsxDEV(
                                            "button",
                                            {
                                              type: "button",
                                              title: "Reset block position",
                                              onClick: resetSelectedBlock,
                                              className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                                              children: /* @__PURE__ */ jsxDEV(Undo2, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2938,
                                                columnNumber: 35
                                              }, this)
                                            },
                                            void 0,
                                            false,
                                            {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2932,
                                              columnNumber: 33
                                            },
                                            this
                                          ),
                                          canDelete && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                                            /* @__PURE__ */ jsxDEV("div", { className: "w-px h-4 bg-border mx-0.5" }, void 0, false, {
                                              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                              lineNumber: 2944,
                                              columnNumber: 35
                                            }, this),
                                            /* @__PURE__ */ jsxDEV(
                                              "button",
                                              {
                                                type: "button",
                                                title: "Hide block",
                                                onClick: () => deleteBlock(block),
                                                className: "flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors",
                                                children: /* @__PURE__ */ jsxDEV(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
                                                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                  lineNumber: 2951,
                                                  columnNumber: 37
                                                }, this)
                                              },
                                              void 0,
                                              false,
                                              {
                                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                                lineNumber: 2945,
                                                columnNumber: 35
                                              },
                                              this
                                            )
                                          ] }, void 0, true, {
                                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                            lineNumber: 2943,
                                            columnNumber: 33
                                          }, this)
                                        ] }, void 0, true, {
                                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                          lineNumber: 2891,
                                          columnNumber: 29
                                        }, this)
                                      ]
                                    },
                                    void 0,
                                    true,
                                    {
                                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                      lineNumber: 2818,
                                      columnNumber: 25
                                    },
                                    this
                                  ),
                                  /* @__PURE__ */ jsxDEV("div", { className: cn(
                                    "pointer-events-none absolute left-2 top-2 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm transition-opacity flex items-center gap-1",
                                    selected || isLocked ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
                                  ), children: [
                                    isLocked && /* @__PURE__ */ jsxDEV(Lock, { className: "h-2.5 w-2.5 text-amber-500" }, void 0, false, {
                                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                      lineNumber: 2965,
                                      columnNumber: 38
                                    }, this),
                                    isGrouped && /* @__PURE__ */ jsxDEV(Link2, { className: "h-2.5 w-2.5 text-violet-500" }, void 0, false, {
                                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                      lineNumber: 2966,
                                      columnNumber: 39
                                    }, this),
                                    getBlockLabel(block, data.customTextBlocks, data.photoBlocks)
                                  ] }, void 0, true, {
                                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                    lineNumber: 2961,
                                    columnNumber: 23
                                  }, this),
                                  !isLocked && /* @__PURE__ */ jsxDEV(
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
                                      children: /* @__PURE__ */ jsxDEV(Maximize2, { className: "h-2.5 w-2.5 text-primary-foreground" }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                        lineNumber: 2982,
                                        columnNumber: 27
                                      }, this)
                                    },
                                    void 0,
                                    false,
                                    {
                                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                      lineNumber: 2972,
                                      columnNumber: 25
                                    },
                                    this
                                  )
                                ]
                              },
                              block,
                              true,
                              {
                                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                                lineNumber: 2783,
                                columnNumber: 21
                              },
                              this
                            );
                          })
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 2756,
                          columnNumber: 15
                        },
                        this
                      )
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 2576,
                    columnNumber: 13
                  },
                  this
                )
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2568,
                columnNumber: 11
              },
              this
            ),
            !isMobileEditor ? /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none absolute bottom-4 right-4", children: /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground/50", children: [
              /* @__PURE__ */ jsxDEV(Keyboard, { className: "h-3 w-3" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2994,
                columnNumber: 17
              }, this),
              "Press ",
              /* @__PURE__ */ jsxDEV("kbd", { className: "rounded bg-muted/80 px-1 py-0.5 font-mono text-[9px] text-foreground/60", children: "?" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 2995,
                columnNumber: 23
              }, this),
              " for shortcuts"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2993,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/MarketingEditor.tsx",
              lineNumber: 2992,
              columnNumber: 13
            }, this) : null
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
          lineNumber: 2562,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
      lineNumber: 2094,
      columnNumber: 7
    }, this),
    showDimensionPicker && /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm",
        onClick: () => setShowDimensionPicker(false),
        children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "bg-background rounded-2xl border shadow-2xl p-6 w-[480px] max-w-[95vw]",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-5", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("h3", { className: "font-semibold text-sm", children: "Canvas Size" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3014,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Choose your posting format or set a custom size" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3015,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3013,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: () => setShowDimensionPicker(false), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3018,
                  columnNumber: 17
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3017,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3012,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2 mb-5", children: CANVAS_DIMENSIONS.filter((d) => d.id !== "custom").map((dim) => {
                const isActive = data.canvasDimensionId === dim.id;
                const previewMaxSize = 36;
                const previewW = dim.width >= dim.height ? previewMaxSize : Math.round(previewMaxSize * dim.width / dim.height);
                const previewH = dim.height >= dim.width ? previewMaxSize : Math.round(previewMaxSize * dim.height / dim.width);
                return /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => applyCanvasDimension(dim),
                    className: cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:bg-muted/40",
                      isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                    ),
                    children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(
                        "div",
                        {
                          className: cn(
                            "rounded border-2",
                            isActive ? "border-primary bg-primary/20" : "border-muted-foreground/40 bg-muted/30"
                          ),
                          style: { width: previewW, height: previewH }
                        },
                        void 0,
                        false,
                        {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3047,
                          columnNumber: 23
                        },
                        this
                      ) }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3046,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold text-foreground", children: dim.label }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 3057,
                            columnNumber: 25
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { className: cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          ), children: dim.aspectLabel }, void 0, false, {
                            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                            lineNumber: 3058,
                            columnNumber: 25
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3056,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: dim.sublabel }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3065,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground/60 mt-0.5", children: dim.platform }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3066,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3055,
                        columnNumber: 21
                      }, this),
                      isActive && /* @__PURE__ */ jsxDEV(Check, { className: "h-4 w-4 text-primary shrink-0" }, void 0, false, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3068,
                        columnNumber: 34
                      }, this)
                    ]
                  },
                  dim.id,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3035,
                    columnNumber: 19
                  },
                  this
                );
              }) }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3023,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: cn(
                "rounded-xl border-2 p-4 transition-all",
                data.canvasDimensionId === "custom" ? "border-primary bg-primary/5" : "border-border"
              ), children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mb-3", children: [
                  /* @__PURE__ */ jsxDEV(PencilLine, { className: "h-3.5 w-3.5 text-muted-foreground" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3080,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold text-foreground", children: "Custom Size" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3081,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-muted-foreground ml-auto", children: "px" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3082,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3079,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block", children: "Width" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3086,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV(
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
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3087,
                        columnNumber: 19
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3085,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(
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
                      children: lockAspect ? /* @__PURE__ */ jsxDEV("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxDEV("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3126,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3127,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3125,
                        columnNumber: 21
                      }, this) : /* @__PURE__ */ jsxDEV("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxDEV("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3131,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" }, void 0, false, {
                          fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                          lineNumber: 3132,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3130,
                        columnNumber: 21
                      }, this)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3105,
                      columnNumber: 17
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block", children: "Height" }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3138,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV(
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
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                        lineNumber: 3139,
                        columnNumber: 19
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3137,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3084,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1 mt-3", children: [
                  { label: "LinkedIn Banner", w: 1584, h: 396 },
                  { label: "Twitter Header", w: 1500, h: 500 },
                  { label: "Email Header", w: 600, h: 200 },
                  { label: "Flyer", w: 816, h: 1056 }
                ].map(({ label, w, h }) => /* @__PURE__ */ jsxDEV(
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
                  label,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3165,
                    columnNumber: 19
                  },
                  this
                )) }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3158,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV(
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
                  },
                  void 0,
                  true,
                  {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3176,
                    columnNumber: 15
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3075,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mt-3 text-center", children: "Changing size resets block positions · Export uses the exact pixel dimensions" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3184,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 3008,
            columnNumber: 11
          },
          this
        )
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
        lineNumber: 3004,
        columnNumber: 9
      },
      this
    ),
    showShortcuts && /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm",
        onClick: () => setShowShortcuts(false),
        children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "bg-background rounded-2xl border shadow-2xl p-6 w-80 max-w-sm",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxDEV("h3", { className: "font-semibold text-sm flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxDEV(Keyboard, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3203,
                    columnNumber: 17
                  }, this),
                  "Keyboard Shortcuts"
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3202,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: () => setShowShortcuts(false), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3207,
                  columnNumber: 17
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3206,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3201,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Editing" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3212,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                    { keys: ["⌘", "Z"], desc: "Undo" },
                    { keys: ["⌘", "⇧", "Z"], desc: "Redo" },
                    { keys: ["Del"], desc: "Reset selected block" },
                    { keys: ["Esc"], desc: "Deselect block" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-foreground", children: desc }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3221,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsxDEV("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3224,
                      columnNumber: 27
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3222,
                      columnNumber: 23
                    }, this)
                  ] }, desc, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3220,
                    columnNumber: 21
                  }, this)) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3213,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3211,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Block Movement" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3232,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                    { keys: ["↑↓←→"], desc: "Nudge 1px" },
                    { keys: ["⇧", "↑↓←→"], desc: "Nudge 10px" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-foreground", children: desc }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3239,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsxDEV("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3242,
                      columnNumber: 27
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3240,
                      columnNumber: 23
                    }, this)
                  ] }, desc, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3238,
                    columnNumber: 21
                  }, this)) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3233,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3231,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "View" }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3250,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                    { keys: ["+"], desc: "Zoom in" },
                    { keys: ["-"], desc: "Zoom out" },
                    { keys: ["0"], desc: "Reset zoom to 100%" },
                    { keys: ["?"], desc: "Toggle this panel" }
                  ].map(({ keys, desc }) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-foreground", children: desc }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3259,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-0.5", children: keys.map((k) => /* @__PURE__ */ jsxDEV("kbd", { className: "px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80", children: k }, k, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3262,
                      columnNumber: 27
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                      lineNumber: 3260,
                      columnNumber: 23
                    }, this)
                  ] }, desc, true, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3258,
                    columnNumber: 21
                  }, this)) }, void 0, false, {
                    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                    lineNumber: 3251,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                  lineNumber: 3249,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3210,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mt-4 text-center", children: "Click anywhere outside to close" }, void 0, false, {
                fileName: "/dev-server/src/pages/MarketingEditor.tsx",
                lineNumber: 3270,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/MarketingEditor.tsx",
            lineNumber: 3197,
            columnNumber: 11
          },
          this
        )
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/MarketingEditor.tsx",
        lineNumber: 3193,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/MarketingEditor.tsx",
    lineNumber: 1959,
    columnNumber: 5
  }, this);
}
export {
  MarketingEditor as default
};
