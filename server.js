// server.js - バックエンドプロキシサーバー
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// API キー（環境変数から取得）
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('環境変数 GEMINI_API_KEY が設定されていません。');
  process.exit(1);
}

// CORS の設定（本番環境では適切に制限すること）
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGIN || 'https://yourdomain.com' 
    : 'http://localhost:3000'
}));

// JSON ボディパーサー
app.use(express.json());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '/')));

// レート制限の設定
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 10, // 15分間に10リクエストまで
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト数の上限に達しました。しばらく待ってから再試行してください。' }
});

// API エンドポイントにレート制限を適用
app.use('/api/', apiLimiter);

// Gemini API プロキシエンドポイント
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: '要約するテキストが提供されていません。' });
    }
    
    // プロンプトの設定
    const prompt = `あなたは、与えられたウェブページの内容を分析し、その核心を1文にまとめるプロの編集者です。

# 制約条件
- 出力は、必ず日本語の1文で行うこと。
- 要約は、記事やページの最も重要な結論や主題を反映していること。
- 専門用語は極力避け、一般的で分かりやすい言葉を選ぶこと。
- 最大でも100文字以内を目安とし、簡潔にまとめること。
- 元の記事の客観的な事実に基づき、個人的な意見や解釈は加えないこと。

# 入力
以下のテキストは、要約対象のウェブページから抽出した内容です。

${text}

# 出力`;

    // Gemini API へのリクエスト
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 200, topP: 0.8, topK: 40 }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API エラー:', errorData);
      return res.status(response.status).json({ 
        error: `Gemini API エラー: ${response.status} ${response.statusText}` 
      });
    }

    const responseData = await response.json();
    
    // レスポンスから要約テキストを抽出
    if (!responseData.candidates || responseData.candidates.length === 0) {
      return res.status(500).json({ error: 'API からの応答に候補がありません。' });
    }
    
    const candidate = responseData.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return res.status(500).json({ error: 'API からの応答に内容がありません。' });
    }
    
    let summaryText = '';
    for (const part of candidate.content.parts) {
      if (part.text) {
        summaryText += part.text;
      }
    }
    
    // クリーンアップ - 1行にする
    summaryText = summaryText.trim()
      .replace(/\n+/g, ' ')  // 改行を空白に置換
      .replace(/\s+/g, ' ')  // 複数の空白を1つに置換
      .trim();
      
    // 長すぎる場合は切り詰める
    const MAX_CHARACTERS = 100;
    if (summaryText.length > MAX_CHARACTERS) {
      summaryText = summaryText.substring(0, MAX_CHARACTERS - 3) + '...';
    }
    
    // 結果を返す
    res.json({ summary: summaryText });
    
  } catch (error) {
    console.error('サーバーエラー:', error);
    res.status(500).json({ error: 'サーバー内部エラー' });
  }
});

// URL コンテンツ取得プロキシ（CORS 対策）
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.match(/^https?:\/\/.+/)) {
      return res.status(400).json({ error: '有効な URL を指定してください。' });
    }
    
    // URL からコンテンツを取得
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `URL の取得に失敗しました: ${response.status} ${response.statusText}` 
      });
    }
    
    const content = await response.text();
    // 取得したコンテンツをJSONオブジェクトでラップして返す
    res.json({ content: content });
    
  } catch (error) {
    console.error('URL 取得エラー:', error);
    res.status(500).json({ error: 'URL の取得中にエラーが発生しました。' });
  }
});

// メインページへのルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
