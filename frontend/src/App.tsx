import { useEffect, useState } from 'react';
import './App.css';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api/todos';
import type { Todo } from './types/todo';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setError('サーバーに接続できませんでした。バックエンドが起動しているか確認してください。'));
  }, []);

  async function handleAdd(title: string) {
    try {
      const todo = await createTodo(title);
      setTodos((prev) => [todo, ...prev]);
      setError(null);
    } catch {
      setError('Todoの追加に失敗しました。');
    }
  }

  async function handleToggle(id: number, done: boolean) {
    try {
      const updated = await updateTodo(id, { done });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setError(null);
    } catch {
      setError('Todoの更新に失敗しました。');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch {
      setError('Todoの削除に失敗しました。');
    }
  }

  return (
    <div className="app">
      <h1 className="app-title">Todo</h1>
      {error && <p className="app-error">{error}</p>}
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}

export default App;
