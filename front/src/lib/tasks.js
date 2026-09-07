import seedTasksData from '../data/seed-tasks.json';

export const STORAGE_KEY = 'tasks-app.tasks';

const toDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + (Number.isFinite(offsetDays) ? offsetDays : 0));
  return d.toISOString().slice(0, 10);
};

export function createSeedTasks() {
  return seedTasksData.map(({ title, offsetDays, done }) => ({
    id: crypto.randomUUID(),
    title,
    due: toDateString(offsetDays),
    done,
  }));
}

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedTasks();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : createSeedTasks();
  } catch {
    return createSeedTasks();
  }
}

export function formatDue(dateString) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  return `${y}/${m}/${d}`;
}
