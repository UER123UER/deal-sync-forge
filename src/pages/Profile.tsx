import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, CreditCard, LogOut, Eye, EyeOff, Building2, Phone, BadgeCheck, Camera, Trash2, Plus, Landmark, X, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateRoutingNumber, validateAccountNumber, validateAccountConfirm } from '@/lib/bankingValidation';

function FieldHint({ value, result }: { value: string; result: { valid: boolean; message: string } }) {
  if (!value) return null;
  return (
    <p className={cn('flex items-center gap-1 text-xs mt-1', result.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
      {result.valid
        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
        : <XCircle className="w-3 h-3 shrink-0" />}
      {result.message}
    </p>
  );
}

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [brokerageName, setBrokerageName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Billing state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAcctHolder, setNewAcctHolder] = useState('');
  const [newAcctType, setNewAcctType] = useState<'checking' | 'savings'>('checking');
  const [newRouting, setNewRouting] = useState('');
  const [newAccountNum, setNewAccountNum] = useState('');
  const [newAccountNumConfirm, setNewAccountNumConfirm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Direct deposit state
  const [showAddDirectDeposit, setShowAddDirectDeposit] = useState(false);
  const [directDeposits, setDirectDeposits] = useState<any[]>([]);
  const [directDepositLoading, setDirectDepositLoading] = useState(true);
  const [addingDeposit, setAddingDeposit] = useState(false);
  const [ddAgentName, setDdAgentName] = useState('');
  const [ddBankName, setDdBankName] = useState('');
  const [ddRouting, setDdRouting] = useState('');
  const [ddAccountNum, setDdAccountNum] = useState('');
  const [ddAccountType, setDdAccountType] = useState<'checking' | 'savings'>('checking');
  const [ddDeletingId, setDdDeletingId] = useState<string | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sign out state
  const [signingOut, setSigningOut] = useState(false);

  // Live validation - billing form
  const billingRoutingResult = validateRoutingNumber(newRouting);
  const billingAccountResult = validateAccountNumber(newAccountNum);
  const billingConfirmResult = validateAccountConfirm(newAccountNum, newAccountNumConfirm);
  const billingFormValid = newAcctHolder.trim().length > 0 && billingRoutingResult.valid && billingAccountResult.valid && billingConfirmResult.valid;

  // Live validation - direct deposit form
  const ddRoutingResult = validateRoutingNumber(ddRouting);
  const ddAccountResult = validateAccountNumber(ddAccountNum);
  const ddFormValid = ddAgentName.trim().length > 0 && ddRoutingResult.valid && ddAccountResult.valid;

  // Populate profile fields from loaded profile
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
      setBrokerageName(profile.brokerage_name ?? '');
      setLicenseNumber(profile.license_number ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  // Load bank accounts
  useEffect(() => {
    if (!user) return;
    supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBankAccounts(data ?? []);
        setBillingLoading(false);
      });
  }, [user]);

  // Load direct deposit accounts
  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from('direct_deposits')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        setDirectDeposits(data ?? []);
        setDirectDepositLoading(false);
      });
  }, [user]);

  // Upload avatar photo
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      toast({ title: 'File too large', description: 'Please choose an image under 5 MB.', variant: 'destructive' });
      return;
    }

    setAvatarUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setAvatarUploading(false);
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: bustedUrl })
      .eq('id', user.id);

    setAvatarUploading(false);
    if (dbError) {
      toast({ title: 'Could not save avatar', description: dbError.message, variant: 'destructive' });
    } else {
      setAvatarUrl(bustedUrl);
      refreshProfile?.();
      toast({ title: 'Profile photo updated ✓' });
    }
  };

  // Remove avatar photo
  const handleAvatarRemove = async () => {
    if (!user || !avatarUrl) return;
    setAvatarUploading(true);

    const { data: files } = await supabase.storage.from('avatars').list(user.id);
    if (files && files.length > 0) {
      await supabase.storage.from('avatars').remove(files.map((f) => `${user.id}/${f.name}`));
    }

    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    setAvatarUrl(null);
    setAvatarUploading(false);
    refreshProfile?.();
    toast({ title: 'Profile photo removed' });
  };

  // Save profile info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        brokerage_name: brokerageName,
        license_number: licenseNumber,
      })
      .eq('id', user.id);
    setProfileLoading(false);
    if (error) {
      toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    } else {
      refreshProfile?.();
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: 'Current password required', description: 'Enter your current password to continue.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast({ title: 'Password too weak', description: 'Must include at least one lowercase letter, one uppercase letter, and one number.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword === currentPassword) {
      toast({ title: 'Same password', description: 'New password must be different from your current one.', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
    const email = user?.email ?? '';
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) {
      setPasswordLoading(false);
      toast({ title: 'Incorrect current password', description: 'Please check your current password and try again.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast({ title: 'Error updating password', description: error.message, variant: 'destructive' });
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your password has been changed.' });
    }
  };

  // Add bank account
  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !billingFormValid) return;

    setAddingAccount(true);
    const last4 = newAccountNum.slice(-4);
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: user.id,
        account_holder_name: newAcctHolder.trim(),
        routing_number: newRouting,
        account_number_last4: last4,
        account_type: newAcctType,
      })
      .select()
      .single();

    setAddingAccount(false);
    if (error) {
      toast({ title: 'Error saving account', description: error.message, variant: 'destructive' });
    } else {
      setBankAccounts((prev) => [data, ...prev]);
      setNewAcctHolder('');
      setNewRouting('');
      setNewAccountNum('');
      setNewAccountNumConfirm('');
      setNewAcctType('checking');
      setShowAddAccount(false);
      toast({ title: 'Bank account added ✓' });
    }
  };

  // Delete bank account
  const handleDeleteBankAccount = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      toast({ title: 'Error deleting account', description: error.message, variant: 'destructive' });
    } else {
      setBankAccounts((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Bank account removed' });
    }
  };

  // Add direct deposit recipient
  const handleAddDirectDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ddFormValid) return;

    setAddingDeposit(true);
    const last4 = ddAccountNum.slice(-4);
    const { data, error } = await (supabase as any)
      .from('direct_deposits')
      .insert({
        owner_id: user.id,
        agent_name: ddAgentName.trim(),
        bank_name: ddBankName.trim() || null,
        routing_number: ddRouting,
        account_number_last4: last4,
        account_type: ddAccountType,
      })
      .select()
      .single();

    setAddingDeposit(false);
    if (error) {
      toast({ title: 'Error saving direct deposit', description: error.message, variant: 'destructive' });
    } else {
      setDirectDeposits((prev) => [data, ...prev]);
      setDdAgentName('');
      setDdBankName('');
      setDdRouting('');
      setDdAccountNum('');
      setDdAccountType('checking');
      setShowAddDirectDeposit(false);
      toast({ title: 'Direct deposit recipient added ✓' });
    }
  };

  // Delete direct deposit recipient
  const handleDeleteDirectDeposit = async (id: string) => {
    setDdDeletingId(id);
    const { error } = await (supabase as any).from('direct_deposits').delete().eq('id', id);
    setDdDeletingId(null);
    if (error) {
      toast({ title: 'Error removing recipient', description: error.message, variant: 'destructive' });
    } else {
      setDirectDeposits((prev) => prev.filter((d) => d.id !== id));
      toast({ title: 'Direct deposit recipient removed' });
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">My Profile</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Account Information</CardTitle>
                  <CardDescription className="text-xs">Your email and personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* ── Avatar upload ── */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b">
                <div className="relative shrink-0">
                  <div className={cn(
                    'w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center',
                    avatarUploading && 'opacity-50'
                  )}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground select-none">
                        {(() => {
                          const f = firstName.trim();
                          const l = lastName.trim();
                          if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
                          if (f) return f.slice(0, 2).toUpperCase();
                          return (user?.email ?? '??').slice(0, 2).toUpperCase();
                        })()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background hover:bg-primary/90 transition-colors"
                    title="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Name'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email ?? ''}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Camera className="w-3 h-3" />
                      {avatarUploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                        disabled={avatarUploading}
                        onClick={handleAvatarRemove}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">JPG, PNG, WebP or GIF · max 5 MB</p>
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="mb-5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
                <p className="mt-1 text-sm font-medium text-foreground">{user?.email ?? '-'}</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</span>
                  </Label>
                  <Input id="phone" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brokerage">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Brokerage Name</span>
                  </Label>
                  <Input id="brokerage" placeholder="Your Brokerage" value={brokerageName} onChange={(e) => setBrokerageName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="license">
                    <span className="flex items-center gap-1.5"><BadgeCheck className="w-3 h-3" /> License Number</span>
                  </Label>
                  <Input id="license" placeholder="RE-12345" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                </div>

                <Button type="submit" disabled={profileLoading} className="w-full">
                  {profileLoading ? 'Saving…' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription className="text-xs">Update your account password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-9"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={passwordLoading} className="w-full">
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Billing / Bank Account Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Billing Information</CardTitle>
                    <CardDescription className="text-xs">Your subscription and payment details</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setShowAddAccount((v) => !v)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subscription status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subscription Status</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{profile?.subscription_status ?? '-'}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.subscription_status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Add account form */}
              {showAddAccount && (
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-primary" /> New Bank Account
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddAccount(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddBankAccount} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Holder Name</Label>
                      <Input
                        placeholder="Full legal name"
                        value={newAcctHolder}
                        onChange={(e) => setNewAcctHolder(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Type</Label>
                      <Select value={newAcctType} onValueChange={(v) => setNewAcctType(v as 'checking' | 'savings')}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Routing Number</Label>
                      <Input
                        placeholder="9-digit ABA routing number"
                        value={newRouting}
                        onChange={(e) => setNewRouting(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        maxLength={9}
                        className={cn(newRouting && (billingRoutingResult.valid ? 'border-emerald-500' : 'border-destructive'))}
                        required
                      />
                      <FieldHint value={newRouting} result={billingRoutingResult} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        type="password"
                        value={newAccountNum}
                        onChange={(e) => setNewAccountNum(e.target.value.replace(/\D/g, '').slice(0, 17))}
                        className={cn(newAccountNum && (billingAccountResult.valid ? 'border-emerald-500' : 'border-destructive'))}
                        required
                      />
                      <FieldHint value={newAccountNum} result={billingAccountResult} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirm Account Number</Label>
                      <Input
                        placeholder="Re-enter account number"
                        type="password"
                        value={newAccountNumConfirm}
                        onChange={(e) => setNewAccountNumConfirm(e.target.value.replace(/\D/g, '').slice(0, 17))}
                        className={cn(newAccountNumConfirm && (billingConfirmResult.valid ? 'border-emerald-500' : 'border-destructive'))}
                        required
                      />
                      <FieldHint value={newAccountNumConfirm} result={billingConfirmResult} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Only the last 4 digits of your account number are stored.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" size="sm" className="flex-1" disabled={addingAccount || !billingFormValid}>
                        {addingAccount ? 'Saving…' : 'Save Account'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddAccount(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bank account list */}
              {billingLoading ? (
                <p className="text-sm text-muted-foreground">Loading billing info…</p>
              ) : bankAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment method on file.</p>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map((acct) => (
                    <div key={acct.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{acct.account_holder_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {acct.account_type} ···· {acct.account_number_last4}
                          {acct.routing_number && (
                            <span className="ml-2 text-muted-foreground/60">Routing: ···{acct.routing_number.slice(-4)}</span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBankAccount(acct.id)}
                        disabled={deletingId === acct.id}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
                        title="Remove account"
                      >
                        {deletingId === acct.id ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Direct Deposit Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Direct Deposit</CardTitle>
                    <CardDescription className="text-xs">Agent banking info for deal payouts</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setShowAddDirectDeposit((v) => !v)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Agent
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add agent banking details here so you can quickly send their commission when a deal closes. Only the last 4 digits of their account number are stored.
              </p>

              {/* Add direct deposit form */}
              {showAddDirectDeposit && (
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> New Payout Recipient
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddDirectDeposit(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddDirectDeposit} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Agent Name</Label>
                      <Input
                        placeholder="Agent full name"
                        value={ddAgentName}
                        onChange={(e) => setDdAgentName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bank Name <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        placeholder="e.g. Chase, Wells Fargo"
                        value={ddBankName}
                        onChange={(e) => setDdBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Type</Label>
                      <Select value={ddAccountType} onValueChange={(v) => setDdAccountType(v as 'checking' | 'savings')}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Routing Number</Label>
                      <Input
                        placeholder="9-digit ABA routing number"
                        value={ddRouting}
                        onChange={(e) => setDdRouting(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        maxLength={9}
                        className={cn(ddRouting && (ddRoutingResult.valid ? 'border-emerald-500' : 'border-destructive'))}
                        required
                      />
                      <FieldHint value={ddRouting} result={ddRoutingResult} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        type="password"
                        value={ddAccountNum}
                        onChange={(e) => setDdAccountNum(e.target.value.replace(/\D/g, '').slice(0, 17))}
                        className={cn(ddAccountNum && (ddAccountResult.valid ? 'border-emerald-500' : 'border-destructive'))}
                        required
                      />
                      <FieldHint value={ddAccountNum} result={ddAccountResult} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Only the last 4 digits of the account number are stored for security.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={addingDeposit || !ddFormValid}>
                        {addingDeposit ? 'Saving…' : 'Save Recipient'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddDirectDeposit(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Direct deposit list */}
              {directDepositLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : directDeposits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payout recipients added yet.</p>
              ) : (
                <div className="space-y-2">
                  {directDeposits.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group">
                      <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{dep.agent_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {dep.bank_name ? `${dep.bank_name} · ` : ''}{dep.account_type} ···· {dep.account_number_last4}
                          {dep.routing_number && (
                            <span className="ml-2 text-muted-foreground/60">Routing: ···{dep.routing_number.slice(-4)}</span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDirectDeposit(dep.id)}
                        disabled={ddDeletingId === dep.id}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
                        title="Remove recipient"
                      >
                        {ddDeletingId === dep.id ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign Out Card */}
          <Card className="border-destructive/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base">Sign Out</CardTitle>
                  <CardDescription className="text-xs">End your current session</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
