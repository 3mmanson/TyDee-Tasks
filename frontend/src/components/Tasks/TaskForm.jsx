import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { toLocalISOString } from '../../utils/dateUtils';
import { X } from 'lucide-react';

const TaskForm = ({ isOpen, onClose, onTaskCreated, editingTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    category: 'Personal',
    due_date: ''
  });
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const normalizePriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (editingTask) {
      const dt = editingTask.due_date ? new Date(editingTask.due_date) : null;
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'pending',
        priority: normalizePriority(editingTask.priority),
        category: editingTask.category || 'Personal',
        due_date: editingTask.due_date || ''
      });
      setDueDate(dt ? dt.toISOString().split('T')[0] : '');
      setDueTime(dt ? dt.toTimeString().slice(0, 5) : '');
    } else {
      setFormData({ title: '', description: '', status: 'pending', priority: 'Medium', category: 'Personal', due_date: '' });
      setDueDate('');
      setDueTime('');
    }
  }, [editingTask]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const combined = toLocalISOString(dueDate, dueTime);
    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, { ...formData, due_date: combined });
      } else {
        await api.tasks.create({ ...formData, due_date: combined });
      }
      onTaskCreated();
      onClose();
    } catch (error) {
      const msg = Array.isArray(error.details)
        ? error.details.join(', ')
        : error.details || error.message || 'An error occurred';
      alert(msg);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--stroke)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--overlay)' }}>
      <div
        className="w-full max-w-md overflow-hidden shadow-2xl glow-always card-light"
        style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}
      >
        <div
          className="px-6 py-4 border-b flex justify-between items-center"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
              style={{ ...inputStyle, minHeight: '80px' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select
              className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
              style={inputStyle}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="DVK Print Shop">DVK Print Shop</option>
              <option value="TyDee Tasks">TyDee Tasks</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
                style={inputStyle}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
                style={inputStyle}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
                style={inputStyle}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Due Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border outline-none focus:ring-2 focus:ring-[var(--color-active)]"
                style={inputStyle}
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition"
              style={{ backgroundColor: 'var(--color-active)' }}
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
