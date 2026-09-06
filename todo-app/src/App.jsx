import { useEffect, useState } from 'react';
import TaskItem from './TaskItem.jsx';
import { STORAGE_KEY, loadTasks } from './tasks.js';

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: trimmed, due, done: false }]);
    setTitle('');
    setDue('');
  }

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDoneTasks() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tasks</h1>
        <p className="app-sub">今日やることを、ここに置いておく。</p>
      </header>

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="タスクを入力して Enter"
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          aria-label="期限"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>

      <div className="list-meta">
        <span>{tasks.length}件のタスク</span>
        <button type="button" className="text-button" onClick={clearDoneTasks}>
          完了済みを削除
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="empty-state visible">
          タスクはまだありません。上の入力欄から追加してください。
        </p>
      )}
    </div>
  );
}
