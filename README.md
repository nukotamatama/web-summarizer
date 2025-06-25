# Web Content Summarizer

ウェブページの内容を要約するシンプルなツールです。Gemini APIを使用して、与えられたテキストの核心を簡潔な日本語の1文にまとめます。セキュアなバックエンドプロキシを通じてAPIキーを保護し、レート制限機能を備えています。

## 機能

- ウェブページのURLから直接コンテンツを取得して要約
- 手動でテキストを入力して要約
- 出力は100文字以内の日本語1文
- シンプルで直感的なWebインターフェース
- セキュアなバックエンドプロキシでAPIキーを保護
- レート制限機能（15分間に10リクエストまで）
- レスポンシブデザイン（モバイル対応）
- ダークモード対応

## 使い方

### 事前準備

1. [Google AI Studio](https://ai.google.dev/)からGemini APIキーを取得
2. `.env`ファイルにAPIキーを設定（詳細は「環境変数の設定」セクションを参照）

### テキストから要約

1. 「テキスト入力」タブを選択
2. 要約したいテキストをテキストエリアに入力または貼り付け
3. 「要約する」ボタンをクリック
4. 生成された要約を確認

### URLから要約

1. 「URLから取得」タブを選択
2. 要約したいウェブページのURLを入力
3. 「取得」ボタンをクリックしてコンテンツを取得
4. コンテンツが取得されたら「要約する」ボタンをクリック
5. 生成された要約を確認

## ローカルでの実行方法

1. リポジトリをクローンまたはダウンロード
   ```bash
   git clone [リポジトリURL]
   cd web-summarizer
   ```

2. 依存関係をインストール
   ```bash
   npm install
   ```

3. 環境変数を設定（`.env`ファイルを作成）
   ```bash
   cp .env.example .env
   # .envファイルを編集してGEMINI_API_KEYを設定
   ```

4. バックエンドサーバーを起動
   ```bash
   node server.js
   ```

5. ブラウザで `http://localhost:3000` を開く

## 技術スタック

- フロントエンド
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (ES6+)
- バックエンド
  - Node.js
  - Express
  - express-rate-limit（レート制限）
  - CORS（クロスオリジンリソース共有）
- 外部API
  - Gemini API (Google AI)

## 注意事項

- APIキーはサーバーサイドの環境変数として保存され、クライアントには公開されません
- レート制限により、15分間に10リクエストまでに制限されています
- URLからのコンテンツ取得はバックエンドプロキシを通じて行われます
- 要約の品質はGemini APIの性能に依存します

## ライセンス

MIT

## 環境変数の設定

`.env`ファイルに以下の環境変数を設定します：

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
```

- `GEMINI_API_KEY`: Google AI StudioからのGemini APIキー
- `PORT`: バックエンドサーバーのポート番号（デフォルト: 3000）
- `NODE_ENV`: 環境モード（development, production）
- `ALLOWED_ORIGIN`: CORS許可オリジン（本番環境ではデプロイ先のドメインに変更）

## デプロイ方法

### バックエンド（Node.js）

1. 環境変数を設定
   ```bash
   # 本番環境用の.envファイルを作成
   cp .env.example .env.production
   # 編集して本番環境用の設定を行う
   ```

2. 依存関係をインストール
   ```bash
   npm install --production
   ```

3. サーバーを起動
   ```bash
   NODE_ENV=production node server.js
   ```

   または、PM2などのプロセスマネージャーを使用：
   ```bash
   pm2 start server.js --name web-summarizer
   ```

### フロントエンド（静的ファイル）

1. 本番環境用の設定を確認
   - `config.js`のAPI_URLが正しく設定されていることを確認

2. 静的ファイルをWebサーバーにデプロイ
   - Nginx、Apache、またはVercel、Netlifyなどの静的ホスティングサービスを使用

## テスト

バックエンドのテストを実行：

```bash
node tests/simple.test.js
```

テスト結果は`tests/test-results.txt`に保存されます。
