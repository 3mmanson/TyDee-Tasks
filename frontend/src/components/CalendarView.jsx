import { useState, useEffect, useRef } from 'react';
import { api } from '../api/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';

const priorityColorMap = {
  High: { bg: 'var(--color-negative)', text: '#fff' },
  Medium: { bg: 'var(--color-warning)', text: '#09090B' },
  Low: { bg: 'var(--stroke)', text: 'var(--text-secondary)' },
};

const CalendarView = ({ onEditTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.tasks.getAll()
      .then(res => setTasks(res.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpenDay(null);
      }
    };
    if (openDay) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDay]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.due_date) return;
    const d = new Date(task.due_date);
    if (isNaN(d.getTime())) return;
    const key = format(d, 'yyyy-MM-dd');
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (dateKey, dayTasks) => {
    if (dayTasks.length === 1) {
      onEditTask(dayTasks[0]);
    } else if (dayTasks.length > 1) {
      setOpenDay(openDay === dateKey ? null : dateKey);
    }
  };

  const STACK_OFFSET = 5;

  return (
    <div
      className="p-4 sm:p-6"
      style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-2 rounded-xl transition"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 rounded-xl transition"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-medium py-1 sm:py-2" style={{ color: 'var(--text-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      {loading ? (
        <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const stackCount = Math.min(dayTasks.length, 3);

            return (
              <div
                key={dateKey}
                className="relative min-h-[52px] sm:min-h-[100px] p-1 sm:p-1.5 border transition cursor-pointer group/day"
                style={{
                  borderColor: 'var(--stroke)',
                  backgroundColor: today ? 'var(--color-active)' + '10' : 'var(--bg-secondary)',
                  opacity: inMonth ? 1 : 0.35,
                  borderRadius: '8px',
                }}
                onClick={() => handleDayClick(dateKey, dayTasks)}
              >
                <div
                  className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 text-right pr-0.5 sm:pr-1"
                  style={{ color: today ? 'var(--color-active)' : 'var(--text-muted)' }}
                >
                  {format(day, 'd')}
                </div>

                {/* Task card stack */}
                <div className="relative" style={{ minHeight: stackCount > 0 ? `${stackCount * 20 + 4}px` : '0' }}>
                  {dayTasks.slice(0, 3).map((task, i) => {
                    const pStyle = priorityColorMap[task.priority] || priorityColorMap.Medium;
                    const isTop = i === 0;
                    const totalVisible = Math.min(dayTasks.length, 3);

                    return (
                      <div
                        key={task.id}
                        className="absolute left-0 right-0 px-1 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium truncate rounded transition-all duration-150"
                        style={{
                          backgroundColor: pStyle.bg,
                          color: pStyle.text,
                          top: `${i * 4}px`,
                          left: `${i * 1}px`,
                          right: `${i * -1}px`,
                          zIndex: totalVisible - i,
                          opacity: dayTasks.length > 1 ? 1 - (i * 0.1) : 1,
                          boxShadow: isTop ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                          transformOrigin: 'center center',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'rotate(-2deg) translateY(-3px) scale(1.04)';
                          e.currentTarget.style.zIndex = '20';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.zIndex = String(totalVisible - i);
                          e.currentTarget.style.boxShadow = isTop ? '0 2px 6px rgba(0,0,0,0.15)' : 'none';
                        }}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                </div>

                {/* Day-detail popover for stacks */}
                {openDay === dateKey && dayTasks.length > 1 && (
                  <div
                    ref={popoverRef}
                    className="absolute bottom-full left-0 right-0 mb-1 rounded-xl shadow-xl overflow-hidden z-50 border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b flex justify-between items-center" style={{ borderColor: 'var(--stroke)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {format(day, 'MMM d')} — {dayTasks.length} tasks
                      </span>
                      <button onClick={() => setOpenDay(null)} style={{ color: 'var(--text-muted)' }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {dayTasks.map(task => {
                        const pStyle = priorityColorMap[task.priority] || priorityColorMap.Medium;
                        return (
                          <button
                            key={task.id}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 border-b transition"
                            style={{ borderColor: 'var(--stroke)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => { onEditTask(task); setOpenDay(null); }}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: pStyle.bg }}
                            />
                            <span className="truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                            <span className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: pStyle.bg, color: pStyle.text }}>
                              {task.priority}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
