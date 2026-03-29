import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContacts } from '@/hooks/useContacts';
import { useDeal } from '@/hooks/useDeals';
import {
  useSigningSession, useCreateSigningSession, useUpdateSigningSession,
  useSessionRecipients, useAddSessionRecipient, useRemoveSessionRecipient,
  useSessionDocuments, useAddSessionDocument,
} from '@/hooks/useSigningSessions';
import { toast } from 'sonner';

const STEPS = ['Details', 'Documents', 'Recipients', 'Roles', 'Settings'] as const;

interface LocalRecipient {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  sort_order: number;
  contact_id?: string;
}

export default function SigningSessionSetup() {
  const { id: dealId, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const isNew = sessionId === 'new';
  const { data: deal } = useDeal(dealId);
  const { data: contacts } = useContacts();
  const { data: existingSession } = useSigningSession(isNew ? undefined : sessionId);
  const { data: existingRecipients } = useSessionRecipients(isNew ? undefined : sessionId);
  const { data: existingDocs } = useSessionDocuments(isNew ? undefined : sessionId);

  const createSession = useCreateSigningSession();
  const updateSession = useUpdateSigningSession();
  const addRecipient = useAddSessionRecipient();
  const removeRecipient = useRemoveSessionRecipient();
  const addDocument = useAddSessionDocument();

  const [step, setStep] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [emailMessage, setEmailMessage] = useState('Please review and sign the attached document(s).');
  const [signingOrderEnabled, setSiggningOrderEnabled] = useState(false);
  const [recipients, setRecipients] = useState<LocalRecipient[]>([]);
  const [reminderDays, setReminderDays] = useState(3);
  const [enableReminders, setEnableReminders] = useState(false);
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);

  // New recipient form
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('signer');

  // Populate from existing
  useEffect(() => {
    if (existingSession) {
      setSessionName(existingSession.session_name);
      setEmailMessage(existingSession.email_message || '');
      setSiggningOrderEnabled(existingSession.signing_order_enabled || false);
      setReminderDays(existingSession.reminder_interval_days || 3);
      setEnableReminders((existingSession.reminder_interval_days || 0) > 0);
    }
  }, [existingSession]);

  useEffect(() => {
    if (existingRecipients) {
      setRecipients(existingRecipients.map(r => ({
        id: r.id, first_name: r.first_name, last_name: r.last_name,
        email: r.email, type: r.type, sort_order: r.sort_order || 0, contact_id: r.contact_id || undefined,
      })));
    }
  }, [existingRecipients]);

  // Default session name from deal
  useEffect(() => {
    if (isNew && deal && !sessionName) {
      setSessionName(`Signing - ${deal.address}`);
    }
  }, [deal, isNew, sessionName]);

  const addLocalRecipient = () => {
    if (!newFirst || !newEmail) { toast.error('Name and email required'); return; }
    setRecipients(prev => [...prev, { first_name: newFirst, last_name: newLast, email: newEmail, type: newType, sort_order: prev.length }]);
    setNewFirst(''); setNewLast(''); setNewEmail(''); setNewType('signer');
  };

  const removeLocalRecipient = (idx: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== idx));
  };

  const addFromContact = (contactId: string) => {
    const c = contacts?.find(x => x.id === contactId);
    if (!c) return;
    if (recipients.some(r => r.contact_id === contactId)) { toast.info('Already added'); return; }
    setRecipients(prev => [...prev, {
      first_name: c.first_name, last_name: c.last_name, email: c.email || '',
      type: 'signer', sort_order: prev.length, contact_id: c.id,
    }]);
  };

  const handleContinue = async () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return; }

    // Final step — save and go to prepare
    try {
      let sid = sessionId;
      if (isNew) {
        const created = await createSession.mutateAsync({
          deal_id: dealId!,
          session_name: sessionName,
          email_message: emailMessage,
          signing_order_enabled: signingOrderEnabled,
          reminder_interval_days: enableReminders ? reminderDays : 0,
          expiration_date: enableExpiration ? new Date(Date.now() + expirationDays * 86400000).toISOString() : undefined,
        });
        sid = created.id;
      } else {
        await updateSession.mutateAsync({
          id: sessionId!,
          session_name: sessionName,
          email_message: emailMessage,
          signing_order_enabled: signingOrderEnabled,
          reminder_interval_days: enableReminders ? reminderDays : 0,
        });
      }

      // Save recipients
      for (const r of recipients) {
        if (!r.id) {
          await addRecipient.mutateAsync({
            session_id: sid!,
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            type: r.type,
            sort_order: r.sort_order,
            contact_id: r.contact_id,
          });
        }
      }

      toast.success('Session saved');
      navigate(`/transactions/${dealId}/signing-session/${sid}/prepare`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}/signing-sessions`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">{isNew ? 'New Signing Session' : 'Edit Session'}</h1>
        </div>
        <Button onClick={handleContinue}>
          {step < STEPS.length - 1 ? 'Next' : 'Continue to Field Editor'}
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex border-b">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              i === step ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Session Name / Email Subject</Label>
              <Input value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g. Signing - 123 Main St" />
            </div>
            <div>
              <Label>Email Message</Label>
              <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={5} placeholder="Message to recipients..." />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Documents</h2>
            {existingDocs?.length ? (
              existingDocs.map(d => (
                <div key={d.id} className="flex items-center gap-2 border rounded px-3 py-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{d.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Documents will be automatically attached from the current form. You can add more in the field editor.</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Recipients</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="signing-order" className="text-sm">Set Signing Order</Label>
                <Switch id="signing-order" checked={signingOrderEnabled} onCheckedChange={setSiggningOrderEnabled} />
              </div>
            </div>

            {/* Existing recipients */}
            {recipients.map((r, i) => (
              <div key={i} className="flex items-center gap-2 border rounded px-3 py-2">
                {signingOrderEnabled && <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>}
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{r.first_name} {r.last_name}</span>
                  <span className="text-muted-foreground ml-2">{r.email}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">{r.type}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLocalRecipient(i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {/* Add from contacts */}
            {contacts && contacts.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Add from contacts</Label>
                <Select onValueChange={addFromContact}>
                  <SelectTrigger><SelectValue placeholder="Select a contact..." /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add new */}
            <div className="border rounded p-3 space-y-3 bg-muted/30">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">Add New Recipient</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input value={newFirst} onChange={e => setNewFirst(e.target.value)} placeholder="First name" />
                <Input value={newLast} onChange={e => setNewLast(e.target.value)} placeholder="Last name" />
              </div>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" />
              <div className="flex gap-2">
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signer">Signer</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="cc">CC</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={addLocalRecipient}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Roles Assignment</h2>
            <p className="text-sm text-muted-foreground">Roles are auto-assigned based on recipient order. You can adjust these in the field editor.</p>
            {recipients.filter(r => r.type === 'signer').map((r, i) => (
              <div key={i} className="flex items-center gap-3 border rounded px-3 py-2">
                <span className="text-sm font-medium flex-1">{r.first_name} {r.last_name}</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Signer {i + 1}</span>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-muted-foreground">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border rounded p-4">
                <div>
                  <div className="text-sm font-medium">Auto Reminders</div>
                  <div className="text-xs text-muted-foreground">Send periodic reminders to unsigned recipients</div>
                </div>
                <Switch checked={enableReminders} onCheckedChange={setEnableReminders} />
              </div>
              {enableReminders && (
                <div className="pl-4">
                  <Label>Remind every (days)</Label>
                  <Input type="number" value={reminderDays} onChange={e => setReminderDays(Number(e.target.value))} className="w-24" min={1} />
                </div>
              )}
              <div className="flex items-center justify-between border rounded p-4">
                <div>
                  <div className="text-sm font-medium">Expiration</div>
                  <div className="text-xs text-muted-foreground">Session expires after a set number of days</div>
                </div>
                <Switch checked={enableExpiration} onCheckedChange={setEnableExpiration} />
              </div>
              {enableExpiration && (
                <div className="pl-4">
                  <Label>Expires in (days)</Label>
                  <Input type="number" value={expirationDays} onChange={e => setExpirationDays(Number(e.target.value))} className="w-24" min={1} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
