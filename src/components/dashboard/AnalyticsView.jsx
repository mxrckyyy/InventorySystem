import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, ChartColumnBig, Database, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { formatPHP } from '../../utils/currency.js';

const PALETTE = [
  '#f59e0b',
  '#fbbf24',
  '#facc15',
  '#d97706',
  '#fcd34d',
  '#eab308',
  '#b45309',
  '#fde68a'
];

const tooltipStyle = {
  backgroundColor: '#0c0a09',
  border: '1px solid #f59e0b55',
  borderRadius: '12px',
  color: '#f5f5f4',
  fontSize: 14
};

function Panel({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-400">
          <Icon size={15} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/60 text-slate-400">
          <Inbox size={20} />
        </div>
        <p className="text-sm text-slate-300">{message}</p>
      </div>
  );
}

function truncateLabel(value, max = 18) {
  const text = String(value || 'Unnamed');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AnalyticsView({ products = [] }) {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      setLogsLoading(true);

      const { data, error } = await supabase
        .from('stock_logs')
        .select('id, change_amount, type, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (cancelled) return;

      if (error) {
        setLogsError(error.message || 'Failed to load stock logs');
        setLogs([]);
      } else {
        setLogsError(null);
        setLogs(data || []);
      }

      setLogsLoading(false);
    };

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, []);

  const topProducts = useMemo(() => {
    return products
      .map((product) => ({
        name: truncateLabel(product.name),
        valuation:
          (Number(product.unit_price) || 0) * (Number(product.quantity) || 0)
      }))
      .sort((a, b) => b.valuation - a.valuation)
      .slice(0, 5);
  }, [products]);

  const categoryDistribution = useMemo(() => {
    const counts = new Map();

    products.forEach((product) => {
      const category = product.category || 'Uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return Array.from(counts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value
    );
  }, [products]);

  const movementTrend = useMemo(() => {
    const days = [];
    const indexByDay = new Map();

    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      const key = dayKey(date);
      const entry = {
        key,
        label: date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        net: 0,
        inbound: 0,
        outbound: 0
      };

      indexByDay.set(key, entry);
      days.push(entry);
    }

    logs.forEach((log) => {
      if (!log.created_at) return;

      const entry = indexByDay.get(dayKey(new Date(log.created_at)));
      if (!entry) return;

      const change = Number(log.change_amount) || 0;
      entry.net += change;

      if (change > 0) entry.inbound += change;
      if (change < 0) entry.outbound += Math.abs(change);
    });

    return days;
  }, [logs]);

  const hasMovement = movementTrend.some((day) => day.net !== 0);
  const totalMovement = logs.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          title="Top 5 Highest Valuation"
          subtitle="Unit price × quantity"
          icon={ChartColumnBig}
        >
          {topProducts.length === 0 ? (
            <EmptyState message="Add products to see valuation rankings." />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
                  barCategoryGap={14}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 13 }}
                    stroke="#334155"
                    tickFormatter={(value) => formatPHP(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fill: '#cbd5e1', fontSize: 13 }}
                    stroke="#334155"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(245,158,11,0.10)' }}
                    formatter={(value) => [formatPHP(value), 'Valuation']}
                  />
                  <Bar dataKey="valuation" radius={[0, 8, 8, 0]}>
                    {topProducts.map((entry, index) => (
                      <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          title="Inventory by Category"
          subtitle={`${categoryDistribution.length} categor${categoryDistribution.length === 1 ? 'y' : 'ies'} · ${products.length} products`}
          icon={Database}
        >
          {categoryDistribution.length === 0 ? (
            <EmptyState message="No categories available yet." />
          ) : (
            <>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={2}
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [`${value} item${value === 1 ? '' : 's'}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {categoryDistribution.map((entry, index) => (
                  <span
                    key={entry.name}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                    />
                    {entry.name}
                    <span className="text-slate-400">({entry.value})</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <Panel
        title="Stock Movement Trend"
        subtitle={`Last 14 days · ${totalMovement} log entr${totalMovement === 1 ? 'y' : 'ies'} (net change per day)`}
        icon={Activity}
      >
        {logsLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-300">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
            <span className="text-sm">Loading stock movement...</span>
          </div>
        ) : logsError ? (
          <div className="h-72 rounded-xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {logsError}
          </div>
        ) : !hasMovement ? (
          <EmptyState message="No stock movement recorded in the last 14 days." />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={movementTrend}
                margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
              >
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 13 }}
                  stroke="#334155"
                  interval={1}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 13 }} stroke="#334155" width={48} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(value, name) => [value, name === 'net' ? 'Net change' : name]}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="net"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#netGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </div>
  );
}
