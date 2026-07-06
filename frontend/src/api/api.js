const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.error || 'Something went wrong',
      details: data.details || []
    };
  }

  return data;
}

export const api = {
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request('/auth/me'),
    forgotPassword: (email) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, password) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
  },
  tasks: {
    getAll: (month) => request(month ? `/tasks?month=${month}` : '/tasks'),
    getById: (id) => request(`/tasks/${id}`),
    create: (taskData) =>
      request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),
    update: (id, taskData) =>
      request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      }),
    delete: (id) =>
      request(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
    clearAll: () => request('/notifications', { method: 'DELETE' }),
  },
  activity: {
    getAll: () => request('/activity'),
  },
  dashboard: {
    getStats: () => request('/dashboard/stats'),
    getHistory: (days = 30) => request(`/dashboard/history?days=${days}`),
  },
  admin: {
    getUsers: () => request('/admin/users'),
  },
};
