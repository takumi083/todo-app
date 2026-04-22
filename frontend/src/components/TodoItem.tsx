import type { Todo } from '../types/todo';

interface Props {
  todo: Todo;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className="todo-item">
      <input
        className="todo-checkbox"
        type="checkbox"
        checked={todo.done === 1}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
      />
      <span className={`todo-title${todo.done === 1 ? ' done' : ''}`}>
        {todo.title}
      </span>
      <button className="todo-delete" onClick={() => onDelete(todo.id)}>
        削除
      </button>
    </li>
  );
}
