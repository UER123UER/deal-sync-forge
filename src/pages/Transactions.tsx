import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Trash2, ArrowUpDown, Home, TrendingUp, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeals, useDeleteDeal, DealRow } from '@/hooks/useDeals';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  EmptyState,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageShell,
  PageStack,
  PageToolbar,
  PageToolbarGroup,
} from '@/components/system/page-shell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  draft: 'border-border bg-muted text-muted-foreground',
  active: 'border-success/15 bg-success/10 text-success',
  pending: 'border-warning/15 bg-warning/10 text-warning',
  archive: 'border-border bg-muted text-muted-foreground',
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
  const { data: tasks = [] } = useTasks();
  const deleteDeal = useDeleteDeal();

  const dashboard = useMemo(() => {
    const parsePrice = (p: string | null) => {
      if (!p) return 0;
      const n = Number(String(p).replace(/[^0-9.]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };
    const active = deals.filter((d) => d.status === 'active');
    const pipeline = active.reduce((s, d) => s + parsePrice(d.price), 0);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const closedThisMonth = deals.filter(
      (d) => d.status === 'archive' && (d.created_at || '').startsWith(monthKey),
    ).length;
    const todayStr = now.toISOString().split('T')[0];
    const tasksDueToday = tasks.filter(
      (t) => !t.completed && t.due_date && t.due_date.startsWith(todayStr),
    ).length;
    return {
      activeCount: active.length,
      pipeline,
      closedThisMonth,
      tasksDueToday,
    };
  }, [deals, tasks]);

  const fmtCurrency = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `$${Math.round(n / 1_000)}K`
        : `$${n.toLocaleString()}`;

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
    <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(sortKeyName)}>
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-3 h-3', sortKey === sortKeyName ? 'text-foreground' : 'text-muted-foreground/50')} />
      </span>
    </TableHead>
  );

  return (
    <PageShell>
      <PageHeader>
        <PageHeaderHeading title="Transactions" meta={`${filtered.length} visible • ${deals.length} total`} />
        <PageHeaderActions>
          <div className="relative w-full max-w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by address, MLS, or agent" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </PageHeaderActions>
      </PageHeader>

      <PageToolbar>
        <PageToolbarGroup className="app-segmented">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              data-state={activeTab === tab ? 'active' : 'inactive'}
              onClick={() => setActiveTab(tab)}
              className="app-segmented-item"
            >
              {tab}
            </button>
          ))}
        </PageToolbarGroup>

        <PageToolbarGroup className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          {selectedDeals.length > 0 ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedDeals.length})
            </Button>
          ) : null}
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/transactions/new')}>
            <Plus className="h-3.5 w-3.5" />
            New Deal
          </Button>
        </PageToolbarGroup>
      </PageToolbar>

      <PageContent className="py-4">
        <PageStack className="max-w-none gap-4">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Deals', value: dashboard.activeCount.toLocaleString(), icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Pipeline Value', value: fmtCurrency(dashboard.pipeline), icon: DollarSign, color: 'text-blue-600' },
              { label: 'Closed This Month', value: dashboard.closedThisMonth.toLocaleString(), icon: CheckCircle2, color: 'text-violet-600' },
              { label: 'Tasks Due Today', value: dashboard.tasksDueToday.toLocaleString(), icon: Clock, color: 'text-amber-600' },
            ].map((s) => (
              <div key={s.label} className="app-surface p-4 flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground truncate">{s.label}</div>
                  <div className="text-lg font-semibold text-foreground truncate">{s.value}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="app-surface overflow-hidden">
            {isLoading ? (
              <div className="divide-y">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-48 rounded bg-muted" />
                        <div className="h-3 w-28 rounded bg-muted/70" />
                      </div>
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted" />
                    <div className="h-3.5 w-20 rounded bg-muted" />
                    <div className="h-3.5 w-24 rounded bg-muted" />
                    <div className="h-3.5 w-24 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No transactions found"
                description={search ? 'Clear the current filters or search term to see more transactions.' : 'Create your first deal to start tracking listings, contracts, and office follow-up in one system.'}
                action={
                  <Button size="sm" className="gap-1.5" onClick={() => navigate('/transactions/new')}>
                    <Plus className="h-3.5 w-3.5" />
                    Create Deal
                  </Button>
                }
              />
            ) : (
              <>
                <div className="divide-y md:hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Select visible deals</span>
                    <Checkbox checked={selectedDeals.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </div>
                  {filtered.map((deal) => (
                    <button
                      key={deal.id}
                      type="button"
                      className="flex w-full flex-col gap-3 px-4 py-4 text-left transition-standard hover:bg-muted/20"
                      onClick={() => navigate(`/transactions/${deal.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedDeals.includes(deal.id)} onCheckedChange={() => toggleSelect(deal.id)} />
                        </div>
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Building2Icon />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-foreground">{deal.address}</div>
                            <div className="truncate text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pl-7 text-sm">
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status</div>
                          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none', statusColors[deal.status] || 'border-border bg-muted text-muted-foreground')}>
                            {deal.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Price</div>
                          <div className="font-medium text-foreground">{deal.price || '-'}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Critical Date</div>
                          <div className="text-muted-foreground">{deal.listing_expiration || '-'}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Primary Agent</div>
                          <div className="text-muted-foreground">{deal.primary_agent || '-'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedDeals.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                        </TableHead>
                        <SortHeader label="Address" sortKeyName="address" />
                        <SortHeader label="Status" sortKeyName="status" />
                        <SortHeader label="Price" sortKeyName="price" />
                        <SortHeader label="Critical Dates" sortKeyName="listing_expiration" />
                        <SortHeader label="Primary Agent" sortKeyName="primary_agent" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((deal) => (
                        <TableRow key={deal.id} className="cursor-pointer" onClick={() => navigate(`/transactions/${deal.id}`)}>
                          <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selectedDeals.includes(deal.id)} onCheckedChange={() => toggleSelect(deal.id)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Building2Icon />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">{deal.address}</div>
                                <div className="truncate text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none', statusColors[deal.status] || 'border-border bg-muted text-muted-foreground')}>
                              {deal.status}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{deal.price || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{deal.listing_expiration || '-'}</TableCell>
                          <TableCell>{deal.primary_agent || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </section>
        </PageStack>
      </PageContent>
    </PageShell>
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
