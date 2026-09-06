const STORAGE_KEY = 'tasks-app.tasks';

const today = new Date();
const toDateString = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const seedTasks = [
  { id: crypto.randomUUID(), title: '週次レポートを提出する', due: toDateString(0), done: false },
  { id: crypto.randomUUID(), title: '会議室を予約する', due: toDateString(1), done: false },
  { id: crypto.randomUUID(), title: '備品発注リストを確認する', due: toDateString(5), done: false },
];

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const dueInput = document.getElementById('due-input');
const list = document.getElementById('task-list');
const countLabel = document.getElementById('count-label');
const emptyState = document.getElementById('empty-state');
const clearDoneButton = document.getElementById('clear-done');

let tasks = loadTasks();

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedTasks;
  try {
    return JSON.parse(raw);
  } catch {
    return seedTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDue(dateString) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  return `${y}/${m}/${d}`;
}

function render() {
  list.innerHTML = '';

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const main = document.createElement('div');
    main.className = 'task-main';

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    main.appendChild(title);

    if (task.due) {
      const due = document.createElement('span');
      due.className = 'task-due';
      due.textContent = `期限: ${formatDue(task.due)}`;
      main.appendChild(due);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'task-delete';
    deleteButton.setAttribute('aria-label', '削除');
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(main);
    li.appendChild(deleteButton);
    list.appendChild(li);
  });

  countLabel.textContent = `${tasks.length}件のタスク`;
  emptyState.classList.toggle('visible', tasks.length === 0);
}

function addTask(title, due) {
  tasks.push({ id: crypto.randomUUID(), title, due, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearDoneTasks() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title, dueInput.value);
  input.value = '';
  dueInput.value = '';
  input.focus();
});

clearDoneButton.addEventListener('click', clearDoneTasks);

render();
