import { useState, useRef, useEffect } from 'react';
import { Copy, Check, DollarSign, Users, Gift, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  PageContent,
  PageHeader,
  PageHeaderHeading,
  PageSection,
  PageShell,
  PageStack,
} from '@/components/system/page-shell';
import { MetricCard } from '@/components/system/metric-card';

export default function Referral() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const earningsPerMonth = 20;

  // Load referred agents and compute monthly accruing earnings
  useEffect(() => {
    if (!profile?.referral_code) {
      setTotalReferrals(0);
      setActiveReferrals(0);
      setTotalEarnings(0);
      setLoadingCount(false);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('id, subscription_status, subscription_activated_at')
        .eq('referred_by_code', profile.referral_code);

      const rows = (data ?? []) as Array<{
        subscription_status: string;
        subscription_activated_at: string | null;
      }>;

      let earnings = 0;
      let active = 0;
      const now = Date.now();
      for (const r of rows) {
        if (r.subscription_status === 'active' && r.subscription_activated_at) {
          active += 1;
          const start = new Date(r.subscription_activated_at).getTime();
          // Count each completed 30-day month the referred agent has been paying
          const months = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)) + 1);
          earnings += months * earningsPerMonth;
        }
      }

      setTotalReferrals(rows.length);
      setActiveReferrals(active);
      setTotalEarnings(earnings);
      setLoadingCount(false);
    })();
  }, [profile?.referral_code]);

  // Use the permanent code from the user's profile
  const referralCode = profile?.referral_code ?? '-';
  const referralLink = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : '';

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
    <PageShell>
      <PageHeader>
        <PageHeaderHeading
          title="Referral Program"
          meta="Invite agents with one permanent code and track monthly recurring rewards."
        />
      </PageHeader>

      <PageContent>
        <PageStack className="max-w-5xl gap-6">
          <PageSection
            title="Referral Identity"
            description="This code is tied to your profile and powers every referral link you share."
            bodyClassName="p-6"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Referral Code
                </p>
                <p className="font-mono text-3xl font-semibold tracking-widest text-primary">
                  {referralCode}
                </p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground lg:text-right">
                <p>Tied directly to your brokerage account.</p>
                <p>Permanent, unique, and reusable across every signup flow.</p>
              </div>
            </div>
          </PageSection>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={DollarSign}
              label="Total Earned"
              value={loadingCount ? '-' : `$${totalEarnings}`}
              description="Accrued recurring rewards from active referred subscriptions."
              tone="primary"
            />
            <MetricCard
              icon={Users}
              label="Total Referrals"
              value={
                loadingCount ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    Loading
                  </span>
                ) : (
                  totalReferrals
                )
              }
              description={
                loadingCount
                  ? 'Loading referral performance.'
                  : `${activeReferrals} currently active and contributing monthly rewards.`
              }
            />
            <MetricCard
              icon={Gift}
              label="Per Active Referral"
              value={`$${earningsPerMonth}`}
              description="Recurring monthly reward for each active paying subscription."
              tone="success"
            />
          </div>

          <PageSection
            title="Share Your Referral"
            description="Use the QR code or direct link. Both resolve to the same tracked signup path."
            bodyClassName="p-6"
          >
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="flex justify-center lg:justify-start">
                {referralLink ? (
                  <div className="rounded-xl border bg-white p-4 shadow-surface">
                    <QRCodeSVG value={referralLink} size={180} level="M" />
                  </div>
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center rounded-xl border bg-muted/30">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Earn <span className="font-semibold text-foreground">${earningsPerMonth}</span> every month for each
                  referred agent who stays on an active subscription.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-sm"
                    placeholder="Loading your referral link..."
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 sm:min-w-28"
                    onClick={handleCopy}
                    disabled={!referralLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </Button>
                </div>
              </div>
            </div>
          </PageSection>

          <PageSection
            title="How It Works"
            description="The referral flow stays simple: share the link, let the agent sign up, and recurring rewards post automatically."
            bodyClassName="p-6"
          >
            <div className="grid gap-3">
              {[
                'Share your referral link with fellow agents.',
                'They sign up using your unique code or referral URL.',
                'You earn $20 each month while their subscription stays active.',
              ].map((step, index) => (
                <div key={step} className="app-surface-subtle flex items-start gap-4 px-4 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </PageSection>
        </PageStack>
      </PageContent>
    </PageShell>
  );
}
