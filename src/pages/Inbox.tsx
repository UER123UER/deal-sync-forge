import { useState } from 'react';
import { Mail, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Inbox() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [outlookDialogOpen, setOutlookDialogOpen] = useState(false);

  const handleSendEmail = () => {
    if (!composeForm.to.trim()) { toast.error('Recipient is required'); return; }
    // Open mailto as fallback since no SMTP backend
    const mailto = `mailto:${encodeURIComponent(composeForm.to)}?subject=${encodeURIComponent(composeForm.subject)}&body=${encodeURIComponent(composeForm.body)}`;
    window.open(mailto, '_blank');
    toast.success('Opening email client...');
    setComposeOpen(false);
    setComposeForm({ to: '', subject: '', body: '' });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Inbox</h1>
        <div className="flex-1" />
        <Button size="sm" className="text-xs gap-1.5" onClick={() => setComposeOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Email
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Mail className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">See your emails here!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
          Connect your Google or Outlook account to see your emails, send messages, and stay on top of your communication — all in one place.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setGoogleDialogOpen(true)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setOutlookDialogOpen(true)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
            Sign in with Outlook
          </Button>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compose Email</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-xs">To *</Label><Input value={composeForm.to} onChange={(e) => setComposeForm((f) => ({ ...f, to: e.target.value }))} placeholder="recipient@email.com" className="mt-1" /></div>
            <div><Label className="text-xs">Subject</Label><Input value={composeForm.subject} onChange={(e) => setComposeForm((f) => ({ ...f, subject: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Message</Label><Textarea value={composeForm.body} onChange={(e) => setComposeForm((f) => ({ ...f, body: e.target.value }))} className="mt-1 min-h-[120px]" /></div>
            <Button className="w-full gap-2" onClick={handleSendEmail}><Send className="w-3.5 h-3.5" /> Send via Email Client</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Setup Dialog */}
      <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Google Email Integration</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>To connect your Gmail account, you need to configure Google OAuth in Supabase:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a></li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Enable the Gmail API</li>
              <li>Add credentials to <a href="https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers" target="_blank" rel="noopener" className="text-primary underline">Supabase Auth Providers</a></li>
            </ol>
          </div>
          <Button variant="outline" onClick={() => setGoogleDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Outlook Setup Dialog */}
      <Dialog open={outlookDialogOpen} onOpenChange={setOutlookDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Microsoft Outlook Integration</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>To connect your Outlook account, configure Azure AD OAuth:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps" target="_blank" rel="noopener" className="text-primary underline">Azure App Registrations</a></li>
              <li>Register a new application</li>
              <li>Add Mail.Read and Mail.Send permissions</li>
              <li>Add credentials to <a href="https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers" target="_blank" rel="noopener" className="text-primary underline">Supabase Auth Providers</a></li>
            </ol>
          </div>
          <Button variant="outline" onClick={() => setOutlookDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
