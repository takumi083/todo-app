import { useState } from 'react';

interface Props {
  onAdd: (title: string) => Promise<void>;
}

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim() === '') return;
    await onAdd(title.trim());
    setTitle('');
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを入力..."
      />
      <button className="todo-btn" type="submit">
        追加
      </button>
    </form>
  );
}
