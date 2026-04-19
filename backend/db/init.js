/**
 * データベース初期化モジュール
 *
 * アプリ起動時に1度だけ実行され、SQLite接続と
 * テーブルのセットアップを担う。require() でキャッシュされるため
 * 複数ファイルからインポートしても接続は1つに保たれる。
 */
const Database = require('better-sqlite3');
const path = require('path');

// __dirname を使って init.js からの相対パスでDBファイルを配置する。
// 実行カレントディレクトリに依存しないようにするため絶対パスに変換している。
const db = new Database(path.join(__dirname, 'todos.db'));

// IF NOT EXISTS により、サーバー再起動時に既存データが消えない。
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,  -- 0: 未完了 / 1: 完了（SQLiteにBOOL型がないためINTEGERで代替）
    created_at TEXT    DEFAULT (datetime('now'))
  )
`);

module.exports = db;
