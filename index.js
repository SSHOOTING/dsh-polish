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
  return [
    'EMPTY_RESPONSE',
    'INVALID_OUTPUT',
    'RATE_LIMIT',
    'SERVER',
    'TIMEOUT',
    'TRANSPORT',
    'TRUNCATED',
  ].includes(error.code)
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

async function resolveReasoningEffort(ctx, route, config) {
  const requested = String(config.reasoningEffort || 'low').trim().toLowerCase()
  if (!requested || requested === 'default') return undefined
  try {
    const info = await ctx.llm.resolveModelInfo(route.provider, route.model)
    const efforts = info && info.reasoning && Array.isArray(info.reasoning.efforts)
      ? info.reasoning.efforts
      : []
    if (efforts.some((effort) => String(effort.id) === requested)) {
      return efforts.find((effort) => String(effort.id) === requested).id
    }
    for (const level of ['minimal', 'low', 'off', 'medium', 'high', 'xhigh', 'max']) {
      const match = efforts.find((effort) => String(effort.id) === level)
      if (match) return match.id
    }
  } catch {
    // Model metadata is advisory. Preserve the provider default when absent.
  }
  return undefined
}

function maxTokensFor(text) {
  return Math.max(8192, Math.min(32768, Math.ceil(text.length * 2) + 3000))
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
    let reasoningEffort = null
    let attempts = 0
    let tokenLimit = maxTokensFor(text)

    try {
      route = await resolveRoute(this.ctx, this.config)
      reasoningEffort = await resolveReasoningEffort(this.ctx, route, this.config)
      const system = String(this.config.prompt || '').trim() || DEFAULT_PROMPT
      let raw = ''
      let lastError = null
      let parsed = null
      let firstTextMs = null
      let reasoningChars = 0
      let finishKind = ''

      while (attempts <= maxRetries) {
        attempts += 1
        const user = buildPolishUserMessage(
          text,
          attempts > 1 && lastError && ['INVALID_OUTPUT', 'TRUNCATED'].includes(lastError.code),
        )
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)
        firstTextMs = null
        reasoningChars = 0
        finishKind = ''
        const attemptStartedAt = Date.now()

        try {
          const stream = this.ctx.llm.stream({
            provider: route.provider,
            model: route.model,
            ...(reasoningEffort === undefined ? {} : { reasoningEffort }),
            system,
            messages: [{
              role: 'user',
              content: [{ type: 'text', text: user }],
            }],
            temperature: 0.2,
            maxTokens: tokenLimit,
            signal: controller.signal,
          })

          raw = ''
          for await (const chunk of stream) {
            if (!chunk) continue
            if (chunk.type === 'text-delta') {
              if (firstTextMs === null) firstTextMs = Date.now() - attemptStartedAt
              raw += chunk.text
              continue
            }
            if (chunk.type === 'reasoning-delta') {
              reasoningChars += String(chunk.text || '').length
              continue
            }
            if (chunk.type === 'finish') {
              const reason = chunk.reason
              finishKind = reason && reason.kind ? reason.kind : ''
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
              if (reason && reason.kind === 'max-tokens') {
                throw new PolishModelError('模型输出被截断', 'TRUNCATED')
              }
            }
          }
          if (!raw.trim()) {
            throw new PolishModelError('模型没有返回文本', 'EMPTY_RESPONSE')
          }
          parsed = parsePolishResponse(raw, text)
          break
        } catch (error) {
          lastError = error instanceof PolishModelError
            ? error
            : new PolishModelError(
              normalizedError(error),
              error && error.code ? error.code : 'MODEL',
            )
          if (attempts > maxRetries || !retryable(lastError)) throw lastError
          if (lastError.code === 'TRUNCATED'
            || (lastError.code === 'EMPTY_RESPONSE' && reasoningChars > 0)) {
            tokenLimit = Math.min(32768, tokenLimit * 2)
          }
          const delay = retryDelayMs * (2 ** (attempts - 1))
          this.writeDiagnostic({
            status: 'retry',
            sessionId,
            route: `${route.provider}/${route.model}`,
            reasoningEffort: reasoningEffort === undefined ? null : String(reasoningEffort),
            attempt: attempts,
            nextRetryInMs: delay,
            code: lastError.code,
            error: lastError.message,
            inputChars: text.length,
            maxTokens: tokenLimit,
            firstTextMs,
            reasoningChars,
            finishKind,
          })
          await wait(delay)
        } finally {
          clearTimeout(timeout)
        }
      }

      if (lastError && (!raw.trim() || parsed === null)) {
        throw lastError
      }

      const elapsedMs = Date.now() - startedAt
      this.writeDiagnostic({
        status: 'ok',
        sessionId,
        route: `${route.provider}/${route.model}`,
        reasoningEffort: reasoningEffort === undefined ? null : String(reasoningEffort),
        attempts,
        elapsedMs,
        inputChars: text.length,
        outputChars: parsed.polished.length,
        parseMode: parsed.parseMode,
        maxTokens: tokenLimit,
        firstTextMs,
        reasoningChars,
        finishKind,
      })
      return {
        ok: true,
        polished: parsed.polished,
        highlights: parsed.highlights,
        sourceHighlights: parsed.sourceHighlights,
        entities: parsed.entities,
        sourceEntities: parsed.sourceEntities,
        notes: parsed.notes,
        parseMode: parsed.parseMode,
        route: `${route.provider}/${route.model}`,
        reasoningEffort: reasoningEffort === undefined ? null : String(reasoningEffort),
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
