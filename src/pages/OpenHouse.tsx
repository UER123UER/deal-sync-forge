import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOpenHouses, useCreateOpenHouse, useDeleteOpenHouse } from '@/hooks/useOpenHouses';
import { useDeals } from '@/hooks/useDeals';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  EmptyState,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageSection,
  PageShell,
  PageStack,
} from '@/components/system/page-shell';

export default function OpenHouse() {
  const [searchParams] = useSearchParams();
  const dealFilter = searchParams.get('deal');
  const { data: openHouses = [], isLoading } = useOpenHouses(dealFilter || undefined);
  const { data: deals = [] } = useDeals();
  const createOH = useCreateOpenHouse();
  const deleteOH = useDeleteOpenHouse();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ deal_id: dealFilter || '', scheduled_date: '', start_time: '10:00 AM', end_time: '12:00 PM', notes: '' });

  const handleCreate = async () => {
    if (!form.deal_id || !form.scheduled_date) { toast.error('Deal and date are required'); return; }
    try {
      await createOH.mutateAsync({ deal_id: form.deal_id, scheduled_date: form.scheduled_date, start_time: form.start_time, end_time: form.end_time, notes: form.notes || undefined });
      toast.success('Open house scheduled');
      setDialogOpen(false);
      setForm({ deal_id: dealFilter || '', scheduled_date: '', start_time: '10:00 AM', end_time: '12:00 PM', notes: '' });
    } catch { toast.error('Failed to create open house'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteOH.mutateAsync(id); toast.success('Open house deleted'); } catch { toast.error('Failed to delete'); }
  };

  const getDealAddress = (dealId: string) => {
    const d = deals.find((x) => x.id === dealId);
    return d ? `${d.address}, ${d.city}` : dealId.slice(0, 8);
  };

  return (
    <PageShell>
      <PageHeader>
        <PageHeaderHeading title="Open Houses" meta={`${openHouses.length} scheduled`} />
        <PageHeaderActions>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Schedule Open House</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Open House</DialogTitle>
                <DialogDescription>
                  Attach the event to a deal so listing, date, and showing details stay aligned.
                </DialogDescription>
              </DialogHeader>
              <div className="app-form-grid pt-2">
                <div className="app-form-field">
                  <Label>Deal</Label>
                  <Select value={form.deal_id} onValueChange={(v) => setForm((f) => ({ ...f, deal_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select a deal" /></SelectTrigger>
                    <SelectContent>{deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.address}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="app-form-field">
                  <Label>Date</Label>
                  <Input type="date" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="app-form-field">
                    <Label>Start Time</Label>
                    <Input value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div className="app-form-field">
                    <Label>End Time</Label>
                    <Input value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
                  </div>
                </div>
                <div className="app-form-field">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={createOH.isPending}>{createOH.isPending ? 'Scheduling...' : 'Schedule'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageStack className="max-w-none">
          {isLoading ? (
            <section className="app-surface">
              <div className="app-empty-state">
                <p className="app-empty-copy">Loading open houses...</p>
              </div>
            </section>
          ) : openHouses.length === 0 ? (
            <section className="app-surface">
              <EmptyState
                icon={Calendar}
                title="No open houses scheduled"
                description="Schedule an open house from the header to keep event details tied to the correct deal."
              />
            </section>
          ) : (
            <PageSection title="Scheduled Events" description="Every open house is linked back to its transaction." bodyClassName="space-y-3 p-6">
              {openHouses.map((oh) => (
                <div key={oh.id} className="app-surface-subtle flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <button onClick={() => navigate(`/transactions/${oh.deal_id}`)} className="flex items-center gap-1 text-sm font-semibold text-foreground transition-standard hover:text-primary">
                      <MapPin className="w-3 h-3" /> {getDealAddress(oh.deal_id)}
                    </button>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {format(new Date(oh.scheduled_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')} · {oh.start_time} – {oh.end_time}
                    </p>
                    {oh.notes ? <p className="mt-1 text-sm text-muted-foreground">{oh.notes}</p> : null}
                  </div>
                  <Button variant="ghost" size="icon" className="self-end sm:self-auto" onClick={() => handleDelete(oh.id)} aria-label="Delete open house">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </PageSection>
          )}
        </PageStack>
      </PageContent>
    </PageShell>
  );
}
