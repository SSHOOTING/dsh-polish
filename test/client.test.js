import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

test('client bundle registers the polish button and dock slots', async () => {
  const source = await readFile(new URL('../client.js', import.meta.url), 'utf8')
  let loaded
  const window = {
    __ModuleLoader__: {
      load(definition) {
        loaded = definition
      },
    },
  }
  vm.runInNewContext(source, { window, setTimeout, clearTimeout })

  assert.equal(loaded.id, 'dsh-polish')
  const fakeReact = {
    createElement() {},
    Fragment: Symbol('Fragment'),
    useRef() {
      return { current: undefined }
    },
    useSyncExternalStore() {
      return {}
    },
  }
  const plugin = loaded.factory((id) => {
    assert.equal(id, 'react')
    return fakeReact
  })

  assert.equal(plugin.name, 'dsh-polish/client')
  assert.deepEqual(Array.from(plugin.inject), ['slots', 'remote'])

  const registrations = []
  const effects = []
  const ctx = {
    remote: {
      async $mount() {
        return async () => {}
      },
    },
    get(key) {
      assert.equal(key, 'remote.dshPolish')
      return {
        polish() {},
      }
    },
    effect(fn) {
      effects.push(fn)
    },
    slots: {
      inject(name, register) {
        register()
        assert.ok(name)
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      },
    },
  }

  await plugin.apply(ctx)
  assert.deepEqual(
    registrations.map((entry) => entry.options.name),
    ['conversation.input.right', 'conversation.input.dock'],
  )
  assert.ok(registrations.every((entry) => typeof entry.component === 'function'))
  assert.ok(effects.length >= 2)
})
