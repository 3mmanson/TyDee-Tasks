import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import Navbar from '../components/Layout/Navbar';
import TaskList from '../components/Tasks/TaskList';
import TaskForm from '../components/Tasks/TaskForm';
import ActivityLog from '../components/ActivityLog';
import KpiDashboard from '../components/KpiDashboard';
import CalendarView from '../components/CalendarView';
import { useNotifications } from '../hooks/useNotifications';
import { Search, History, List, CalendarDays } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [view, setView] = useState('list');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.tasks.getAll();
      const order = JSON.parse(localStorage.getItem('taskOrder') || '[]');
      if (order.length > 0) {
        const taskMap = new Map(response.data.map(t => [t.id, t]));
        const ordered = order.map(id => taskMap.get(id)).filter(Boolean);
        const remaining = response.data.filter(t => !order.includes(t.id));
        setTasks([...ordered, ...remaining]);
      } else {
        setTasks(response.data);
      }
    } catch (error) {
      alert('Failed to load tasks: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleReorder = (newOrder) => {
    setTasks(newOrder);
    localStorage.setItem('taskOrder', JSON.stringify(newOrder.map(t => t.id)));
  };

  const handleNotification = useCallback(() => {
    fetchTasks();
  }, []);

  useNotifications(handleNotification);

  const handleCreateOrUpdate = async () => {
    await fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.tasks.delete(id);
      await fetchTasks();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.tasks.update(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        due_date: task.due_date
      });
      await fetchTasks();
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                         t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const inputStyle = {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--stroke)',
    color: 'var(--text-primary)',
  };

  const viewBtnStyle = (active) => ({
    backgroundColor: active ? 'var(--color-active)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar onNewTask={() => { setEditingTask(null); setIsFormOpen(true); }} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ paddingTop: '96px' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>Manage your daily productivity</p>
          </div>
        </div>

        <KpiDashboard />

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition min-h-[44px]"
              style={{ ...inputStyle, '--tw-ring-color': 'var(--color-active)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="px-3 py-2.5 border rounded-xl outline-none focus:ring-2 transition text-sm min-h-[44px]"
              style={inputStyle}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* View toggle */}
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
              <button
                onClick={() => setView('list')}
                className="p-2.5 transition"
                style={viewBtnStyle(view === 'list')}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className="p-2.5 transition"
                style={viewBtnStyle(view === 'calendar')}
                title="Calendar view"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {view === 'list' ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
              <div className="animate-spin rounded-full h-8 w-8 mb-4" style={{ borderBottomColor: 'var(--color-active)' }}></div>
              <p>Loading your tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onReorder={handleReorder}
            />
          )
        ) : (
          <CalendarView onEditTask={handleEdit} />
        )}

        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
          onTaskCreated={handleCreateOrUpdate}
          editingTask={editingTask}
        />

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--stroke)' }}>
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="flex items-center gap-2 text-sm font-medium transition mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            <History className="w-4 h-4" />
            {showActivity ? 'Hide' : 'Show'} Activity History
          </button>
          {showActivity && <ActivityLog />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
