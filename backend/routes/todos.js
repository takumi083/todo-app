/**
 * /api/todos ルーター
 *
 * Todo リソースに対する CRUD エンドポイントを定義する。
 * better-sqlite3 は同期APIのため async/await は不要。
 */
const express = require('express');
const router = express.Router();
const db = require('../db/init');

/**
 * GET /api/todos
 * 全件取得。作成日時の降順（新しい順）で返す。
 */
router.get('/', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(todos);
});

/**
 * POST /api/todos
 * 新規作成。タイトルが空の場合は 400 を返す。
 * INSERT 後に lastInsertRowid で追加行を取得して返すことで、
 * クライアントがレスポンスだけで新しい ID を知れるようにしている。
 *
 * @body {string} title - タスクのタイトル（必須）
 */
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  const result = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title.trim());
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(todo);
});

/**
 * PATCH /api/todos/:id
 * 部分更新。title と done はどちらか一方だけ送っても更新できる。
 * undefined チェックで「送られなかったフィールド」と「意図的に falsy を送った場合」を区別している。
 * done は SQLite が BOOL を持たないため 0/1 に変換して保存する。
 *
 * @param  {string} id   - 更新対象の Todo ID
 * @body   {string} [title] - 新しいタイトル
 * @body   {boolean} [done] - 完了フラグ
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return res.status(404).json({ error: 'not found' });

  const newTitle = title !== undefined ? title : todo.title;
  const newDone  = done  !== undefined ? (done ? 1 : 0) : todo.done;

  db.prepare('UPDATE todos SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);
  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(updated);
});

/**
 * DELETE /api/todos/:id
 * 削除。成功時は本文なしの 204 を返す（REST の慣例）。
 * 存在しない ID へのリクエストは 404 とする。
 *
 * @param {string} id - 削除対象の Todo ID
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return res.status(404).json({ error: 'not found' });

  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = router;
