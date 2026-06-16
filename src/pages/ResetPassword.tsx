import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/auth');
    }
  };

  if (!isRecovery) {
    return (
      <>
        <SeoHead
          title="Reset Password | United Estates Realty"
          description="Reset your United Estates Realty agent account password. Secure link validation."
          path="/reset-password"
        />
        <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <h1 className="text-lg font-semibold leading-tight tracking-[-0.015em]">Invalid Reset Link</h1>
              <CardDescription>This link is invalid or has expired.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>Go to Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Set New Password | United Estates Realty"
        description="Create a new password for your United Estates Realty agent account."
        path="/reset-password"
      />
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.015em]">Set New Password</h1>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="confirm-new-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
