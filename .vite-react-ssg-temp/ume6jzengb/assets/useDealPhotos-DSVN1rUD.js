import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { s as supabase } from "../main.mjs";
const CANVAS_DIMENSIONS = [
  {
    id: "square",
    label: "Square Post",
    sublabel: "1080 × 1080",
    platform: "Instagram · Facebook",
    platformIcon: "⬜",
    width: 1080,
    height: 1080,
    aspectLabel: "1:1"
  },
  {
    id: "portrait",
    label: "Portrait Feed",
    sublabel: "1080 × 1350",
    platform: "Instagram · Facebook",
    platformIcon: "📸",
    width: 1080,
    height: 1350,
    aspectLabel: "4:5"
  },
  {
    id: "story",
    label: "Story / Reel",
    sublabel: "1080 × 1920",
    platform: "Instagram · TikTok",
    platformIcon: "📱",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16"
  },
  {
    id: "landscape",
    label: "Landscape",
    sublabel: "1920 × 1080",
    platform: "Facebook · LinkedIn",
    platformIcon: "🖥",
    width: 1920,
    height: 1080,
    aspectLabel: "16:9"
  },
  {
    id: "custom",
    label: "Custom",
    sublabel: "Any size",
    platform: "Custom",
    platformIcon: "✏️",
    width: 1080,
    height: 1080,
    aspectLabel: "Custom"
  }
];
function createMarketingPhotoBlock(src, canvasWidth, canvasHeight, index = 0, preferredLeft, preferredTop) {
  const w = canvasWidth || 1080;
  const h = canvasHeight || 1080;
  const scale = Math.min(w, h) / 1080;
  const isFirst = index === 0;
  const width = Math.round(isFirst ? Math.min(w * 0.8, 860 * scale) : Math.min(w * 0.34, 360 * scale));
  const height = Math.round(isFirst ? Math.min(h * 0.38, 430 * scale) : width * 0.72);
  const staggerIndex = Math.max(0, index - 1);
  const column = staggerIndex % 3;
  const row = Math.floor(staggerIndex / 3);
  const defaultLeft = isFirst ? Math.round((w - width) / 2) : Math.round(w * 0.06) + column * Math.round(width + 18 * scale);
  const defaultTop = isFirst ? Math.round(h * 0.17) : Math.round(h * 0.14) + row * Math.round(height + 18 * scale);
  const maxLeft = Math.max(16, w - width - 16);
  const maxTop = Math.max(16, h - height - 16);
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    src,
    left: Math.min(maxLeft, Math.max(16, Math.round(preferredLeft ?? defaultLeft))),
    top: Math.min(maxTop, Math.max(16, Math.round(preferredTop ?? defaultTop))),
    width,
    height
  };
}
const DEFAULT_TEMPLATE_VISIBILITY = {
  headline: true,
  address: true,
  price: false,
  stats: true,
  description: false,
  agentName: false,
  agentTitle: false,
  agentPhone: false,
  agentEmail: false
};
const DEFAULT_BLOCK_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1
};
function mergeTemplateVisibility(visibility) {
  return {
    ...DEFAULT_TEMPLATE_VISIBILITY,
    ...visibility ?? {}
  };
}
function mergeMarketingBlockTransforms(blockTransforms) {
  return blockTransforms ?? {};
}
function getBlockTransform(data, block) {
  var _a;
  return {
    ...DEFAULT_BLOCK_TRANSFORM,
    ...((_a = data.blockTransforms) == null ? void 0 : _a[block]) ?? {}
  };
}
function AdjustableBlock({
  data,
  block,
  style,
  children
}) {
  const transform = getBlockTransform(data, block);
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-marketing-block": block,
      style: {
        ...style,
        position: "relative",
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: "top left",
        willChange: "transform"
      },
      children
    }
  );
}
function renderCustomTextBlocks(data, editable, fontScale = 1) {
  const customTextBlocks = data.customTextBlocks ?? [];
  return customTextBlocks.map((block, index) => {
    var _a, _b, _c, _d, _e, _f;
    const blockKey = `custom-text-${block.id}`;
    const defaultX = Math.round((data.canvasWidth || 1080) * 0.08);
    const defaultY = Math.round((data.canvasHeight || 1080) * 0.08) + index * Math.round(72 * fontScale);
    return /* @__PURE__ */ jsx(
      AdjustableBlock,
      {
        data: {
          blockTransforms: {
            ...data.blockTransforms,
            [blockKey]: {
              x: ((_b = (_a = data.blockTransforms) == null ? void 0 : _a[blockKey]) == null ? void 0 : _b.x) ?? defaultX,
              y: ((_d = (_c = data.blockTransforms) == null ? void 0 : _c[blockKey]) == null ? void 0 : _d.y) ?? defaultY,
              scale: ((_f = (_e = data.blockTransforms) == null ? void 0 : _e[blockKey]) == null ? void 0 : _f.scale) ?? 1
            }
          }
        },
        block: blockKey,
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          maxWidth: Math.round((data.canvasWidth || 1080) * 0.72),
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: Math.round(40 * fontScale),
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -0.8,
              color: "#0e1428",
              whiteSpace: "pre-wrap",
              textShadow: "0 1px 2px rgba(255,255,255,0.3)"
            },
            children: /* @__PURE__ */ jsx(E, { editable, children: block.text })
          }
        )
      },
      block.id
    );
  });
}
const E = ({
  children,
  editable,
  style
}) => /* @__PURE__ */ jsx(
  "span",
  {
    contentEditable: editable,
    suppressContentEditableWarning: true,
    style: { outline: "none", cursor: editable ? "text" : "default", ...style },
    children
  }
);
const Logo = ({ width = 300 }) => /* @__PURE__ */ jsx(
  "img",
  {
    src: "/logo.png",
    alt: "United Estates Realty",
    crossOrigin: "anonymous",
    loading: "eager",
    style: { width, height: "auto", objectFit: "contain", display: "block" }
  }
);
function splitHeadline(headline, fallback) {
  const normalized = headline.trim();
  if (!normalized) return fallback;
  const parts = normalized.split(/\s+/);
  if (parts.length === 1) {
    return { italic: "", bold: parts[0] };
  }
  return {
    italic: parts.slice(0, -1).join(" "),
    bold: parts[parts.length - 1]
  };
}
function getRenderableAgents(data) {
  var _a;
  if ((_a = data.agents) == null ? void 0 : _a.length) {
    return data.agents.filter((agent) => agent.name.trim()).slice(0, 3);
  }
  return [{
    name: data.agentName,
    title: data.agentTitle,
    phone: data.agentPhone,
    email: data.agentEmail
  }].filter((agent) => agent.name.trim());
}
function renderHeadlineBlock(style, headline, fallback, editable, fontScale = 1) {
  const headlineParts = splitHeadline(headline, fallback);
  if (style === "h2") {
    return /* @__PURE__ */ jsxs("div", { style: { marginBottom: Math.round(16 * fontScale) }, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: Math.round(20 * fontScale),
            fontWeight: 700,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: "#c9a96e",
            marginBottom: Math.round(10 * fontScale)
          },
          children: /* @__PURE__ */ jsx(E, { editable, children: headline })
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            width: Math.round(112 * fontScale),
            height: 1,
            background: "rgba(255,255,255,0.3)",
            margin: "0 auto"
          }
        }
      )
    ] });
  }
  if (style === "h3") {
    return /* @__PURE__ */ jsx("div", { style: { marginBottom: Math.round(18 * fontScale) }, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: Math.round(50 * fontScale),
          fontWeight: 400,
          letterSpacing: 1.2,
          color: "#ffffff",
          lineHeight: 1.04
        },
        children: /* @__PURE__ */ jsx(E, { editable, children: headline })
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: Math.round(14 * fontScale),
        marginBottom: Math.round(18 * fontScale),
        flexWrap: "wrap"
      },
      children: [
        headlineParts.italic ? /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: Math.round(68 * fontScale),
              color: "#ffffff",
              lineHeight: 1
            },
            children: /* @__PURE__ */ jsx(E, { editable, children: headlineParts.italic })
          }
        ) : null,
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: Math.round(68 * fontScale),
              color: "#ffffff",
              lineHeight: 1
            },
            children: /* @__PURE__ */ jsx(E, { editable, children: headlineParts.bold })
          }
        )
      ]
    }
  );
}
function FreeformPhotoBlock({
  block,
  index,
  data
}) {
  const blockKey = `photo-item-${block.id}`;
  const t = getBlockTransform(data, blockKey);
  const fitMode = t.fitMode ?? (index === 0 ? "cover" : "contain");
  const radius = Math.round(Math.min(data.canvasWidth || 1080, data.canvasHeight || 1080) * 8e-3);
  return /* @__PURE__ */ jsx(
    AdjustableBlock,
    {
      data,
      block: blockKey,
      style: {
        position: "absolute",
        left: block.left,
        top: block.top,
        width: block.width,
        height: block.height,
        borderRadius: radius,
        overflow: "hidden",
        background: "#e5e7eb",
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)"
      },
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: block.src,
          alt: `Property ${index + 1}`,
          crossOrigin: "anonymous",
          loading: "eager",
          style: {
            width: "100%",
            height: "100%",
            objectFit: fitMode,
            objectPosition: "center center",
            display: "block",
            pointerEvents: "none",
            userSelect: "none",
            background: "#f8fafc"
          }
        }
      )
    }
  );
}
function renderPhotoBlocks(data) {
  const photoBlocks = data.photoBlocks ?? [];
  return photoBlocks.map((block, index) => /* @__PURE__ */ jsx(
    FreeformPhotoBlock,
    {
      block,
      index,
      data
    },
    block.id
  ));
}
function buildTemplate(id, name, category, labelParts) {
  return {
    id,
    name,
    category,
    type: "post",
    // Default size - overridden at render time by data.canvasWidth/canvasHeight
    width: 1080,
    height: 1080,
    thumbnail: "",
    render: (data, editable) => {
      var _a, _b, _c, _d;
      const w = data.canvasWidth || 1080;
      const h = data.canvasHeight || 1080;
      const visibility = mergeTemplateVisibility(data.visibility);
      const agents = getRenderableAgents(data);
      const showAgentBlock = visibility.agentName || visibility.agentTitle || visibility.agentPhone || visibility.agentEmail;
      const fontScale = Math.min(w, h) / 1080;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            width: w,
            height: h,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#fff",
            fontFamily: 'Georgia, "Times New Roman", serif'
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Scale header padding relative to canvas width
                  padding: `${Math.round(44 * fontScale)}px ${Math.round(60 * fontScale)}px ${Math.round(40 * fontScale)}px`,
                  flexShrink: 0
                },
                children: /* @__PURE__ */ jsx(
                  AdjustableBlock,
                  {
                    data,
                    block: "logo",
                    style: { display: "flex", alignItems: "center", justifyContent: "center" },
                    children: /* @__PURE__ */ jsx(Logo, { width: Math.round(360 * fontScale) })
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  background: "#ffffff"
                }
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  background: "#0e1428",
                  flexShrink: 0,
                  padding: `${Math.round(40 * fontScale)}px ${Math.round(64 * fontScale)}px ${Math.round(42 * fontScale)}px`,
                  textAlign: "center"
                },
                children: [
                  visibility.headline && /* @__PURE__ */ jsx(AdjustableBlock, { data, block: "headline", children: renderHeadlineBlock(data.headlineStyle, data.headline, labelParts, editable, fontScale) }),
                  visibility.address && /* @__PURE__ */ jsxs(AdjustableBlock, { data, block: "address", children: [
                    visibility.headline && /* @__PURE__ */ jsx("div", { style: { width: Math.round(80 * fontScale), height: 2, background: "#c9a96e", margin: `0 auto ${Math.round(22 * fontScale)}px` } }),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          fontFamily: '"Inter", system-ui, sans-serif',
                          fontSize: Math.round(36 * fontScale),
                          fontWeight: 700,
                          color: "#ffffff",
                          letterSpacing: 0.3,
                          lineHeight: 1.12,
                          marginBottom: Math.round(8 * fontScale)
                        },
                        children: /* @__PURE__ */ jsx(E, { editable, children: data.address })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          fontFamily: '"Inter", system-ui, sans-serif',
                          fontSize: Math.round(22 * fontScale),
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.6)",
                          letterSpacing: 0.6,
                          marginBottom: visibility.price || visibility.stats || visibility.description ? Math.round(16 * fontScale) : 0
                        },
                        children: /* @__PURE__ */ jsxs(E, { editable, children: [
                          data.city,
                          ", ",
                          data.state,
                          " ",
                          data.zip
                        ] })
                      }
                    )
                  ] }),
                  visibility.price && /* @__PURE__ */ jsx(AdjustableBlock, { data, block: "price", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: Math.round(42 * fontScale),
                        fontWeight: 700,
                        color: "#c9a96e",
                        letterSpacing: 0.4,
                        marginBottom: visibility.stats || visibility.description ? Math.round(18 * fontScale) : 0
                      },
                      children: /* @__PURE__ */ jsx(E, { editable, children: data.price })
                    }
                  ) }),
                  visibility.stats && /* @__PURE__ */ jsx(AdjustableBlock, { data, block: "stats", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        display: "flex",
                        justifyContent: "center",
                        gap: Math.round(36 * fontScale),
                        marginBottom: visibility.description ? Math.round(18 * fontScale) : 0,
                        flexWrap: "wrap",
                        fontFamily: '"Inter", system-ui, sans-serif'
                      },
                      children: [
                        { label: "Beds", value: data.beds },
                        { label: "Baths", value: data.baths },
                        { label: "Sq Ft", value: data.sqft }
                      ].map((item) => /* @__PURE__ */ jsxs("div", { style: { minWidth: Math.round(110 * fontScale) }, children: [
                        /* @__PURE__ */ jsx("div", { style: { fontSize: Math.round(28 * fontScale), fontWeight: 700, color: "#ffffff" }, children: /* @__PURE__ */ jsx(E, { editable, children: item.value }) }),
                        /* @__PURE__ */ jsx("div", { style: { fontSize: Math.round(11 * fontScale), letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 4 }, children: item.label })
                      ] }, item.label))
                    }
                  ) }),
                  visibility.description && /* @__PURE__ */ jsx(AdjustableBlock, { data, block: "description", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        maxWidth: Math.round(760 * fontScale),
                        margin: "0 auto",
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: Math.round(18 * fontScale),
                        lineHeight: 1.45,
                        color: "rgba(255,255,255,0.72)"
                      },
                      children: /* @__PURE__ */ jsx(E, { editable, children: data.description })
                    }
                  ) }),
                  category === "Open House" && /* @__PURE__ */ jsxs("div", { style: { marginTop: Math.round(20 * fontScale), fontSize: Math.round(24 * fontScale), color: "#c9a96e", fontStyle: "italic" }, children: [
                    /* @__PURE__ */ jsx(E, { editable, children: data.openHouseDate }),
                    /* @__PURE__ */ jsx("span", { style: { margin: `0 ${Math.round(12 * fontScale)}px`, color: "rgba(255,255,255,0.3)" }, children: "|" }),
                    /* @__PURE__ */ jsx(E, { editable, children: data.openHouseTime })
                  ] }),
                  showAgentBlock && /* @__PURE__ */ jsx(AdjustableBlock, { data, block: "agent", children: data.agentLayout === "multi" && agents.length > 1 ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        marginTop: Math.round(24 * fontScale),
                        paddingTop: Math.round(20 * fontScale),
                        borderTop: "1px solid rgba(255,255,255,0.14)",
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, minmax(0, 1fr))`,
                        gap: Math.round(14 * fontScale),
                        fontFamily: '"Inter", system-ui, sans-serif'
                      },
                      children: agents.map((agent) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: Math.round(16 * fontScale),
                            padding: `${Math.round(14 * fontScale)}px ${Math.round(12 * fontScale)}px`,
                            background: "rgba(255,255,255,0.04)"
                          },
                          children: [
                            visibility.agentName && /* @__PURE__ */ jsx("div", { style: { color: "#ffffff", fontWeight: 700, fontSize: Math.round(15 * fontScale), marginBottom: visibility.agentTitle ? 4 : 8 }, children: agent.name }),
                            visibility.agentTitle && /* @__PURE__ */ jsx("div", { style: { color: "rgba(255,255,255,0.55)", fontSize: Math.round(12 * fontScale), marginBottom: visibility.agentPhone || visibility.agentEmail ? 10 : 0 }, children: agent.title }),
                            visibility.agentPhone && /* @__PURE__ */ jsx("div", { style: { color: "rgba(255,255,255,0.82)", fontSize: Math.round(12 * fontScale), marginBottom: visibility.agentEmail ? 4 : 0 }, children: agent.phone }),
                            visibility.agentEmail && /* @__PURE__ */ jsx("div", { style: { color: "rgba(255,255,255,0.65)", fontSize: Math.round(11 * fontScale), wordBreak: "break-word" }, children: agent.email })
                          ]
                        },
                        agent.id || `${agent.name}-${agent.email}`
                      ))
                    }
                  ) : /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        marginTop: Math.round(24 * fontScale),
                        paddingTop: Math.round(20 * fontScale),
                        borderTop: "1px solid rgba(255,255,255,0.14)",
                        display: "flex",
                        justifyContent: "center",
                        gap: Math.round(20 * fontScale),
                        flexWrap: "wrap",
                        fontFamily: '"Inter", system-ui, sans-serif',
                        color: "rgba(255,255,255,0.72)",
                        fontSize: Math.round(16 * fontScale)
                      },
                      children: [
                        visibility.agentName && /* @__PURE__ */ jsx("span", { style: { color: "#ffffff", fontWeight: 700 }, children: /* @__PURE__ */ jsx(E, { editable, children: data.agentName }) }),
                        visibility.agentTitle && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(E, { editable, children: data.agentTitle }) }),
                        visibility.agentPhone && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(E, { editable, children: data.agentPhone }) }),
                        visibility.agentEmail && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(E, { editable, children: data.agentEmail }) })
                      ]
                    }
                  ) })
                ]
              }
            ),
            ((((_a = data.photoBlocks) == null ? void 0 : _a.length) ?? 0) > 0 || (((_b = data.customTextBlocks) == null ? void 0 : _b.length) ?? 0) > 0) && /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
              (((_c = data.photoBlocks) == null ? void 0 : _c.length) ?? 0) > 0 && renderPhotoBlocks(data),
              (((_d = data.customTextBlocks) == null ? void 0 : _d.length) ?? 0) > 0 && renderCustomTextBlocks(data, editable, fontScale)
            ] })
          ]
        }
      );
    }
  };
}
const TEMPLATES = [
  buildTemplate("just-listed-post-1", "Just Listed", "Just Listed", { italic: "Just", bold: "Listed" }),
  buildTemplate("open-house-post-1", "Open House", "Open House", { italic: "Open", bold: "House" }),
  buildTemplate("coming-soon-post-1", "Coming Soon", "Coming Soon", { italic: "Coming", bold: "Soon" }),
  buildTemplate("just-sold-post-1", "Just Sold", "Just Sold", { italic: "Just", bold: "Sold" }),
  buildTemplate("price-cut-post-1", "Price Cut", "Price Cut", { italic: "Price", bold: "Cut" }),
  buildTemplate("under-contract-post-1", "Under Contract", "Under Contract", { italic: "Under", bold: "Contract" })
];
const TEMPLATE_CATEGORIES = [
  "Just Listed",
  "Open House",
  "Coming Soon",
  "Just Sold",
  "Price Cut",
  "Under Contract"
];
function getDefaultTemplateData(deal, category = "Just Listed") {
  var _a;
  const contacts = (deal == null ? void 0 : deal.deal_contacts) || [];
  const agentContacts = contacts.filter((dc) => {
    const role = (dc.role || "").toLowerCase();
    return role.includes("agent") || role.includes("broker");
  });
  const uniqueAgents = Array.from(new Map(
    agentContacts.filter((dc) => dc.contact).map((dc) => {
      const contact = dc.contact;
      const id = contact.id || `${contact.first_name}-${contact.last_name}-${dc.role}`;
      return [id, {
        id,
        name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || (deal == null ? void 0 : deal.primary_agent) || "Agent Name",
        title: dc.role || "Real Estate Agent",
        phone: contact.phone || "",
        email: contact.email || ""
      }];
    })
  ).values());
  const sellerAgent = (_a = contacts.find(
    (dc) => dc.role === "Seller Agent" || dc.role === "Listing Agent"
  )) == null ? void 0 : _a.contact;
  const primaryAgent = uniqueAgents[0] || {
    name: sellerAgent ? `${sellerAgent.first_name} ${sellerAgent.last_name}` : (deal == null ? void 0 : deal.primary_agent) || "Agent Name",
    title: "Real Estate Agent",
    phone: (sellerAgent == null ? void 0 : sellerAgent.phone) || "(555) 123-4567",
    email: (sellerAgent == null ? void 0 : sellerAgent.email) || "agent@unitedestatesrealty.com"
  };
  return {
    address: (deal == null ? void 0 : deal.address) || "123 Main Street",
    city: (deal == null ? void 0 : deal.city) || "City",
    state: (deal == null ? void 0 : deal.state) || "ST",
    zip: (deal == null ? void 0 : deal.zip) || "00000",
    price: (deal == null ? void 0 : deal.price) || "$595,000",
    beds: "4",
    baths: "3",
    sqft: "2,500",
    lotSize: "0.25 acres",
    photos: [],
    agentName: primaryAgent.name,
    agentTitle: primaryAgent.title,
    agentPhone: primaryAgent.phone,
    agentEmail: primaryAgent.email,
    headline: category,
    subheadline: "Your Dream Home Awaits",
    description: "Beautiful property featuring modern finishes, spacious living areas, and a stunning outdoor space. Schedule your private showing today!",
    openHouseDate: "Saturday, March 22",
    openHouseTime: "1:00 PM – 4:00 PM",
    visibility: { ...DEFAULT_TEMPLATE_VISIBILITY },
    headlineStyle: "h1",
    agentLayout: "single",
    agents: uniqueAgents.length ? uniqueAgents : [primaryAgent],
    photoBlocks: [],
    customTextBlocks: [],
    groupedBlockKeys: [],
    blockTransforms: {},
    canvasDimensionId: "square",
    canvasWidth: 1080,
    canvasHeight: 1080
  };
}
const RECENTS_LIMIT = 20;
function marketingRecentsKey(dealId) {
  return `uer_marketing_recents_${dealId}`;
}
function loadMarketingRecents(dealId) {
  try {
    const raw = localStorage.getItem(marketingRecentsKey(dealId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveMarketingRecents(dealId, entries) {
  try {
    localStorage.setItem(
      marketingRecentsKey(dealId),
      JSON.stringify(entries.slice(0, RECENTS_LIMIT))
    );
    return true;
  } catch (error) {
    console.warn("[Marketing] localStorage quota exceeded:", error);
    return false;
  }
}
function useDealPhotos(dealId) {
  return useQuery({
    queryKey: ["deal_photos", dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("deal-photos").list(dealId, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).map((f) => ({
        name: f.name,
        url: supabase.storage.from("deal-photos").getPublicUrl(`${dealId}/${f.name}`).data.publicUrl
      }));
    }
  });
}
function useUploadDealPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, file }) => {
      const path = `${dealId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("deal-photos").upload(path, file);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ["deal_photos", dealId] })
  });
}
function useDeleteDealPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, name }) => {
      const { error } = await supabase.storage.from("deal-photos").remove([`${dealId}/${name}`]);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ["deal_photos", dealId] })
  });
}
export {
  CANVAS_DIMENSIONS as C,
  DEFAULT_TEMPLATE_VISIBILITY as D,
  TEMPLATE_CATEGORIES as T,
  useUploadDealPhoto as a,
  useDeleteDealPhoto as b,
  TEMPLATES as c,
  createMarketingPhotoBlock as d,
  getDefaultTemplateData as g,
  loadMarketingRecents as l,
  mergeMarketingBlockTransforms as m,
  saveMarketingRecents as s,
  useDealPhotos as u
};
