import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useMemo, useState } from "react";
import { l as loadMarketingRecents, u as useDealPhotos, a as useUploadDealPhoto, b as useDeleteDealPhoto, T as TEMPLATE_CATEGORIES, c as TEMPLATES, g as getDefaultTemplateData } from "./useDealPhotos-DSVN1rUD.js";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Upload, FileText, MoreHorizontal, Eye, ChevronDown, Plus, Mail, Check, Bell, X, UserPlus, Trash2, Download, GripVertical, Image, Clock } from "lucide-react";
import { s as supabase, B as Button, c as cn, a as useAuth, i as useContacts, I as Input, L as Label } from "../main.mjs";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { c as useDeal, d as useUpdateDeal, e as useDeleteChecklistItem, f as useAddDealContact, g as useAddChecklistItems, h as useToggleChecklistItem, r as resolveChecklistAdminDocument, i as buildAddableFormOptions, j as getChecklistSectionId, k as getChecklistSectionTitle } from "./useDeals-CMdNuTy4.js";
import { u as useOpenHouses, a as useCreateOpenHouse } from "./useOpenHouses-C0QWM_XJ.js";
import { u as useTasks, a as useCreateTask, b as useDeleteTask } from "./useTasks-B-9jj9rB.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-BMACWGKM.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-Gt8dxHPr.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-9L1xmEk2.js";
import { C as Checkbox } from "./checkbox-D50hG86N.js";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
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
  return /* @__PURE__ */ jsxs("div", { className: "border-b bg-muted/20 px-12 py-3", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-3 flex flex-wrap items-center justify-end gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "application/pdf,.pdf",
          multiple: true,
          className: "hidden",
          onChange: handleUpload
        }
      ),
      /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
            uploadChecklistDocument.isPending ? "Uploading..." : "Upload PDF"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-md border bg-background", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm text-muted-foreground", children: "Loading PDFs..." }) : uploadedDocumentsError ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm text-destructive", children: "Could not load uploaded PDFs right now." }) : documentRows.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm text-muted-foreground", children: "No PDFs yet. Upload a signed or completed PDF for this checklist item." }) : documentRows.map((document2, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t"),
        children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 flex-shrink-0 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm text-foreground", children: document2.fileName }),
            /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                  document2.kind === "default" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                ),
                children: document2.kind === "default" ? "Default blank PDF" : "Uploaded PDF"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 text-muted-foreground",
                "aria-label": `PDF actions for ${document2.fileName}`,
                children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
              }
            ) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => openDocument(document2), children: "View PDF" }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => downloadDocument(document2), children: "Download PDF" }),
              document2.kind === "uploaded" && /* @__PURE__ */ jsx(
                DropdownMenuItem,
                {
                  onClick: () => handleDelete(document2),
                  className: "text-destructive focus:text-destructive",
                  disabled: deleteChecklistDocument.isPending,
                  children: "Delete PDF"
                }
              )
            ] })
          ] })
        ]
      },
      document2.id
    )) })
  ] });
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
    return /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading deal..." }) });
  }
  if (!deal) {
    return /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Deal not found" }) });
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b px-4 py-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-foreground", children: deal.address }),
            /* @__PURE__ */ jsx("span", { className: cn(
              "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
              deal.status === "active" ? "bg-success/10 text-success" : deal.status === "pending" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
            ), children: deal.status }),
            isVisibleToOffice && /* @__PURE__ */ jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: "Office Visible" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            deal.city,
            ", ",
            deal.state,
            " ",
            deal.zip
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 self-start lg:self-auto", children: contacts.slice(0, 3).map((c) => /* @__PURE__ */ jsxs("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium", title: `${c.firstName} ${c.lastName}`, children: [
          c.firstName[0],
          c.lastName[0]
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-stretch gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: handleToggleVisibility, disabled: sendingToOffice, children: [
          /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }),
          " ",
          sendingToOffice ? "Sending…" : isVisibleToOffice ? "Sent to Office" : "Send to Office"
        ] }),
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", children: [
            "Open House ",
            /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3" })
          ] }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { children: [
            /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => setOpenHouseDialogOpen(true), children: "Schedule Open House" }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => navigate(`/open-house?deal=${deal.id}`), children: [
              "View Open Houses (",
              dealOpenHouses.length,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: () => setOfferDialogOpen(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
          " Add Offer ",
          dealOffers.length > 0 && `(${dealOffers.length})`
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", onClick: handleEmail, children: [
          /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5" }),
          " Email"
        ] }),
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-xs gap-1.5", children: [
            "Change Status ",
            /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3" })
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuContent, { children: ["draft", "active", "pending", "archive"].map((s) => /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleChangeStatus(s), className: "capitalize", children: [
            deal.status === s && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 mr-1.5" }),
            s
          ] }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6", children: /* @__PURE__ */ jsx("div", { className: "flex w-max min-w-full gap-1 sm:gap-0", children: TABS.map((tab) => /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab(tab), className: cn(
        "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
        activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      ), children: tab }, tab)) }) })
    ] }),
    activeTab === "Checklists" && /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col overflow-hidden xl:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-full overflow-auto border-b p-4 space-y-6 xl:w-80 xl:flex-shrink-0 xl:border-b-0 xl:border-r", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Timeline" }),
            /* @__PURE__ */ jsx(Bell, { className: "w-3.5 h-3.5 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-[5px] top-2 bottom-2 w-px bg-border" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 relative", children: [
              /* @__PURE__ */ jsx("div", { className: "w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Listing Expiration" }),
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: deal.listing_expiration || "-" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 relative", children: [
              /* @__PURE__ */ jsx("div", { className: "w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Listing Start Date" }),
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: deal.listing_start_date || "-" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Details" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "MLS#" }),
              editingMls ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Input, { value: mlsValue, onChange: (e) => setMlsValue(e.target.value), className: "h-7 w-28 text-xs", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleSaveMls() }),
                /* @__PURE__ */ jsx("button", { onClick: handleSaveMls, className: "text-success", children: /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => setEditingMls(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" }) })
              ] }) : deal.mls_number ? /* @__PURE__ */ jsx("button", { onClick: () => {
                setMlsValue(deal.mls_number || "");
                setEditingMls(true);
              }, className: "text-foreground hover:text-primary", children: deal.mls_number }) : /* @__PURE__ */ jsx("button", { onClick: () => {
                setMlsValue("");
                setEditingMls(true);
              }, className: "text-primary text-sm hover:underline", children: "Add MLS# Number" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Side" }),
              /* @__PURE__ */ jsx("span", { className: "text-foreground capitalize", children: deal.representation_side })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Type" }),
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: deal.property_type })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Contacts" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            contacts.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0", children: [
                c.firstName[0],
                c.lastName[0]
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-foreground", children: [
                  c.firstName,
                  " ",
                  c.lastName
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground sm:hidden", children: c.role })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "hidden text-xs text-muted-foreground sm:inline", children: c.role })
            ] }, c.id)),
            /* @__PURE__ */ jsxs("button", { onClick: () => setAddContactDialogOpen(true), className: "text-sm text-primary hover:underline flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "w-3 h-3" }),
              " Add a New Contact"
            ] })
          ] })
        ] }),
        dealOffers.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: [
            "Offers (",
            dealOffers.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: dealOffers.map((o) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: o.amount }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground ml-2", children: [
                "- ",
                o.buyer_name
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => deleteOffer.mutateAsync({ id: o.id, dealId: id }), className: "text-destructive hover:bg-muted rounded p-0.5", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }) })
          ] }, o.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "CDA Information" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 text-sm sm:flex-row sm:justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Deal #" }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: deal.id.slice(0, 8) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Listing Information" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "List Price" }),
            editingPrice ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Input, { value: priceValue, onChange: (e) => setPriceValue(e.target.value), className: "h-7 w-28 text-xs", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleSavePrice() }),
              /* @__PURE__ */ jsx("button", { onClick: handleSavePrice, className: "text-success", children: /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => setEditingPrice(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" }) })
            ] }) : /* @__PURE__ */ jsx("button", { onClick: () => {
              setPriceValue(deal.price || "");
              setEditingPrice(true);
            }, className: "text-foreground hover:text-primary", children: formatPriceWithCommas(deal.price || "") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "w-full text-xs gap-1.5", onClick: handleDownloadArchive, children: [
          /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
          " Download Archive"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 sm:p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Checklist" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              completedChecklistCount,
              " of ",
              checklistItems.length,
              " completed"
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "text-xs gap-1.5",
                onClick: () => setAddFormsOpen(true),
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  "Add Hidden Forms",
                  addableForms.length > 0 ? ` (${addableForms.length})` : ""
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border rounded-md overflow-hidden", children: groupedChecklistSections.map((section, sectionIndex) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "px-3 py-2 bg-muted/50 border-b",
            sectionIndex > 0 && "border-t"
          ), children: /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: section.title }) }),
          section.items.map((item) => {
            const isCompleted = !!item.completed;
            const linkedDocument = checklistDocumentsByItemId.get(item.id);
            const isPdfRowOpen = expandedChecklistItems.has(item.id);
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: cn(
                "flex items-center px-3 py-3 border-b last:border-b-0 group transition-colors",
                isCompleted && "bg-success/5"
              ), children: [
                /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-muted-foreground/40 mr-2 flex-shrink-0 cursor-grab" }),
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: isCompleted,
                    onCheckedChange: (checked) => handleToggleChecklistCompleted(item.id, checked === true),
                    className: "mr-2 flex-shrink-0"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "mr-2 h-4 w-4 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: cn(
                  "text-sm flex-1",
                  isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                ), children: item.name }),
                isCompleted && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium px-2 py-0.5 rounded-full mr-2 bg-success/10 text-success", children: "Complete" }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 mr-1",
                    "aria-label": `${isPdfRowOpen ? "Hide" : "Show"} PDF row for ${item.name}`,
                    onClick: () => handleToggleChecklistPdfRow(item.id),
                    children: /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", isPdfRowOpen && "rotate-180") })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-muted-foreground hover:text-destructive",
                    onClick: () => handleDeleteChecklist(item.id),
                    "aria-label": `Delete ${item.name}`,
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }),
              isPdfRowOpen && /* @__PURE__ */ jsx(
                ChecklistDocumentPanel,
                {
                  dealId: deal.id,
                  itemId: item.id,
                  itemName: item.name,
                  defaultDocument: linkedDocument
                }
              )
            ] }, item.id);
          })
        ] }, section.id)) })
      ] })
    ] }),
    activeTab === "Photos" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-foreground", children: [
          "Photos (",
          dealPhotos.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handlePhotoUpload }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "text-xs gap-1.5", onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          }, disabled: uploadPhoto.isPending, children: [
            /* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }),
            " ",
            uploadPhoto.isPending ? "Uploading..." : "Upload Photos"
          ] })
        ] })
      ] }),
      dealPhotos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg", children: [
        /* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-muted-foreground mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "No photos yet. Upload photos of this property." }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        }, children: "Choose Files" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: dealPhotos.map((photo) => /* @__PURE__ */ jsxs("div", { className: "relative group rounded-lg overflow-hidden border bg-muted", children: [
        /* @__PURE__ */ jsx("img", { src: photo.url, alt: photo.name, className: "w-full h-40 object-cover" }),
        /* @__PURE__ */ jsx("button", { onClick: () => deletePhoto.mutateAsync({ dealId: id, name: photo.name }), className: "absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })
      ] }, photo.name)) })
    ] }),
    activeTab === "Tasks" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Add a task for this deal...", value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAddDealTask(), className: "text-sm" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleAddDealTask, disabled: !newTaskTitle.trim(), children: "Add" })
      ] }),
      dealTasks.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No tasks for this deal yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: dealTasks.map((task) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border rounded-md px-3 py-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground flex-1", children: task.title }),
        task.due_date && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: format(new Date(task.due_date), "MMM d") }),
        /* @__PURE__ */ jsx("button", { onClick: () => deleteTask.mutateAsync(task.id), className: "text-destructive hover:bg-muted rounded p-1", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }) })
      ] }, task.id)) })
    ] }),
    activeTab === "Notes" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-2 sm:flex-row sm:items-start", children: [
        /* @__PURE__ */ jsx(Textarea, { placeholder: "Write a note...", value: newNote, onChange: (e) => setNewNote(e.target.value), className: "text-sm min-h-[80px]" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleAddNote, disabled: !newNote.trim() || createNote.isPending, children: "Add" })
      ] }),
      dealNotes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No notes yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: dealNotes.map((note) => /* @__PURE__ */ jsxs("div", { className: "border rounded-md px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground whitespace-pre-wrap", children: note.content }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: note.created_at ? format(new Date(note.created_at), "MMM d, yyyy h:mm a") : "" }),
          /* @__PURE__ */ jsx("button", { onClick: () => deleteNote.mutateAsync({ id: note.id, dealId: id }), className: "text-destructive hover:bg-muted rounded p-1", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }) })
        ] })
      ] }, note.id)) })
    ] }),
    activeTab === "Marketing" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 sm:p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground", children: "Marketing Studio" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-6", children: [
        dealRecents.length > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setShowRecentOnly(!showRecentOnly);
              setMarketingCategory(null);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5", showRecentOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
              "Recent",
              /* @__PURE__ */ jsx("span", { className: cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", showRecentOnly ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"), children: dealRecents.length })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setMarketingCategory(null);
              setShowRecentOnly(false);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", !marketingCategory && !showRecentOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: "All Templates"
          }
        ),
        TEMPLATE_CATEGORIES.map((cat) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setMarketingCategory(marketingCategory === cat ? null : cat);
              setShowRecentOnly(false);
            },
            className: cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", marketingCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/30"),
            children: cat
          },
          cat
        ))
      ] }),
      TEMPLATES.filter((t) => {
        if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
        return !marketingCategory || t.category === marketingCategory;
      }).length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "🎨" }),
        /* @__PURE__ */ jsx("h4", { className: "text-base font-semibold text-foreground mb-1", children: "Templates coming soon" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "New designs are being built to order." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", children: TEMPLATES.filter((t) => {
        if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
        return !marketingCategory || t.category === marketingCategory;
      }).map((template) => {
        const PREVIEW_W = 200;
        const naturalH = Math.round(template.height * (PREVIEW_W / template.width));
        const THUMB_H = Math.min(naturalH, 260);
        const thumbScale = PREVIEW_W / template.width;
        const typeLabel = template.type === "flyer" ? "Flyer" : template.type === "post" ? "Post" : "Story";
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate(`/transactions/${id}/marketing?template=${template.id}`),
            className: "group border-2 border-transparent rounded-xl overflow-hidden bg-background hover:shadow-xl hover:border-primary transition-all hover:-translate-y-0.5 text-left flex flex-col w-full",
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative overflow-hidden bg-muted shrink-0",
                  style: { height: THUMB_H, width: "100%" },
                  children: [
                    /* @__PURE__ */ jsx(
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
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg", children: "Open in Editor" }) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-2.5 border-t flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-foreground leading-tight", children: template.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: template.category }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded", children: typeLabel })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-muted-foreground/50 tabular-nums", children: [
                  template.width,
                  "×",
                  template.height,
                  "px"
                ] })
              ] })
            ]
          },
          template.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: offerDialogOpen, onOpenChange: setOfferDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add Offer" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Buyer Name *" }),
          /* @__PURE__ */ jsx(Input, { value: offerForm.buyer_name, onChange: (e) => setOfferForm((f) => ({ ...f, buyer_name: e.target.value })), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Amount *" }),
          /* @__PURE__ */ jsx(Input, { value: offerForm.amount, onChange: (e) => setOfferForm((f) => ({ ...f, amount: e.target.value })), placeholder: "$500,000", className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsx(Input, { value: offerForm.notes, onChange: (e) => setOfferForm((f) => ({ ...f, notes: e.target.value })), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleCreateOffer, disabled: createOffer.isPending, children: "Add Offer" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openHouseDialogOpen, onOpenChange: setOpenHouseDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Schedule Open House" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Date *" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: ohForm.scheduled_date, onChange: (e) => setOhForm((f) => ({ ...f, scheduled_date: e.target.value })), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Start Time" }),
            /* @__PURE__ */ jsx(Input, { value: ohForm.start_time, onChange: (e) => setOhForm((f) => ({ ...f, start_time: e.target.value })), className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "End Time" }),
            /* @__PURE__ */ jsx(Input, { value: ohForm.end_time, onChange: (e) => setOhForm((f) => ({ ...f, end_time: e.target.value })), className: "mt-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsx(Input, { value: ohForm.notes, onChange: (e) => setOhForm((f) => ({ ...f, notes: e.target.value })), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleScheduleOH, disabled: createOH.isPending, children: "Schedule" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addContactDialogOpen, onOpenChange: (open) => {
      setAddContactDialogOpen(open);
      if (!open) {
        setContactSearch("");
        setContactDropdownOpen(false);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add Contact to Deal" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Contact" }),
          /* @__PURE__ */ jsx(
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
            }
          ),
          contactDropdownOpen && contactSearch.length > 0 && (() => {
            const filtered = allContacts.filter(
              (c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) || c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())
            );
            return filtered.length > 0 ? /* @__PURE__ */ jsx("div", { className: "absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md", children: filtered.map((c) => /* @__PURE__ */ jsxs(
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
              c.id
            )) }) : null;
          })()
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Role" }),
          /* @__PURE__ */ jsxs(Select, { value: contactRole, onValueChange: setContactRole, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Buyer, Seller, Agent..." }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: CONTACT_ROLES.map((role) => /* @__PURE__ */ jsx(SelectItem, { value: role, children: role }, role)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleAddContact, disabled: addDealContact.isPending, children: "Add to Deal" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addFormsOpen, onOpenChange: (open) => {
      setAddFormsOpen(open);
      if (!open) {
        setHiddenFormSearch("");
        setSelectedHiddenForms(/* @__PURE__ */ new Set());
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add Hidden Forms" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            addableForms.length,
            " hidden forms available"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            selectedHiddenForms.size,
            " selected"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            value: hiddenFormSearch,
            onChange: (event) => setHiddenFormSearch(event.target.value),
            placeholder: "Search hidden forms..."
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "text-xs",
              onClick: () => setSelectedHiddenForms(new Set(filteredAddableForms.map((form) => form.file_name))),
              disabled: filteredAddableForms.length === 0,
              children: "Select Filtered"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "text-xs",
              onClick: () => setSelectedHiddenForms(/* @__PURE__ */ new Set()),
              disabled: selectedHiddenForms.size === 0,
              children: "Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[420px] overflow-auto border rounded-md", children: filteredAddableForms.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-8 text-sm text-center text-muted-foreground", children: "No hidden forms match your search." }) : filteredAddableForms.map((form) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: "flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/40",
            children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: selectedHiddenForms.has(form.file_name),
                  onCheckedChange: () => handleToggleHiddenForm(form.file_name)
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-foreground", children: form.checklistName }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: form.file_name })
              ] })
            ]
          },
          form.file_name
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setAddFormsOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              onClick: handleAddHiddenForms,
              disabled: selectedHiddenForms.size === 0 || addChecklistItems.isPending,
              children: addChecklistItems.isPending ? "Adding..." : `Add ${selectedHiddenForms.size || ""}`.trim()
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  DealDetail as default
};
