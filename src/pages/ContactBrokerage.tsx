import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'compliance', label: 'Compliance Question' },
  { value: 'it', label: 'IT Question' },
  { value: 'general', label: 'General Question' },
];

export default function ContactBrokerage() {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!category) { toast.error('Please select a category'); return; }
    if (!message.trim()) { toast.error('Please enter a message'); return; }
    // In production this would upload files and send to backend
    toast.success('Message sent to brokerage!');
    setCategory('');
    setMessage('');
    setFiles([]);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Contact Brokerage</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="border rounded-lg p-6 bg-background space-y-5">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue..."
                className="mt-1.5 min-h-[120px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Attachments</Label>
              <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" size="sm" className="mt-1.5 gap-1.5 text-xs" onClick={() => fileRef.current?.click()}>
                <Paperclip className="w-3.5 h-3.5" /> Attach Files
              </Button>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-muted/30">
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} className="p-0.5 hover:bg-muted rounded">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full gap-1.5" onClick={handleSubmit}>
              <Send className="w-4 h-4" /> Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
