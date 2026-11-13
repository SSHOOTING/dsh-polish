import { readFileSync } from 'node:fs'
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
  }

  async polish(request) {
    const text = String(request && request.text ? request.text : '').trim()
    if (!text) {
      return { ok: false, error: '输入框还是空的，请先写下要整理的内容。' }
    }

    const startedAt = Date.now()
    const controller = new AbortController()
    const timeoutMs = Math.max(5000, Number(this.config.timeoutMs) || 90000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const route = await resolveRoute(this.ctx, this.config)
      const system = String(this.config.prompt || '').trim() || DEFAULT_PROMPT
      const user = buildPolishUserMessage(text)
      let raw = ''

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

      for await (const chunk of stream) {
        if (!chunk) continue
        if (chunk.type === 'text-delta') {
          raw += chunk.text
          continue
        }
        if (chunk.type === 'finish') {
          const reason = chunk.reason
          if (reason && reason.kind === 'error') {
            throw new Error(reason.failure && reason.failure.message
              ? reason.failure.message
              : '模型调用失败')
          }
          if (reason && reason.kind === 'aborted') {
            throw new Error('润色请求已取消或超时')
          }
        }
      }

      const parsed = parsePolishResponse(raw, text)
      return {
        ok: true,
        polished: parsed.polished,
        highlights: parsed.highlights,
        sourceHighlights: parsed.sourceHighlights,
        notes: parsed.notes,
        route: `${route.provider}/${route.model}`,
        elapsedMs: Date.now() - startedAt,
      }
    } catch (error) {
      return {
        ok: false,
        error: controller.signal.aborted
          ? '润色超时了，请重试或缩短输入。'
          : normalizedError(error),
        elapsedMs: Date.now() - startedAt,
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

exposeRemote(DshPolishRemote, 'polish')

export function apply(ctx, config = {}) {
  new DshPolishRemote(ctx, config)
  console.log('[dsh-polish] host ready')
}
