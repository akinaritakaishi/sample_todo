import { formatDue } from '../lib/tasks.js';

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item${task.done ? ' done' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <div className="task-main">
        <span className="task-title">{task.title}</span>
        {task.due && <span className="task-due">期限: {formatDue(task.due)}</span>}
      </div>
      <button
        type="button"
        className="task-delete"
        aria-label="削除"
        onClick={() => onDelete(task.id)}
      >
        ×
      </button>
    </li>
  );
}
