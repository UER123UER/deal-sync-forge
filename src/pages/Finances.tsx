import { useDeals } from '@/hooks/useDeals';
import { DollarSign, TrendingUp, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  EmptyState,
  PageContent,
  PageHeader,
  PageHeaderHeading,
  PageShell,
  PageStack,
  PageSection,
} from '@/components/system/page-shell';
import { MetricCard } from '@/components/system/metric-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function parseDollar(s: string | null): number {
  if (!s) return 0;
  // Remove currency symbols, spaces, commas - keep only digits and first decimal point
  const stripped = s.replace(/[^0-9.]/g, '');
  const firstDot = stripped.indexOf('.');
  const clean = firstDot === -1
    ? stripped
    : stripped.slice(0, firstDot + 1) + stripped.slice(firstDot + 1).replace(/\./g, '');
  return parseFloat(clean) || 0;
}

export default function Finances() {
  const { data: deals = [], isLoading } = useDeals();

  const activeDeals = deals.filter((d) => d.status !== 'archive');
  const totalVolume = activeDeals.reduce((sum, d) => sum + parseDollar(d.price), 0);

  // Gather commissions from deal contacts
  let totalCommission = 0;
  activeDeals.forEach((d) => {
    (d.deal_contacts || []).forEach((dc) => {
      const c = dc.contact;
      if (c?.commission) {
        const val = parseFloat(c.commission.replace(/[^0-9.]/g, '')) || 0;
        if (c.commission_type === 'percentage') {
          totalCommission += (parseDollar(d.price) * val) / 100;
        } else {
          totalCommission += val;
        }
      }
    });
  });

  // Monthly volume chart
  const monthlyMap: Record<string, number> = {};
  deals.forEach((d) => {
    if (d.created_at) {
      const key = format(parseISO(d.created_at), 'yyyy-MM');
      monthlyMap[key] = (monthlyMap[key] || 0) + parseDollar(d.price);
    }
  });
  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, volume]) => ({ month: format(parseISO(month + '-01'), 'MMM yy'), volume }));

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <PageShell>
      <PageHeader>
        <PageHeaderHeading
          title="Finances"
          meta={`${activeDeals.length} active deals contributing to brokerage totals`}
        />
      </PageHeader>

      <PageContent>
        <PageStack className="max-w-none gap-6">
          {isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <section key={i} className="app-surface animate-pulse p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="h-3 w-28 rounded bg-muted" />
                    </div>
                    <div className="h-8 w-28 rounded bg-muted" />
                  </section>
                ))}
              </div>
              <section className="app-surface animate-pulse p-6">
                <div className="mb-4 h-4 w-40 rounded bg-muted" />
                <div className="h-80 rounded-lg bg-muted/60" />
              </section>
              <section className="app-surface overflow-hidden animate-pulse">
                <div className="border-b px-6 py-4">
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
                <div className="divide-y">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-3.5 w-56 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted/70" />
                      </div>
                      <div className="h-3.5 w-20 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  icon={DollarSign}
                  label="Total Volume"
                  value={fmt(totalVolume)}
                  description="Combined list price across all non-archived deals."
                  tone="primary"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Expected Commissions"
                  value={fmt(totalCommission)}
                  description="Derived from active deal pricing and assigned commission rules."
                  tone="success"
                />
                <MetricCard
                  icon={Home}
                  label="Active Deals"
                  value={activeDeals.length}
                  description="Deals still in play and contributing to financial reporting."
                />
              </div>

              <PageSection
                title="Monthly Deal Volume"
                description="Tracks rolling deal volume for the most recent 12 creation months."
                bodyClassName="p-6"
              >
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="month"
                        className="fill-muted-foreground text-xs"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        className="fill-muted-foreground text-xs"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="volume" className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title="No volume data yet"
                    description="Once deals are created, monthly volume will appear here automatically."
                  />
                )}
              </PageSection>

              <PageSection
                title="Deal Breakdown"
                description="Every active deal listed with its location, current status, and recorded price."
                bodyClassName="p-0"
              >
                {activeDeals.length > 0 ? (
                  <>
                    <div className="divide-y md:hidden">
                      {activeDeals.map((deal) => (
                        <div key={deal.id} className="space-y-3 px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-foreground">{deal.address}</div>
                            <div className="text-sm text-muted-foreground">
                              {deal.city}, {deal.state} {deal.zip}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status</div>
                              <div className="capitalize text-muted-foreground">{deal.status}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Created</div>
                              <div className="text-muted-foreground">
                                {deal.created_at ? format(parseISO(deal.created_at), 'MMM d, yyyy') : '-'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Price</div>
                              <div className="font-medium text-foreground">{deal.price || '$0'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeDeals.map((deal) => (
                            <TableRow key={deal.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold text-foreground">{deal.address}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {deal.city}, {deal.state} {deal.zip}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize text-muted-foreground">{deal.status}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {deal.created_at ? format(parseISO(deal.created_at), 'MMM d, yyyy') : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium text-foreground">
                                {deal.price || '$0'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={Home}
                    title="No active deals to report"
                    description="Financial breakdown appears once the brokerage has active or pending business."
                  />
                )}
              </PageSection>
            </>
          )}
        </PageStack>
      </PageContent>
    </PageShell>
  );
}
