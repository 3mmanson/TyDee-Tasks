import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const metrics = [
  { key: 'tasks_completed', label: 'Completed', color: 'var(--color-positive)' },
  { key: 'pending_tasks', label: 'Pending', color: 'var(--color-warning)' },
  { key: 'at_risk', label: 'At Risk', color: 'var(--color-negative)' },
  { key: 'completion_rate', label: 'Rate %', color: 'var(--color-active)' },
];

const periods = [7, 30, 90];

const KpiHistoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState(metrics[0].key);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api.dashboard.getHistory(days)
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [days]);

  const activeMetric = metrics.find(m => m.key === metric);
  const chartData = data.map(d => ({
    date: d.snapshot_date?.slice(5) || d.snapshot_date,
    value: d[metric] ?? 0,
  }));

  return (
    <div
      className="rounded-xl border p-4 sm:p-6 glow-always card-light"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)', borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          KPI History
        </span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
            {metrics.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className="px-2.5 py-1 text-xs font-medium transition"
                style={{
                  backgroundColor: metric === m.key ? 'var(--color-active)' : 'transparent',
                  color: metric === m.key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Period:</span>
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setDays(p)}
            className="px-2 py-0.5 text-xs rounded transition font-medium"
            style={{
              backgroundColor: days === p ? 'var(--color-hover)' : 'transparent',
              color: days === p ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {p}d
          </button>
        ))}
      </div>
      {loading ? (
        <div className="h-48 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No history data yet — snapshots are recorded daily as you use the app.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--stroke)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--stroke)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [value, activeMetric?.label || '']}
              />
              <Bar dataKey="value" fill={activeMetric?.color || 'var(--color-active)'} radius={[3, 3, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KpiHistoryChart;
