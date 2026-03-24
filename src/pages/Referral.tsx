import { useState } from 'react';
import { Copy, Check, DollarSign, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  // Mock data
  const totalReferrals = 3;
  const earningsPerReferral = 20;
  const totalEarnings = totalReferrals * earningsPerReferral;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Referral Program</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Earnings Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-primary" /></div>
                <span className="text-xs text-muted-foreground">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-foreground">${totalEarnings}</div>
            </div>
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
                <span className="text-xs text-muted-foreground">Referrals</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalReferrals}</div>
            </div>
            <div className="border rounded-lg p-5 bg-background">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Gift className="w-4 h-4 text-primary" /></div>
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
            <div className="p-4 bg-background border rounded-xl">
              <QRCodeSVG value={referralLink} size={180} level="M" />
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={handleCopy}>
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
                { step: '2', text: 'They sign up using your link' },
                { step: '3', text: 'Once they become a paying agent, you earn $20' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{item.step}</div>
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
