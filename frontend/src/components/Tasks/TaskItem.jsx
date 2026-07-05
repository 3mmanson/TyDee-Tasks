import React from 'react';
import { Calendar, Flag, Trash2, Edit2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

const TaskItem = ({ task, onDelete, onEdit, onToggleStatus }) => {
  const priorityColors = {
    Low: 'text-gray-500 bg-gray-100',
    Medium: 'text-yellow-600 bg-yellow-50',
    High: 'text-red-600 bg-red-50',
  };

  const statusColors = {
    pending: 'text-gray-600 bg-gray-100',
    in_progress: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
    overdue: 'text-red-600 bg-red-50',
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const d = new Date(dueDate);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div className={`group bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 ${task.status === 'overdue' ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
      <button
        onClick={() => onToggleStatus(task)}
        className="mt-1 transition-transform hover:scale-110"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : task.status === 'overdue' ? (
          <AlertTriangle className="w-6 h-6 text-red-500" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className={`font-semibold text-gray-800 truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {task.description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDueDate(task.due_date)}</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto sm:ml-0">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Edit task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
