import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Bell, Clock, AlertTriangle, Search, Plus, X, Menu, Trash2 } from 'lucide-react';

const Navbar = ({ onNewTask }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllRead, clearAll } = useNotificationContext();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const dropdownRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-negative)' }} />;
      case 'pending_reminder': return <Clock className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />;
      default: return <Bell className="w-4 h-4" style={{ color: 'var(--color-active)' }} />;
    }
  };

  const formatTime = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    if (diff < 0 || diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { api } = await import('../../api/api');
      const res = await api.activity.getAll();
      setHistoryLogs(res.data || []);
    } catch {
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 border-b px-4 sm:px-6 py-3"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--stroke)',
      }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'var(--color-active)', color: '#fff' }}
          >
            T
          </div>
          <span className="text-lg font-bold hidden sm:inline" style={{ color: 'var(--text-primary)' }}>
            TyDee Tasks
          </span>
        </a>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--stroke)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* + New Task button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[40px]"
            style={
              theme === 'dark'
                ? { background: 'linear-gradient(to right, #FF2E95, #0076FF)', color: '#fff' }
                : { backgroundColor: 'var(--color-active)', color: '#fff' }
            }
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setIsOpen(!isOpen); setHistoryOpen(false); }}
              className="relative p-2 rounded-xl transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  style={{ backgroundColor: 'var(--color-negative)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50 border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
              >
                <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--stroke)' }}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs hover:underline" style={{ color: 'var(--color-active)' }}>Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-xs hover:opacity-70" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className="px-4 py-3 border-b cursor-pointer transition"
                        style={{
                          borderColor: 'var(--stroke)',
                          backgroundColor: !n.read ? 'var(--color-active)' + '10' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.read ? 'var(--color-active)' + '10' : 'transparent'}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatTime(n.created_at)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--color-active)' }} />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* History clock */}
          <div className="relative" ref={historyRef}>
            <button
              onClick={() => { setHistoryOpen(!historyOpen); setIsOpen(false); }}
              className="p-2 rounded-xl transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Clock className="w-5 h-5" />
            </button>

            {historyOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50 border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--stroke)' }}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Activity History</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {historyLoading ? (
                    <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
                  ) : historyLogs.length === 0 ? (
                    <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet</div>
                  ) : (
                    historyLogs.map(log => (
                      <div
                        key={log.id}
                        className="px-4 py-3 border-b"
                        style={{ borderColor: 'var(--stroke)' }}
                      >
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.details}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatTime(log.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: 'var(--color-warning)', color: '#09090B' }}
            title={user?.username}
          >
            {getInitials(user?.username)}
          </div>

          {/* Logout (desktop) */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition min-h-[40px]"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-negative)'; e.currentTarget.style.backgroundColor = 'var(--color-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 rounded-xl"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden border-t mt-3 pt-3 flex flex-col gap-2"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--stroke)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.username}</span>
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition min-h-[44px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
