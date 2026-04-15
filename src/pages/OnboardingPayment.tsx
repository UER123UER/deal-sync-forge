import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { validateRoutingNumber, validateAccountNumber, validateAccountConfirm } from '@/lib/bankingValidation';
import { cn } from '@/lib/utils';

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

export default function OnboardingPayment() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');

  // Live validation
  const routingResult = validateRoutingNumber(routingNumber);
  const accountResult = validateAccountNumber(accountNumber);
  const confirmResult = validateAccountConfirm(accountNumber, confirmAccountNumber);

  const canSubmit =
    accountHolderName.trim().length > 0 &&
    routingResult.valid &&
    accountResult.valid &&
    confirmResult.valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;

    setLoading(true);

    // Save bank account (store only last 4 digits)
    const { error: bankError } = await supabase.from('bank_accounts').insert({
      user_id: user.id,
      account_holder_name: accountHolderName,
      routing_number: routingNumber,
      account_number_last4: accountNumber.slice(-4),
      account_type: accountType,
    });

    if (bankError) {
      toast({ title: 'Error saving payment info', description: bankError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Activate subscription
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    if (profileError) {
      toast({ title: 'Error activating subscription', description: profileError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    refreshProfile?.();
    toast({ title: 'Subscription activated!', description: 'Welcome to United Estates Realty.' });
    navigate('/profile');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <CreditCard className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Subscription</CardTitle>
          <CardDescription>Enter your banking details to activate your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Info banner */}
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Please enter your <strong>real</strong> banking information. Your routing number is validated in real time and only the last 4 digits of your account number are ever stored.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="holder-name">Account Holder Name</Label>
              <Input
                id="holder-name"
                placeholder="Full legal name on account"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="routing">Routing Number</Label>
              <Input
                id="routing"
                placeholder="9-digit ABA routing number"
                maxLength={9}
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                className={cn(
                  routingNumber && (routingResult.valid
                    ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                    : 'border-destructive focus-visible:ring-destructive/30')
                )}
                required
              />
              <FieldHint value={routingNumber} result={routingResult} />
              {!routingNumber && (
                <p className="text-xs text-muted-foreground">Find it on the bottom-left of a check or in your bank's app</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-num">Account Number</Label>
              <Input
                id="account-num"
                placeholder="Enter your account number"
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                className={cn(
                  accountNumber && (accountResult.valid
                    ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                    : 'border-destructive focus-visible:ring-destructive/30')
                )}
                required
              />
              <FieldHint value={accountNumber} result={accountResult} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-account">Confirm Account Number</Label>
              <Input
                id="confirm-account"
                placeholder="Re-enter account number"
                type="password"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                className={cn(
                  confirmAccountNumber && (confirmResult.valid
                    ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                    : 'border-destructive focus-visible:ring-destructive/30')
                )}
                required
              />
              <FieldHint value={confirmAccountNumber} result={confirmResult} />
            </div>

            <div className="space-y-3">
              <Label>Account Type</Label>
              <RadioGroup value={accountType} onValueChange={setAccountType} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="checking" id="checking" />
                  <Label htmlFor="checking" className="font-normal cursor-pointer">Checking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="savings" id="savings" />
                  <Label htmlFor="savings" className="font-normal cursor-pointer">Savings</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
              {loading ? 'Processing…' : 'Activate Subscription'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Securely stored · Only last 4 digits of account number saved</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
