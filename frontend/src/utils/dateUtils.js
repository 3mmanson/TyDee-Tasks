/**
 * Build a UTC ISO string from local date/time picker values.
 * new Date(year, month, day, hour, minute) treats args as local time.
 * .toISOString() converts that local time to correct UTC for storage.
 */
export function toLocalISOString(dateStr, timeStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute).toISOString();
  }
  return new Date(year, month - 1, day).toISOString();
}

/**
 * Parse a stored due_date (ISO string, Unix timestamp, etc.) and return
 * a formatted display string like "Jul 5, 1:00 PM" in local time.
 */
export function formatDueDate(dueDate) {
  if (!dueDate) return null;
  try {
    let d;
    if (typeof dueDate === 'number' || (typeof dueDate === 'string' && /^\d+$/.test(dueDate.trim()))) {
      const ts = Number(dueDate);
      d = new Date(ts < 1e12 ? ts * 1000 : ts);
    } else {
      d = new Date(dueDate);
    }
    if (isNaN(d.getTime())) return null;

    const month = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${month}, ${h12}:${minutes} ${ampm}`;
  } catch {
    return null;
  }
}
