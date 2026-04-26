# ToDoアプリ 開発計画書（GitHub練習付き）

## Context

開発初心者がCRUD操作・状態管理・API通信・DB設計を実践的に学ぶためのToDoアプリを作る。
フロントエンドはReact + TypeScript、バックエンドはNode.js+Express、DBはSQLiteを採用し、環境構築の手間を最小化しつつ本格的なWebアプリ開発の流れを体験できる構成にする。
**GitHub連携を通じて、バージョン管理・ブランチ戦略・Pull Requestの基本も習得する。**

---

## 技術スタック

| レイヤー | 技術 | 理由 |
|---|---|---|
| フロントエンド | React + TypeScript + Vite | 型安全なReact開発・最速で環境構築できる標準ツール |
| バックエンド | Node.js + Express | シンプルなAPIを最小コードで構築可能 |
| DB | SQLite + better-sqlite3 | インストール不要・ファイル1つで完結 |
| スタイル | CSS Modules | クラス名衝突なし・追加ライブラリ不要 |
| バージョン管理 | Git + GitHub | 変更履歴の管理・リモート保存・PR練習 |

---

## 機能一覧

### MVP（最初に作る）
- [ ] タスクの一覧表示（Read）
- [ ] タスクの追加（Create）
- [ ] タスクの完了チェック（Update）
- [ ] タスクの削除（Delete）

### 発展機能（MVPの後に追加）
- [ ] タスクのタイトル編集
- [ ] 完了済み/未完了フィルター
- [ ] タスクの並び替え（ドラッグ&ドロップ）

---

## プロジェクト構成

```
todo-app/
├── frontend/          # Reactアプリ（TypeScript）
│   ├── src/
│   │   ├── App.tsx
│   │   ├── types/
│   │   │   └── todo.ts         # Todo型定義
│   │   ├── components/
│   │   │   ├── TodoList.tsx    # タスク一覧
│   │   │   ├── TodoItem.tsx    # タスク1件
│   │   │   └── AddTodo.tsx     # 追加フォーム
│   │   ├── hooks/
│   │   │   └── useTodos.ts     # API通信ロジック
│   │   └── api/
│   │       └── todos.ts        # fetch関数まとめ
│   ├── tsconfig.json
│   └── package.json
│
└── backend/           # Express API
    ├── index.js       # サーバー起動
    ├── routes/
    │   └── todos.js   # /api/todos エンドポイント
    ├── db/
    │   ├── init.js    # テーブル作成
    │   └── todos.db   # SQLiteファイル（自動生成）
    └── package.json
```

---

## API設計

| メソッド | パス | 処理 |
|---|---|---|
| GET | /api/todos | 全タスク取得 |
| POST | /api/todos | タスク追加 |
| PATCH | /api/todos/:id | タスク更新（完了チェック/編集） |
| DELETE | /api/todos/:id | タスク削除 |

### DBスキーマ（todosテーブル）

```sql
CREATE TABLE todos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT    NOT NULL,
  done      INTEGER NOT NULL DEFAULT 0,  -- 0=未完了, 1=完了
  created_at TEXT   DEFAULT (datetime('now'))
);
```

---

## 実装ステップ

### Step 0: GitHub準備（15分）

