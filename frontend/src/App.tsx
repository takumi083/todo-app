import { useEffect, useState } from 'react';
import './App.css';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api/todos';
import type { Todo } from './types/todo';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos().then(setTodos).catch(console.error);
  }, []);

  async function handleAdd(title: string) {
    const todo = await createTodo(title);
    setTodos((prev) => [todo, ...prev]);
  }

  async function handleToggle(id: number, done: boolean) {
    const updated = await updateTodo(id, { done });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: number) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="app">
      <h1 className="app-title">Todo</h1>
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}

export default App;
