import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPolishUserMessage,
  normalizeWhitespace,
  parsePolishResponse,
} from '../src/polish.js'

const source = '帮我做一下登录页，接口不要动。错误提示放到表单下面，然后提交的时候不要让用户重复点。'
const polished = '【目标】调整登录页面。\n\n【关键要求】\n- 保持现有接口不变。\n- 错误提示展示在表单下方。\n\n【约束与边界】\n- 提交时禁止重复点击。'

test('parses strict JSON and keeps exact highlight phrases', () => {
  const raw = JSON.stringify({
    polished,
    highlights: ['保持现有接口不变', '错误提示展示在表单下方', '禁止重复点击', 'not present'],
    source_highlights: ['接口不要动', '错误提示放到表单下面', '不要让用户重复点'],
    entities: ['登录页面', '接口'],
    source_entities: ['登录页', '接口'],
    notes: '把口语要求拆成目标和约束。',
  })

  const result = parsePolishResponse(raw, source)

  assert.equal(result.polished, polished)
  assert.deepEqual(result.highlights, ['错误提示展示在表单下方', '保持现有接口不变', '禁止重复点击'])
  assert.deepEqual(result.sourceHighlights, ['错误提示放到表单下面', '不要让用户重复点', '接口不要动'])
  assert.deepEqual(result.entities, ['登录页面', '接口'])
  assert.deepEqual(result.sourceEntities, ['登录页', '接口'])
  assert.equal(result.notes, '把口语要求拆成目标和约束。')
})

test('extracts JSON from a fenced block', () => {
  const raw = `这里是结果：\n\`\`\`json\n${JSON.stringify({
    polished,
    highlights: ['保持现有接口不变'],
    source_highlights: ['接口不要动'],
    notes: '轻度结构化。',
  })}\n\`\`\``

  const result = parsePolishResponse(raw, source)
  assert.equal(result.polished, polished)
  assert.deepEqual(result.highlights, ['保持现有接口不变'])
})

test('accepts brace characters inside JSON strings', () => {
  const customPolished = '【目标】输出 {name} 字段。\n\n【约束与边界】\n- 不要修改接口。'
  const raw = JSON.stringify({
    polished: customPolished,
    highlights: ['输出 {name} 字段', '不要修改接口'],
    source_highlights: ['接口不要动'],
    notes: '保留占位符。',
  })

  const result = parsePolishResponse(raw, '接口不要动，然后输出 {name} 字段。')
  assert.equal(result.polished, customPolished)
  assert.deepEqual(result.highlights, ['输出 {name} 字段', '不要修改接口'])
})

test('falls back to plain text when JSON is unavailable', () => {
  const result = parsePolishResponse(`润色稿：${polished}`, source)
  assert.equal(result.polished, polished)
  assert.ok(result.highlights.length > 0)
  assert.ok(result.sourceHighlights.length > 0)
  assert.match(result.notes, /纯文本/)
})

test('rejects an empty model response', () => {
  assert.throws(() => parsePolishResponse('   ', source), /没有返回可用的润色结果/)
})

test('normalizes whitespace without destroying paragraphs', () => {
  assert.equal(
    normalizeWhitespace('第一段  \r\n\r\n\r\n第二段\n'),
    '第一段\n\n第二段',
  )
})

test('decodes literal escaped line breaks from model JSON strings', () => {
  const raw = JSON.stringify({
    polished: '【目标】\\n修改页面。\\n\\n【关键要求】\\n- 接口不要动。',
    highlights: ['修改页面', '接口不要动'],
    source_highlights: ['接口不要动'],
    entities: ['接口'],
    source_entities: ['接口'],
    notes: '测试转义。',
  })
  const result = parsePolishResponse(raw, '接口不要动')
  assert.equal(result.polished, '【目标】\n修改页面。\n\n【关键要求】\n- 接口不要动。')
})

test('flags a truncated JSON response instead of accepting raw JSON as polish', () => {
  assert.throws(
    () => parsePolishResponse('{"polished":"【目标】修改页面。\\n【关键要求】', source),
    (error) => error.code === 'TRUNCATED' && /截断/.test(error.message),
  )
})

test('wraps the source draft for the model', () => {
  const message = buildPolishUserMessage('  第一行\n第二行  ')
  assert.match(message, /只输出约定的 JSON/)
  assert.match(message, /<draft>\n第一行\n第二行\n<\/draft>/)
})