#### 0-1. GitHubリポジトリ作成
1. [github.com](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. 設定:
   - Repository name: `todo-app`
   - Description: `React + Express + SQLite で作るToDoアプリ（学習用）`
   - Visibility: **Public**（ポートフォリオにもなる）
   - **「Add a README file」はチェックしない**（後でローカルから push するため）
4. 「Create repository」をクリック
5. 表示された `git remote add origin ...` のコマンドをメモしておく

#### 0-2. ローカルリポジトリの初期化
```bash
cd todo-app
git init
git branch -M main
```

#### 0-3. .gitignore の作成
DBファイルや依存パッケージをGitに含めないよう設定する。

```bash
cat > .gitignore << 'EOF'
# Node.js
node_modules/

# SQLite DB（データはローカルのみ）
backend/db/todos.db

# 環境変数
.env

# OS生成ファイル
.DS_Store
Thumbs.db

# Viteビルド成果物
frontend/dist/
EOF
```

#### 0-4. 最初のコミット（空のリポジトリを記録）
```bash
git add .gitignore
git commit -m ".gitignoreの追加"
```

#### 0-5. GitHubへ接続してプッシュ
```bash
# Step 0-1 でメモしたコマンドを使う（URLは自分のものに変える）
git remote add origin https://github.com/<ユーザー名>/todo-app.git
git push -u origin main
```

---

### Step 1: 環境構築（30分）

1. `mkdir todo-app && cd todo-app`（Step 0 でいなければ）
2. フロントエンド（TypeScriptテンプレートを指定）:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend && npm install
   ```
3. バックエンド: `mkdir backend && cd backend && npm init -y`
4. バックエンド依存: `npm install express better-sqlite3 cors`
5. フロントエンド起動確認: `npm run dev`

> **TypeScriptテンプレートで生成されるもの:**
> - `tsconfig.json` / `tsconfig.app.json` — TypeScriptコンパイラ設定
> - `vite-env.d.ts` — Vite用の型定義
> - ファイル拡張子が `.tsx` / `.ts`（`.jsx` / `.js` ではなく）

#### コミット
```bash
git add .
git commit -m "フロントエンドとバックエンドの環境構築"
git push
```

> **ポイント:** `node_modules/` が .gitignore に含まれているので、`package.json` だけがコミットされる。
> 別環境では `npm install` を実行すれば依存が復元できる。

---

### Step 2: バックエンドAPI構築（60分）

**新しいブランチを切って作業する（ブランチ戦略の練習）**

```bash
git checkout -b feature/backend-api
```

1. `backend/db/init.js` でSQLiteファイル作成・テーブル定義
2. `backend/routes/todos.js` で4つのエンドポイント実装
3. `backend/index.js` でExpressサーバー起動（ポート3001）
4. `curl` コマンドでAPIの動作確認

```bash
# 動作確認用curlコマンド例
curl http://localhost:3001/api/todos
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"最初のタスク"}'
```

#### コミット＆Pull Request
```bash
git add .
git commit -m "CRUD APIエンドポイントの実装"
git push -u origin feature/backend-api
```

GitHubでPull Requestを作成:
1. リポジトリページを開く
2. 「Compare & pull request」ボタンをクリック
3. タイトル: `バックエンドCRUD APIの実装`
4. 説明: 実装した内容・動作確認方法を簡単に記述
5. 「Create pull request」→「Merge pull request」→「Confirm merge」
6. ローカルで `main` に戻り最新を取得:

```bash
git checkout main
git pull origin main
```

---

### Step 3: フロントエンド実装（90分）

```bash
git checkout -b feature/frontend-ui
```

1. **`src/types/todo.ts`** にTodo型を定義（最初に型を決める）

   ```ts
   export type Todo = {
     id: number;
     title: string;
     done: boolean;
     created_at: string;
   };
   ```

2. **`src/api/todos.ts`** にfetch関数を4つ定義（戻り値・引数に型を付ける）

   ```ts
   import { Todo } from '../types/todo';

   export const getTodos = (): Promise<Todo[]> => ...
   export const addTodo = (title: string): Promise<Todo> => ...
   export const updateTodo = (id: number, done: boolean): Promise<Todo> => ...
   export const deleteTodo = (id: number): Promise<void> => ...
   ```

3. **`src/hooks/useTodos.ts`** でAPIを呼ぶカスタムフック作成（状態管理）
4. **`AddTodo.tsx`** → **`TodoList.tsx`** → **`TodoItem.tsx`** の順にコンポーネント実装
   - Propsは必ずinterfaceまたはtypeで型定義する
5. **`App.tsx`** でコンポーネントを組み合わせる

#### コミット（こまめに分割する練習）
```bash
# 型定義を先にコミット
git add frontend/src/types/
git commit -m "Todo型定義の追加"

# API関数
git add frontend/src/api/
git commit -m "Todo APIのfetch関数の追加"

