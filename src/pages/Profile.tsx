import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, CreditCard, LogOut, Eye, EyeOff, Building2, Phone, BadgeCheck } from 'lucide-react';

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

  // Sign out state
  const [signingOut, setSigningOut] = useState(false);

  // Populate profile fields from loaded profile
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
      setBrokerageName(profile.brokerage_name ?? '');
      setLicenseNumber(profile.license_number ?? '');
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
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
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
              {/* Email (read-only) */}
              <div className="mb-5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
                <p className="mt-1 text-sm font-medium text-foreground">{user?.email ?? '—'}</p>
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Billing Information</CardTitle>
                  <CardDescription className="text-xs">Your subscription and payment details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Subscription status */}
              <div className="mb-4 flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subscription Status</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{profile?.subscription_status ?? '—'}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.subscription_status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Bank accounts */}
              {billingLoading ? (
                <p className="text-sm text-muted-foreground">Loading billing info…</p>
              ) : bankAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment method on file.</p>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((acct) => (
                    <div key={acct.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{acct.account_holder_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {acct.account_type} account ending in {acct.account_number_last4}
                        </p>
                      </div>
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
