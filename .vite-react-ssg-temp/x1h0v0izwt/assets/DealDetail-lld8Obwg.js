import { jsxDEV } from "react/jsx-dev-runtime";
import { useRef, useMemo, useState } from "react";
import { l as loadMarketingRecents, u as useDealPhotos, a as useUploadDealPhoto, b as useDeleteDealPhoto, T as TEMPLATE_CATEGORIES, c as TEMPLATES, g as getDefaultTemplateData } from "./useDealPhotos-DeFyjJO4.js";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Upload, FileText, MoreHorizontal, Eye, ChevronDown, Plus, Mail, Check, Bell, X, UserPlus, Trash2, Download, GripVertical, Image, Clock } from "lucide-react";
import { s as supabase, B as Button, c as cn, a as useAuth, i as useContacts, I as Input, L as Label } from "../main.mjs";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { c as useDeal, d as useUpdateDeal, e as useDeleteChecklistItem, f as useAddDealContact, g as useAddChecklistItems, h as useToggleChecklistItem, r as resolveChecklistAdminDocument, i as buildAddableFormOptions, j as getChecklistSectionId, k as getChecklistSectionTitle } from "./useDeals-CMdNuTy4.js";
import { u as useOpenHouses, a as useCreateOpenHouse } from "./useOpenHouses-C0QWM_XJ.js";
import { u as useTasks, a as useCreateTask, b as useDeleteTask } from "./useTasks-B-9jj9rB.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-z1c4sRu8.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BhAZyUdo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
import { C as Checkbox } from "./checkbox-B7kHRerZ.js";
import { toast } from "sonner";
import { format } from "date-fns";
import JSZip from "jszip";
import "vite-react-ssg";
import "@supabase/supabase-js";
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
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
function useDealNotes(dealId) {
  return useQuery({
    queryKey: ["deal_notes", dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.from("deal_notes").select("*").eq("deal_id", dealId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
function useCreateDealNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note) => {
      const { data, error } = await supabase.from("deal_notes").insert(note).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["deal_notes", vars.deal_id] })
  });
}
function useDeleteDealNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dealId }) => {
      const { error } = await supabase.from("deal_notes").delete().eq("id", id);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ["deal_notes", dealId] })
  });
}
function useOffers(dealId) {
  return useQuery({
    queryKey: ["offers", dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").eq("deal_id", dealId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer) => {
      const { data, error } = await supabase.from("offers").insert(offer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["offers", vars.deal_id] })
  });
}
function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dealId }) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ["offers", dealId] })
  });
}
const CHECKLIST_ITEM_DOCUMENTS_BUCKET = "deal-photos";
const CHECKLIST_ITEM_DOCUMENTS_ROOT = "checklist-documents";
const UPLOAD_NAME_SEPARATOR = "__";
const getChecklistItemDocumentFolder = (dealId, itemId) => `${CHECKLIST_ITEM_DOCUMENTS_ROOT}/${dealId}/${itemId}`;
const buildStoredChecklistDocumentName = (fileName) => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${UPLOAD_NAME_SEPARATOR}${fileName}`;
const getChecklistItemDocumentDisplayName = (storedName) => {
  const separatorIndex = storedName.indexOf(UPLOAD_NAME_SEPARATOR);
  return separatorIndex === -1 ? storedName : storedName.slice(separatorIndex + UPLOAD_NAME_SEPARATOR.length);
};
function useChecklistItemDocuments(dealId, itemId) {
  return useQuery({
    queryKey: ["checklist_item_documents", dealId, itemId],
    enabled: !!dealId && !!itemId,
    queryFn: async () => {
      var _a;
      const folder = getChecklistItemDocumentFolder(dealId, itemId);
      const { data, error } = await supabase.storage.from(CHECKLIST_ITEM_DOCUMENTS_BUCKET).list(folder, { sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        if ((_a = error.message) == null ? void 0 : _a.toLowerCase().includes("not found")) {
          return [];
        }
        throw error;
      }
      return (data || []).filter((entry) => !!entry.name).map((entry) => {
        const storagePath = `${folder}/${entry.name}`;
        return {
          name: entry.name,
          storagePath,
          url: supabase.storage.from(CHECKLIST_ITEM_DOCUMENTS_BUCKET).getPublicUrl(storagePath).data.publicUrl
        };
      });
    }
  });
}
function useUploadChecklistItemDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dealId,
      itemId,
      file
    }) => {
      const folder = getChecklistItemDocumentFolder(dealId, itemId);
      const storagePath = `${folder}/${buildStoredChecklistDocumentName(file.name)}`;
      const { error } = await supabase.storage.from(CHECKLIST_ITEM_DOCUMENTS_BUCKET).upload(storagePath, file);
      if (error) throw error;
      return { dealId, itemId };
    },
    onSuccess: ({ dealId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: ["checklist_item_documents", dealId, itemId] });
    }
  });
}
function useDeleteChecklistItemDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dealId,
      itemId,
      storagePath
    }) => {
      const { error } = await supabase.storage.from(CHECKLIST_ITEM_DOCUMENTS_BUCKET).remove([storagePath]);
      if (error) throw error;
      return { dealId, itemId };
    },
    onSuccess: ({ dealId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: ["checklist_item_documents", dealId, itemId] });
    }
  });
}
function ChecklistDocumentPanel({
  dealId,
  itemId,
  itemName,
  defaultDocument
}) {
  const fileInputRef = useRef(null);
  const {
    data: uploadedDocuments = [],
    error: uploadedDocumentsError,
    isLoading
  } = useChecklistItemDocuments(dealId, itemId);
  const uploadChecklistDocument = useUploadChecklistItemDocument();
  const deleteChecklistDocument = useDeleteChecklistItemDocument();
  const documentRows = useMemo(() => {
    const rows = [];
    if (defaultDocument == null ? void 0 : defaultDocument.storage_path) {
      rows.push({
        id: `default-${itemId}`,
        bucket: "admin-documents",
        fileName: defaultDocument.file_name || `${itemName}.pdf`,
        storagePath: defaultDocument.storage_path,
        kind: "default"
      });
    }
    return rows.concat(
      uploadedDocuments.map((document2) => ({
        id: `uploaded-${document2.storagePath}`,
        bucket: CHECKLIST_ITEM_DOCUMENTS_BUCKET,
        fileName: getChecklistItemDocumentDisplayName(document2.name),
        storagePath: document2.storagePath,
        kind: "uploaded"
      }))
    );
  }, [defaultDocument == null ? void 0 : defaultDocument.file_name, defaultDocument == null ? void 0 : defaultDocument.storage_path, itemId, itemName, uploadedDocuments]);
  const openDocument = (document2) => {
    const { data } = supabase.storage.from(document2.bucket).getPublicUrl(document2.storagePath);
    if (!(data == null ? void 0 : data.publicUrl)) {
      toast.error("Unable to open this PDF");
      return;
    }
    window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  };
  const downloadDocument = async (document2) => {
    try {
      const { data, error } = await supabase.storage.from(document2.bucket).download(document2.storagePath);
      if (error || !data) throw error;
      const url = URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document2.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download this PDF");
    }
  };
  const handleUpload = async (event) => {
    const chosenFiles = Array.from(event.target.files || []);
    const pdfFiles = chosenFiles.filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );
    if (chosenFiles.length > 0 && pdfFiles.length === 0) {
      toast.error("Only PDF files can be uploaded here");
      event.target.value = "";
      return;
    }
    let uploadedCount = 0;
    for (const file of pdfFiles) {
      try {
        await uploadChecklistDocument.mutateAsync({ dealId, itemId, file });
        uploadedCount += 1;
      } catch (error) {
        toast.error((error == null ? void 0 : error.message) ? `Failed to upload ${file.name}: ${error.message}` : `Failed to upload ${file.name}`);
      }
    }
    if (uploadedCount > 0) {
      toast.success(uploadedCount === 1 ? "PDF uploaded" : `${uploadedCount} PDFs uploaded`);
    }
    event.target.value = "";
  };
  const handleDelete = async (document2) => {
    if (document2.kind !== "uploaded") {
      toast.error("Default blank PDFs cannot be deleted");
      return;
    }
    try {
      await deleteChecklistDocument.mutateAsync({
        dealId,
        itemId,
        storagePath: document2.storagePath
      });
      toast.success("Uploaded PDF deleted");
    } catch (error) {
      toast.error(
        (error == null ? void 0 : error.message) ? `Failed to delete ${document2.fileName}: ${error.message}` : "Failed to delete PDF"
      );
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "border-b bg-muted/20 px-12 py-3", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-3 flex flex-wrap items-center justify-end gap-3", children: /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "application/pdf,.pdf",
          multiple: true,
          className: "hidden",
          onChange: handleUpload
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
          lineNumber: 165,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "h-8 gap-1.5 text-xs",
          onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          },
          disabled: uploadChecklistDocument.isPending,
          children: [
            /* @__PURE__ */ jsxDEV(Upload, { className: "h-3.5 w-3.5" }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
              lineNumber: 181,
              columnNumber: 13
            }, this),
            uploadChecklistDocument.isPending ? "Uploading..." : "Upload PDF"
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
          lineNumber: 173,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 164,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 163,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "overflow-hidden rounded-md border bg-background", children: isLoading ? /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-3 text-sm text-muted-foreground", children: "Loading PDFs..." }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 189,
      columnNumber: 11
    }, this) : uploadedDocumentsError ? /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-3 text-sm text-destructive", children: "Could not load uploaded PDFs right now." }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 191,
      columnNumber: 11
    }, this) : documentRows.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-3 text-sm text-muted-foreground", children: "No PDFs yet. Upload a signed or completed PDF for this checklist item." }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 193,
      columnNumber: 11
    }, this) : documentRows.map((document2, index) => /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t"),
        children: [
          /* @__PURE__ */ jsxDEV(FileText, { className: "h-4 w-4 flex-shrink-0 text-muted-foreground" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
            lineNumber: 202,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "truncate text-sm text-foreground", children: document2.fileName }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
              lineNumber: 204,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "mt-1", children: /* @__PURE__ */ jsxDEV(
              "span",
              {
                className: cn(
                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                  document2.kind === "default" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                ),
                children: document2.kind === "default" ? "Default blank PDF" : "Uploaded PDF"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                lineNumber: 206,
                columnNumber: 19
              },
              this
            ) }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
              lineNumber: 205,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
            lineNumber: 203,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
            /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 text-muted-foreground",
                "aria-label": `PDF actions for ${document2.fileName}`,
                children: /* @__PURE__ */ jsxDEV(MoreHorizontal, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                  lineNumber: 227,
                  columnNumber: 21
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                lineNumber: 220,
                columnNumber: 19
              },
              this
            ) }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
              lineNumber: 219,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => openDocument(document2), children: "View PDF" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                lineNumber: 231,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => downloadDocument(document2), children: "Download PDF" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                lineNumber: 234,
                columnNumber: 19
              }, this),
              document2.kind === "uploaded" && /* @__PURE__ */ jsxDEV(
                DropdownMenuItem,
                {
                  onClick: () => handleDelete(document2),
                  className: "text-destructive focus:text-destructive",
                  disabled: deleteChecklistDocument.isPending,
                  children: "Delete PDF"
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
                  lineNumber: 238,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
              lineNumber: 230,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
            lineNumber: 218,
            columnNumber: 15
          }, this)
        ]
      },
      document2.id,
      true,
      {
        fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
        lineNumber: 198,
        columnNumber: 13
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
      lineNumber: 187,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/deal/ChecklistDocumentPanel.tsx",
    lineNumber: 162,
    columnNumber: 5
  }, this);
}
const TABS = [
  "Checklists",
  // 'Signing Sessions', // Disabled while the checklist stays manual-only.
  "Photos",
  "Tasks",
  "Notes",
  "Marketing"
];
const CONTACT_ROLES = [
  "Buyer",
  "Buyer Agent",
  "Seller",
  "Seller Broker",
  "Title",
  "Buyer Broker",
  "Co Buyer Agent",
  "Buyer Power Of Attorney",
  "Buyer Lawyer",
  "Buyer Referral",
  "Co Seller Agent",
  "Seller Power Of Attorney",
  "Seller Lawyer",
  "Seller Referral",
  "Lender"
];
const formatPriceWithCommas = (value) => {
  const stripped = value.replace(/[^0-9.]/g, "");
  if (!stripped) return "";
  const firstDot = stripped.indexOf(".");
  const intPart = firstDot === -1 ? stripped : stripped.slice(0, firstDot);
  const decPart = firstDot === -1 ? "" : stripped.slice(firstDot + 1).replace(/\./g, "");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "$" + (decPart ? `${formatted}.${decPart}` : formatted);
};
function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: deal, isLoading } = useDeal(id);
  const { user, profile } = useAuth();
  const updateDeal = useUpdateDeal();
  const deleteChecklist = useDeleteChecklistItem();
  const addDealContact = useAddDealContact();
  const addChecklistItems = useAddChecklistItems();
  const toggleChecklistItem = useToggleChecklistItem();
  const { data: allContacts = [] } = useContacts();
  const initialTab = TABS.includes(searchParams.get("tab") ?? "") ? searchParams.get("tab") : "Checklists";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [addFormsOpen, setAddFormsOpen] = useState(false);
  const [hiddenFormSearch, setHiddenFormSearch] = useState("");
  const [selectedHiddenForms, setSelectedHiddenForms] = useState(/* @__PURE__ */ new Set());
  const [expandedChecklistItems, setExpandedChecklistItems] = useState(/* @__PURE__ */ new Set());
  const [sendingToOffice, setSendingToOffice] = useState(false);
  const [editingMls, setEditingMls] = useState(false);
  const [mlsValue, setMlsValue] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ amount: "", buyer_name: "", notes: "" });
  const [openHouseDialogOpen, setOpenHouseDialogOpen] = useState(false);
  const [ohForm, setOhForm] = useState({ scheduled_date: "", start_time: "10:00 AM", end_time: "12:00 PM", notes: "" });
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  useState(/* @__PURE__ */ new Set());
  const [marketingCategory, setMarketingCategory] = useState(null);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const dealRecents = (() => {
    try {
      return id ? loadMarketingRecents(id) : [];
    } catch {
      return [];
    }
  })();
  const { data: dealNotes = [] } = useDealNotes(id);
  const createNote = useCreateDealNote();
  const deleteNote = useDeleteDealNote();
  const [newNote, setNewNote] = useState("");
  const { data: dealPhotos = [] } = useDealPhotos(id);
  const uploadPhoto = useUploadDealPhoto();
  const deletePhoto = useDeleteDealPhoto();
  const fileInputRef = useRef(null);
  const { data: allTasks = [] } = useTasks();
  const dealTasks = allTasks.filter((t) => t.deal_id === id);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { data: dealOffers = [] } = useOffers(id);
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();
  const { data: dealOpenHouses = [] } = useOpenHouses(id);
  const createOH = useCreateOpenHouse();
  const { data: adminDocuments = [] } = useQuery({
    queryKey: ["admin_documents", "catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_documents").select("file_name, storage_path").order("file_name", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });
  const handleChangeStatus = async (status) => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, status });
      toast.success(`Status changed to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };
  const handleSaveMls = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, mls_number: mlsValue });
      setEditingMls(false);
      toast.success("MLS# updated");
    } catch {
      toast.error("Failed to update MLS#");
    }
  };
  const handleSavePrice = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, price: priceValue });
      setEditingPrice(false);
      toast.success("Price updated");
    } catch {
      toast.error("Failed to update price");
    }
  };
  const handleToggleChecklistCompleted = async (itemId, completed) => {
    try {
      await toggleChecklistItem.mutateAsync({ itemId, completed });
    } catch {
      toast.error("Failed to update checklist item");
    }
  };
  const handleDeleteChecklist = async (itemId) => {
    try {
      await deleteChecklist.mutateAsync(itemId);
      toast.success("Checklist item deleted");
    } catch {
      toast.error("Failed to delete checklist item");
    }
  };
  const handleToggleHiddenForm = (fileName) => {
    setSelectedHiddenForms((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      if (nextSelection.has(fileName)) nextSelection.delete(fileName);
      else nextSelection.add(fileName);
      return nextSelection;
    });
  };
  const handleToggleVisibility = async () => {
    if (!deal) return;
    const turningOn = !deal.visible_to_office;
    try {
      await updateDeal.mutateAsync({ id: deal.id, visible_to_office: turningOn });
      if (turningOn) {
        setSendingToOffice(true);
        const { data: { session } } = await supabase.auth.getSession();
        const agentName = [profile == null ? void 0 : profile.first_name, profile == null ? void 0 : profile.last_name].filter(Boolean).join(" ") || (user == null ? void 0 : user.email) || "";
        const dealAddress = [deal.address, deal.city, deal.state].filter(Boolean).join(", ");
        const items = (deal.checklist_items || []).map((item) => ({ id: item.id, name: item.name }));
        const { data, error } = await supabase.functions.invoke("notify-office", {
          headers: { Authorization: `Bearer ${session == null ? void 0 : session.access_token}` },
          body: { dealId: deal.id, dealAddress, agentName, agentEmail: (user == null ? void 0 : user.email) || "", checklistItems: items }
        });
        if (error || data && data.error) {
          try {
            await updateDeal.mutateAsync({ id: deal.id, visible_to_office: false });
          } catch {
          }
          const detail = (data == null ? void 0 : data.error) || (error == null ? void 0 : error.message) || "Failed to email documents to office";
          toast.error(detail);
          return;
        }
        toast.success("Deal sent to office — brokerage has been notified");
      } else {
        toast.success("Hidden from office");
      }
    } catch (e) {
      toast.error((e == null ? void 0 : e.message) || "Failed to update visibility");
    } finally {
      setSendingToOffice(false);
    }
  };
  const handleEmail = () => {
    if (!deal) return;
    const contacts2 = (deal.deal_contacts || []).map((dc) => {
      var _a;
      return (_a = dc.contact) == null ? void 0 : _a.email;
    }).filter(Boolean);
    const mailto = `mailto:${contacts2.join(",")}?subject=${encodeURIComponent(deal.address)}`;
    window.open(mailto, "_blank");
  };
  const handleDownloadArchive = async () => {
    if (!deal) return;
    const zip = new JSZip();
    zip.file("deal.json", JSON.stringify(deal, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deal.address.replace(/\s+/g, "-")}-archive.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archive downloaded");
  };
  const handleCreateOffer = async () => {
    if (!id || !offerForm.amount || !offerForm.buyer_name) {
      toast.error("Amount and buyer name required");
      return;
    }
    try {
      await createOffer.mutateAsync({ deal_id: id, amount: offerForm.amount, buyer_name: offerForm.buyer_name, notes: offerForm.notes || void 0 });
      toast.success("Offer added");
      setOfferDialogOpen(false);
      setOfferForm({ amount: "", buyer_name: "", notes: "" });
    } catch {
      toast.error("Failed to add offer");
    }
  };
  const handleScheduleOH = async () => {
    if (!id || !ohForm.scheduled_date) {
      toast.error("Date is required");
      return;
    }
    try {
      await createOH.mutateAsync({ deal_id: id, scheduled_date: ohForm.scheduled_date, start_time: ohForm.start_time, end_time: ohForm.end_time, notes: ohForm.notes || void 0 });
      toast.success("Open house scheduled");
      setOpenHouseDialogOpen(false);
      setOhForm({ scheduled_date: "", start_time: "10:00 AM", end_time: "12:00 PM", notes: "" });
    } catch {
      toast.error("Failed to schedule");
    }
  };
  const handleAddContact = async () => {
    if (!id || !selectedContactId) {
      toast.error("Select a contact");
      return;
    }
    try {
      await addDealContact.mutateAsync({ dealId: id, contactId: selectedContactId, role: contactRole || "Other" });
      toast.success("Contact added to deal");
      setAddContactDialogOpen(false);
      setSelectedContactId("");
      setContactRole("");
    } catch {
      toast.error("Failed to add contact");
    }
  };
  const handlePhotoUpload = async (e) => {
    var _a;
    if (!id || !((_a = e.target.files) == null ? void 0 : _a.length)) return;
    let uploaded = 0;
    for (const file of Array.from(e.target.files)) {
      try {
        await uploadPhoto.mutateAsync({ dealId: id, file });
        uploaded++;
      } catch (err) {
        const msg = (err == null ? void 0 : err.message) || "Unknown error";
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      }
    }
    if (uploaded > 0) toast.success(`${uploaded} photo(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      await createNote.mutateAsync({ deal_id: id, content: newNote.trim() });
      setNewNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };
  const handleAddDealTask = async () => {
    if (!id || !newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({ title: newTaskTitle.trim(), type: "todo", deal_id: id });
      setNewTaskTitle("");
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
    }
  };
  const checklistItems = useMemo(
    () => [...(deal == null ? void 0 : deal.checklist_items) || []].sort((a, b) => a.sort_order - b.sort_order),
    [deal == null ? void 0 : deal.checklist_items]
  );
  const completedChecklistCount = checklistItems.filter((item) => item.completed).length;
  const checklistDocumentsByItemId = useMemo(
    () => new Map(
      checklistItems.map((item) => [
        item.id,
        resolveChecklistAdminDocument(item.name, adminDocuments, {
          propertyType: deal == null ? void 0 : deal.property_type,
          representationSide: deal == null ? void 0 : deal.representation_side
        })
      ])
    ),
    [adminDocuments, checklistItems, deal == null ? void 0 : deal.property_type, deal == null ? void 0 : deal.representation_side]
  );
  const addableForms = useMemo(
    () => buildAddableFormOptions({
      adminDocuments,
      checklistItems,
      propertyType: deal == null ? void 0 : deal.property_type,
      representationSide: deal == null ? void 0 : deal.representation_side
    }),
    [adminDocuments, checklistItems, deal == null ? void 0 : deal.property_type, deal == null ? void 0 : deal.representation_side]
  );
  const filteredAddableForms = useMemo(() => {
    const normalizedSearch = hiddenFormSearch.trim().toLowerCase();
    if (!normalizedSearch) return addableForms;
    return addableForms.filter(
      (form) => form.checklistName.toLowerCase().includes(normalizedSearch) || form.file_name.toLowerCase().includes(normalizedSearch)
    );
  }, [addableForms, hiddenFormSearch]);
  const groupedChecklistSections = useMemo(() => {
    const sectionMap = /* @__PURE__ */ new Map();
    for (const checklistItem of checklistItems) {
      const sectionId = getChecklistSectionId(checklistItem.name, {
        propertyType: deal == null ? void 0 : deal.property_type,
        representationSide: deal == null ? void 0 : deal.representation_side
      });
      const collection = sectionMap.get(sectionId) || [];
      collection.push(checklistItem);
      sectionMap.set(sectionId, collection);
    }
    return ["listing", "contract", "company", "additional"].map((sectionId) => ({
      id: sectionId,
      title: getChecklistSectionTitle(sectionId),
      items: sectionMap.get(sectionId) || []
    })).filter((section) => section.items.length > 0);
  }, [checklistItems, deal == null ? void 0 : deal.property_type, deal == null ? void 0 : deal.representation_side]);
  const handleAddHiddenForms = async () => {
    if (!deal || selectedHiddenForms.size === 0) return;
    const selectedForms = addableForms.filter((form) => selectedHiddenForms.has(form.file_name));
    if (!selectedForms.length) {
      toast.error("Select at least one hidden form to add");
      return;
    }
    const nextSortOrderStart = checklistItems.reduce((highestSortOrder, item) => Math.max(highestSortOrder, item.sort_order), -1) + 1;
    try {
      await addChecklistItems.mutateAsync({
        dealId: deal.id,
        items: selectedForms.map((form, index) => ({
          name: form.checklistName,
          has_digital_form: true,
          sort_order: nextSortOrderStart + index
        }))
      });
      toast.success(
        selectedForms.length === 1 ? `Added "${selectedForms[0].checklistName}"` : `Added ${selectedForms.length} forms`
      );
      setSelectedHiddenForms(/* @__PURE__ */ new Set());
      setHiddenFormSearch("");
      setAddFormsOpen(false);
    } catch {
      toast.error("Failed to add selected forms");
    }
  };
  const handleToggleChecklistPdfRow = (itemId) => {
    setExpandedChecklistItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "Loading deal..." }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 426,
      columnNumber: 69
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 426,
      columnNumber: 12
    }, this);
  }
  if (!deal) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "Deal not found" }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 429,
      columnNumber: 69
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 429,
      columnNumber: 12
    }, this);
  }
  const contacts = (deal.deal_contacts || []).map((dc) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    return {
      id: ((_a = dc.contact) == null ? void 0 : _a.id) || dc.contact_id,
      firstName: ((_b = dc.contact) == null ? void 0 : _b.first_name) || "",
      lastName: ((_c = dc.contact) == null ? void 0 : _c.last_name) || "",
      email: ((_d = dc.contact) == null ? void 0 : _d.email) || "",
      phone: ((_e = dc.contact) == null ? void 0 : _e.phone) || "",
      company: ((_f = dc.contact) == null ? void 0 : _f.company) || "",
      role: dc.role || "",
      mlsId: ((_g = dc.contact) == null ? void 0 : _g.mls_id) || "",
      mls: ((_h = dc.contact) == null ? void 0 : _h.mls) || "",
      commission: ((_i = dc.contact) == null ? void 0 : _i.commission) || "",
      commissionType: ((_j = dc.contact) == null ? void 0 : _j.commission_type) || "percentage"
    };
  });
  const isVisibleToOffice = deal.visible_to_office;
  return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "border-b px-4 py-4 sm:px-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-semibold text-foreground", children: deal.address }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 455,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: cn(
              "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
              deal.status === "active" ? "bg-success/10 text-success" : deal.status === "pending" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
            ), children: deal.status }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 456,
              columnNumber: 15
            }, this),
            isVisibleToOffice && /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: "Office Visible" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 461,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 454,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
            deal.city,
            ", ",
            deal.state,
            " ",
            deal.zip
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 463,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 453,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 self-start lg:self-auto", children: contacts.slice(0, 3).map((c) => /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium", title: `${c.firstName} ${c.lastName}`, children: [
          c.firstName[0],
          c.lastName[0]
        ] }, c.id, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 467,
          columnNumber: 15
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 465,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 452,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex flex-wrap items-stretch gap-2", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: handleToggleVisibility, disabled: sendingToOffice, children: [
          /* @__PURE__ */ jsxDEV(Eye, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 477,
            columnNumber: 13
          }, this),
          " ",
          sendingToOffice ? "Sending…" : isVisibleToOffice ? "Sent to Office" : "Send to Office"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 476,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
          /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", children: [
            "Open House ",
            /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-3 h-3" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 481,
              columnNumber: 90
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 481,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 480,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenuContent, { children: [
            /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => setOpenHouseDialogOpen(true), children: "Schedule Open House" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 484,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => navigate(`/open-house?deal=${deal.id}`), children: [
              "View Open Houses (",
              dealOpenHouses.length,
              ")"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 485,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 483,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 479,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: () => setOfferDialogOpen(true), children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 489,
            columnNumber: 13
          }, this),
          " Add Offer ",
          dealOffers.length > 0 && `(${dealOffers.length})`
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 488,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: handleEmail, children: [
          /* @__PURE__ */ jsxDEV(Mail, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 492,
            columnNumber: 13
          }, this),
          " Email"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 491,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
          /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", children: [
            "Change Status ",
            /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-3 h-3" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 496,
              columnNumber: 93
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 496,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 495,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenuContent, { children: ["draft", "active", "pending", "archive"].map((s) => /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => handleChangeStatus(s), className: "capitalize", children: [
            deal.status === s && /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5 mr-1.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 501,
              columnNumber: 41
            }, this),
            s
          ] }, s, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 500,
            columnNumber: 17
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 498,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 494,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 475,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6", children: /* @__PURE__ */ jsxDEV("div", { className: "flex w-max min-w-full gap-1 sm:gap-0", children: TABS.map((tab) => /* @__PURE__ */ jsxDEV("button", { onClick: () => setActiveTab(tab), className: cn(
        "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
        activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      ), children: tab }, tab, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 512,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 510,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 509,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 451,
      columnNumber: 7
    }, this),
    activeTab === "Checklists" && /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 flex-col overflow-hidden xl:flex-row", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "w-full overflow-auto border-b p-4 space-y-6 xl:w-80 xl:flex-shrink-0 xl:border-b-0 xl:border-r", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Timeline" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 529,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Bell, { className: "w-3.5 h-3.5 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 530,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 528,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 relative", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "absolute left-[5px] top-2 bottom-2 w-px bg-border" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 533,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 relative", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 535,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "Listing Expiration" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 537,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: deal.listing_expiration || "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 538,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 536,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 534,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 relative", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 542,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "Listing Start Date" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 544,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: deal.listing_start_date || "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 545,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 543,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 541,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 532,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 527,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Details" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 553,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "MLS#" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 556,
                columnNumber: 19
              }, this),
              editingMls ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxDEV(Input, { value: mlsValue, onChange: (e) => setMlsValue(e.target.value), className: "h-7 w-28 text-xs", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleSaveMls() }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 559,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: handleSaveMls, className: "text-success", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 560,
                  columnNumber: 80
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 560,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: () => setEditingMls(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsxDEV(X, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 561,
                  columnNumber: 102
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 561,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 558,
                columnNumber: 21
              }, this) : deal.mls_number ? /* @__PURE__ */ jsxDEV("button", { onClick: () => {
                setMlsValue(deal.mls_number || "");
                setEditingMls(true);
              }, className: "text-foreground hover:text-primary", children: deal.mls_number }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 564,
                columnNumber: 21
              }, this) : /* @__PURE__ */ jsxDEV("button", { onClick: () => {
                setMlsValue("");
                setEditingMls(true);
              }, className: "text-primary text-sm hover:underline", children: "Add MLS# Number" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 566,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 555,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "Side" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 570,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-foreground capitalize", children: deal.representation_side }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 571,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 569,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "Type" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 574,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: deal.property_type }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 575,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 573,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 554,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 552,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Contacts" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 582,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
            contacts.map((c) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0", children: [
                c.firstName[0],
                c.lastName[0]
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 586,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-foreground", children: [
                  c.firstName,
                  " ",
                  c.lastName
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 588,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-muted-foreground sm:hidden", children: c.role }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 589,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 587,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "hidden text-xs text-muted-foreground sm:inline", children: c.role }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 591,
                columnNumber: 21
              }, this)
            ] }, c.id, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 585,
              columnNumber: 19
            }, this)),
            /* @__PURE__ */ jsxDEV("button", { onClick: () => setAddContactDialogOpen(true), className: "text-sm text-primary hover:underline flex items-center gap-1", children: [
              /* @__PURE__ */ jsxDEV(UserPlus, { className: "w-3 h-3" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 595,
                columnNumber: 19
              }, this),
              " Add a New Contact"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 594,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 583,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 581,
          columnNumber: 13
        }, this),
        dealOffers.length > 0 && /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: [
            "Offers (",
            dealOffers.length,
            ")"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 603,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: dealOffers.map((o) => /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-foreground font-medium", children: o.amount }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 608,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground ml-2", children: [
                "- ",
                o.buyer_name
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 609,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 607,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("button", { onClick: () => deleteOffer.mutateAsync({ id: o.id, dealId: id }), className: "text-destructive hover:bg-muted rounded p-0.5", children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3 h-3" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 611,
              columnNumber: 156
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 611,
              columnNumber: 23
            }, this)
          ] }, o.id, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 606,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 604,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 602,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "CDA Information" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 620,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "Deal #" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 622,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: deal.id.slice(0, 8) }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 623,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 621,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 619,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Listing Information" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 629,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "List Price" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 631,
              columnNumber: 17
            }, this),
            editingPrice ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxDEV(Input, { value: priceValue, onChange: (e) => setPriceValue(e.target.value), className: "h-7 w-28 text-xs", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleSavePrice() }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 634,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("button", { onClick: handleSavePrice, className: "text-success", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 635,
                columnNumber: 80
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 635,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("button", { onClick: () => setEditingPrice(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsxDEV(X, { className: "w-3.5 h-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 636,
                columnNumber: 102
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 636,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 633,
              columnNumber: 19
            }, this) : /* @__PURE__ */ jsxDEV("button", { onClick: () => {
              setPriceValue(deal.price || "");
              setEditingPrice(true);
            }, className: "text-foreground hover:text-primary", children: formatPriceWithCommas(deal.price || "") }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 639,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 630,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 628,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full text-xs gap-1.5", onClick: handleDownloadArchive, children: [
          /* @__PURE__ */ jsxDEV(Download, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 645,
            columnNumber: 15
          }, this),
          " Download Archive"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 644,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 525,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-4 sm:p-5", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: "Checklist" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 652,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-muted-foreground", children: [
              completedChecklistCount,
              " of ",
              checklistItems.length,
              " completed"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 654,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "text-xs gap-1.5",
                onClick: () => setAddFormsOpen(true),
                children: [
                  /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 663,
                    columnNumber: 19
                  }, this),
                  "Add Hidden Forms",
                  addableForms.length > 0 ? ` (${addableForms.length})` : ""
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 657,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 653,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 651,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "border rounded-md overflow-hidden", children: groupedChecklistSections.map((section, sectionIndex) => /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { className: cn(
            "px-3 py-2 bg-muted/50 border-b",
            sectionIndex > 0 && "border-t"
          ), children: /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: section.title }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 676,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 672,
            columnNumber: 19
          }, this),
          section.items.map((item) => {
            const isCompleted = !!item.completed;
            const linkedDocument = checklistDocumentsByItemId.get(item.id);
            const isPdfRowOpen = expandedChecklistItems.has(item.id);
            return /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: cn(
                "flex items-center px-3 py-3 border-b last:border-b-0 group transition-colors",
                isCompleted && "bg-success/5"
              ), children: [
                /* @__PURE__ */ jsxDEV(GripVertical, { className: "w-4 h-4 text-muted-foreground/40 mr-2 flex-shrink-0 cursor-grab" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 690,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Checkbox,
                  {
                    checked: isCompleted,
                    onCheckedChange: (checked) => handleToggleChecklistCompleted(item.id, checked === true),
                    className: "mr-2 flex-shrink-0"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 691,
                    columnNumber: 27
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("div", { className: "mr-2 h-4 w-4 flex-shrink-0" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 696,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: cn(
                  "text-sm flex-1",
                  isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                ), children: item.name }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 697,
                  columnNumber: 27
                }, this),
                isCompleted && /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-medium px-2 py-0.5 rounded-full mr-2 bg-success/10 text-success", children: "Complete" }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 704,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 mr-1",
                    "aria-label": `${isPdfRowOpen ? "Hide" : "Show"} PDF row for ${item.name}`,
                    onClick: () => handleToggleChecklistPdfRow(item.id),
                    children: /* @__PURE__ */ jsxDEV(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", isPdfRowOpen && "rotate-180") }, void 0, false, {
                      fileName: "/dev-server/src/pages/DealDetail.tsx",
                      lineNumber: 715,
                      columnNumber: 29
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 708,
                    columnNumber: 27
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-muted-foreground hover:text-destructive",
                    onClick: () => handleDeleteChecklist(item.id),
                    "aria-label": `Delete ${item.name}`,
                    children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
                      fileName: "/dev-server/src/pages/DealDetail.tsx",
                      lineNumber: 725,
                      columnNumber: 29
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 718,
                    columnNumber: 27
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 686,
                columnNumber: 25
              }, this),
              isPdfRowOpen && /* @__PURE__ */ jsxDEV(
                ChecklistDocumentPanel,
                {
                  dealId: deal.id,
                  itemId: item.id,
                  itemName: item.name,
                  defaultDocument: linkedDocument
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 729,
                  columnNumber: 27
                },
                this
              )
            ] }, item.id, true, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 685,
              columnNumber: 23
            }, this);
          })
        ] }, section.id, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 671,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 669,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 650,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 523,
      columnNumber: 9
    }, this),
    activeTab === "Photos" && /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground", children: [
          "Photos (",
          dealPhotos.length,
          ")"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 752,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handlePhotoUpload }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 754,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "text-xs gap-1.5", onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          }, disabled: uploadPhoto.isPending, children: [
            /* @__PURE__ */ jsxDEV(Upload, { className: "w-3.5 h-3.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 756,
              columnNumber: 17
            }, this),
            " ",
            uploadPhoto.isPending ? "Uploading..." : "Upload Photos"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 755,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 753,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 751,
        columnNumber: 11
      }, this),
      dealPhotos.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg", children: [
        /* @__PURE__ */ jsxDEV(Image, { className: "w-12 h-12 text-muted-foreground mb-3" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 762,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-3", children: "No photos yet. Upload photos of this property." }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 763,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        }, children: "Choose Files" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 764,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 761,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: dealPhotos.map((photo) => /* @__PURE__ */ jsxDEV("div", { className: "relative group rounded-lg overflow-hidden border bg-muted", children: [
        /* @__PURE__ */ jsxDEV("img", { src: photo.url, alt: photo.name, className: "w-full h-40 object-cover" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 770,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: () => deletePhoto.mutateAsync({ dealId: id, name: photo.name }), className: "absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5 text-destructive" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 772,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 771,
          columnNumber: 19
        }, this)
      ] }, photo.name, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 769,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 767,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 750,
      columnNumber: 9
    }, this),
    activeTab === "Tasks" && /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxDEV(Input, { placeholder: "Add a task for this deal...", value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAddDealTask(), className: "text-sm" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 785,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: handleAddDealTask, disabled: !newTaskTitle.trim(), children: "Add" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 786,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 784,
        columnNumber: 11
      }, this),
      dealTasks.length === 0 ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No tasks for this deal yet." }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 789,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: dealTasks.map((task) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 border rounded-md px-3 py-2", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-foreground flex-1", children: task.title }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 794,
          columnNumber: 19
        }, this),
        task.due_date && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: format(new Date(task.due_date), "MMM d") }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 795,
          columnNumber: 37
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: () => deleteTask.mutateAsync(task.id), className: "text-destructive hover:bg-muted rounded p-1", children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 796,
          columnNumber: 131
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 796,
          columnNumber: 19
        }, this)
      ] }, task.id, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 793,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 791,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 783,
      columnNumber: 9
    }, this),
    activeTab === "Notes" && /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex flex-col gap-2 sm:flex-row sm:items-start", children: [
        /* @__PURE__ */ jsxDEV(Textarea, { placeholder: "Write a note...", value: newNote, onChange: (e) => setNewNote(e.target.value), className: "text-sm min-h-[80px]" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 808,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: handleAddNote, disabled: !newNote.trim() || createNote.isPending, children: "Add" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 809,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 807,
        columnNumber: 11
      }, this),
      dealNotes.length === 0 ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No notes yet." }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 812,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: dealNotes.map((note) => /* @__PURE__ */ jsxDEV("div", { className: "border rounded-md px-4 py-3", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-foreground whitespace-pre-wrap", children: note.content }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 817,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mt-2", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: note.created_at ? format(new Date(note.created_at), "MMM d, yyyy h:mm a") : "" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 819,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("button", { onClick: () => deleteNote.mutateAsync({ id: note.id, dealId: id }), className: "text-destructive hover:bg-muted rounded p-1", children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3 h-3" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 820,
            columnNumber: 154
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 820,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 818,
          columnNumber: 19
        }, this)
      ] }, note.id, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 816,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 814,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 806,
      columnNumber: 9
    }, this),
    activeTab === "Marketing" && /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold text-foreground", children: "Marketing Studio" }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 833,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 832,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-2 mb-6", children: [
        dealRecents.length > 0 && /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setShowRecentOnly(!showRecentOnly);
              setMarketingCategory(null);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5", showRecentOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: [
              /* @__PURE__ */ jsxDEV(Clock, { className: "h-3 w-3" }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 843,
                columnNumber: 17
              }, this),
              "Recent",
              /* @__PURE__ */ jsxDEV("span", { className: cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", showRecentOnly ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"), children: dealRecents.length }, void 0, false, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 845,
                columnNumber: 17
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 839,
            columnNumber: 15
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setMarketingCategory(null);
              setShowRecentOnly(false);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", !marketingCategory && !showRecentOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: "All Templates"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 850,
            columnNumber: 13
          },
          this
        ),
        TEMPLATE_CATEGORIES.map((cat) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setMarketingCategory(marketingCategory === cat ? null : cat);
              setShowRecentOnly(false);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", marketingCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: cat
          },
          cat,
          false,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 857,
            columnNumber: 15
          },
          this
        ))
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 836,
        columnNumber: 11
      }, this),
      TEMPLATES.filter((t) => {
        if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
        return !marketingCategory || t.category === marketingCategory;
      }).length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-5xl mb-4", children: "🎨" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 872,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("h4", { className: "text-base font-semibold text-foreground mb-1", children: "Templates coming soon" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 873,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "New designs are being built to order." }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 874,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 871,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", children: TEMPLATES.filter((t) => {
        if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
        return !marketingCategory || t.category === marketingCategory;
      }).map((template) => {
        const PREVIEW_W = 200;
        const naturalH = Math.round(template.height * (PREVIEW_W / template.width));
        const THUMB_H = Math.min(naturalH, 260);
        const thumbScale = PREVIEW_W / template.width;
        const typeLabel = template.type === "flyer" ? "Flyer" : template.type === "post" ? "Post" : "Story";
        return /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => navigate(`/transactions/${id}/marketing?template=${template.id}`),
            className: "group border-2 border-transparent rounded-xl overflow-hidden bg-background hover:shadow-xl hover:border-primary transition-all hover:-translate-y-0.5 text-left flex flex-col w-full",
            children: [
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "relative overflow-hidden bg-muted shrink-0",
                  style: { height: THUMB_H, width: "100%" },
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      "div",
                      {
                        style: {
                          transform: `scale(${thumbScale})`,
                          transformOrigin: "top left",
                          width: template.width,
                          height: template.height,
                          pointerEvents: "none",
                          userSelect: "none"
                        },
                        children: template.render({
                          ...getDefaultTemplateData(deal, template.category),
                          photos: dealPhotos.map((p) => p.url)
                        }, false)
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/DealDetail.tsx",
                        lineNumber: 899,
                        columnNumber: 21
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("span", { className: "opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg", children: "Open in Editor" }, void 0, false, {
                      fileName: "/dev-server/src/pages/DealDetail.tsx",
                      lineNumber: 916,
                      columnNumber: 23
                    }, this) }, void 0, false, {
                      fileName: "/dev-server/src/pages/DealDetail.tsx",
                      lineNumber: 915,
                      columnNumber: 21
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 895,
                  columnNumber: 19
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "px-3 py-2.5 border-t flex flex-col gap-1", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-bold text-foreground leading-tight", children: template.name }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 923,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-muted-foreground", children: template.category }, void 0, false, {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 925,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded", children: typeLabel }, void 0, false, {
                    fileName: "/dev-server/src/pages/DealDetail.tsx",
                    lineNumber: 926,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 924,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-[9px] text-muted-foreground/50 tabular-nums", children: [
                  template.width,
                  "×",
                  template.height,
                  "px"
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 928,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 922,
                columnNumber: 19
              }, this)
            ]
          },
          template.id,
          true,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 889,
            columnNumber: 17
          },
          this
        );
      }) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 877,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 831,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: offerDialogOpen, onOpenChange: setOfferDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Add Offer" }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 940,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 940,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Buyer Name *" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 942,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: offerForm.buyer_name, onChange: (e) => setOfferForm((f) => ({ ...f, buyer_name: e.target.value })), className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 942,
            columnNumber: 65
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 942,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Amount *" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 943,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: offerForm.amount, onChange: (e) => setOfferForm((f) => ({ ...f, amount: e.target.value })), placeholder: "$500,000", className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 943,
            columnNumber: 61
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 943,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Notes" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 944,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: offerForm.notes, onChange: (e) => setOfferForm((f) => ({ ...f, notes: e.target.value })), className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 944,
            columnNumber: 58
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 944,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { className: "w-full", onClick: handleCreateOffer, disabled: createOffer.isPending, children: "Add Offer" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 945,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 941,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 939,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 938,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: openHouseDialogOpen, onOpenChange: setOpenHouseDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Schedule Open House" }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 952,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 952,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Date *" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 954,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { type: "date", value: ohForm.scheduled_date, onChange: (e) => setOhForm((f) => ({ ...f, scheduled_date: e.target.value })), className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 954,
            columnNumber: 59
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 954,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Start Time" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 956,
              columnNumber: 20
            }, this),
            /* @__PURE__ */ jsxDEV(Input, { value: ohForm.start_time, onChange: (e) => setOhForm((f) => ({ ...f, start_time: e.target.value })), className: "mt-1" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 956,
              columnNumber: 65
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 956,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "End Time" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 957,
              columnNumber: 20
            }, this),
            /* @__PURE__ */ jsxDEV(Input, { value: ohForm.end_time, onChange: (e) => setOhForm((f) => ({ ...f, end_time: e.target.value })), className: "mt-1" }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 957,
              columnNumber: 63
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 957,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 955,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Notes" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 959,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: ohForm.notes, onChange: (e) => setOhForm((f) => ({ ...f, notes: e.target.value })), className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 959,
            columnNumber: 58
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 959,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { className: "w-full", onClick: handleScheduleOH, disabled: createOH.isPending, children: "Schedule" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 960,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 953,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 951,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 950,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: addContactDialogOpen, onOpenChange: (open) => {
      setAddContactDialogOpen(open);
      if (!open) {
        setContactSearch("");
        setContactDropdownOpen(false);
      }
    }, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Add Contact to Deal" }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 967,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 967,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Contact" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 970,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              value: contactSearch,
              onChange: (e) => {
                setContactSearch(e.target.value);
                setContactDropdownOpen(true);
                setSelectedContactId("");
              },
              onFocus: () => setContactDropdownOpen(true),
              placeholder: "Search contacts...",
              className: "mt-1",
              autoComplete: "off"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 971,
              columnNumber: 15
            },
            this
          ),
          contactDropdownOpen && contactSearch.length > 0 && (() => {
            const filtered = allContacts.filter(
              (c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) || c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())
            );
            return filtered.length > 0 ? /* @__PURE__ */ jsxDEV("div", { className: "absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md", children: filtered.map((c) => /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                className: "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                onClick: () => {
                  setSelectedContactId(c.id);
                  setContactSearch(`${c.first_name} ${c.last_name}`);
                  setContactDropdownOpen(false);
                },
                children: [
                  c.first_name,
                  " ",
                  c.last_name,
                  c.email ? ` - ${c.email}` : ""
                ]
              },
              c.id,
              true,
              {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 991,
                columnNumber: 23
              },
              this
            )) }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 989,
              columnNumber: 19
            }, this) : null;
          })()
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 969,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Role" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1009,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Select, { value: contactRole, onValueChange: setContactRole, children: [
            /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Buyer, Seller, Agent..." }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1011,
              columnNumber: 49
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1011,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(SelectContent, { children: CONTACT_ROLES.map((role) => /* @__PURE__ */ jsxDEV(SelectItem, { value: role, children: role }, role, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1014,
              columnNumber: 21
            }, this)) }, void 0, false, {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1012,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1010,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1008,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { className: "w-full", onClick: handleAddContact, disabled: addDealContact.isPending, children: "Add to Deal" }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1019,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 968,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 966,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 965,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: addFormsOpen, onOpenChange: (open) => {
      setAddFormsOpen(open);
      if (!open) {
        setHiddenFormSearch("");
        setSelectedHiddenForms(/* @__PURE__ */ new Set());
      }
    }, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Add Hidden Forms" }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 1033,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 1032,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxDEV("span", { children: [
            addableForms.length,
            " hidden forms available"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1037,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("span", { children: [
            selectedHiddenForms.size,
            " selected"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1038,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1036,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            value: hiddenFormSearch,
            onChange: (event) => setHiddenFormSearch(event.target.value),
            placeholder: "Search hidden forms..."
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1040,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "text-xs",
              onClick: () => setSelectedHiddenForms(new Set(filteredAddableForms.map((form) => form.file_name))),
              disabled: filteredAddableForms.length === 0,
              children: "Select Filtered"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1046,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "text-xs",
              onClick: () => setSelectedHiddenForms(/* @__PURE__ */ new Set()),
              disabled: selectedHiddenForms.size === 0,
              children: "Clear"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1056,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1045,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "max-h-[420px] overflow-auto border rounded-md", children: filteredAddableForms.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-8 text-sm text-center text-muted-foreground", children: "No hidden forms match your search." }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1069,
          columnNumber: 17
        }, this) : filteredAddableForms.map((form) => /* @__PURE__ */ jsxDEV(
          "label",
          {
            className: "flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/40",
            children: [
              /* @__PURE__ */ jsxDEV(
                Checkbox,
                {
                  checked: selectedHiddenForms.has(form.file_name),
                  onCheckedChange: () => handleToggleHiddenForm(form.file_name)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 1078,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-foreground", children: form.checklistName }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 1083,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] text-muted-foreground truncate", children: form.file_name }, void 0, false, {
                  fileName: "/dev-server/src/pages/DealDetail.tsx",
                  lineNumber: 1084,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/DealDetail.tsx",
                lineNumber: 1082,
                columnNumber: 21
              }, this)
            ]
          },
          form.file_name,
          true,
          {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1074,
            columnNumber: 19
          },
          this
        )) }, void 0, false, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1067,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { type: "button", variant: "ghost", onClick: () => setAddFormsOpen(false), children: "Cancel" }, void 0, false, {
            fileName: "/dev-server/src/pages/DealDetail.tsx",
            lineNumber: 1091,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              type: "button",
              onClick: handleAddHiddenForms,
              disabled: selectedHiddenForms.size === 0 || addChecklistItems.isPending,
              children: addChecklistItems.isPending ? "Adding..." : `Add ${selectedHiddenForms.size || ""}`.trim()
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/DealDetail.tsx",
              lineNumber: 1094,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/DealDetail.tsx",
          lineNumber: 1090,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/DealDetail.tsx",
        lineNumber: 1035,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 1031,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/DealDetail.tsx",
      lineNumber: 1024,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/DealDetail.tsx",
    lineNumber: 449,
    columnNumber: 5
  }, this);
}
export {
  DealDetail as default
};
