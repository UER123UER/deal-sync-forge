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
import { CreditCard, ShieldCheck } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!/^\d{9}$/.test(routingNumber)) {
      toast({ title: 'Invalid routing number', description: 'Routing number must be exactly 9 digits.', variant: 'destructive' });
      return;
    }
    if (accountNumber.length < 4) {
      toast({ title: 'Invalid account number', description: 'Please enter a valid account number.', variant: 'destructive' });
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      toast({ title: 'Account numbers do not match', variant: 'destructive' });
      return;
    }

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

    await refreshProfile?.();
    toast({ title: 'Subscription activated!', description: 'Welcome to DealSync.' });
    navigate('/transactions');
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
            <div className="space-y-2">
              <Label htmlFor="holder-name">Account Holder Name</Label>
              <Input id="holder-name" placeholder="John Doe" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routing">Routing Number</Label>
              <Input id="routing" placeholder="123456789" maxLength={9} value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))} required />
              <p className="text-xs text-muted-foreground">9-digit routing number from your bank</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-num">Account Number</Label>
              <Input id="account-num" placeholder="••••••••1234" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-account">Confirm Account Number</Label>
              <Input id="confirm-account" placeholder="••••••••1234" value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))} required />
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing…' : 'Activate Subscription'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Your information is securely stored</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
