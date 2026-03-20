import { useDeals } from '@/hooks/useDeals';
import { DollarSign, TrendingUp, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

function parseDollar(s: string | null): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
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
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Finances</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-5 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Volume</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{fmt(totalVolume)}</p>
            </div>
            <div className="border rounded-lg p-5 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-success" /></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected Commissions</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{fmt(totalCommission)}</p>
            </div>
            <div className="border rounded-lg p-5 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Home className="w-5 h-5 text-accent-foreground" /></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Deals</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeDeals.length}</p>
            </div>
          </div>

          {/* Monthly Volume Chart */}
          <div className="border rounded-lg p-5 bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Deal Volume</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="volume" className="fill-primary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No deal data to chart yet.</p>
            )}
          </div>

          {/* Per-deal breakdown */}
          <div className="border rounded-lg bg-card">
            <div className="px-5 py-3 border-b"><h3 className="text-sm font-semibold text-foreground">Deal Breakdown</h3></div>
            <div className="divide-y">
              {activeDeals.map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{d.address}</p>
                    <p className="text-xs text-muted-foreground">{d.city}, {d.state} · <span className="capitalize">{d.status}</span></p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{d.price || '$0'}</span>
                </div>
              ))}
              {activeDeals.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No deals yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
