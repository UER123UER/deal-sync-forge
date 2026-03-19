import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, FileDown, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDealStore, Deal } from '@/store/deals';
import { cn } from '@/lib/utils';

const TABS = ['All Deals', 'Draft', 'Active', 'Pending', 'Archive'] as const;
type TabType = typeof TABS[number];

const statusMap: Record<TabType, Deal['status'] | 'all'> = {
  'All Deals': 'all',
  Draft: 'draft',
  Active: 'active',
  Pending: 'pending',
  Archive: 'archive',
};

const statusColors: Record<Deal['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  archive: 'bg-muted text-muted-foreground',
};

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<TabType>('All Deals');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const deals = useDealStore((s) => s.deals);

  const filtered = deals.filter((d) => {
    const matchesTab = statusMap[activeTab] === 'all' || d.status === statusMap[activeTab];
    const matchesSearch = !search || d.address.toLowerCase().includes(search.toLowerCase()) || d.mlsNumber.toLowerCase().includes(search.toLowerCase()) || d.primaryAgent.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Transactions</h1>
        <div className="flex-1" />
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deals by address, MLS# or agent name"
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export Deals
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileDown className="w-3.5 h-3.5" />
          Download Forms
        </Button>
        <div className="flex-1" />
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/transactions/new')}>
          <Plus className="w-3.5 h-3.5" />
          New Deal
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Address</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Price</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Critical Dates</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Primary Agent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal) => (
              <tr
                key={deal.id}
                className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/transactions/${deal.id}`)}
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2Icon />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{deal.address}</div>
                      <div className="text-xs text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full capitalize', statusColors[deal.status])}>
                    {deal.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{deal.price}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{deal.listingExpiration || '—'}</td>
                <td className="px-4 py-3 text-sm text-foreground">{deal.primaryAgent}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No deals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
