import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { a as useAuth, u as useToast, s as supabase, c as cn, B as Button, L as Label, I as Input } from "../main.mjs";
import { C as Card, a as CardHeader, d as CardTitle, b as CardDescription, c as CardContent } from "./card-DhvFoEG1.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function FieldHint({ value, result }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxDEV("p", { className: cn("flex items-center gap-1 text-xs mt-1", result.valid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"), children: [
    result.valid ? /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-3 h-3 shrink-0" }, void 0, false, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 20,
      columnNumber: 11
    }, this) : /* @__PURE__ */ jsxDEV(XCircle, { className: "w-3 h-3 shrink-0" }, void 0, false, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 21,
      columnNumber: 11
    }, this),
    result.message
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Profile.tsx",
    lineNumber: 18,
    columnNumber: 5
  }, this);
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center px-6", children: /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "My Profile" }, void 0, false, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 408,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 407,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(User, { className: "w-4 h-4 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 419,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 418,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Account Information" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 422,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "Your email and personal details" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 423,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 421,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 417,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 416,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-5 mb-6 pb-6 border-b", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxDEV("div", { className: cn(
                "w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center",
                avatarUploading && "opacity-50"
              ), children: avatarUrl ? /* @__PURE__ */ jsxDEV("img", { src: avatarUrl, alt: "Profile", className: "w-full h-full object-cover" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 436,
                columnNumber: 23
              }, this) : /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-bold text-muted-foreground select-none", children: (() => {
                const f = firstName.trim();
                const l = lastName.trim();
                if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
                if (f) return f.slice(0, 2).toUpperCase();
                return ((user == null ? void 0 : user.email) ?? "??").slice(0, 2).toUpperCase();
              })() }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 438,
                columnNumber: 23
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 431,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(
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
                  children: /* @__PURE__ */ jsxDEV(Camera, { className: "w-3.5 h-3.5" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 456,
                    columnNumber: 21
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 449,
                  columnNumber: 19
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "input",
                {
                  ref: avatarInputRef,
                  type: "file",
                  accept: "image/jpeg,image/png,image/webp,image/gif",
                  className: "hidden",
                  onChange: handleAvatarUpload
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 458,
                  columnNumber: 19
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 430,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-foreground", children: firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 468,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mt-0.5", children: (user == null ? void 0 : user.email) ?? "" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 471,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 mt-3", children: [
                /* @__PURE__ */ jsxDEV(
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
                      /* @__PURE__ */ jsxDEV(Camera, { className: "w-3 h-3" }, void 0, false, {
                        fileName: "/dev-server/src/pages/Profile.tsx",
                        lineNumber: 481,
                        columnNumber: 23
                      }, this),
                      avatarUploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 473,
                    columnNumber: 21
                  },
                  this
                ),
                avatarUrl && /* @__PURE__ */ jsxDEV(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5",
                    disabled: avatarUploading,
                    onClick: handleAvatarRemove,
                    children: [
                      /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3 h-3" }, void 0, false, {
                        fileName: "/dev-server/src/pages/Profile.tsx",
                        lineNumber: 493,
                        columnNumber: 25
                      }, this),
                      "Remove"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 485,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 472,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mt-1.5", children: "JPG, PNG, WebP or GIF · max 5 MB" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 498,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 467,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 429,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email Address" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 504,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-sm font-medium text-foreground", children: (user == null ? void 0 : user.email) ?? "-" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 505,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 503,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSaveProfile, className: "space-y-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { htmlFor: "first-name", children: "First Name" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 511,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(Input, { id: "first-name", placeholder: "John", value: firstName, onChange: (e) => setFirstName(e.target.value) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 512,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 510,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { htmlFor: "last-name", children: "Last Name" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 515,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(Input, { id: "last-name", placeholder: "Doe", value: lastName, onChange: (e) => setLastName(e.target.value) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 516,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 514,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 509,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "phone", children: /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxDEV(Phone, { className: "w-3 h-3" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 522,
                  columnNumber: 65
                }, this),
                " Phone"
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 522,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 521,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(Input, { id: "phone", placeholder: "(555) 000-0000", value: phone, onChange: (e) => setPhone(e.target.value) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 524,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 520,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "brokerage", children: /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxDEV(Building2, { className: "w-3 h-3" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 529,
                  columnNumber: 65
                }, this),
                " Brokerage Name"
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 529,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 528,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(Input, { id: "brokerage", placeholder: "Your Brokerage", value: brokerageName, onChange: (e) => setBrokerageName(e.target.value) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 531,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 527,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "license", children: /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxDEV(BadgeCheck, { className: "w-3 h-3" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 536,
                  columnNumber: 65
                }, this),
                " License Number"
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 536,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 535,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(Input, { id: "license", placeholder: "RE-12345", value: licenseNumber, onChange: (e) => setLicenseNumber(e.target.value) }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 538,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 534,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Button, { type: "submit", disabled: profileLoading, className: "w-full", children: profileLoading ? "Saving…" : "Save Profile" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 541,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 508,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 427,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 415,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(Lock, { className: "w-4 h-4 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 553,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 552,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Change Password" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 556,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "Update your account password" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 557,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 555,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 551,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 550,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV("form", { onSubmit: handleChangePassword, className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "current-password", children: "Current Password" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 564,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "current-password",
                  type: showCurrent ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: currentPassword,
                  onChange: (e) => setCurrentPassword(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 566,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowCurrent((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showCurrent ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 581,
                    columnNumber: 38
                  }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 581,
                    columnNumber: 71
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 575,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 565,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 563,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "new-password", children: "New Password" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 587,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "new-password",
                  type: showNew ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 589,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowNew((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showNew ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 604,
                    columnNumber: 34
                  }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 604,
                    columnNumber: 67
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 598,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 588,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 586,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "confirm-password", children: "Confirm New Password" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 610,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "confirm-password",
                  type: showConfirm ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pr-9",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 612,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowConfirm((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showConfirm ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 627,
                    columnNumber: 38
                  }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 627,
                    columnNumber: 71
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 621,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 611,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 609,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { type: "submit", disabled: passwordLoading, className: "w-full", children: passwordLoading ? "Updating…" : "Update Password" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 632,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 562,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 561,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 549,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(CreditCard, { className: "w-4 h-4 text-primary" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 645,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 644,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Billing Information" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 648,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "Your subscription and payment details" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 649,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 647,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 643,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 text-xs gap-1.5",
              onClick: () => setShowAddAccount((v) => !v),
              children: [
                /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 658,
                  columnNumber: 19
                }, this),
                "Add Account"
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 652,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 642,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 641,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/50 border", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Subscription Status" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 667,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-foreground capitalize", children: (profile == null ? void 0 : profile.subscription_status) ?? "-" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 668,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 666,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(profile == null ? void 0 : profile.subscription_status) === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`, children: (profile == null ? void 0 : profile.subscription_status) === "active" ? "Active" : "Inactive" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 670,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 665,
            columnNumber: 15
          }, this),
          showAddAccount && /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border bg-muted/20 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDEV(Landmark, { className: "w-4 h-4 text-primary" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 684,
                  columnNumber: 23
                }, this),
                " New Bank Account"
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 683,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowAddAccount(false),
                  className: "text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsxDEV(X, { className: "w-4 h-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 691,
                    columnNumber: 23
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 686,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 682,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("form", { onSubmit: handleAddBankAccount, className: "space-y-3", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Account Holder Name" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 697,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Full legal name",
                    value: newAcctHolder,
                    onChange: (e) => setNewAcctHolder(e.target.value),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 698,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 696,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Account Type" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 706,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Select, { value: newAcctType, onValueChange: (v) => setNewAcctType(v), children: [
                  /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 709,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 708,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(SelectContent, { children: [
                    /* @__PURE__ */ jsxDEV(SelectItem, { value: "checking", children: "Checking" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Profile.tsx",
                      lineNumber: 712,
                      columnNumber: 27
                    }, this),
                    /* @__PURE__ */ jsxDEV(SelectItem, { value: "savings", children: "Savings" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Profile.tsx",
                      lineNumber: 713,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 711,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 707,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 705,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Routing Number" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 718,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "9-digit ABA routing number",
                    value: newRouting,
                    onChange: (e) => setNewRouting(e.target.value.replace(/\D/g, "").slice(0, 9)),
                    maxLength: 9,
                    className: cn(newRouting && (billingRoutingResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 719,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(FieldHint, { value: newRouting, result: billingRoutingResult }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 727,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 717,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Account Number" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 730,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Enter account number",
                    type: "password",
                    value: newAccountNum,
                    onChange: (e) => setNewAccountNum(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(newAccountNum && (billingAccountResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 731,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(FieldHint, { value: newAccountNum, result: billingAccountResult }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 739,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 729,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Confirm Account Number" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 742,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Re-enter account number",
                    type: "password",
                    value: newAccountNumConfirm,
                    onChange: (e) => setNewAccountNumConfirm(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(newAccountNumConfirm && (billingConfirmResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 743,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(FieldHint, { value: newAccountNumConfirm, result: billingConfirmResult }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 751,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 741,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground", children: "Only the last 4 digits of your account number are stored." }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 753,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 pt-1", children: [
                /* @__PURE__ */ jsxDEV(Button, { type: "submit", size: "sm", className: "flex-1", disabled: addingAccount || !billingFormValid, children: addingAccount ? "Saving…" : "Save Account" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 757,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setShowAddAccount(false), children: "Cancel" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 760,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 756,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 695,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 681,
            columnNumber: 17
          }, this),
          billingLoading ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Loading billing info…" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 770,
            columnNumber: 17
          }, this) : bankAccounts.length === 0 ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "No payment method on file." }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 772,
            columnNumber: 17
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: bankAccounts.map((acct) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(Landmark, { className: "w-4 h-4 text-primary" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 778,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 777,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-foreground truncate", children: acct.account_holder_name }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 781,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground capitalize", children: [
                acct.account_type,
                " ···· ",
                acct.account_number_last4,
                acct.routing_number && /* @__PURE__ */ jsxDEV("span", { className: "ml-2 text-muted-foreground/60", children: [
                  "Routing: ···",
                  acct.routing_number.slice(-4)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 785,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 782,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 780,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => handleDeleteBankAccount(acct.id),
                disabled: deletingId === acct.id,
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded",
                title: "Remove account",
                children: deletingId === acct.id ? /* @__PURE__ */ jsxDEV("span", { className: "text-xs", children: "…" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 797,
                  columnNumber: 27
                }, this) : /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 799,
                  columnNumber: 27
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 789,
                columnNumber: 23
              },
              this
            )
          ] }, acct.id, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 776,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 774,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 663,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 640,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 815,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 814,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Direct Deposit" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 818,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "Agent banking info for deal payouts" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 819,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 817,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 813,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 text-xs gap-1.5",
              onClick: () => setShowAddDirectDeposit((v) => !v),
              children: [
                /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 828,
                  columnNumber: 19
                }, this),
                "Add Agent"
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 822,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 812,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 811,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Add agent banking details here so you can quickly send their commission when a deal closes. Only the last 4 digits of their account number are stored." }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 834,
            columnNumber: 15
          }, this),
          showAddDirectDeposit && /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border bg-muted/20 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDEV(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 843,
                  columnNumber: 23
                }, this),
                " New Payout Recipient"
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 842,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowAddDirectDeposit(false),
                  className: "text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsxDEV(X, { className: "w-4 h-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 850,
                    columnNumber: 23
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 845,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 841,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("form", { onSubmit: handleAddDirectDeposit, className: "space-y-3", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Agent Name" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 856,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Agent full name",
                    value: ddAgentName,
                    onChange: (e) => setDdAgentName(e.target.value),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 857,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 855,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: [
                  "Bank Name ",
                  /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground", children: "(optional)" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 865,
                    columnNumber: 60
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 865,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "e.g. Chase, Wells Fargo",
                    value: ddBankName,
                    onChange: (e) => setDdBankName(e.target.value)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 866,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 864,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Account Type" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 873,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Select, { value: ddAccountType, onValueChange: (v) => setDdAccountType(v), children: [
                  /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 876,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 875,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(SelectContent, { children: [
                    /* @__PURE__ */ jsxDEV(SelectItem, { value: "checking", children: "Checking" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Profile.tsx",
                      lineNumber: 879,
                      columnNumber: 27
                    }, this),
                    /* @__PURE__ */ jsxDEV(SelectItem, { value: "savings", children: "Savings" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Profile.tsx",
                      lineNumber: 880,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 878,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 874,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 872,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Routing Number" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 885,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "9-digit ABA routing number",
                    value: ddRouting,
                    onChange: (e) => setDdRouting(e.target.value.replace(/\D/g, "").slice(0, 9)),
                    maxLength: 9,
                    className: cn(ddRouting && (ddRoutingResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 886,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(FieldHint, { value: ddRouting, result: ddRoutingResult }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 894,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 884,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Account Number" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 897,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Enter account number",
                    type: "password",
                    value: ddAccountNum,
                    onChange: (e) => setDdAccountNum(e.target.value.replace(/\D/g, "").slice(0, 17)),
                    className: cn(ddAccountNum && (ddAccountResult.valid ? "border-emerald-500" : "border-destructive")),
                    required: true
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Profile.tsx",
                    lineNumber: 898,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(FieldHint, { value: ddAccountNum, result: ddAccountResult }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 906,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 896,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground", children: "Only the last 4 digits of the account number are stored for security." }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 908,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 pt-1", children: [
                /* @__PURE__ */ jsxDEV(Button, { type: "submit", size: "sm", className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white", disabled: addingDeposit || !ddFormValid, children: addingDeposit ? "Saving…" : "Save Recipient" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 912,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setShowAddDirectDeposit(false), children: "Cancel" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 915,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 911,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 854,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 840,
            columnNumber: 17
          }, this),
          directDepositLoading ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Loading…" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 925,
            columnNumber: 17
          }, this) : directDeposits.length === 0 ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "No payout recipients added yet." }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 927,
            columnNumber: 17
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: directDeposits.map((dep) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(DollarSign, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 933,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 932,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-foreground truncate", children: dep.agent_name }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 936,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground capitalize", children: [
                dep.bank_name ? `${dep.bank_name} · ` : "",
                dep.account_type,
                " ···· ",
                dep.account_number_last4,
                dep.routing_number && /* @__PURE__ */ jsxDEV("span", { className: "ml-2 text-muted-foreground/60", children: [
                  "Routing: ···",
                  dep.routing_number.slice(-4)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 940,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 937,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 935,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => handleDeleteDirectDeposit(dep.id),
                disabled: ddDeletingId === dep.id,
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded",
                title: "Remove recipient",
                children: ddDeletingId === dep.id ? /* @__PURE__ */ jsxDEV("span", { className: "text-xs", children: "…" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 952,
                  columnNumber: 27
                }, this) : /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 954,
                  columnNumber: 27
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 944,
                columnNumber: 23
              },
              this
            )
          ] }, dep.id, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 931,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 929,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 833,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 810,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { className: "border-destructive/40", children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(LogOut, { className: "w-4 h-4 text-destructive" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 969,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 968,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Sign Out" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 972,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "End your current session" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 973,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 971,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 967,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 966,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "destructive",
            className: "w-full",
            onClick: handleSignOut,
            disabled: signingOut,
            children: signingOut ? "Signing out…" : "Sign Out"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 978,
            columnNumber: 15
          },
          this
        ) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 977,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 965,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { className: "border-destructive/40", children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(XCircle, { className: "w-4 h-4 text-destructive" }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 994,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 993,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-base", children: "Leave the Brokerage" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 997,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(CardDescription, { className: "text-xs", children: "Cancel your membership or permanently delete your account" }, void 0, false, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 998,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 996,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 992,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 991,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border bg-muted/30 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-foreground", children: "Manage Subscription" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1006,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Opens Stripe's secure billing portal where you can cancel your subscription, update your card, download invoices, or change plans." }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1007,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 1005,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive",
                onClick: handleCancelSubscription,
                disabled: cancelLoading,
                children: cancelLoading ? "Opening Stripe…" : "Manage in Stripe"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1011,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 1004,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-destructive", children: "Delete Account" }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1025,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Permanently deletes your account, cancels your Stripe subscription, and removes all your data. This cannot be undone." }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1026,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 1024,
              columnNumber: 17
            }, this),
            deleteStep === "idle" ? /* @__PURE__ */ jsxDEV(
              Button,
              {
                variant: "destructive",
                size: "sm",
                onClick: () => setDeleteStep("confirm"),
                children: "Delete My Account"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1031,
                columnNumber: 19
              },
              this
            ) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-medium text-destructive", children: "This is permanent and cannot be reversed. All data will be lost." }, void 0, false, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1040,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxDEV(Button, { size: "sm", variant: "destructive", onClick: handleDeleteAccount, disabled: deleteLoading, children: deleteLoading ? "Deleting…" : "Yes, delete everything" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 1042,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { size: "sm", variant: "outline", onClick: () => setDeleteStep("idle"), disabled: deleteLoading, children: "Cancel" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Profile.tsx",
                  lineNumber: 1045,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Profile.tsx",
                lineNumber: 1041,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Profile.tsx",
              lineNumber: 1039,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Profile.tsx",
            lineNumber: 1023,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Profile.tsx",
          lineNumber: 1002,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Profile.tsx",
        lineNumber: 990,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 412,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Profile.tsx",
      lineNumber: 411,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Profile.tsx",
    lineNumber: 405,
    columnNumber: 5
  }, this);
}
export {
  Profile as default
};
