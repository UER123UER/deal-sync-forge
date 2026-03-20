import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenHouses, useCreateOpenHouse, useDeleteOpenHouse } from '@/hooks/useOpenHouses';
import { useDeals } from '@/hooks/useDeals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Open Houses</h1>
        <div className="flex-1" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5"><Plus className="w-3.5 h-3.5" /> Schedule Open House</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Open House</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Deal</Label>
                <Select value={form.deal_id} onValueChange={(v) => setForm((f) => ({ ...f, deal_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a deal" /></SelectTrigger>
                  <SelectContent>{deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.address}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Start Time</Label><Input value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">End Time</Label><Input value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" /></div>
              <Button className="w-full" onClick={handleCreate} disabled={createOH.isPending}>{createOH.isPending ? 'Scheduling...' : 'Schedule'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : openHouses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Calendar className="w-8 h-8 text-muted-foreground" /></div>
          <p className="text-sm text-muted-foreground">No open houses scheduled yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-3">
            {openHouses.map((oh) => (
              <div key={oh.id} className="border rounded-lg p-4 flex items-center gap-4 bg-card hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(`/transactions/${oh.deal_id}`)} className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {getDealAddress(oh.deal_id)}
                  </button>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(oh.scheduled_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')} · {oh.start_time} – {oh.end_time}
                  </p>
                  {oh.notes && <p className="text-xs text-muted-foreground mt-1">{oh.notes}</p>}
                </div>
                <button onClick={() => handleDelete(oh.id)} className="p-1.5 rounded hover:bg-muted"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
