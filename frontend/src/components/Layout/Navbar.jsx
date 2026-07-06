import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Bell, AlertTriangle, Plus, X, Menu, Trash2, Sun, Moon, Shield, Volume2, VolumeX } from 'lucide-react';

const Navbar = ({ onNewTask }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllRead, clearAll } = useNotificationContext();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem('notif_muted') === 'true');
  const dropdownRef = useRef(null);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('notif_muted', next);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-negative)' }} />;
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

  return (
    <nav
      className="sticky top-3 z-30 border-b px-4 sm:px-6 shadow-sm"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--stroke)',
        height: 'var(--nav-height)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'var(--color-positive-inv)', color: '#fff' }}
          >
            T
          </div>
          <span className="text-lg font-bold hidden sm:inline" style={{ color: 'var(--text-primary)' }}>
            TyDee Tasks
          </span>
        </a>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* + New Task button — green */}
          <button
            onClick={onNewTask}
            className="btn-new-task flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold min-h-[40px]"
            style={
              theme === 'dark'
                ? { background: 'linear-gradient(to right, #16A34A, #4ADE80)', color: '#fff' }
                : { backgroundColor: '#16A34A', color: '#fff' }
            }
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 rounded-xl transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  style={{ backgroundColor: 'var(--color-negative)', color: '#fff' }}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-xs hover:opacity-70 transition"
                      style={{ color: 'var(--text-muted)' }}
                      title={muted ? 'Unmute sounds' : 'Mute sounds'}
                    >
                      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
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

          {/* Username — plain text */}
          <span className="hidden sm:inline text-sm" style={{ color: 'var(--text-secondary)' }}>
            {user?.username}
          </span>

          {/* Admin link — admin only */}
          {user?.is_admin ? (
            <a
              href="/admin"
              className="hidden sm:flex p-2 rounded-xl transition"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Admin dashboard"
            >
              <Shield className="w-5 h-5" />
            </a>
          ) : null}

          {/* Logout */}
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
          className="sm:hidden border-t mt-3 pt-3 px-4 pb-3 flex flex-col gap-2 rounded-b-xl"
          style={{ borderColor: 'var(--stroke)', backgroundColor: 'var(--bg-secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.username}</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
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
