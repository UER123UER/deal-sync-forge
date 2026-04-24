import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { UERLogo } from '@/components/UERLogo';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/transactions');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (signUpPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!/[a-z]/.test(signUpPassword) || !/[A-Z]/.test(signUpPassword) || !/[0-9]/.test(signUpPassword)) {
      toast({ title: 'Password too weak', description: 'Must include at least one lowercase letter, one uppercase letter, and one number.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (signUpError) {
      setLoading(false);
      toast({ title: 'Sign up failed', description: signUpError.message, variant: 'destructive' });
      return;
    }
    // Sign in immediately so the user doesn't have to wait for a confirmation email
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signUpEmail,
      password: signUpPassword,
    });
    setLoading(false);
    if (signInError) {
      // Account created but auto-sign-in failed — tell them to sign in manually
      toast({ title: 'Account created!', description: 'Please sign in with your new credentials.' });
    } else {
      navigate('/onboarding/payment');
    }
  };

  // Google OAuth is intentionally disabled for now.

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'A password reset link has been sent.' });
      setShowForgotPassword(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="reset-email" type="email" placeholder="you@example.com" className="pl-9" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                Back to sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <UERLogo width={220} />
          </div>
          <CardDescription>Real estate transaction management</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google OAuth button intentionally removed while auth stays email/password only. */}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signin-email" type="email" placeholder="you@example.com" className="pl-9" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signin-password" type={showSignInPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowSignInPassword(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
                <Button type="button" variant="link" className="w-full text-sm" onClick={() => setShowForgotPassword(true)}>
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="first-name" placeholder="John" className="pl-9" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="you@example.com" className="pl-9" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type={showSignUpPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowSignUpPassword(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                      {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be 6+ characters with uppercase, lowercase, and a number.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={signUpConfirmPassword} onChange={(e) => setSignUpConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
