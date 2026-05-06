import { useState, useEffect, useMemo } from 'react';
import { Link2, Plus, Copy, Check, Trash2, ExternalLink, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type AffiliateLink = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  url: string;
  notes: string | null;
  created_at: string;
};

const CATEGORIES = [
  'Mortgage Broker',
  'Home Inspector',
  'Title Company',
  'Insurance',
  'Attorney',
  'Contractor',
  'Photographer',
  'Stager',
  'Other',
];

export default function AffiliateLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  // form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mortgage Broker');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setName(''); setCategory('Mortgage Broker'); setUrl(''); setNotes(''); setEditing(null);
  };

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('affiliate_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load affiliate links');
    setLinks((data ?? []) as AffiliateLink[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (link: AffiliateLink) => {
    setEditing(link);
    setName(link.name);
    setCategory(link.category);
    setUrl(link.url);
    setNotes(link.notes ?? '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim() || !url.trim()) {
      toast.error('Name and URL are required');
      return;
    }
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    if (editing) {
      const { error } = await (supabase as any)
        .from('affiliate_links')
        .update({ name, category, url: normalizedUrl, notes })
        .eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Affiliate link updated');
    } else {
      const { error } = await (supabase as any)
        .from('affiliate_links')
        .insert({ user_id: user.id, name, category, url: normalizedUrl, notes });
      if (error) { toast.error('Failed to add'); return; }
      toast.success('Affiliate link added');
    }
    setOpen(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this affiliate link?')) return;
    const { error } = await (supabase as any).from('affiliate_links').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Deleted');
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCopy = (link: AffiliateLink) => {
    navigator.clipboard.writeText(link.url).catch(() => {});
    setCopiedId(link.id);
    toast.success('Link copied');
    setTimeout(() => setCopiedId((c) => (c === link.id ? null : c)), 1800);
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(links.map((l) => l.category)))], [links]);
  const visible = filter === 'All' ? links : links.filter((l) => l.category === filter);

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Affiliate Links</h1>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Link
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-muted-foreground">
            Save and share referral links for your trusted partners - mortgage brokers, inspectors, title companies, and more.
            Copy a link any time to share it with a client.
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filter === c
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : visible.length === 0 ? (
            <div className="border border-dashed rounded-lg p-12 text-center">
              <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No affiliate links yet.</p>
              <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5">
                <Plus className="w-4 h-4" /> Add your first link
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {visible.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 bg-background flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{link.name}</h3>
                      <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {link.category}
                      </span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1 mt-1"
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {link.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5">{link.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(link)} className="gap-1.5">
                      {copiedId === link.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(link)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Affiliate Link' : 'Add Affiliate Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="aff-name">Partner Name</Label>
              <Input id="aff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Smith - ABC Mortgage" />
            </div>
            <div>
              <Label htmlFor="aff-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="aff-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aff-url">Referral Link</Label>
              <Input id="aff-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label htmlFor="aff-notes">Notes (optional)</Label>
              <Textarea id="aff-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything to remember about this partner…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add Link'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
