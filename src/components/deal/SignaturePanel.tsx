import { useState } from 'react';
import { X, Plus, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateSignatureRequest } from '@/hooks/useSignatureRequests';

interface Contact {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

interface SignaturePanelProps {
  open: boolean;
  onClose: () => void;
  documentName: string;
  contacts: Contact[];
  dealId?: string;
  checklistItemId?: string;
  formData?: Record<string, any>;
  designatedFields?: Array<{ type: string; x: number; y: number; page: number; width: number; height: number; signerId?: string }>;
}

export function SignaturePanel({ open, onClose, documentName, contacts, dealId, checklistItemId, formData, designatedFields }: SignaturePanelProps) {
  const [to, setTo] = useState<string[]>([]);
  const [subject, setSubject] = useState('Please DocuSign');
  const [message, setMessage] = useState('Please review and sign the attached document.');
  const [attachments, setAttachments] = useState([documentName]);
  const createSignatureRequest = useCreateSignatureRequest();

  const handleSend = async () => {
    if (to.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    const recipientsWithoutEmail = to.filter((id) => {
      const c = contacts.find((x) => x.id === id);
      return !c?.email;
    });
    if (recipientsWithoutEmail.length > 0) {
      toast.error('All recipients must have an email address');
      return;
    }

    if (!dealId) {
      toast.error('No deal context');
      return;
    }

    try {
      const recipients = to.map((cId) => {
        const c = contacts.find((x) => x.id === cId)!;
        return {
          contact_id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          role: c.role,
        };
      });

      const sigReq = await createSignatureRequest.mutateAsync({
        deal_id: dealId,
        checklist_item_id: checklistItemId,
        document_name: documentName,
        sender_name: 'UE Realty',
        subject,
        message,
        form_data: formData || {},
        recipients,
        designated_fields: designatedFields,
      });

      // Build signing URL and open mailto with all recipients
      const baseUrl = window.location.origin;
      const signUrl = `${baseUrl}/sign/${sigReq.token}`;
      const allEmails = recipients.map((r) => r.email).join(',');
      const emailBody = `${message}\n\nPlease sign the document here:\n${signUrl}`;
      const mailto = `mailto:${allEmails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Use location.href to avoid popup blockers
      window.location.href = mailto;

      // Also copy signing link to clipboard for easy sharing
      try {
        await navigator.clipboard.writeText(signUrl);
        toast.success('Signature request created! Signing link copied to clipboard. Your email app should open — just hit Send.', { duration: 8000 });
      } catch {
        toast.success(`Signature request created! Signing link: ${signUrl}`, { duration: 8000 });
      }
      onClose();
    } catch {
      toast.error('Failed to create signature request');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-background border-l shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-14 border-b flex items-center px-4 justify-between flex-shrink-0">
              <h2 className="text-sm font-semibold text-foreground">Send for Signatures</h2>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <Label className="text-xs">
                  From <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1 flex items-center border rounded-md px-3 py-2 bg-muted">
                  <span className="text-sm text-foreground flex-1">uerealty1@gmail.com</span>
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  To <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1 space-y-2">
                  {contacts.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={to.includes(c.id)}
                        onChange={(e) => setTo(e.target.checked ? [...to, c.id] : to.filter((t) => t !== c.id))}
                        className="rounded border-input"
                      />
                      {c.firstName} {c.lastName} ({c.role})
                      {c.email && <span className="text-xs text-muted-foreground">— {c.email}</span>}
                      {!c.email && <span className="text-xs text-destructive">— no email</span>}
                    </label>
                  ))}
                  <button onClick={() => toast.info('Add recipient coming soon')} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add New Recipient
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label className="text-xs">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" rows={4} />
              </div>

              {/* Attachments */}
              <div>
                <Label className="text-xs mb-2 block">Attachments</Label>
                {attachments.map((att, i) => (
                  <div key={i} className="border rounded-md p-3 flex items-center gap-3 mb-2">
                    <div className="w-10 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{att}</p>
                      <p className="text-xs text-muted-foreground">Attached just now</p>
                    </div>
                    <button onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => toast.info('Add attachment coming soon')} className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
                  <Paperclip className="w-3 h-3" /> Add More Attachments
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end flex-shrink-0">
              <Button onClick={handleSend} disabled={to.length === 0 || createSignatureRequest.isPending}>
                {createSignatureRequest.isPending ? 'Sending...' : 'Send for Signature'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
