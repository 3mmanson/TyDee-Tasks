import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';

const categoryColorMap = {
  Design: 'var(--color-negative)',
  Marketing: 'var(--color-active)',
  Development: 'var(--color-positive)',
  Research: 'var(--color-warning)',
  Personal: 'var(--color-primary)',
};

const CalendarView = ({ onEditTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.tasks.getAll()
      .then(res => setTasks(res.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.due_date) {
      const key = format(new Date(), 'yyyy-MM-dd');
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(task);
      return;
    }
    const key = task.due_date.split('T')[0];
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <div key={d} className="text-center text-xs font-medium py-2" style={{ color: 'var(--text-muted)' }}>
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
            const hasStack = dayTasks.length > 1;

            return (
              <div
                key={dateKey}
                className="relative min-h-[80px] sm:min-h-[100px] p-1.5 border transition group/day"
                style={{
                  borderColor: 'var(--stroke)',
                  backgroundColor: today ? 'var(--color-active)' + '10' : 'var(--bg-secondary)',
                  opacity: inMonth ? 1 : 0.35,
                  borderRadius: '8px',
                }}
              >
                <div
                  className="text-xs font-medium mb-1 text-right pr-1"
                  style={{ color: today ? 'var(--color-active)' : 'var(--text-muted)' }}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5 relative">
                  {dayTasks.slice(0, 3).map((task, i) => {
                    const color = categoryColorMap[task.category] || 'var(--color-active)';
                    return (
                      <button
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className="w-full text-left px-1.5 py-0.5 text-[10px] font-medium truncate border-l-2 transition-all duration-150"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          borderLeftColor: color,
                          borderRadius: '4px',
                          ...(hasStack ? {
                            transform: `translateY(${i * 1}px)`,
                            zIndex: dayTasks.length - i,
                          } : {}),
                        }}
                        onMouseEnter={e => {
                          if (hasStack) {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                            e.currentTarget.style.zIndex = '10';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (hasStack) {
                            e.currentTarget.style.transform = `translateY(${i * 1}px)`;
                            e.currentTarget.style.zIndex = String(dayTasks.length - i);
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
