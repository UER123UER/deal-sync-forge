import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { a as useAuth, u as useToast, s as supabase, c as cn, B as Button, L as Label, I as Input } from "../main.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-D3uDNDlq.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-9L1xmEk2.js";
import { User, Camera, Trash2, Phone, Building2, BadgeCheck, Lock, EyeOff, Eye, CreditCard, Plus, Landmark, X, DollarSign, LogOut, XCircle, CheckCircle2 } from "lucide-react";
import { v as validateRoutingNumber, a as validateAccountNumber, b as validateAccountConfirm } from "./bankingValidation-z--2UZA-.js";
import "vite-react-ssg";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "sonner";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function FieldHint({ value, result }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("p", { className: cn("flex items-center gap-1 text-xs mt-1", result.valid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"), children: [
    result.valid ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3 shrink-0" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-3 h-3 shrink-0" }),
    result.message
  ] });
}
function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [brokerageName, setBrokerageName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAcctHolder, setNewAcctHolder] = useState("");
  const [newAcctType, setNewAcctType] = useState("checking");
  const [newRouting, setNewRouting] = useState("");
  const [newAccountNum, setNewAccountNum] = useState("");
  const [newAccountNumConfirm, setNewAccountNumConfirm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showAddDirectDeposit, setShowAddDirectDeposit] = useState(false);
  const [directDeposits, setDirectDeposits] = useState([]);
  const [directDepositLoading, setDirectDepositLoading] = useState(true);
  const [addingDeposit, setAddingDeposit] = useState(false);
  const [ddAgentName, setDdAgentName] = useState("");
  const [ddBankName, setDdBankName] = useState("");
  const [ddRouting, setDdRouting] = useState("");
  const [ddAccountNum, setDdAccountNum] = useState("");
  const [ddAccountType, setDdAccountType] = useState("checking");
  const [ddDeletingId, setDdDeletingId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [signingOut, setSigningOut] = useState(false);
  useState("idle");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteStep, setDeleteStep] = useState("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const billingRoutingResult = validateRoutingNumber(newRouting);
  const billingAccountResult = validateAccountNumber(newAccountNum);
  const billingConfirmResult = validateAccountConfirm(newAccountNum, newAccountNumConfirm);
  const billingFormValid = newAcctHolder.trim().length > 0 && billingRoutingResult.valid && billingAccountResult.valid && billingConfirmResult.valid;
  const ddRoutingResult = validateRoutingNumber(ddRouting);
  const ddAccountResult = validateAccountNumber(ddAccountNum);
  const ddFormValid = ddAgentName.trim().length > 0 && ddRoutingResult.valid && ddAccountResult.valid;
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setBrokerageName(profile.brokerage_name ?? "");
      setLicenseNumber(profile.license_number ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);
  useEffect(() => {
    if (!user) return;
    supabase.from("bank_accounts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setBankAccounts(data ?? []);
      setBillingLoading(false);
    });
  }, [user]);
  useEffect(() => {
    if (!user) return;
    supabase.from("direct_deposits").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setDirectDeposits(data ?? []);
      setDirectDepositLoading(false);
    });
  }, [user]);
  const handleAvatarUpload = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    e.target.value = "";
    if (!file || !user) return;
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      toast({ title: "File too large", description: "Please choose an image under 5 MB.", variant: "destructive" });
      return;
    }
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setAvatarUploading(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: dbError } = await supabase.from("profiles").update({ avatar_url: bustedUrl }).eq("id", user.id);
    setAvatarUploading(false);
    if (dbError) {
      toast({ title: "Could not save avatar", description: dbError.message, variant: "destructive" });
    } else {
      setAvatarUrl(bustedUrl);
      refreshProfile == null ? void 0 : refreshProfile();
      toast({ title: "Profile photo updated ✓" });
    }
  };
  const handleAvatarRemove = async () => {
    if (!user || !avatarUrl) return;
    setAvatarUploading(true);
    const { data: files } = await supabase.storage.from("avatars").list(user.id);
    if (files && files.length > 0) {
      await supabase.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`));
    }
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setAvatarUrl(null);
    setAvatarUploading(false);
    refreshProfile == null ? void 0 : refreshProfile();
    toast({ title: "Profile photo removed" });
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      phone,
      brokerage_name: brokerageName,
      license_number: licenseNumber
    }).eq("id", user.id);
    setProfileLoading(false);
    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      refreshProfile == null ? void 0 : refreshProfile();
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: "Current password required", description: "Enter your current password to continue.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast({ title: "Password too weak", description: "Must include at least one lowercase letter, one uppercase letter, and one number.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword === currentPassword) {
      toast({ title: "Same password", description: "New password must be different from your current one.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const email = (user == null ? void 0 : user.email) ?? "";
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) {
      setPasswordLoading(false);
      toast({ title: "Incorrect current password", description: "Please check your current password and try again.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast({ title: "Error updating password", description: error.message, variant: "destructive" });
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password has been changed." });
    }
  };
  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    if (!user || !billingFormValid) return;
    setAddingAccount(true);
    const last4 = newAccountNum.slice(-4);
    const { data, error } = await supabase.from("bank_accounts").insert({
      user_id: user.id,
      account_holder_name: newAcctHolder.trim(),
      routing_number: newRouting,
      account_number_last4: last4,
      account_type: newAcctType
    }).select().single();
    setAddingAccount(false);
    if (error) {
      toast({ title: "Error saving account", description: error.message, variant: "destructive" });
    } else {
      setBankAccounts((prev) => [data, ...prev]);
      setNewAcctHolder("");
      setNewRouting("");
      setNewAccountNum("");
      setNewAccountNumConfirm("");
      setNewAcctType("checking");
      setShowAddAccount(false);
      toast({ title: "Bank account added ✓" });
    }
  };
  const handleDeleteBankAccount = async (id) => {
    setDeletingId(id);
    const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Error deleting account", description: error.message, variant: "destructive" });
    } else {
      setBankAccounts((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Bank account removed" });
    }
  };
  const handleAddDirectDeposit = async (e) => {
    e.preventDefault();
    if (!user || !ddFormValid) return;
    setAddingDeposit(true);
    const last4 = ddAccountNum.slice(-4);
    const { data, error } = await supabase.from("direct_deposits").insert({
      owner_id: user.id,
      agent_name: ddAgentName.trim(),
      bank_name: ddBankName.trim() || null,
      routing_number: ddRouting,
      account_number_last4: last4,
      account_type: ddAccountType
    }).select().single();
    setAddingDeposit(false);
    if (error) {
      toast({ title: "Error saving direct deposit", description: error.message, variant: "destructive" });
    } else {
      setDirectDeposits((prev) => [data, ...prev]);
      setDdAgentName("");
      setDdBankName("");
      setDdRouting("");
      setDdAccountNum("");
      setDdAccountType("checking");
      setShowAddDirectDeposit(false);
      toast({ title: "Direct deposit recipient added ✓" });
    }
  };
  const handleDeleteDirectDeposit = async (id) => {
    setDdDeletingId(id);
    const { error } = await supabase.from("direct_deposits").delete().eq("id", id);
    setDdDeletingId(null);
    if (error) {
      toast({ title: "Error removing recipient", description: error.message, variant: "destructive" });
    } else {
      setDirectDeposits((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Direct deposit recipient removed" });
    }
  };
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/auth");
  };
  const handleCancelSubscription = async () => {
    var _a;
    setCancelLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session == null ? void 0 : session.access_token}` }
      });
      if (res.error) throw new Error(res.error.message);
      const url = (_a = res.data) == null ? void 0 : _a.url;
      if (!url) throw new Error("Could not open billing portal");
      window.location.href = url;
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session == null ? void 0 : session.access_token}` }
      });
      if (res.error) throw new Error(res.error.message);
      await signOut();
      navigate("/");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setDeleteLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "h-14 border-b flex items-center px-6", children: /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground", children: "My Profile" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Account Information" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Your email and personal details" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5 mb-6 pb-6 border-b", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: cn(
                "w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center",
                avatarUploading && "opacity-50"
              ), children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: "Profile", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-muted-foreground select-none", children: (() => {
                const f = firstName.trim();
                const l = lastName.trim();
                if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
                if (f) return f.slice(0, 2).toUpperCase();
                return ((user == null ? void 0 : user.email) ?? "??").slice(0, 2).toUpperCase();
              })() }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    var _a;
                    return (_a = avatarInputRef.current) == null ? void 0 : _a.click();
                  },
                  disabled: avatarUploading,
                  className: "absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background hover:bg-primary/90 transition-colors",
                  title: "Upload photo",
                  children: /* @__PURE__ */ jsx(Camera, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: avatarInputRef,
                  type: "file",
                  accept: "image/jpeg,image/png,image/webp,image/gif",
                  className: "hidden",
                  onChange: handleAvatarUpload
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: (user == null ? void 0 : user.email) ?? "" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-3", children: [
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    className: "h-7 text-xs gap-1.5",
                    disabled: avatarUploading,
                    onClick: () => {
                      var _a;
                      return (_a = avatarInputRef.current) == null ? void 0 : _a.click();
                    },
                    children: [
                      /* @__PURE__ */ jsx(Camera, { className: "w-3 h-3" }),
                      avatarUploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"
                    ]
                  }
                ),
                avatarUrl && /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5",
                    disabled: avatarUploading,
                    onClick: handleAvatarRemove,
                    children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }),
                      "Remove"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1.5", children: "JPG, PNG, WebP or GIF · max 5 MB" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email Address" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-medium text-foreground", children: (user == null ? void 0 : user.email) ?? "-" })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveProfile, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "first-name", children: "First Name" }),
                /* @__PURE__ */ jsx(Input, { id: "first-name", placeholder: "John", value: firstName, onChange: (e) => setFirstName(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "last-name", children: "Last Name" }),
                /* @__PURE__ */ jsx(Input, { id: "last-name", placeholder: "Doe", value: lastName, onChange: (e) => setLastName(e.target.value) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3" }),
                " Phone"
              ] }) }),
              /* @__PURE__ */ jsx(Input, { id: "phone", placeholder: "(555) 000-0000", value: phone, onChange: (e) => setPhone(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "brokerage", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Building2, { className: "w-3 h-3" }),
                " Brokerage Name"
              ] }) }),
              /* @__PURE__ */ jsx(Input, { id: "brokerage", placeholder: "Your Brokerage", value: brokerageName, onChange: (e) => setBrokerageName(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "license", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "w-3 h-3" }),
                " License Number"
              ] }) }),
              /* @__PURE__ */ jsx(Input, { id: "license", placeholder: "RE-12345", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: profileLoading, className: "w-full", children: profileLoading ? "Saving…" : "Save Profile" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Change Password" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Update your account password" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleChangePassword, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "current-password", children: "Current Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "current-password",
                  type: showCurrent ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: currentPassword,
                  onChange: (e) => setCurrentPassword(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowCurrent((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showCurrent ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "new-password", children: "New Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "new-password",
                  type: showNew ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowNew((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showNew ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", children: "Confirm New Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "confirm-password",
                  type: showConfirm ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowConfirm((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showConfirm ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: passwordLoading, className: "w-full", children: passwordLoading ? "Updating…" : "Update Password" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Billing Information" }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Your subscription and payment details" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 text-xs gap-1.5",
              onClick: () => setShowAddAccount((v) => !v),
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                "Add Account"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/50 border", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Subscription Status" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground capitalize", children: (profile == null ? void 0 : profile.subscription_status) ?? "-" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(profile == null ? void 0 : profile.subscription_status) === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`, children: (profile == null ? void 0 : profile.subscription_status) === "active" ? "Active" : "Inactive" })
          ] }),
          showAddAccount && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/20 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Landmark, { className: "w-4 h-4 text-primary" }),
                " New Bank Account"
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowAddAccount(false),
                  className: "text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleAddBankAccount, className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Account Holder Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Full legal name",
                    value: newAcctHolder,
                    onChange: (e) => setNewAcctHolder(e.target.value),
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Account Type" }),
                /* @__PURE__ */ jsxs(Select, { value: newAcctType, onValueChange: (v) => setNewAcctType(v), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 text-sm", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "checking", children: "Checking" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "savings", children: "Savings" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Routing Number" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "9-digit ABA routing number",
                    value: newRouting,
                    onChange: (e) => setNewRouting(e.target.value.replace(/\D/g, "").slice(0, 9)),
                    maxLength: 9,
                    className: cn(newRouting && (billingRoutingResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(FieldHint, { value: newRouting, result: billingRoutingResult })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Account Number" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Enter account number",
                    type: "password",
                    value: newAccountNum,
                    onChange: (e) => setNewAccountNum(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(newAccountNum && (billingAccountResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(FieldHint, { value: newAccountNum, result: billingAccountResult })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Confirm Account Number" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Re-enter account number",
                    type: "password",
                    value: newAccountNumConfirm,
                    onChange: (e) => setNewAccountNumConfirm(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(newAccountNumConfirm && (billingConfirmResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(FieldHint, { value: newAccountNumConfirm, result: billingConfirmResult })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Only the last 4 digits of your account number are stored." }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
                /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", className: "flex-1", disabled: addingAccount || !billingFormValid, children: addingAccount ? "Saving…" : "Save Account" }),
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setShowAddAccount(false), children: "Cancel" })
              ] })
            ] })
          ] }),
          billingLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading billing info…" }) : bankAccounts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No payment method on file." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bankAccounts.map((acct) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Landmark, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground truncate", children: acct.account_holder_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground capitalize", children: [
                acct.account_type,
                " ···· ",
                acct.account_number_last4,
                acct.routing_number && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-muted-foreground/60", children: [
                  "Routing: ···",
                  acct.routing_number.slice(-4)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleDeleteBankAccount(acct.id),
                disabled: deletingId === acct.id,
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded",
                title: "Remove account",
                children: deletingId === acct.id ? /* @__PURE__ */ jsx("span", { className: "text-xs", children: "…" }) : /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] }, acct.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Direct Deposit" }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Agent banking info for deal payouts" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 text-xs gap-1.5",
              onClick: () => setShowAddDirectDeposit((v) => !v),
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                "Add Agent"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Add agent banking details here so you can quickly send their commission when a deal closes. Only the last 4 digits of their account number are stored." }),
          showAddDirectDeposit && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/20 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }),
                " New Payout Recipient"
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowAddDirectDeposit(false),
                  className: "text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleAddDirectDeposit, className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Agent Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Agent full name",
                    value: ddAgentName,
                    onChange: (e) => setDdAgentName(e.target.value),
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxs(Label, { className: "text-xs", children: [
                  "Bank Name ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "e.g. Chase, Wells Fargo",
                    value: ddBankName,
                    onChange: (e) => setDdBankName(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Account Type" }),
                /* @__PURE__ */ jsxs(Select, { value: ddAccountType, onValueChange: (v) => setDdAccountType(v), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 text-sm", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "checking", children: "Checking" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "savings", children: "Savings" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Routing Number" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "9-digit ABA routing number",
                    value: ddRouting,
                    onChange: (e) => setDdRouting(e.target.value.replace(/\D/g, "").slice(0, 9)),
                    maxLength: 9,
                    className: cn(ddRouting && (ddRoutingResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(FieldHint, { value: ddRouting, result: ddRoutingResult })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Account Number" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Enter account number",
                    type: "password",
                    value: ddAccountNum,
                    onChange: (e) => setDdAccountNum(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(ddAccountNum && (ddAccountResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(FieldHint, { value: ddAccountNum, result: ddAccountResult })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Only the last 4 digits of the account number are stored for security." }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
                /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white", disabled: addingDeposit || !ddFormValid, children: addingDeposit ? "Saving…" : "Save Recipient" }),
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setShowAddDirectDeposit(false), children: "Cancel" })
              ] })
            ] })
          ] }),
          directDepositLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : directDeposits.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No payout recipients added yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: directDeposits.map((dep) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground truncate", children: dep.agent_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground capitalize", children: [
                dep.bank_name ? `${dep.bank_name} · ` : "",
                dep.account_type,
                " ···· ",
                dep.account_number_last4,
                dep.routing_number && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-muted-foreground/60", children: [
                  "Routing: ···",
                  dep.routing_number.slice(-4)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleDeleteDirectDeposit(dep.id),
                disabled: ddDeletingId === dep.id,
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded",
                title: "Remove recipient",
                children: ddDeletingId === dep.id ? /* @__PURE__ */ jsx("span", { className: "text-xs", children: "…" }) : /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] }, dep.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-destructive/40", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 text-destructive" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Sign Out" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "End your current session" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            className: "w-full",
            onClick: handleSignOut,
            disabled: signingOut,
            children: signingOut ? "Signing out…" : "Sign Out"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-destructive/40", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4 text-destructive" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Leave the Brokerage" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Cancel your membership or permanently delete your account" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/30 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Manage Subscription" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Opens Stripe's secure billing portal where you can cancel your subscription, update your card, download invoices, or change plans." })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive",
                onClick: handleCancelSubscription,
                disabled: cancelLoading,
                children: cancelLoading ? "Opening Stripe…" : "Manage in Stripe"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-destructive", children: "Delete Account" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Permanently deletes your account, cancels your Stripe subscription, and removes all your data. This cannot be undone." })
            ] }),
            deleteStep === "idle" ? /* @__PURE__ */ jsx(
              Button,
              {
                variant: "destructive",
                size: "sm",
                onClick: () => setDeleteStep("confirm"),
                children: "Delete My Account"
              }
            ) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: "This is permanent and cannot be reversed. All data will be lost." }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "destructive", onClick: handleDeleteAccount, disabled: deleteLoading, children: deleteLoading ? "Deleting…" : "Yes, delete everything" }),
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setDeleteStep("idle"), disabled: deleteLoading, children: "Cancel" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Profile as default
};
