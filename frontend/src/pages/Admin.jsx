import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Users, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    api.admin.getUsers()
      .then(res => setData(res.data))
      .catch(err => setError(err.message || 'Access denied'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8" style={{ borderBottomColor: 'var(--color-active)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-negative)' }} />
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm rounded-xl transition"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Registered users and activity</p>
          </div>
        </div>

        {/* Stats card */}
        <div
          className="p-6 mb-6 glow-always card-light"
          style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5" style={{ color: 'var(--color-active)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Users</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.totalUsers}</div>
        </div>

        {/* Users table */}
        <div
          className="border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--stroke)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>All Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Username</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Email</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Tasks</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--stroke)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{user.username}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{user.taskCount}</td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
