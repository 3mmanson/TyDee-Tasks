import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import Navbar from '../components/Layout/Navbar';
import TaskList from '../components/Tasks/TaskList';
import TaskForm from '../components/Tasks/TaskForm';
import { Plus, Filter, Search } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.tasks.getAll();
      setTasks(response.data);
    } catch (error) {
      alert('Failed to load tasks: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500 text-sm sm:text-base">Manage your daily productivity</p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[44px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-sm min-h-[44px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading your tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}

        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
          onTaskCreated={handleCreateOrUpdate}
          editingTask={editingTask}
        />
      </main>
    </div>
  );
};

export default Dashboard;
