const express = require('express')
// parser本体はTypeScript化されたため、コンパイル済みのdist/parserを参照する
// （npm run api が事前に tsc -p tsconfig.parser.json を実行する）
const parse = require('../dist/parser/parser').default
const { nodeHtmlParser } = require('../dist/parser/nodeHtmlParser')

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/parse', async (req, res) => {
  const { source } = req.body || {}

  if (typeof source !== 'string' || source.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'Request body must include a non-empty "source" string.',
    })
  }

  try {
    // 旧実装はhtmlParser未指定でparseを呼んでおり常に500エラーになっていた
    const result = await parse(source, nodeHtmlParser)
    return res.json({ ok: true, ...result })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected parser error.',
    })
  }
})

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

app.listen(port, () => {
  console.log(`webTaleKit API server listening on http://localhost:${port}`)
})