import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Plus, Edit2, Trash2, RefreshCw, Clock } from 'lucide-react';

const actionIcons = {
  task_created: <Plus className="w-4 h-4" style={{ color: 'var(--color-positive)' }} />,
  task_updated: <Edit2 className="w-4 h-4" style={{ color: 'var(--color-active)' }} />,
  status_changed: <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />,
  task_deleted: <Trash2 className="w-4 h-4" style={{ color: 'var(--color-negative)' }} />,
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.activity.getAll()
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  if (loading) return <div className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading activity...</div>;
  if (logs.length === 0) return <div className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet</div>;

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {logs.map(log => (
        <div
          key={log.id}
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="mt-0.5">{actionIcons[log.action] || <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.details}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatTime(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
