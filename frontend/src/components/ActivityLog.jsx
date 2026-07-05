import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Plus, Edit2, Trash2, RefreshCw, Clock } from 'lucide-react';

const actionIcons = {
  task_created: <Plus className="w-4 h-4 text-green-500" />,
  task_updated: <Edit2 className="w-4 h-4 text-blue-500" />,
  status_changed: <RefreshCw className="w-4 h-4 text-yellow-500" />,
  task_deleted: <Trash2 className="w-4 h-4 text-red-500" />,
};

const actionColors = {
  task_created: 'bg-green-50',
  task_updated: 'bg-blue-50',
  status_changed: 'bg-yellow-50',
  task_deleted: 'bg-red-50',
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

  if (loading) return <div className="py-4 text-center text-gray-400 text-sm">Loading activity...</div>;
  if (logs.length === 0) return <div className="py-4 text-center text-gray-400 text-sm">No activity yet</div>;

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {logs.map(log => (
        <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg ${actionColors[log.action] || 'bg-gray-50'}`}>
          <div className="mt-0.5">{actionIcons[log.action] || <Clock className="w-4 h-4 text-gray-400" />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">{log.details}</p>
            <p className="text-xs text-gray-400 mt-1">{formatTime(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
