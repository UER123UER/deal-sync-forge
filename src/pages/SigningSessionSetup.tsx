import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  useSigningSession,
  useCreateSigningSession,
  useUpdateSigningSession,
  useSessionRecipients,
  useAddSessionRecipient,
  useSessionDocuments,
  useAddSessionDocument,
} from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
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

interface PendingSessionDocument {
  checklistItemId: string;
  name: string;
  storage_path: string;
  page_count: number;
}

const normalizeDocumentName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const findMatchingAdminDocument = (
  checklistName: string,
  adminDocs: Array<{ file_name: string; storage_path: string }>
) => {
  const normalizedChecklist = normalizeDocumentName(checklistName);
  const checklistTokens = normalizedChecklist.split(' ').filter((token) => token.length > 2);

  return adminDocs.find((doc) => {
    const normalizedFileName = normalizeDocumentName(doc.file_name);
    if (
      normalizedFileName.includes(normalizedChecklist) ||
      normalizedChecklist.includes(normalizedFileName)
    ) {
      return true;
    }

    const matchedTokenCount = checklistTokens.filter((token) =>
      normalizedFileName.includes(token)
    ).length;

    return checklistTokens.length > 0 && matchedTokenCount >= Math.max(2, checklistTokens.length - 1);
  });
};

export default function SigningSessionSetup() {
  const { id: dealId, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = sessionId === 'new';
  const { data: deal } = useDeal(dealId);
  const { data: contacts } = useContacts();
  const { data: existingSession } = useSigningSession(isNew ? undefined : sessionId);
  const { data: existingRecipients } = useSessionRecipients(isNew ? undefined : sessionId);
  const { data: existingDocs } = useSessionDocuments(isNew ? undefined : sessionId);

  const createSession = useCreateSigningSession();
  const updateSession = useUpdateSigningSession();
  const addRecipient = useAddSessionRecipient();
  const addDocument = useAddSessionDocument();

  const [step, setStep] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [emailMessage, setEmailMessage] = useState('Please review and sign the attached document(s).');
  const [signingOrderEnabled, setSigningOrderEnabled] = useState(false);
  const [recipients, setRecipients] = useState<LocalRecipient[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingSessionDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [enableReminders, setEnableReminders] = useState(false);
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);

  const selectedDocumentsParam = searchParams.get('documents') || '';
  const selectedDocumentIds = selectedDocumentsParam
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('signer');

  useEffect(() => {
    if (!existingSession) return;

    setSessionName(existingSession.session_name);
    setEmailMessage(existingSession.email_message || '');
    setSigningOrderEnabled(existingSession.signing_order_enabled || false);
    setReminderDays(existingSession.reminder_interval_days || 3);
    setEnableReminders((existingSession.reminder_interval_days || 0) > 0);
  }, [existingSession]);

  useEffect(() => {
    if (!existingRecipients) return;

    setRecipients(
      existingRecipients.map((recipient) => ({
        id: recipient.id,
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        email: recipient.email,
        type: recipient.type,
        sort_order: recipient.sort_order || 0,
        contact_id: recipient.contact_id || undefined,
      }))
    );
  }, [existingRecipients]);

  useEffect(() => {
    if (isNew && deal && !sessionName) {
      setSessionName(`Signing - ${deal.address}`);
    }
  }, [deal, isNew, sessionName]);

  useEffect(() => {
    if (!isNew || !deal) return;

    const selectedChecklistItems = (deal.checklist_items || []).filter((item) =>
      selectedDocumentIds.includes(item.id)
    );

    if (selectedChecklistItems.length === 0) {
      setPendingDocuments([]);
      return;
    }

    let cancelled = false;

    const loadPendingDocuments = async () => {
      setDocumentsLoading(true);

      try {
        const { data: adminDocs, error } = await supabase
          .from('admin_documents')
          .select('file_name, storage_path')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const resolvedDocuments = selectedChecklistItems.map((item) => {
          const match = findMatchingAdminDocument(item.name, adminDocs || []);

          return {
            checklistItemId: item.id,
            name: item.name,
            storage_path: match?.storage_path || '',
            page_count: match ? 1 : 0,
          };
        });

        if (!cancelled) {
          setPendingDocuments(resolvedDocuments);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to resolve selected documents');
          setPendingDocuments(
            selectedChecklistItems.map((item) => ({
              checklistItemId: item.id,
              name: item.name,
              storage_path: '',
              page_count: 0,
            }))
          );
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    };

    loadPendingDocuments();

    return () => {
      cancelled = true;
    };
  }, [deal, isNew, selectedDocumentsParam]);

  const documentsForStep = isNew
    ? pendingDocuments
    : (existingDocs || []).map((doc) => ({
        checklistItemId: doc.id,
        name: doc.name,
        storage_path: doc.storage_path,
        page_count: doc.page_count || 0,
      }));

  const addLocalRecipient = () => {
    if (!newFirst || !newEmail) {
      toast.error('Name and email required');
      return;
    }

    setRecipients((prev) => [
      ...prev,
      {
        first_name: newFirst,
        last_name: newLast,
        email: newEmail,
        type: newType,
        sort_order: prev.length,
      },
    ]);

    setNewFirst('');
    setNewLast('');
    setNewEmail('');
    setNewType('signer');
  };

  const removeLocalRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const addFromContact = (contactId: string) => {
    const contact = contacts?.find((item) => item.id === contactId);
    if (!contact) return;
    if (recipients.some((recipient) => recipient.contact_id === contactId)) {
      toast.info('Already added');
      return;
    }

    setRecipients((prev) => [
      ...prev,
      {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || '',
        type: 'signer',
        sort_order: prev.length,
        contact_id: contact.id,
      },
    ]);
  };

  const handleContinue = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    try {
      let nextSessionId = sessionId;

      if (isNew) {
        const created = await createSession.mutateAsync({
          deal_id: dealId!,
          session_name: sessionName,
          email_message: emailMessage,
          signing_order_enabled: signingOrderEnabled,
          reminder_interval_days: enableReminders ? reminderDays : 0,
          expiration_date: enableExpiration
            ? new Date(Date.now() + expirationDays * 86400000).toISOString()
            : undefined,
        });
        nextSessionId = created.id;
      } else {
        await updateSession.mutateAsync({
          id: sessionId!,
          session_name: sessionName,
          email_message: emailMessage,
          signing_order_enabled: signingOrderEnabled,
          reminder_interval_days: enableReminders ? reminderDays : 0,
        });
      }

      for (const recipient of recipients) {
        if (recipient.id) continue;

        await addRecipient.mutateAsync({
          session_id: nextSessionId!,
          first_name: recipient.first_name,
          last_name: recipient.last_name,
          email: recipient.email,
          type: recipient.type,
          sort_order: recipient.sort_order,
          contact_id: recipient.contact_id,
        });
      }

      if (isNew) {
        for (const [index, document] of pendingDocuments.entries()) {
          await addDocument.mutateAsync({
            session_id: nextSessionId!,
            name: document.name,
            storage_path: document.storage_path,
            sort_order: index,
            page_count: document.page_count,
          });
        }
      }

      toast.success('Session saved');
      navigate(`/transactions/${dealId}/signing-session/${nextSessionId}/prepare`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}/signing-sessions`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">{isNew ? 'New Signing Session' : 'Edit Session'}</h1>
        </div>
        <Button
          onClick={handleContinue}
          disabled={documentsLoading || createSession.isPending || updateSession.isPending}
        >
          {step < STEPS.length - 1 ? 'Next' : 'Continue to Field Editor'}
        </Button>
      </div>

      <div className="flex border-b">
        {STEPS.map((stepName, index) => (
          <button
            key={stepName}
            onClick={() => setStep(index)}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              index === step
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {stepName}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Session Name / Email Subject</Label>
              <Input
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder="e.g. Signing - 123 Main St"
              />
            </div>
            <div>
              <Label>Email Message</Label>
              <Textarea
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                rows={5}
                placeholder="Message to recipients..."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Documents</h2>
            {documentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading selected documents...</p>
            ) : documentsForStep.length ? (
              <div className="space-y-2">
                {documentsForStep.map((document, index) => (
                  <div key={`${document.checklistItemId}-${index}`} className="flex items-center gap-2 border rounded px-3 py-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{document.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      document.storage_path ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {document.storage_path ? 'Ready' : 'Needs linked PDF'}
                    </span>
                  </div>
                ))}
                {documentsForStep.some((document) => !document.storage_path) && (
                  <p className="text-xs text-muted-foreground">
                    Documents without a linked PDF will still be added to the session, but they need a file before fields can be placed on them.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents were selected yet. Go back to the deal checklist and check the documents you want in this signing session.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Recipients</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="signing-order" className="text-sm">Set Signing Order</Label>
                <Switch id="signing-order" checked={signingOrderEnabled} onCheckedChange={setSigningOrderEnabled} />
              </div>
            </div>

            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center gap-2 border rounded px-3 py-2">
                {signingOrderEnabled && <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>}
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{recipient.first_name} {recipient.last_name}</span>
                  <span className="text-muted-foreground ml-2">{recipient.email}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">{recipient.type}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLocalRecipient(index)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {contacts && contacts.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Add from contacts</Label>
                <Select onValueChange={addFromContact}>
                  <SelectTrigger><SelectValue placeholder="Select a contact..." /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} — {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="border rounded p-3 space-y-3 bg-muted/30">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">Add New Recipient</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input value={newFirst} onChange={(event) => setNewFirst(event.target.value)} placeholder="First name" />
                <Input value={newLast} onChange={(event) => setNewLast(event.target.value)} placeholder="Last name" />
              </div>
              <Input value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Email" />
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
            {recipients
              .filter((recipient) => recipient.type === 'signer')
              .map((recipient, index) => (
                <div key={index} className="flex items-center gap-3 border rounded px-3 py-2">
                  <span className="text-sm font-medium flex-1">{recipient.first_name} {recipient.last_name}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Signer {index + 1}</span>
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
                  <Input
                    type="number"
                    value={reminderDays}
                    onChange={(event) => setReminderDays(Number(event.target.value))}
                    className="w-24"
                    min={1}
                  />
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
                  <Input
                    type="number"
                    value={expirationDays}
                    onChange={(event) => setExpirationDays(Number(event.target.value))}
                    className="w-24"
                    min={1}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
