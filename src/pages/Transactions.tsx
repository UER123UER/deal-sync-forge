import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeals, useDeleteDeal, DealRow } from '@/hooks/useDeals';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const TABS = ['All Deals', 'Draft', 'Active', 'Pending', 'Archive'] as const;
type TabType = typeof TABS[number];

const statusMap: Record<TabType, string> = {
  'All Deals': 'all',
  Draft: 'draft',
  Active: 'active',
  Pending: 'pending',
  Archive: 'archive',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  archive: 'bg-muted text-muted-foreground',
};

type SortKey = 'address' | 'status' | 'price' | 'listing_expiration' | 'primary_agent';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<TabType>('All Deals');
  const [search, setSearch] = useState('');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('address');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();

  const filtered = deals
    .filter((d) => {
      const matchesTab = statusMap[activeTab] === 'all' || d.status === statusMap[activeTab];
      const matchesSearch = !search || d.address.toLowerCase().includes(search.toLowerCase()) || (d.mls_number || '').toLowerCase().includes(search.toLowerCase()) || (d.primary_agent || '').toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const valA = (a[sortKey] || '').toLowerCase();
      const valB = (b[sortKey] || '').toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const toggleSelect = (id: string) => {
    setSelectedDeals((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedDeals.length === filtered.length) setSelectedDeals([]);
    else setSelectedDeals(filtered.map((d) => d.id));
  };

  const handleExport = () => {
    const headers = ['Address', 'City', 'State', 'Zip', 'Status', 'Price', 'MLS#', 'Primary Agent', 'Created'];
    const rows = filtered.map((d) => [d.address, d.city, d.state, d.zip, d.status, d.price || '', d.mls_number || '', d.primary_agent || '', d.created_at || '']);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deals-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Deals exported as CSV');
  };


  const handleBulkDelete = async () => {
    if (!selectedDeals.length) return;
    const count = selectedDeals.length;
    try {
      for (const id of selectedDeals) { await deleteDeal.mutateAsync(id); }
      setSelectedDeals([]);
      toast.success(`${count} deal(s) deleted`);
    } catch { toast.error('Failed to delete deals'); }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(sortKeyName)}>
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-3 h-3', sortKey === sortKeyName ? 'text-foreground' : 'text-muted-foreground/50')} />
      </span>
    </th>
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Transactions</h1>
        <div className="flex-1" />
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search deals by address, MLS# or agent name" className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}><Download className="w-3.5 h-3.5" /> Export Deals</Button>
        
        {selectedDeals.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive" onClick={handleBulkDelete}><Trash2 className="w-3.5 h-3.5" /> Delete ({selectedDeals.length})</Button>
        )}
        <div className="flex-1" />
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/transactions/new')}><Plus className="w-3.5 h-3.5" /> New Deal</Button>
      </div>

      <div className="px-6 border-b">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><p className="text-muted-foreground text-sm">Loading deals...</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 w-8"><Checkbox checked={selectedDeals.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></th>
                <SortHeader label="Address" sortKeyName="address" />
                <SortHeader label="Status" sortKeyName="status" />
                <SortHeader label="Price" sortKeyName="price" />
                <SortHeader label="Critical Dates" sortKeyName="listing_expiration" />
                <SortHeader label="Primary Agent" sortKeyName="primary_agent" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((deal) => (
                <tr key={deal.id} className="border-b hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/transactions/${deal.id}`)}>
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><Checkbox checked={selectedDeals.includes(deal.id)} onCheckedChange={() => toggleSelect(deal.id)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0"><Building2Icon /></div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{deal.address}</div>
                        <div className="text-xs text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={cn('text-xs font-medium px-2 py-1 rounded-full capitalize', statusColors[deal.status] || 'bg-muted text-muted-foreground')}>{deal.status}</span></td>
                  <td className="px-4 py-3 text-sm text-foreground">{deal.price}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{deal.listing_expiration || '—'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{deal.primary_agent}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No deals found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Building2Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  );
}
