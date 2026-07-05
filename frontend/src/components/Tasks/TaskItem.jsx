import { Calendar, Trash2, Edit2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { formatDueDate } from '../../utils/dateUtils';

const categoryColorMap = {
  Design: 'var(--color-negative)',
  Marketing: 'var(--color-active)',
  Development: 'var(--color-positive)',
  Research: 'var(--color-warning)',
  Personal: 'var(--color-primary)',
};

const priorityColorMap = {
  High: { bg: 'var(--color-negative)', text: '#fff' },
  Medium: { bg: 'var(--color-warning)', text: '#09090B' },
  Low: { bg: 'var(--stroke)', text: 'var(--text-secondary)' },
};

const statusColorMap = {
  pending: { bg: 'var(--stroke)', text: 'var(--text-secondary)' },
  in_progress: { bg: 'var(--color-warning)', text: '#09090B' },
  completed: { bg: 'var(--color-positive)', text: '#09090B' },
  overdue: { bg: 'var(--color-negative)', text: '#fff' },
};

const TaskItem = ({ task, onDelete, onEdit, onToggleStatus }) => {
  const isOverdue = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const categoryColor = categoryColorMap[task.category] || 'var(--color-active)';
  const pStyle = priorityColorMap[task.priority] || priorityColorMap.Medium;
  const sStyle = statusColorMap[task.status] || statusColorMap.pending;

  return (
    <div
      className="group relative flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 glow-hover card-light"
      style={{
        backgroundColor: isOverdue ? 'var(--color-negative)' + '08' : 'var(--bg-secondary)',
        borderColor: isOverdue ? 'var(--color-negative)' + '40' : 'var(--stroke)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Left: Checkbox or Overdue triangle */}
      <button
        onClick={() => onToggleStatus(task)}
        className="shrink-0 transition-transform hover:scale-110"
        title={isOverdue ? 'Mark complete' : isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-positive)' }} />
        ) : isOverdue ? (
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-negative)' }} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Center: Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}
          >
            {task.title}
          </h3>
          {/* Category pill */}
          <span
            className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: categoryColor + '18',
              color: categoryColor,
              borderRadius: '4px',
            }}
          >
            {task.category || 'General'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {/* Status pill */}
          <span
            className="px-2 py-0.5 font-bold uppercase tracking-wider"
            style={{
              backgroundColor: sStyle.bg,
              color: sStyle.text,
              borderRadius: 'var(--radius-sm)',
              fontSize: '10px',
            }}
          >
            {task.status.replace('_', ' ')}
          </span>
          {/* Priority pill */}
          <span
            className="px-2 py-0.5 font-bold uppercase tracking-wider"
            style={{
              backgroundColor: pStyle.bg,
              color: pStyle.text,
              borderRadius: 'var(--radius-sm)',
              fontSize: '10px',
            }}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* Right: Due date + actions */}
      <div className="flex items-center gap-3 shrink-0">
        {task.due_date && (
          <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDueDate(task.due_date)}</span>
          </div>
        )}

        {/* Hover actions */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ transitionDuration: '150ms' }}
        >
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg transition"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-active)'; e.currentTarget.style.backgroundColor = 'var(--color-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg transition"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-negative)'; e.currentTarget.style.backgroundColor = 'var(--color-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
