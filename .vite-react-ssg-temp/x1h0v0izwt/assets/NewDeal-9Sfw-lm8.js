import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, X, ChevronRight, Search, Loader2, MapPin, User, Users, Check } from "lucide-react";
import { i as useContacts, B as Button, c as cn, I as Input, L as Label } from "../main.mjs";
import { b as useCreateDeal } from "./useDeals-CMdNuTy4.js";
import { motion } from "framer-motion";
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
const HERE_API_KEY = "AiDx3Qd6umV3vVKcvr2gJRiituEHhQ4UOBu8LJPE8xw";
function useAddressAutocomplete(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef();
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(query)}&in=countryCode:USA&types=address&limit=6&apiKey=${HERE_API_KEY}`
        );
        if (!res.ok) throw new Error("HERE API error");
        const data = await res.json();
        const parsed = (data.items || []).filter((item) => item.address).map((item) => {
          const addr = item.address;
          return {
            address: [addr.houseNumber, addr.street].filter(Boolean).join(" ") || addr.label || "",
            city: addr.city || "",
            state: addr.stateCode || addr.state || "",
            zip: addr.postalCode || "",
            label: item.title || ""
          };
        });
        setSuggestions(parsed);
      } catch (err) {
        console.error("Address autocomplete error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);
  return { suggestions, isLoading };
}
const PROPERTY_TYPES = [
  "Sale-Condo",
  "Sale-Single Family Home",
  "Lease-Condo",
  "Lease-Single Family Home"
];
const createPartyForm = (role) => ({
  role,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: ""
});
const emptyPartyErrorState = () => ({
  seller1: {},
  seller2: {},
  buyer1: {},
  buyer2: {}
});
const hasPartyDetails = (form) => Boolean(form.firstName.trim() || form.lastName.trim() || form.email.trim() || form.phone.trim() || form.company.trim());
function NewDeal() {
  const navigate = useNavigate();
  const createDealMutation = useCreateDeal();
  const { data: allContacts = [] } = useContacts();
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [representationSide, setRepresentationSide] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [showAddresses, setShowAddresses] = useState(false);
  const { suggestions: addressSuggestions, isLoading: addressLoading } = useAddressAutocomplete(addressSearch);
  const [createdDealId, setCreatedDealId] = useState(null);
  const [partyForms, setPartyForms] = useState({
    seller1: createPartyForm("Seller"),
    seller2: createPartyForm("Seller 2"),
    buyer1: createPartyForm("Buyer"),
    buyer2: createPartyForm("Buyer 2")
  });
  const [partyErrors, setPartyErrors] = useState(emptyPartyErrorState);
  const [agentForm, setAgentForm] = useState({ role: "Seller Agent", firstName: "", lastName: "", email: "", phone: "", company: "", mlsId: "", mls: "", commission: "", commissionType: "percentage" });
  const [agentErrors, setAgentErrors] = useState({});
  const [partySearch, setPartySearch] = useState({
    seller1: "",
    seller2: "",
    buyer1: "",
    buyer2: ""
  });
  const [showPartyResults, setShowPartyResults] = useState({
    seller1: false,
    seller2: false,
    buyer1: false,
    buyer2: false
  });
  const [showSecondSeller, setShowSecondSeller] = useState(false);
  const [showSecondBuyer, setShowSecondBuyer] = useState(false);
  const stepRefs = useRef([]);
  const containerRef = useRef(null);
  const addressDropdownRef = useRef(null);
  const handleClose = () => navigate("/transactions");
  const agentTitle = representationSide === "buyer" ? "Buyer's Agent" : representationSide === "both" ? "Lead Agent" : "Seller's Agent";
  const agentDetailsTitle = representationSide === "buyer" ? "Buyer Agent Details" : representationSide === "both" ? "Agent Details" : "Seller Agent Details";
  const clientStepTitle = representationSide === "both" ? "Deal Parties" : representationSide === "buyer" ? "Buyer Legal Name" : "Seller Legal Name";
  const clientStepDescription = representationSide === "both" ? "Add the sellers and buyers on this deal. Second parties are optional." : representationSide === "buyer" ? "Search your contacts or enter the buyer's name. Add a second buyer if needed." : "Search your contacts or enter the seller's name. Add a second seller if needed.";
  useEffect(() => {
    const el = stepRefs.current[step - 1];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);
  useEffect(() => {
    const handler = (e) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target)) {
        setShowAddresses(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const goToStep = (targetStep) => {
    if (targetStep < step) setStep(targetStep);
  };
  const handlePropertyType = (type) => {
    setPropertyType(type);
    setStep(2);
  };
  const handleAddress = (addr) => {
    setAddress(addr.address);
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.zip);
    setAddressSearch("");
    setShowAddresses(false);
    setStep(3);
  };
  const handleRepSide = (side) => {
    setRepresentationSide(side);
    setAgentForm((f) => ({
      ...f,
      role: side === "buyer" ? "Buyer Agent" : side === "seller" ? "Seller Agent" : "Agent"
    }));
    setStep(4);
  };
  const handleSelectAgent = (agent) => {
    setAgentForm((f) => ({
      ...f,
      firstName: agent.first_name,
      lastName: agent.last_name,
      email: agent.email || "",
      phone: agent.phone || "",
      company: agent.company || "",
      mlsId: agent.mls_id || "",
      mls: agent.mls || "",
      commission: agent.commission || "",
      commissionType: agent.commission_type || f.commissionType
    }));
    setStep(5);
  };
  const updatePartyField = (key, field, value) => {
    setPartyForms((forms) => ({
      ...forms,
      [key]: {
        ...forms[key],
        [field]: value,
        contactId: field === "role" ? forms[key].contactId : void 0
      }
    }));
    if (field === "firstName" || field === "lastName") {
      setPartyErrors((errors) => ({
        ...errors,
        [key]: {
          ...errors[key],
          [field]: false
        }
      }));
    }
  };
  const selectPartyContact = (key, contact) => {
    setPartyForms((forms) => ({
      ...forms,
      [key]: {
        ...forms[key],
        contactId: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        role: forms[key].role
      }
    }));
    setPartySearch((search) => ({ ...search, [key]: "" }));
    setShowPartyResults((show) => ({ ...show, [key]: false }));
    setPartyErrors((errors) => ({
      ...errors,
      [key]: {}
    }));
  };
  const validatePartyForm = (form, required) => {
    const needsValidation = required || hasPartyDetails(form);
    if (!needsValidation) return {};
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = true;
    if (!form.lastName.trim()) errors.lastName = true;
    return errors;
  };
  const handleSaveParties = () => {
    const nextErrors = emptyPartyErrorState();
    let hasErrors = false;
    if (representationSide === "seller" || representationSide === "both") {
      nextErrors.seller1 = validatePartyForm(partyForms.seller1, true);
      nextErrors.seller2 = validatePartyForm(partyForms.seller2, false);
      hasErrors = hasErrors || Object.keys(nextErrors.seller1).length > 0 || Object.keys(nextErrors.seller2).length > 0;
    }
    if (representationSide === "buyer" || representationSide === "both") {
      nextErrors.buyer1 = validatePartyForm(partyForms.buyer1, true);
      nextErrors.buyer2 = validatePartyForm(partyForms.buyer2, false);
      hasErrors = hasErrors || Object.keys(nextErrors.buyer1).length > 0 || Object.keys(nextErrors.buyer2).length > 0;
    }
    if (hasErrors) {
      setPartyErrors(nextErrors);
      toast.error("Each added seller or buyer needs a first and last name.");
      return;
    }
    setStep(6);
  };
  const handleSaveAgent = async () => {
    const errors = {};
    if (!agentForm.firstName) errors.firstName = true;
    if (!agentForm.lastName) errors.lastName = true;
    if (Object.keys(errors).length) {
      setAgentErrors(errors);
      return;
    }
    const contacts = [];
    if (agentForm.firstName) {
      contacts.push({
        first_name: agentForm.firstName,
        last_name: agentForm.lastName,
        email: agentForm.email || void 0,
        phone: agentForm.phone || void 0,
        company: agentForm.company || void 0,
        role: agentForm.role,
        mls_id: agentForm.mlsId || void 0,
        mls: agentForm.mls || void 0,
        commission: agentForm.commission || void 0,
        commission_type: agentForm.commissionType || void 0
      });
    }
    const includedPartyKeys = [];
    if (representationSide === "seller" || representationSide === "both") includedPartyKeys.push("seller1", "seller2");
    if (representationSide === "buyer" || representationSide === "both") includedPartyKeys.push("buyer1", "buyer2");
    includedPartyKeys.forEach((key) => {
      const form = partyForms[key];
      const shouldInclude = key.endsWith("1") || hasPartyDetails(form);
      if (!shouldInclude || !form.firstName.trim() || !form.lastName.trim()) return;
      contacts.push({
        contact_id: form.contactId,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email || void 0,
        phone: form.phone || void 0,
        company: form.company || void 0,
        role: form.role
      });
    });
    try {
      const newDeal = await createDealMutation.mutateAsync({
        property_type: propertyType,
        address: address || "TBD",
        city: city || "",
        state: state || "",
        zip: zip || "",
        representation_side: representationSide || "seller",
        primary_agent: agentForm.firstName ? `${agentForm.firstName} ${agentForm.lastName}` : "Unassigned",
        contacts
      });
      setCreatedDealId(newDeal.id);
      setStep(7);
      toast.success("Deal created successfully!");
    } catch (err) {
      console.error("Failed to create deal:", err);
      toast.error("Failed to create deal. Please try again.");
    }
  };
  const agentContacts = allContacts.filter((c) => {
    const role = (c.role || "").toLowerCase();
    const matchesRole = role.includes("agent") || role.includes("broker") || c.mls_id || c.mls;
    if (!agentSearch) return matchesRole;
    const term = agentSearch.toLowerCase();
    return matchesRole && (c.first_name.toLowerCase().includes(term) || c.last_name.toLowerCase().includes(term) || (c.company || "").toLowerCase().includes(term));
  });
  const stepSummary = (s) => {
    switch (s) {
      case 1:
        return propertyType;
      case 2:
        return address === "TBD" ? "TBD" : `${address}${city ? `, ${city}` : ""}${state ? `, ${state}` : ""} ${zip}`.trim();
      case 3:
        return representationSide ? representationSide.charAt(0).toUpperCase() + representationSide.slice(1) : "";
      case 4:
        return agentForm.firstName ? `${agentForm.firstName} ${agentForm.lastName}` : "";
      case 5: {
        const sellerNames = [partyForms.seller1, partyForms.seller2].filter((form) => hasPartyDetails(form) && form.firstName.trim()).map((form) => `${form.firstName} ${form.lastName}`.trim());
        const buyerNames = [partyForms.buyer1, partyForms.buyer2].filter((form) => hasPartyDetails(form) && form.firstName.trim()).map((form) => `${form.firstName} ${form.lastName}`.trim());
        if (representationSide === "seller") return sellerNames.join(", ");
        if (representationSide === "buyer") return buyerNames.join(", ");
        const parts = [];
        if (sellerNames.length) parts.push(`Sellers: ${sellerNames.join(", ")}`);
        if (buyerNames.length) parts.push(`Buyers: ${buyerNames.join(", ")}`);
        return parts.join(" • ");
      }
      case 6:
        return "Completed";
      default:
        return "";
    }
  };
  const renderPartySection = ({
    keyName,
    title,
    description
  }) => {
    const form = partyForms[keyName];
    const errors = partyErrors[keyName];
    const searchTerm = partySearch[keyName];
    const shouldShowResults = showPartyResults[keyName] && searchTerm.length >= 1;
    const filteredContacts = allContacts.filter((c) => {
      const term = searchTerm.toLowerCase();
      return c.first_name.toLowerCase().includes(term) || c.last_name.toLowerCase().includes(term) || (c.email || "").toLowerCase().includes(term);
    }).slice(0, 8);
    return /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border border-border bg-card p-4 sm:p-5", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: title }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 385,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-xs text-muted-foreground", children: description }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 386,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 384,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
          /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }, void 0, false, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 391,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              placeholder: "Search contacts to auto-fill...",
              className: "pl-9",
              value: searchTerm,
              onChange: (e) => setPartySearch((search) => ({ ...search, [keyName]: e.target.value })),
              onFocus: () => setShowPartyResults((show) => ({ ...show, [keyName]: true }))
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 392,
              columnNumber: 13
            },
            this
          ),
          shouldShowResults && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-auto", children: [
            filteredContacts.map((c) => /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => selectPartyContact(keyName, c),
                className: "w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-3 text-sm transition-colors",
                children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium", children: [
                    c.first_name[0],
                    c.last_name[0]
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 407,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: [
                      c.first_name,
                      " ",
                      c.last_name
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 411,
                      columnNumber: 23
                    }, this),
                    c.email && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground ml-2", children: [
                      "• ",
                      c.email
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 412,
                      columnNumber: 35
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 410,
                    columnNumber: 21
                  }, this)
                ]
              },
              c.id,
              true,
              {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 402,
                columnNumber: 19
              },
              this
            )),
            filteredContacts.length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground py-3 text-center", children: "No contacts found" }, void 0, false, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 417,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 400,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 390,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Role" }, void 0, false, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 425,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              value: form.role,
              onChange: (e) => updatePartyField(keyName, "role", e.target.value),
              className: "mt-1"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 426,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 424,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 423,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: [
              "First Name ",
              /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: "*" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 436,
                columnNumber: 53
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 436,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                value: form.firstName,
                onChange: (e) => updatePartyField(keyName, "firstName", e.target.value),
                className: cn("mt-1", errors.firstName && "border-destructive")
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 437,
                columnNumber: 15
              },
              this
            ),
            errors.firstName && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-destructive mt-1", children: "Required" }, void 0, false, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 442,
              columnNumber: 36
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 435,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: [
              "Last Name ",
              /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: "*" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 445,
                columnNumber: 52
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 445,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                value: form.lastName,
                onChange: (e) => updatePartyField(keyName, "lastName", e.target.value),
                className: cn("mt-1", errors.lastName && "border-destructive")
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 446,
                columnNumber: 15
              },
              this
            ),
            errors.lastName && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-destructive mt-1", children: "Required" }, void 0, false, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 451,
              columnNumber: 35
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 444,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 434,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Email" }, void 0, false, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 457,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                type: "email",
                value: form.email,
                onChange: (e) => updatePartyField(keyName, "email", e.target.value),
                className: "mt-1"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 458,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 456,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Phone" }, void 0, false, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 466,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                value: form.phone,
                onChange: (e) => updatePartyField(keyName, "phone", e.target.value),
                className: "mt-1"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 467,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 465,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 455,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Company / Trust" }, void 0, false, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 476,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              value: form.company,
              onChange: (e) => updatePartyField(keyName, "company", e.target.value),
              className: "mt-1"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 477,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 475,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 389,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 383,
      columnNumber: 7
    }, this);
  };
  const CompletedStep = ({ stepNum, title }) => /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: (el) => {
        stepRefs.current[stepNum - 1] = el;
      },
      onClick: () => goToStep(stepNum),
      className: "cursor-pointer group",
      children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 px-4 py-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 496,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 495,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-muted-foreground", children: title }, void 0, false, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 499,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-medium text-foreground truncate", children: stepSummary(stepNum) }, void 0, false, {
            fileName: "/dev-server/src/pages/NewDeal.tsx",
            lineNumber: 500,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 498,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV(ChevronUp, { className: "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 502,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 494,
        columnNumber: 7
      }, this)
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 489,
      columnNumber: 5
    },
    this
  );
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center px-6 sticky top-0 bg-background z-20", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Create New Deal" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 511,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 512,
        columnNumber: 9
      }, this),
      step > 1 && step < 7 && /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => setStep(step - 1), className: "mr-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxDEV(ChevronUp, { className: "w-4 h-4 mr-1" }, void 0, false, {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 515,
          columnNumber: 13
        }, this),
        " Back"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 514,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: handleClose, className: "p-2 rounded-md hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxDEV(X, { className: "w-5 h-5 text-muted-foreground" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 519,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 518,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 510,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "h-1 bg-muted", children: /* @__PURE__ */ jsxDEV("div", { className: "h-full bg-primary transition-all duration-500 ease-out", style: { width: `${step / 7 * 100}%` } }, void 0, false, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 525,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 524,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { ref: containerRef, className: "flex-1 overflow-auto", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl mx-auto py-10 px-6 space-y-6", children: [
      step > 1 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 1, title: "Property Type" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 533,
        columnNumber: 24
      }, this),
      step > 2 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 2, title: "Property Address" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 534,
        columnNumber: 24
      }, this),
      step > 3 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 3, title: "Representation Side" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 535,
        columnNumber: 24
      }, this),
      step > 4 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 4, title: agentTitle }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 536,
        columnNumber: 24
      }, this),
      step > 5 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 5, title: clientStepTitle }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 537,
        columnNumber: 24
      }, this),
      step > 6 && /* @__PURE__ */ jsxDEV(CompletedStep, { stepNum: 6, title: agentDetailsTitle }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 538,
        columnNumber: 24
      }, this),
      /* @__PURE__ */ jsxDEV(
        motion.div,
        {
          ref: (el) => {
            stepRefs.current[step - 1] = el;
          },
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, ease: "easeOut" },
          children: [
            step === 1 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: "What type of property is this?" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 551,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: "Select the property type to get started." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 552,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: PROPERTY_TYPES.map((type) => /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => handlePropertyType(type),
                  className: cn(
                    "w-full text-left px-4 py-3 rounded-md border text-sm transition-colors flex items-center justify-between group",
                    propertyType === type ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30 text-foreground"
                  ),
                  children: [
                    type,
                    /* @__PURE__ */ jsxDEV(ChevronRight, { className: "w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 566,
                      columnNumber: 23
                    }, this)
                  ]
                },
                type,
                true,
                {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 555,
                  columnNumber: 21
                },
                this
              )) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 553,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 550,
              columnNumber: 15
            }, this),
            step === 2 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: "Property Address" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 576,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: "Enter the MLS# or property address." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 577,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "relative", ref: addressDropdownRef, children: [
                /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 579,
                  columnNumber: 19
                }, this),
                addressLoading && /* @__PURE__ */ jsxDEV(Loader2, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 580,
                  columnNumber: 38
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Start typing an address...",
                    className: "pl-9",
                    value: addressSearch,
                    onChange: (e) => {
                      setAddressSearch(e.target.value);
                      setShowAddresses(true);
                    },
                    onFocus: () => addressSearch.length >= 3 && setShowAddresses(true)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 581,
                    columnNumber: 19
                  },
                  this
                ),
                showAddresses && addressSuggestions.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-64 overflow-auto", children: addressSuggestions.map((addr, i) => /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => handleAddress(addr),
                    className: "w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 text-sm transition-colors",
                    children: [
                      /* @__PURE__ */ jsxDEV(MapPin, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }, void 0, false, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 596,
                        columnNumber: 27
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "text-foreground", children: addr.address }, void 0, false, {
                          fileName: "/dev-server/src/pages/NewDeal.tsx",
                          lineNumber: 598,
                          columnNumber: 29
                        }, this),
                        /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-muted-foreground", children: [
                          addr.city,
                          addr.state ? `, ${addr.state}` : "",
                          " ",
                          addr.zip
                        ] }, void 0, true, {
                          fileName: "/dev-server/src/pages/NewDeal.tsx",
                          lineNumber: 599,
                          columnNumber: 29
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 597,
                        columnNumber: 27
                      }, this)
                    ]
                  },
                  `${addr.label}-${i}`,
                  true,
                  {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 591,
                    columnNumber: 25
                  },
                  this
                )) }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 589,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 578,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => {
                setAddress("TBD");
                setCity("");
                setState("");
                setZip("");
                setStep(3);
              }, children: "Skip" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 607,
                columnNumber: 19
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 606,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 575,
              columnNumber: 15
            }, this),
            step === 3 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: "Which side do you represent?" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 617,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: "Select your representation in this deal." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 618,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [["buyer", "Buyer", User], ["seller", "Seller", User], ["both", "Both", Users]].map(([value, label, Icon]) => /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => handleRepSide(value),
                  className: cn(
                    "w-full text-left px-4 py-4 rounded-md border text-sm transition-colors flex items-center gap-3",
                    representationSide === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  ),
                  children: [
                    /* @__PURE__ */ jsxDEV(Icon, { className: "w-5 h-5 text-muted-foreground" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 631,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-foreground font-medium", children: label }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 632,
                      columnNumber: 23
                    }, this)
                  ]
                },
                value,
                true,
                {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 621,
                  columnNumber: 21
                },
                this
              )) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 619,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 616,
              columnNumber: 15
            }, this),
            step === 4 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: agentTitle }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 642,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: "Search for agents from your contacts or enter manually." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 643,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "relative mb-4", children: [
                /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 645,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV(Input, { placeholder: "Search agents by name or company", className: "pl-9", value: agentSearch, onChange: (e) => setAgentSearch(e.target.value) }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 646,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 644,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1 max-h-64 overflow-auto", children: agentContacts.length > 0 ? agentContacts.map((c) => /* @__PURE__ */ jsxDEV("button", { onClick: () => handleSelectAgent(c), className: "w-full text-left px-4 py-3 hover:bg-muted/50 rounded-md flex items-center gap-3 text-sm transition-colors border border-border", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium", children: [
                  c.first_name[0],
                  c.last_name[0]
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 651,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: [
                    c.first_name,
                    " ",
                    c.last_name
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 653,
                    columnNumber: 25
                  }, this),
                  c.company && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground ml-2", children: [
                    "• ",
                    c.company
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 654,
                    columnNumber: 39
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 652,
                  columnNumber: 23
                }, this)
              ] }, c.id, true, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 650,
                columnNumber: 21
              }, this)) : /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "No agents found in your contacts." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 658,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 648,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "mt-4 pt-4 border-t", children: /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => {
                setAgentForm((f) => ({ ...f, firstName: "", lastName: "" }));
                setStep(6);
              }, children: "Enter agent manually instead" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 662,
                columnNumber: 19
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 661,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 641,
              columnNumber: 15
            }, this),
            step === 5 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: clientStepTitle }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 672,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: clientStepDescription }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 673,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
                (representationSide === "seller" || representationSide === "both") && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                  renderPartySection({
                    keyName: "seller1",
                    title: "Seller 1",
                    description: "Primary seller contact on this deal."
                  }),
                  showSecondSeller ? /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
                    renderPartySection({
                      keyName: "seller2",
                      title: "Seller 2",
                      description: "Optional second seller for trusts, spouses, or co-owners."
                    }),
                    /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", className: "w-full sm:w-auto", onClick: () => {
                      setShowSecondSeller(false);
                      setPartyForms((forms) => ({ ...forms, seller2: createPartyForm("Seller 2") }));
                      setPartyErrors((errors) => ({ ...errors, seller2: {} }));
                      setPartySearch((search) => ({ ...search, seller2: "" }));
                      setShowPartyResults((show) => ({ ...show, seller2: false }));
                    }, children: "Remove second seller" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 689,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 683,
                    columnNumber: 25
                  }, this) : /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: () => setShowSecondSeller(true), children: "Add second seller" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 700,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 676,
                  columnNumber: 21
                }, this),
                (representationSide === "buyer" || representationSide === "both") && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                  renderPartySection({
                    keyName: "buyer1",
                    title: "Buyer 1",
                    description: "Primary buyer contact on this deal."
                  }),
                  showSecondBuyer ? /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
                    renderPartySection({
                      keyName: "buyer2",
                      title: "Buyer 2",
                      description: "Optional second buyer for spouses, co-buyers, or entities."
                    }),
                    /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", className: "w-full sm:w-auto", onClick: () => {
                      setShowSecondBuyer(false);
                      setPartyForms((forms) => ({ ...forms, buyer2: createPartyForm("Buyer 2") }));
                      setPartyErrors((errors) => ({ ...errors, buyer2: {} }));
                      setPartySearch((search) => ({ ...search, buyer2: "" }));
                      setShowPartyResults((show) => ({ ...show, buyer2: false }));
                    }, children: "Remove second buyer" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 721,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 715,
                    columnNumber: 25
                  }, this) : /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: () => setShowSecondBuyer(true), children: "Add second buyer" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 732,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 708,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 pt-2", children: [
                  /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => setStep(4), children: "Back" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 740,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV(Button, { onClick: handleSaveParties, children: "Continue" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 741,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 739,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 674,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 671,
              columnNumber: 15
            }, this),
            step === 6 && /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-semibold mb-1 text-foreground", children: agentDetailsTitle }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 750,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-6", children: "Complete the agent information." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 751,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Role" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 754,
                    columnNumber: 26
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: agentForm.role, onChange: (e) => setAgentForm((f) => ({ ...f, role: e.target.value })), className: "mt-1" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 754,
                    columnNumber: 65
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 754,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 753,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: [
                      "First Name ",
                      /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: "*" }, void 0, false, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 758,
                        columnNumber: 61
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 758,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.firstName, onChange: (e) => {
                      setAgentForm((f) => ({ ...f, firstName: e.target.value }));
                      setAgentErrors((e2) => ({ ...e2, firstName: false }));
                    }, className: cn("mt-1", agentErrors.firstName && "border-destructive") }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 759,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 757,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: [
                      "Last Name ",
                      /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: "*" }, void 0, false, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 762,
                        columnNumber: 60
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 762,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.lastName, onChange: (e) => {
                      setAgentForm((f) => ({ ...f, lastName: e.target.value }));
                      setAgentErrors((e2) => ({ ...e2, lastName: false }));
                    }, className: cn("mt-1", agentErrors.lastName && "border-destructive") }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 763,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 761,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 756,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Email" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 767,
                      columnNumber: 26
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { type: "email", value: agentForm.email, onChange: (e) => setAgentForm((f) => ({ ...f, email: e.target.value })), className: "mt-1" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 767,
                      columnNumber: 66
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 767,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Phone" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 768,
                      columnNumber: 26
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.phone, onChange: (e) => setAgentForm((f) => ({ ...f, phone: e.target.value })), className: "mt-1" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 768,
                      columnNumber: 66
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 768,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 766,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Company / Trust" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 770,
                    columnNumber: 24
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: agentForm.company, onChange: (e) => setAgentForm((f) => ({ ...f, company: e.target.value })), className: "mt-1" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 770,
                    columnNumber: 74
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 770,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "MLS ID" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 772,
                      columnNumber: 26
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.mlsId, onChange: (e) => setAgentForm((f) => ({ ...f, mlsId: e.target.value })), className: "mt-1" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 772,
                      columnNumber: 67
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 772,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "MLS" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 774,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.mls, onChange: (e) => setAgentForm((f) => ({ ...f, mls: e.target.value })), className: "mt-1" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 775,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 773,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 771,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Commission" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 779,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 mt-1", children: [
                    /* @__PURE__ */ jsxDEV(Input, { value: agentForm.commission, onChange: (e) => setAgentForm((f) => ({ ...f, commission: e.target.value })), className: "flex-1", placeholder: "0" }, void 0, false, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 781,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex border rounded-md overflow-hidden", children: [
                      /* @__PURE__ */ jsxDEV("button", { onClick: () => setAgentForm((f) => ({ ...f, commissionType: "percentage" })), className: cn("px-3 py-2 text-xs font-medium transition-colors", agentForm.commissionType === "percentage" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"), children: "%" }, void 0, false, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 783,
                        columnNumber: 25
                      }, this),
                      /* @__PURE__ */ jsxDEV("button", { onClick: () => setAgentForm((f) => ({ ...f, commissionType: "dollars" })), className: cn("px-3 py-2 text-xs font-medium transition-colors", agentForm.commissionType === "dollars" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"), children: "$" }, void 0, false, {
                        fileName: "/dev-server/src/pages/NewDeal.tsx",
                        lineNumber: 784,
                        columnNumber: 25
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/NewDeal.tsx",
                      lineNumber: 782,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 780,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 778,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 pt-2", children: [
                  /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => setStep(5), children: "Back" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 789,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV(Button, { onClick: handleSaveAgent, disabled: createDealMutation.isPending, children: createDealMutation.isPending ? "Creating..." : "Save" }, void 0, false, {
                    fileName: "/dev-server/src/pages/NewDeal.tsx",
                    lineNumber: 790,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/NewDeal.tsx",
                  lineNumber: 788,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 752,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 749,
              columnNumber: 15
            }, this),
            step === 7 && /* @__PURE__ */ jsxDEV("div", { className: "text-center py-16", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-8 h-8 text-success" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 802,
                columnNumber: 19
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 801,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-semibold text-foreground mb-2", children: "Congratulations!" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 804,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground mb-8", children: "Your deal has been created successfully." }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 805,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV(Button, { onClick: () => navigate(`/transactions/${createdDealId}`), children: "View Deal" }, void 0, false, {
                fileName: "/dev-server/src/pages/NewDeal.tsx",
                lineNumber: 806,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/NewDeal.tsx",
              lineNumber: 800,
              columnNumber: 15
            }, this)
          ]
        },
        step,
        true,
        {
          fileName: "/dev-server/src/pages/NewDeal.tsx",
          lineNumber: 541,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "h-32" }, void 0, false, {
        fileName: "/dev-server/src/pages/NewDeal.tsx",
        lineNumber: 812,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 530,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/NewDeal.tsx",
      lineNumber: 529,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/NewDeal.tsx",
    lineNumber: 508,
    columnNumber: 5
  }, this);
}
export {
  NewDeal as default
};
