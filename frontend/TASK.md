# Step 3: フロントエンド実装

## 作成・変更するファイル

```
frontend/src/
  types/
    todo.ts          ← 新規: Todo型定義
  api/
    todos.ts         ← 新規: fetchラッパー（全CRUD）
  components/
    TodoForm.tsx     ← 新規: タイトル入力フォーム
    TodoItem.tsx     ← 新規: 1件分の行（チェック・削除）
    TodoList.tsx     ← 新規: 一覧レンダリング
  App.tsx            ← 全書き換え: stateとハンドラを持つルート
  App.css            ← 全書き換え: Todo用スタイル
```

`main.tsx` / `index.css` / `vite.config.ts` は変更しない。

---

## 各ファイルの役割

### `src/types/todo.ts`
バックエンドのDBスキーマに合わせたTodo型。`done` はSQLiteに合わせて `0 | 1`。

### `src/api/todos.ts`
`http://localhost:3001/api/todos` へのfetchラッパー。

| 関数 | メソッド | 用途 |
|------|---------|------|
| `fetchTodos()` | GET | 全件取得 |
| `createTodo(title)` | POST | 新規作成 |
| `updateTodo(id, patch)` | PATCH | title/done の部分更新 |
| `deleteTodo(id)` | DELETE | 削除（204レスポンス） |

### `src/components/TodoForm.tsx`
- 制御コンポーネント（inputをuseStateで管理）
- 空文字はsubmitさせない
- submitで `onAdd(title)` コールバックを呼ぶ

### `src/components/TodoItem.tsx`
- チェックボックス（done切り替え）
- タイトル（done=1のとき打ち消し線）
- 削除ボタン

### `src/components/TodoList.tsx`
- `TodoItem` を並べるラッパー

### `src/App.tsx`
- `todos: Todo[]` を useState で管理
- useEffect で初回フェッチ
- ハンドラ: `handleAdd` / `handleToggle` / `handleDelete`
- APIレスポンス後にstateを更新（楽観的更新なし）

### `src/App.css`
- 既存のCSS変数（`--bg`, `--text`, `--accent` 等）を活用
- 追加ライブラリなし（vanilla CSS）
- 中央寄せ、最大幅600px

---

## 検証手順

1. `cd backend && node index.js`（port 3001）
2. `cd frontend && npm run dev`（port 5173）
3. `http://localhost:5173` でブラウザ確認
   - Todo一覧が表示される
   - 追加・完了切り替え・削除ができる
   - リロード後もデータが残る
