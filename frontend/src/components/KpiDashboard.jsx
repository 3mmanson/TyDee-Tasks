import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const kpiConfig = [
  {
    key: 'tasksCompleted',
    label: 'Completed',
    icon: CheckCircle,
    color: 'var(--color-positive)',
    showRate: false,
    valueKey: 'count',
  },
  {
    key: 'pendingTasks',
    label: 'Pending',
    icon: Clock,
    color: 'var(--color-warning)',
    showRate: false,
    valueKey: 'count',
  },
  {
    key: 'atRisk',
    label: 'At Risk',
    icon: AlertTriangle,
    color: 'var(--color-negative)',
    showRate: false,
    valueKey: 'count',
  },
  {
    key: 'completionRate',
    label: 'Completion Rate',
    icon: TrendingUp,
    color: 'var(--color-active)',
    showRate: true,
    valueKey: 'rate',
  },
];

// Trend is "good" if: completed ↑, pending ↓, atRisk ↓, completionRate ↑
const isTrendPositive = (key, change) => {
  if (key === 'pendingTasks' || key === 'atRisk') return change <= 0;
  return change >= 0;
};

const KpiDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.getStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border animate-pulse"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="h-4 w-20 rounded mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            <div className="h-8 w-16 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            <div className="h-3 w-24 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {kpiConfig.map(kpi => {
        const data = stats[kpi.key];
        const value = data[kpi.valueKey];
        const change = data.change;
        const positive = isTrendPositive(kpi.key, change);
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.key}
            className="p-4 border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {kpi.label}
              </span>
              <Icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {kpi.showRate ? `${value}%` : value}
            </div>
            <div className="text-xs" style={{ color: positive ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {change > 0 ? '+' : ''}{change}% vs last week
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiDashboard;
