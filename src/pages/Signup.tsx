import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { UERLogo } from '@/components/UERLogo';
import { cn } from '@/lib/utils';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'One number', pass: /[0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const strengthColor = passed <= 1 ? 'bg-red-500' : passed <= 2 ? 'bg-orange-400' : passed === 3 ? 'bg-yellow-400' : 'bg-emerald-500';
  const strengthLabel = passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed === 3 ? 'Good' : 'Strong';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn('flex-1 rounded-full transition-all', i <= passed ? strengthColor : 'bg-muted')}
            />
          ))}
        </div>
        <span className={cn('text-xs font-medium', passed === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
          {strengthLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <p key={c.label} className={cn('flex items-center gap-1 text-[11px]', c.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
            <CheckCircle2 className={cn('w-3 h-3 shrink-0', c.pass ? 'opacity-100' : 'opacity-30')} />
            {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Signup() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') ?? '';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordReady = password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordReady) {
      toast({ title: 'Password too weak', description: 'Must be 6+ characters with uppercase, lowercase, and a number.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          referral_code: refCode || undefined,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      setLoading(false);
      toast({ title: 'Sign up failed', description: signUpError.message, variant: 'destructive' });
      return;
    }

    // Auto sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      toast({ title: 'Account created!', description: 'Please sign in with your new credentials.' });
      navigate('/auth');
      return;
    }

    // Save the referral code that brought this user here
    if (refCode && signInData.user) {
      await (supabase.from('profiles') as any)
        .update({ referred_by_code: refCode })
        .eq('id', signInData.user.id);
    }

    setLoading(false);
    navigate('/onboarding/payment');
  };

  // Google OAuth is intentionally disabled for now.

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[hsl(var(--sidebar-bg))] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-[40px] border-white" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-[60px] border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[80px] border-white" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex rounded-2xl border border-white/20 bg-white/95 px-5 py-4 shadow-xl shadow-black/10 backdrop-blur">
            <UERLogo width={180} />
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Manage every deal,<br />close with confidence.
            </h1>
            <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-sm">
              United Estates Realty gives you everything you need — transactions, contacts, marketing, and payouts — in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Home, text: 'Track every transaction from offer to close' },
              { icon: User, text: 'Built-in CRM with priority contacts' },
              { icon: CheckCircle2, text: 'Digital signing & marketing tools' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">© {new Date().getFullYear()} United Estates Realty</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-auto">
        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center space-y-1 lg:hidden">
            <UERLogo width={160} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Referral badge */}
          {refCode && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Referral applied</p>
                <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Code: {refCode}</p>
              </div>
            </div>
          )}

          {/* Google OAuth button intentionally removed while auth stays email/password only. */}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first-name"
                    placeholder="John"
                    className="pl-9"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    'pl-9 pr-9',
                    confirmPassword && (passwordsMatch ? 'border-emerald-500' : 'border-destructive')
                  )}
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
              {passwordMismatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 mt-2"
              disabled={loading || !passwordReady || !passwordsMatch}
            >
              {loading ? 'Creating account…' : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="underline cursor-pointer">Terms of Service</span>{' '}
              and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