# カスタムフック
git add frontend/src/hooks/
git commit -m "useTodosカスタムフックの追加"

# コンポーネント
git add frontend/src/components/
git commit -m "TodoList・TodoItem・AddTodoコンポーネントの実装"

# App.tsx
git add frontend/src/App.tsx
git commit -m "App.tsxでコンポーネントを組み合わせ"

git push -u origin feature/frontend-ui
```

GitHubでPull Request → マージ → `main` に戻る

---

### Step 4: スタイリング（30分）

```bash
git checkout -b feature/styling
```

1. 基本レイアウト（中央揃え・最大幅）
2. チェックボックス・削除ボタンのスタイル
3. 完了済みタスクの打ち消し線

```bash
git add .
git commit -m "CSSモジュールでレイアウトとTodoアイテムのスタイリング"
git push -u origin feature/styling
```

Pull Request → マージ

---

### Step 5: 発展機能（任意）

各機能ごとにブランチを切って実装する。

```bash
git checkout -b feature/filter
# フィルター機能実装
git commit -m "完了/未完了フィルターの追加"
git push -u origin feature/filter
# PR → マージ

git checkout -b feature/edit-title
# 編集機能実装
git commit -m "インラインタイトル編集機能の追加"
git push -u origin feature/edit-title
# PR → マージ
```

---

## コミットメッセージ規約（Conventional Commits）

| プレフィックス | 意味 | 例 |
|---|---|---|
| `feat:` | 新機能 | `feat: 削除ボタンの追加` |
| `fix:` | バグ修正 | `fix: 空タイトルの送信を防止` |
| `style:` | スタイル変更 | `style: Todoリストのレイアウトを中央揃えに` |
| `refactor:` | リファクタリング | `refactor: APIロジックをフックに切り出し` |
| `chore:` | 設定・ツール変更 | `chore: .gitignoreの更新` |
| `docs:` | ドキュメント | `docs: READMEの追加` |

---

## GitHubブランチ戦略まとめ

```
main ──────────────────────────────────────── 常に動く状態を保つ
  └─ feature/backend-api ──── PR ──► merge
  └─ feature/frontend-ui ──── PR ──► merge
  └─ feature/styling ──────── PR ──► merge
  └─ feature/filter ───────── PR ──► merge
```

- `main` に直接コミットしない（Step 0 の初期設定以外）
- 1機能 = 1ブランチ = 1 Pull Request
- マージ後はブランチを削除してOK

---

## 学べること（スキルマップ）

```
HTML/CSS ─────── コンポーネントのマークアップ・スタイル
React ────────── useState・useEffect・props・カスタムフック
TypeScript ───── 型定義（type/interface）・ジェネリクス・Props型
API通信 ─────── fetch・非同期処理（async/await）・エラーハンドリング
バックエンド ─── Express・ルーティング・ミドルウェア（cors）
DB ──────────── SQL基礎（SELECT/INSERT/UPDATE/DELETE）・スキーマ設計
Git ─────────── コミット・ブランチ・マージ・.gitignore
GitHub ──────── リモートリポジトリ・Push・Pull Request・コードレビュー
```

---

## 動作確認方法

1. `cd backend && node index.js` でAPIサーバー起動（ポート3001）
2. `cd frontend && npm run dev` でReact起動（ポート5173）
3. ブラウザで `http://localhost:5173` を開く
4. タスクの追加 → チェック → 削除が正常に動作するか確認
5. ページリロード後もデータが残っているか確認（DB永続化の確認）
6. DevToolsのNetworkタブでAPIリクエストを確認

---

## 推奨開発順序の理由

バックエンドを先に作る理由：APIが固まっていないとフロントエンドの実装が不安定になるため。
`curl` でAPIを単体確認してから画面を作ることで、バグの切り分けが容易になる。

ブランチを切る理由：`main` を常に動く状態に保つことで、機能追加中でも安全にコードを共有できる。
Pull Requestを使う理由：変更の意図を記録し、将来の自分や他の人がコードの経緯を追いやすくなるため。
