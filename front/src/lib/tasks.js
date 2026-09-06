export const STORAGE_KEY = 'tasks-app.tasks';

const toDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export function createSeedTasks() {
  return [
    { id: crypto.randomUUID(), title: '週次レポートを提出する', due: toDateString(0), done: false },
    { id: crypto.randomUUID(), title: '会議室を予約する', due: toDateString(1), done: false },
    { id: crypto.randomUUID(), title: '備品発注リストを確認する', due: toDateString(5), done: false },
  ];
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
