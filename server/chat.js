/**
 * WebTaleKit LLM中継サーバー（サンプル）
 *
 * シナリオから `<say post="http://localhost:3002/chat">` で呼び出し、
 * LLMの応答を `{ "reply": "..." }` の形で返します。
 * APIキーはこのサーバー側の環境変数に置き、ブラウザには渡しません。
 *
 * OpenAI互換API（/chat/completions）に対応しているサービスなら何でも使えます。
 *   - ローカルLLM: llama.cpp server / Ollama / LM Studio
 *   - Gemini:      https://generativelanguage.googleapis.com/v1beta/openai
 *   - OpenAI:      https://api.openai.com/v1
 *
 * 起動: npm run chat
 */
const express = require('express')

const PORT = Number(process.env.PORT || 3002)
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'http://localhost:8080/v1').replace(/\/$/, '')
const LLM_API_KEY = process.env.LLM_API_KEY || '' // ローカルLLMなら空でOK
const LLM_MODEL = process.env.LLM_MODEL || 'local-model'
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT || 'あなたはノベルゲームの案内人です。2〜3文で、親しみやすく答えてください。'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*' // 公開時はゲームのURLに絞ってください
const MAX_MESSAGE_LENGTH = 1000

const app = express()
app.use(express.json({ limit: '16kb' }))

// ゲーム（開発サーバー）とポートが違うので、CORSを許可する
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/chat', async (req, res) => {
  const { message } = req.body || {}

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ ok: false, error: '"message" を文字列で送ってください。' })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ ok: false, error: `"message" は${MAX_MESSAGE_LENGTH}文字以内にしてください。` })
  }

  try {
    const upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LLM_API_KEY && { Authorization: `Bearer ${LLM_API_KEY}` }),
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      console.error(`LLM API error ${upstream.status}: ${detail.slice(0, 500)}`)
      return res.status(502).json({ ok: false, error: `LLM API returned ${upstream.status}` })
    }

    const json = await upstream.json()
    const reply = json?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return res.status(502).json({ ok: false, error: 'LLMの応答が空でした。' })
    }

    // シナリオ側では {{res.reply}} で参照できる
    return res.json({ ok: true, reply })
  } catch (error) {
    console.error(error)
    return res.status(502).json({ ok: false, error: 'LLMに接続できませんでした。' })
  }
})

app.listen(PORT, () => {
  console.log(`webTaleKit chat relay listening on http://localhost:${PORT}/chat`)
  console.log(`  -> ${LLM_BASE_URL} (model: ${LLM_MODEL})`)
})
