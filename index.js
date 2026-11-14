import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import {
  buildPolishUserMessage,
  parsePolishResponse,
} from './src/polish.js'

export const name = 'dsh-polish'
export const inject = ['llm', 'agentDefaultModel']

const DEFAULT_PROMPT = readFileSync(
  new URL('./prompts/polish-system.md', import.meta.url),
  'utf8',
).trim()

const remoteMethods = []

function exposeRemote(klass, method, exportName) {
  const initializers = []
  Remote(exportName || method)(klass.prototype[method], {
    private: false,
    static: false,
    name: method,
    addInitializer(fn) {
      initializers.push(fn)
    },
  })
  const marker = Object.create(klass.prototype)
  for (const init of initializers) init.call(marker)
  remoteMethods.push(exportName || method)
}

function normalizedError(error) {
  return String(error && error.message ? error.message : error)
}

class PolishModelError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'PolishModelError'
    this.code = code || 'MODEL'
  }
}

function retryable(error) {
  return ['EMPTY_RESPONSE', 'RATE_LIMIT', 'SERVER', 'TIMEOUT', 'TRANSPORT'].includes(error.code)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function diagnosticPath(config) {
  if (config.logPath) return String(config.logPath)
  const home = process.env.DSH_HOME || process.cwd()
  return join(home, 'dsh-polish', 'diagnostics.jsonl')
}

function pickFallbackRoute(llm, selection) {
  const providers = llm.listProviders()
  if (providers.length === 0) throw new Error('DSH 当前没有可用的模型服务')
  const selected = providers.find((provider) => provider.id === selection.provider)
  const provider = selected || providers[0]
  return {
    provider: provider.id,
    model: selected ? (selection.model || '') : '',
    selected: selected !== undefined,
  }
}

async function resolveRoute(ctx, config) {
  const configuredProvider = String(config.provider || '').trim()
  const configuredModel = String(config.model || '').trim()
  const current = ctx.agentDefaultModel.currentSelection()
  const selection = {
    provider: configuredProvider || current.provider,
    model: configuredModel || current.model,
  }

  const route = pickFallbackRoute(ctx.llm, selection)
  const models = await ctx.llm.listModels(route.provider)
  if (models.length === 0) {
    throw new Error(`模型服务 ${route.provider} 没有可用模型`)
  }
  if (!route.model || !models.some((model) => model.id === route.model)) {
    route.model = models[0].id
  }

  return route
}

function maxTokensFor(text) {
  return Math.max(1600, Math.min(8192, Math.ceil(text.length * 1.5) + 700))
}

class DshPolishRemote extends TypertRemoteService {
  constructor(ctx, config) {
    super(ctx, 'dshPolish', { namespace: 'dshPolish' })
    this.config = config || {}
    this.logPath = diagnosticPath(this.config)
  }

  writeDiagnostic(record) {
    try {
      mkdirSync(dirname(this.logPath), { recursive: true })
      appendFileSync(this.logPath, `${JSON.stringify({
        time: new Date().toISOString(),
        ...record,
      })}\n`, 'utf8')
    } catch {
      // Diagnostics must never turn a model failure into a second failure.
    }
  }

  async polish(request) {
    const text = String(request && request.text ? request.text : '').trim()
    if (!text) {
      return { ok: false, error: '输入框还是空的，请先写下要整理的内容。' }
    }

    const startedAt = Date.now()
    const timeoutMs = Math.max(5000, Number(this.config.timeoutMs) || 90000)
    const configuredRetries = Number(this.config.maxRetries)
    const configuredDelay = Number(this.config.retryDelayMs)
    const maxRetries = Math.max(0, Math.min(5, Number.isFinite(configuredRetries) ? configuredRetries : 2))
    const retryDelayMs = Math.max(100, Number.isFinite(configuredDelay) ? configuredDelay : 700)
    const sessionId = request && request.sessionId ? String(request.sessionId) : ''
    let route = null
    let attempts = 0

    try {
      route = await resolveRoute(this.ctx, this.config)
      const system = String(this.config.prompt || '').trim() || DEFAULT_PROMPT
      const user = buildPolishUserMessage(text)
      let raw = ''
      let lastError = null

      while (attempts <= maxRetries) {
        attempts += 1
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)

        try {
          const stream = this.ctx.llm.stream({
            provider: route.provider,
            model: route.model,
            system,
            messages: [{
              role: 'user',
              content: [{ type: 'text', text: user }],
            }],
            temperature: 0.2,
            maxTokens: maxTokensFor(text),
            signal: controller.signal,
          })

          raw = ''
          for await (const chunk of stream) {
            if (!chunk) continue
            if (chunk.type === 'text-delta') {
              raw += chunk.text
              continue
            }
            if (chunk.type === 'finish') {
              const reason = chunk.reason
              if (reason && reason.kind === 'error') {
                const failure = reason.failure || {}
                throw new PolishModelError(
                  failure.message || '模型调用失败',
                  failure.code || 'MODEL',
                )
              }
              if (reason && reason.kind === 'aborted') {
                throw new PolishModelError(
                  controller.signal.aborted ? '润色请求超时' : '润色请求已取消',
                  controller.signal.aborted ? 'TIMEOUT' : 'ABORTED',
                )
              }
            }
          }
          if (!raw.trim()) {
            throw new PolishModelError('模型没有返回文本', 'EMPTY_RESPONSE')
          }
          break
        } catch (error) {
          lastError = error instanceof PolishModelError
            ? error
            : new PolishModelError(normalizedError(error), 'MODEL')
          if (attempts > maxRetries || !retryable(lastError)) throw lastError
          const delay = retryDelayMs * (2 ** (attempts - 1))
          this.writeDiagnostic({
            status: 'retry',
            sessionId,
            route: `${route.provider}/${route.model}`,
            attempt: attempts,
            nextRetryInMs: delay,
            code: lastError.code,
            error: lastError.message,
            inputChars: text.length,
          })
          await wait(delay)
        } finally {
          clearTimeout(timeout)
        }
      }

      if (lastError && !raw.trim()) {
        throw lastError
      }

      const parsed = parsePolishResponse(raw, text)
      const elapsedMs = Date.now() - startedAt
      this.writeDiagnostic({
        status: 'ok',
        sessionId,
        route: `${route.provider}/${route.model}`,
        attempts,
        elapsedMs,
        inputChars: text.length,
        outputChars: parsed.polished.length,
      })
      return {
        ok: true,
        polished: parsed.polished,
        highlights: parsed.highlights,
        sourceHighlights: parsed.sourceHighlights,
        notes: parsed.notes,
        route: `${route.provider}/${route.model}`,
        attempts,
        elapsedMs,
      }
    } catch (error) {
      const code = error instanceof PolishModelError ? error.code : 'MODEL'
      const elapsedMs = Date.now() - startedAt
      this.writeDiagnostic({
        status: 'error',
        sessionId,
        route: route ? `${route.provider}/${route.model}` : '',
        attempts,
        elapsedMs,
        code,
        error: normalizedError(error),
        inputChars: text.length,
      })
      const message = code === 'TIMEOUT'
        ? '润色超时了，请重试或缩短输入。'
        : normalizedError(error)
      return {
        ok: false,
        error: attempts > 1 ? `${message}（已尝试 ${attempts} 次）` : message,
        code,
        attempts,
        elapsedMs,
        diagnosticPath: this.logPath,
      }
    }
  }
}

exposeRemote(DshPolishRemote, 'polish')

export function apply(ctx, config = {}) {
  new DshPolishRemote(ctx, config)
  console.log('[dsh-polish] host ready')
}
