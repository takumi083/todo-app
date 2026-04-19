/**
 * Express サーバーのエントリーポイント
 *
 * ミドルウェアの登録とルーターのマウントを行い、サーバーを起動する。
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// フロントエンド（localhost:5173）からのリクエストを許可する。
// cors() をデフォルト設定で使うと全オリジンを許可するが、
// ローカル開発用途のためこのままで問題ない。
app.use(cors());

// JSON ボディをパースして req.body で受け取れるようにする。
app.use(express.json());

app.use('/api/todos', require('./routes/todos'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
