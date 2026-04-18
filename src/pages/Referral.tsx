import { useState, useRef, useEffect } from 'react';
import { Copy, Check, DollarSign, Users, Gift, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Referral() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  const earningsPerReferral = 20;

  // Load how many agents signed up using this profile's referral code
  useEffect(() => {
    if (!profile?.referral_code) return;
    (supabase as any)
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by_code', profile.referral_code)
      .then(({ count }: any) => {
        setReferralCount(count ?? 0);
        setLoadingCount(false);
      });
  }, [profile?.referral_code]);

  // Use the permanent code from the user's profile
  const referralCode = profile?.referral_code ?? '—';
  const referralLink = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : '';

  const totalReferrals = referralCount ?? 0;
  const totalEarnings = totalReferrals * earningsPerReferral;

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    toast.success('Referral link copied!');
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Referral Program</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Your code badge */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-primary/5 border-primary/20">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Your Referral Code</p>
              <p className="text-2xl font-bold tracking-widest text-primary font-mono">{referralCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tied to your account</p>
              <p className="text-xs text-muted-foreground">Permanent &amp; unique</p>
            </div>
          </div>

          {/* Earnings Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {loadingCount ? '—' : `$${totalEarnings}`}
              </div>
            </div>
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Referrals</span>
              </div>
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5">
                {loadingCount
                  ? <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                  : totalReferrals}
              </div>
            </div>
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Per Referral</span>
              </div>
              <div className="text-2xl font-bold text-foreground">${earningsPerReferral}</div>
            </div>
          </div>

          {/* QR Code & Link */}
          <div className="border rounded-lg p-8 bg-background flex flex-col items-center gap-6">
            <h2 className="text-lg font-semibold text-foreground">Share Your Referral</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Earn <span className="font-semibold text-foreground">${earningsPerReferral}</span> for every paying agent you refer. Share your unique link or QR code.
            </p>
            {referralLink ? (
              <div className="p-4 bg-white border rounded-xl shadow-sm">
                <QRCodeSVG value={referralLink} size={180} level="M" />
              </div>
            ) : (
              <div className="w-[212px] h-[212px] border rounded-xl flex items-center justify-center bg-muted/30">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="flex w-full max-w-md gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm font-mono"
                placeholder="Loading your link…"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-shrink-0"
                onClick={handleCopy}
                disabled={!referralLink}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="border rounded-lg p-6 bg-background">
            <h3 className="text-sm font-semibold text-foreground mb-4">How It Works</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Share your referral link with fellow agents' },
                { step: '2', text: 'They sign up using your unique link' },
                { step: '3', text: 'Once they become a paying agent, you earn $20' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
