window.__ModuleLoader__.load({
  id: 'dsh-polish',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const name = 'dsh-polish/client'
    const inject = ['slots', 'remote']

    const json = Object.freeze({
      parse(value) {
        return value
      },
    })

    const descriptor = (method) => ({
      id: `dsh-polish/remote#dshPolish/${method}`,
      service: 'dshPolish',
      namespace: 'dshPolish',
      method,
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        wire: 'request',
        source: 'json',
        codec: {
          mode: 'strict',
          typeSymbol: 'dsh-polish#JsonRequest',
          schema: json,
          create: () => json,
        },
      }],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-polish#JsonResult',
        schema: json,
        create: () => json,
      },
    })

    const remoteContribution = Object.freeze({
      package: 'dsh-polish',
      descriptors: Object.freeze([descriptor('polish')]),
    })

    const CSS = `
      .dsh-polish-trigger {
        height: 28px;
        min-width: 58px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 0 9px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, var(--dsw-alias-border-l2));
        border-radius: 9px;
        background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent);
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        transition: background .16s ease, color .16s ease, border-color .16s ease, transform .16s ease;
      }
      .dsh-polish-trigger:hover:not(:disabled) {
        color: var(--dsw-alias-label-primary);
        border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, var(--dsw-alias-border-l2));
        background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);
      }
      .dsh-polish-trigger:active:not(:disabled) { transform: scale(.96); }
      .dsh-polish-trigger:disabled { cursor: default; opacity: .48; }
      .dsh-polish-trigger[data-busy="true"] .dsh-polish-spark { animation: dsh-polish-spin 1.1s linear infinite; }
      .dsh-polish-spark { width: 14px; height: 14px; flex: none; }
      .dsh-polish-count {
        min-width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border-radius: 999px;
        color: var(--dsw-alias-state-business-primary);
        background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 15%, transparent);
        font-size: 9px;
        font-weight: 650;
      }
      .dsh-polish-panel {
        box-sizing: border-box;
        position: relative;
        width: 100%;
        margin: 8px 0 10px;
        padding: 13px 14px 12px;
        overflow: hidden;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, var(--dsw-alias-border-l2));
        border-radius: 16px;
        color: var(--dsw-alias-label-primary);
        background:
          radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent), transparent 36%),
          radial-gradient(circle at 88% 100%, color-mix(in srgb, #7c6cff 10%, transparent), transparent 34%),
          var(--dsw-alias-bg-layer-1);
        box-shadow: var(--dsw-shadow-lv2);
        animation: dsh-polish-panel-in .24s cubic-bezier(.2,.8,.2,1);
      }
      .dsh-polish-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(100deg, transparent 20%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 7%, transparent) 44%, transparent 68%);
        transform: translateX(-100%);
        animation: dsh-polish-sheen 2.6s ease-in-out infinite;
      }
      .dsh-polish-head {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 9px;
        min-height: 22px;
      }
      .dsh-polish-kicker {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
        font-weight: 650;
        letter-spacing: .01em;
      }
      .dsh-polish-live-dot {
        width: 7px;
        height: 7px;
        flex: none;
        border-radius: 50%;
        background: var(--dsw-alias-state-business-primary);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);
        animation: dsh-polish-dot 1.1s ease-in-out infinite;
      }
      .dsh-polish-head-note {
        min-width: 0;
        overflow: hidden;
        color: var(--dsw-alias-label-tertiary);
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-polish-head-spacer { flex: 1; }
      .dsh-polish-close {
        width: 25px;
        height: 25px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        padding: 0;
        border: 0;
        border-radius: 7px;
        color: var(--dsw-alias-label-tertiary);
        background: transparent;
        font: inherit;
        font-size: 17px;
        line-height: 1;
        cursor: pointer;
      }
      .dsh-polish-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
      .dsh-polish-thinking {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        margin-top: 10px;
        padding: 11px 12px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 12px;
        background: color-mix(in srgb, var(--dsw-alias-bg-module-platform) 78%, transparent);
      }
      .dsh-polish-orb {
        width: 30px;
        height: 30px;
        position: relative;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 11%, transparent);
      }
      .dsh-polish-orb::before,
      .dsh-polish-orb::after,
      .dsh-polish-orb i {
        content: "";
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--dsw-alias-state-business-primary);
        animation: dsh-polish-orbit 1.25s ease-in-out infinite;
      }
      .dsh-polish-orb::before { transform: translateX(-7px); animation-delay: 0s; }
      .dsh-polish-orb i { transform: translateY(-7px); animation-delay: .15s; }
      .dsh-polish-orb::after { transform: translateX(7px); animation-delay: .3s; }
      .dsh-polish-thinking-text {
        min-width: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 18px;
      }
      .dsh-polish-thinking-text strong {
        display: block;
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
        font-weight: 600;
      }
      .dsh-polish-skeleton {
        height: 5px;
        margin-top: 7px;
        overflow: hidden;
        border-radius: 99px;
        background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 11%, transparent);
      }
      .dsh-polish-skeleton::after {
        content: "";
        display: block;
        width: 42%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, var(--dsw-alias-state-business-primary), transparent);
        animation: dsh-polish-loading 1.35s ease-in-out infinite;
      }
      .dsh-polish-compare {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 42px minmax(0, 1fr);
        gap: 0;
        align-items: stretch;
        margin-top: 10px;
        max-height: min(48vh, 520px);
        overflow: auto;
        scrollbar-width: thin;
      }
      .dsh-polish-pane {
        min-width: 0;
        padding: 11px 12px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 12px;
        background: color-mix(in srgb, var(--dsw-alias-bg-module-platform) 80%, transparent);
      }
      .dsh-polish-pane-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 10px;
        font-weight: 650;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .dsh-polish-pane-text {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 12.5px;
        line-height: 1.76;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
      .dsh-polish-output .dsh-polish-pane-text {
        color: var(--dsw-alias-label-primary);
        animation: dsh-polish-reveal 1.15s cubic-bezier(.2,.7,.2,1) both;
      }
      .dsh-polish-hl {
        position: relative;
        display: inline;
        padding: 1px 2px;
        border-radius: 5px;
        color: var(--dsw-alias-label-primary);
        background: linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 25%, transparent) 55%);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary) 0%, transparent);
        animation: dsh-polish-highlight-pulse .9s ease-in-out var(--dsh-hl-delay, 0ms) 2;
      }
      .dsh-polish-pane:first-child .dsh-polish-hl {
        background: linear-gradient(180deg, transparent 54%, color-mix(in srgb, #ffb84d 34%, transparent) 54%);
        animation-name: dsh-polish-highlight-source;
      }
      .dsh-polish-bridge {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100%;
      }
      .dsh-polish-bridge::before {
        content: "";
        width: 1px;
        height: 72%;
        background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, transparent), transparent);
      }
      .dsh-polish-particle {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 5px;
        height: 5px;
        margin: -2.5px;
        border-radius: 50%;
        background: var(--dsw-alias-state-business-primary);
        box-shadow: 0 0 9px color-mix(in srgb, var(--dsw-alias-state-business-primary) 70%, transparent);
        animation: dsh-polish-merge 1.25s ease-in-out var(--dsh-particle-delay, 0ms) infinite;
      }
      .dsh-polish-particle:nth-child(2) { width: 4px; height: 4px; opacity: .7; }
      .dsh-polish-particle:nth-child(3) { width: 3px; height: 3px; opacity: .5; }
      .dsh-polish-footer {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
      }
      .dsh-polish-notes {
        min-width: 0;
        flex: 1 1 220px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 11px;
        line-height: 17px;
      }
      .dsh-polish-actions {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }
      .dsh-polish-action {
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px;
        color: var(--dsw-alias-label-secondary);
        background: transparent;
        font: inherit;
        font-size: 11px;
        cursor: pointer;
      }
      .dsh-polish-action:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
      .dsh-polish-action.primary {
        color: var(--dsw-alias-label-on-business, #fff);
        border-color: transparent;
        background: var(--dsw-alias-state-business-primary);
      }
      .dsh-polish-action.primary:hover { filter: brightness(1.06); background: var(--dsw-alias-state-business-primary); }
      .dsh-polish-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--dsw-alias-state-success-primary);
        font-size: 11px;
        white-space: nowrap;
      }
      .dsh-polish-status::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }
      .dsh-polish-error {
        position: relative;
        z-index: 1;
        margin-top: 10px;
        padding: 10px 11px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, var(--dsw-alias-border-l2));
        border-radius: 10px;
        color: var(--dsw-alias-state-error-primary);
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent);
        font-size: 12px;
        line-height: 18px;
      }
      @keyframes dsh-polish-spin { to { transform: rotate(360deg); } }
      @keyframes dsh-polish-panel-in { from { opacity: 0; transform: translateY(7px) scale(.995); } }
      @keyframes dsh-polish-sheen { 0%, 35% { transform: translateX(-110%); } 70%, 100% { transform: translateX(110%); } }
      @keyframes dsh-polish-dot { 50% { opacity: .45; transform: scale(.75); } }
      @keyframes dsh-polish-orbit { 50% { opacity: .25; transform: scale(.62); } }
      @keyframes dsh-polish-loading { from { transform: translateX(-110%); } to { transform: translateX(250%); } }
      @keyframes dsh-polish-reveal { from { clip-path: inset(0 100% 0 0); opacity: .48; } to { clip-path: inset(0 0 0 0); opacity: 1; } }
      @keyframes dsh-polish-highlight-source {
        0%, 100% { background-size: 100% 100%; box-shadow: 0 0 0 0 transparent; }
        45% { background-size: 100% 100%; box-shadow: 0 0 0 4px color-mix(in srgb, #ffb84d 13%, transparent); }
      }
      @keyframes dsh-polish-highlight-pulse {
        0%, 100% { box-shadow: 0 0 0 0 transparent; }
        45% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-business-primary) 13%, transparent); }
      }
      @keyframes dsh-polish-merge {
        0% { opacity: 0; transform: translate(0, 18px) scale(.5); }
        22% { opacity: 1; }
        72% { opacity: 1; transform: translate(0, -16px) scale(1); }
        100% { opacity: 0; transform: translate(8px, -22px) scale(.65); }
      }
      @media (max-width: 700px) {
        .dsh-polish-compare { grid-template-columns: minmax(0, 1fr); }
        .dsh-polish-bridge { min-height: 34px; }
        .dsh-polish-bridge::before { width: 70%; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, transparent), transparent); }
        .dsh-polish-particle { animation-name: dsh-polish-merge-mobile; }
      }
      @keyframes dsh-polish-merge-mobile {
        0% { opacity: 0; transform: translate(-18px, 0) scale(.5); }
        30% { opacity: 1; }
        100% { opacity: 0; transform: translate(18px, 0) scale(.65); }
      }
      @media (prefers-reduced-motion: reduce) {
        .dsh-polish-panel,
        .dsh-polish-panel::before,
        .dsh-polish-live-dot,
        .dsh-polish-orb::before,
        .dsh-polish-orb::after,
        .dsh-polish-orb i,
        .dsh-polish-skeleton::after,
        .dsh-polish-hl,
        .dsh-polish-particle,
        .dsh-polish-output .dsh-polish-pane-text,
        .dsh-polish-trigger[data-busy="true"] .dsh-polish-spark {
          animation: none !important;
        }
        .dsh-polish-output .dsh-polish-pane-text { clip-path: none; opacity: 1; }
      }
    `

    const STATES = new Map()
    const LISTENERS = new Set()
    let callPolish = null
    let styleDisposer = null

    function initialState() {
      return {
        visible: false,
        status: 'idle',
        source: '',
        original: '',
        result: null,
        round: 0,
        animationKey: 0,
        error: '',
        dirty: false,
        applied: false,
      }
    }

    function stateFor(sessionId) {
      let state = STATES.get(sessionId)
      if (!state) {
        state = initialState()
        STATES.set(sessionId, state)
      }
      return state
    }

    function publish(sessionId, patch) {
      STATES.set(sessionId, { ...stateFor(sessionId), ...patch })
      for (const listener of [...LISTENERS]) listener()
    }

    function subscribe(listener) {
      LISTENERS.add(listener)
      return () => LISTENERS.delete(listener)
    }

    function usePolishState(sessionId) {
      return React.useSyncExternalStore(
        subscribe,
        () => stateFor(sessionId),
        () => stateFor(sessionId),
      )
    }

    function installStyle() {
      if (typeof document === 'undefined') return () => {}
      const id = 'dsh-polish/styles'
      const existing = document.querySelector(`style[data-plugin-css="${id}"]`)
      if (existing) return () => {}
      const node = document.createElement('style')
      node.dataset.plugin = 'dsh-polish'
      node.dataset.pluginCss = id
      node.textContent = CSS
      ;(document.head || document.body || document.documentElement).appendChild(node)
      return () => node.remove()
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    function errorText(error) {
      return String(error && error.message ? error.message : error)
    }

    function draftTextForEditor(text) {
      return String(text || '').replace(/\n{2,}/g, '\n')
    }

    async function invokePolish(payload) {
      if (typeof callPolish !== 'function') throw new Error('润色服务还没准备好，请刷新页面后重试。')
      const answered = await callPolish(payload)
      if (!answered || answered.ok !== true) {
        const failure = answered && answered.error
        throw new Error(failure
          ? String(failure.message || failure.code || failure)
          : 'DSH Remote 调用失败')
      }
      const value = answered.value
      if (!value || value.ok !== true) {
        throw new Error(value && value.error ? value.error : '润色服务没有返回结果')
      }
      return value
    }

    async function startPolish(sessionId, draft, inputActions, draftRef) {
      const current = stateFor(sessionId)
      if (current.status === 'polishing' || current.status === 'revealing') return
      const text = String(draft || '').trim()
      if (!text) return

      const requestKey = Date.now()
      publish(sessionId, {
        visible: true,
        status: 'polishing',
        source: text,
        original: current.round === 0 ? text : (current.original || text),
        result: null,
        error: '',
        dirty: false,
        applied: false,
        animationKey: requestKey,
      })

      try {
        const result = await invokePolish({ text, sessionId })
        if (stateFor(sessionId).animationKey !== requestKey) return

        publish(sessionId, {
          status: 'revealing',
          result,
          animationKey: requestKey + 1,
        })

        await sleep(2350)
        if (stateFor(sessionId).animationKey !== requestKey + 1) return

        const currentDraft = String(draftRef.current || '')
        if (currentDraft !== text) {
          publish(sessionId, {
            status: 'ready',
            dirty: true,
            applied: false,
          })
          return
        }

        inputActions.setDraft(draftTextForEditor(result.polished))
        publish(sessionId, {
          status: 'done',
          dirty: false,
          applied: true,
          round: stateFor(sessionId).round + 1,
        })
      } catch (error) {
        if (stateFor(sessionId).animationKey !== requestKey
          && stateFor(sessionId).animationKey !== requestKey + 1) return
        publish(sessionId, {
          status: 'error',
          error: errorText(error),
          applied: false,
        })
      }
    }

    function applyReadyResult(sessionId, inputActions) {
      const state = stateFor(sessionId)
      if (!state.result || !state.result.polished) return
      inputActions.setDraft(draftTextForEditor(state.result.polished))
      publish(sessionId, {
        status: 'done',
        dirty: false,
        applied: true,
        round: state.round + 1,
      })
    }

    function undoToOriginal(sessionId, inputActions) {
      const state = stateFor(sessionId)
      if (!state.original) return
      inputActions.setDraft(state.original)
      publish(sessionId, {
        visible: false,
        status: 'idle',
        source: '',
        original: '',
        result: null,
        round: 0,
        error: '',
        dirty: false,
        applied: false,
      })
    }

    function rangesFor(text, phrases) {
      const ranges = []
      const sorted = [...new Set(phrases || [])]
        .filter((phrase) => typeof phrase === 'string' && phrase.length > 0)
        .sort((a, b) => b.length - a.length)

      for (const phrase of sorted) {
        let from = 0
        while (from < text.length) {
          const index = text.indexOf(phrase, from)
          if (index < 0) break
          const end = index + phrase.length
          const overlaps = ranges.some((range) => index < range.end && end > range.start)
          if (!overlaps) ranges.push({ start: index, end })
          from = index + Math.max(1, phrase.length)
        }
      }

      return ranges.sort((a, b) => a.start - b.start)
    }

    function HighlightedText({ text, phrases }) {
      const value = String(text || '')
      const ranges = rangesFor(value, phrases)
      if (ranges.length === 0) return value

      const children = []
      let cursor = 0
      ranges.forEach((range, index) => {
        if (cursor < range.start) children.push(value.slice(cursor, range.start))
        children.push(h('mark', {
          key: `hl-${index}-${range.start}`,
          className: 'dsh-polish-hl',
          style: { '--dsh-hl-delay': `${index * 120}ms` },
        }, value.slice(range.start, range.end)))
        cursor = range.end
      })
      if (cursor < value.length) children.push(value.slice(cursor))
      return h(React.Fragment, null, ...children)
    }

    function SparkIcon() {
      return h('svg', {
        className: 'dsh-polish-spark',
        viewBox: '0 0 16 16',
        'aria-hidden': true,
      },
      h('path', {
        d: 'M8.4 1.8 9.7 5l3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2L3.9 6.3 7.1 5 8.4 1.8Z',
        fill: 'currentColor',
      }),
      h('path', {
        d: 'm12.9 10.2.65 1.55 1.55.65-1.55.65-.65 1.55-.65-1.55-1.55-.65 1.55-.65.65-1.55Z',
        fill: 'currentColor',
        opacity: '.62',
      }))
    }

    function PolishButton({ sessionId, useInput, inputActions }) {
      const draft = useInput((state) => state.draft)
      const draftRef = React.useRef(draft)
      draftRef.current = draft
      const state = usePolishState(sessionId)
      const busy = state.status === 'polishing' || state.status === 'revealing'
      const disabled = busy || draft.trim().length === 0

      return h('button', {
        type: 'button',
        className: 'dsh-polish-trigger',
        'data-busy': busy ? 'true' : 'false',
        disabled,
        title: !draft.trim()
          ? '先输入内容，再点击润色'
          : busy
            ? '正在重组你的表达'
            : state.round > 0
              ? `再次润色当前草稿（已完成 ${state.round} 次）`
              : '把草稿整理成结构化、精简的请求',
        'aria-label': '润色当前草稿',
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => {
          void startPolish(sessionId, draftRef.current, inputActions, draftRef)
        },
      },
      h(SparkIcon),
      h('span', null, '润色'),
      state.round > 0 ? h('span', { className: 'dsh-polish-count' }, String(state.round)) : null)
    }

    function CombineBridge() {
      return h('div', { className: 'dsh-polish-bridge', 'aria-hidden': true },
        h('i', { className: 'dsh-polish-particle', style: { '--dsh-particle-delay': '0ms' } }),
        h('i', { className: 'dsh-polish-particle', style: { '--dsh-particle-delay': '280ms' } }),
        h('i', { className: 'dsh-polish-particle', style: { '--dsh-particle-delay': '560ms' } }))
    }

    function PolishDock({ sessionId, useInput, inputActions }) {
      const draft = useInput((state) => state.draft)
      const draftRef = React.useRef(draft)
      draftRef.current = draft
      const state = usePolishState(sessionId)
      if (!state.visible || state.status === 'idle') return null

      const result = state.result
      const sourcePhrases = result && Array.isArray(result.sourceHighlights)
        ? result.sourceHighlights
        : []
      const polishedPhrases = result && Array.isArray(result.highlights)
        ? result.highlights
        : []

      const close = () => publish(sessionId, { visible: false })
      const retry = () => {
        const target = String(draftRef.current || '').trim()
        if (!target) return
        void startPolish(sessionId, target, inputActions, draftRef)
      }

      const headNote = state.status === 'polishing'
        ? '只重组表达，不替你回答'
        : state.status === 'revealing'
          ? '高亮重点 → 重新组合 → 写回输入框'
          : state.status === 'ready'
            ? '你在动画期间继续编辑了，结果没有覆盖当前内容'
            : state.status === 'error'
              ? '这次没有生成可用结果'
              : '已写回输入框，可以继续编辑或再次润色'

      return h('section', {
        className: 'dsh-polish-panel',
        'data-status': state.status,
        'aria-label': 'DSH 润色工作区',
      },
      h('header', { className: 'dsh-polish-head' },
        h('div', { className: 'dsh-polish-kicker' },
          h('span', {
            className: 'dsh-polish-live-dot',
            style: state.status === 'done' ? { background: 'var(--dsw-alias-state-success-primary)' } : undefined,
          }),
          h('span', null, state.status === 'polishing'
            ? `第 ${state.round + 1} 次润色中`
            : state.status === 'revealing'
              ? '正在重组'
              : state.status === 'error'
                ? '润色失败'
                : `第 ${state.round || 1} 次润色完成`)),
        h('span', { className: 'dsh-polish-head-note' }, headNote),
        h('span', { className: 'dsh-polish-head-spacer' }),
        h('button', {
          type: 'button',
          className: 'dsh-polish-close',
          title: '收起润色面板',
          'aria-label': '收起润色面板',
          onMouseDown: (event) => event.preventDefault(),
          onClick: close,
        }, '×')),

      state.status === 'polishing'
        ? h('div', { className: 'dsh-polish-thinking' },
          h('span', { className: 'dsh-polish-orb', 'aria-hidden': true }, h('i')),
          h('div', { className: 'dsh-polish-thinking-text' },
            h('strong', null, '正在读懂目标、约束和重点'),
            h('span', null, '先保留原意，再压缩重复，最后整理成可发送的结构。'),
            h('div', { className: 'dsh-polish-skeleton', 'aria-hidden': true })))
        : null,

      (state.status === 'revealing' || state.status === 'done' || state.status === 'ready') && result
        ? h('div', { className: 'dsh-polish-compare', key: state.animationKey },
          h('div', { className: 'dsh-polish-pane' },
            h('div', { className: 'dsh-polish-pane-label' },
              h('span', null, '你的原话'),
              h('span', null, `${state.source.length} 字`)),
            h('pre', { className: 'dsh-polish-pane-text' },
              h(HighlightedText, { text: state.source, phrases: sourcePhrases }))),
          h(CombineBridge),
          h('div', { className: 'dsh-polish-pane dsh-polish-output' },
            h('div', { className: 'dsh-polish-pane-label' },
              h('span', null, '重组后的表达'),
              h('span', null, `${result.polished.length} 字`)),
            h('pre', { className: 'dsh-polish-pane-text' },
              h(HighlightedText, { text: result.polished, phrases: polishedPhrases }))))
        : null,

      state.status === 'error'
        ? h('div', { className: 'dsh-polish-error', role: 'alert' }, state.error || '润色失败，请重试。')
        : null,

      h('footer', { className: 'dsh-polish-footer' },
        state.status === 'done'
          ? h('span', { className: 'dsh-polish-status' }, state.applied ? '已写回输入框' : '结果已生成')
          : h('span', { className: 'dsh-polish-notes' },
            result && result.notes
              ? result.notes
              : '润色只整理你的表达，不改事实、不替你执行任务。'),
        h('span', { className: 'dsh-polish-actions' },
          state.status === 'ready'
            ? h(React.Fragment, null,
              h('button', {
                type: 'button',
                className: 'dsh-polish-action',
                onMouseDown: (event) => event.preventDefault(),
                onClick: () => publish(sessionId, { visible: false, status: 'done', dirty: false }),
              }, '保留我的编辑'),
              h('button', {
                type: 'button',
                className: 'dsh-polish-action primary',
                onMouseDown: (event) => event.preventDefault(),
                onClick: () => applyReadyResult(sessionId, inputActions),
              }, '采用润色稿'))
            : null,
          state.status === 'error'
            ? h('button', {
              type: 'button',
              className: 'dsh-polish-action primary',
              onMouseDown: (event) => event.preventDefault(),
              onClick: retry,
            }, '重试')
            : null,
          (state.status === 'done' || state.status === 'revealing')
            ? h('button', {
              type: 'button',
              className: 'dsh-polish-action',
              disabled: state.status === 'revealing',
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => undoToOriginal(sessionId, inputActions),
            }, '撤销到最初原稿')
            : null,
          state.status === 'done'
            ? h('button', {
              type: 'button',
              className: 'dsh-polish-action primary',
              onMouseDown: (event) => event.preventDefault(),
              onClick: close,
            }, '继续编辑')
            : null)))
    }

    async function apply(ctx) {
      const disposeRemote = await ctx.remote.$mount(remoteContribution)
      ctx.effect(() => () => {
        void disposeRemote()
      })

      const remote = ctx.get('remote.dshPolish')
      if (!remote) throw new Error('dsh-polish: host Remote namespace is unavailable')
      callPolish = (payload) => remote.polish(payload)

      styleDisposer = installStyle()
      ctx.effect(() => () => {
        if (styleDisposer) {
          styleDisposer()
          styleDisposer = null
        }
      })

      ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'dsh-polish-button',
        order: 30,
        label: '润色',
      }, PolishButton))

      ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'dsh-polish-dock',
        order: 20,
        label: '润色工作区',
      }, PolishDock))
    }

    return { name, inject, apply }
  },
})
