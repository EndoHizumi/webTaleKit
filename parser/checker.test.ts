import { check } from '../parser/checker'

describe('checker', () => {
  describe('valid scenarios', () => {
    test('empty scenario passes without errors', () => {
      expect(check([])).toEqual([])
    })

    test('top-level commands pass without errors', () => {
      const scenario = [
        { type: 'text', content: ['Hello'] },
        { type: 'say', name: 'Narrator', content: ['World'] },
        { type: 'show', src: './bg.jpg', content: [] },
        { type: 'route', to: 'title', content: [] },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('item inside choice passes without errors', () => {
      const scenario = [
        {
          type: 'choice',
          prompt: 'Choose',
          content: [
            { type: 'item', label: 'A', content: [] },
            { type: 'item', label: 'B', content: [] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('action inside actions inside dialog passes without errors', () => {
      const scenario = [
        {
          type: 'dialog',
          name: 'test',
          content: [
            { type: 'prompt', content: ['Question?'] },
            {
              type: 'actions',
              content: [
                { type: 'action', value: 'yes', label: 'Yes', content: [] },
                { type: 'action', value: 'no', label: 'No', content: [] },
              ],
            },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('then and else inside if passes without errors', () => {
      const scenario = [
        {
          type: 'if',
          condition: 'x === 1',
          content: [
            { type: 'then', content: [{ type: 'text', content: ['yes'] }] },
            { type: 'else', content: [{ type: 'text', content: ['no'] }] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('nested choice inside item passes without errors', () => {
      const scenario = [
        {
          type: 'choice',
          prompt: 'Outer',
          content: [
            {
              type: 'item',
              label: 'Pick',
              content: [
                {
                  type: 'choice',
                  prompt: 'Inner',
                  content: [{ type: 'item', label: 'Sub', content: [] }],
                },
              ],
            },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('inline text decoration tags inside text pass without errors', () => {
      const scenario = [
        {
          type: 'text',
          content: [
            { type: 'color', value: 'red', content: ['Red text'] },
            { type: 'ruby', text: 'ルビ', content: ['漢字'] },
            { type: 'b', content: ['Bold'] },
            { type: 'i', content: ['Italic'] },
            { type: 'br', content: [] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('inline text decoration tags inside say pass without errors', () => {
      const scenario = [
        {
          type: 'say',
          name: 'Narrator',
          content: [
            { type: 'color', value: 'blue', content: ['Blue'] },
            { type: 'b', content: ['Bold'] },
            { type: 'br', content: [] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('then inside text (HTTP response) passes without errors', () => {
      const scenario = [
        {
          type: 'text',
          get: 'https://api.example.com/data',
          content: [
            { type: 'progress', content: ['Loading...'] },
            { type: 'header', content: [] },
            { type: 'data', content: [] },
            { type: 'then', content: ['Success'] },
            { type: 'error', content: ['Error'] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('HTTP sub-tags inside call pass without errors', () => {
      const scenario = [
        {
          type: 'call',
          post: 'https://api.example.com/action',
          content: [
            { type: 'header', content: [] },
            { type: 'data', content: [] },
            { type: 'then', content: ['Done'] },
            { type: 'error', content: ['Failed'] },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('all known show attributes pass without warnings', () => {
      const scenario = [
        {
          type: 'show',
          src: './chara.png',
          name: 'hero',
          mode: 'chara',
          x: 100,
          y: 200,
          width: 300,
          height: 400,
          pos: 'center:middle',
          look: false,
          entry: { time: 1, wait: false },
          sepia: 0.5,
          mono: false,
          blur: 0,
          opacity: 1,
          transition: 'fade',
          duration: 1000,
          content: [],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('all known sound attributes pass without warnings', () => {
      const scenario = [
        {
          type: 'sound',
          src: './bgm.mp3',
          name: 'main',
          mode: 'bgm',
          play: true,
          loop: true,
          content: [],
        },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('save and load with known attributes pass without warnings', () => {
      const scenario = [
        { type: 'save', slot: '1', name: 'chapter1', message: true, content: [] },
        { type: 'load', slot: '1', message: false, content: [] },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('global attributes (if, get, post, put, delete) do not produce warnings', () => {
      const scenario = [
        { type: 'text', if: 'flag', get: 'https://api.example.com', content: ['ok'] },
        { type: 'call', if: 'x > 0', method: 'doSomething()', content: [] },
      ]
      expect(check(scenario)).toEqual([])
    })

    test('item with all known attributes passes without warnings', () => {
      const scenario = [
        {
          type: 'choice',
          content: [
            {
              type: 'item',
              label: 'Option A',
              id: 1,
              default: './btn.png',
              hover: './btn_hover.png',
              select: './btn_select.png',
              color: { default: 'black', hover: 'white', select: 'red' },
              position: { x: 100, y: 200 },
              content: [],
            },
          ],
        },
      ]
      expect(check(scenario)).toEqual([])
    })
  })

  describe('invalid parent-child relationships', () => {
    test('item at scenario root produces an error', () => {
      const scenario = [{ type: 'item', label: 'Option', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('invalid_parent')
      expect(errors[0].node).toBe('item')
      expect(errors[0].parent).toBeNull()
      expect(errors[0].message).toContain('<item>')
      expect(errors[0].message).toContain('<choice>')
    })

    test('item inside if (not choice) produces an error', () => {
      const scenario = [
        {
          type: 'if',
          condition: 'x',
          content: [
            {
              type: 'then',
              content: [{ type: 'item', label: 'Option', content: [] }],
            },
          ],
        },
      ]
      const errors = check(scenario)
      expect(errors.some((e) => e.node === 'item')).toBe(true)
    })

    test('action at scenario root produces an error', () => {
      const scenario = [{ type: 'action', value: 'yes', label: 'Yes', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('invalid_parent')
      expect(errors[0].node).toBe('action')
      expect(errors[0].message).toContain('<actions>')
    })

    test('then at scenario root produces an error', () => {
      const scenario = [{ type: 'then', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('then')
      expect(errors[0].message).toContain('<if>')
    })

    test('else at scenario root produces an error', () => {
      const scenario = [{ type: 'else', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('else')
      expect(errors[0].message).toContain('<if>')
    })

    test('prompt at scenario root produces an error', () => {
      const scenario = [{ type: 'prompt', content: ['Question?'] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('prompt')
      expect(errors[0].message).toContain('<dialog>')
    })

    test('actions at scenario root produces an error', () => {
      const scenario = [{ type: 'actions', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('actions')
      expect(errors[0].message).toContain('<dialog>')
    })

    test('multiple errors are all reported', () => {
      const scenario = [
        { type: 'item', label: 'A', content: [] },
        { type: 'item', label: 'B', content: [] },
        { type: 'action', value: 'x', label: 'X', content: [] },
      ]
      const errors = check(scenario)
      expect(errors).toHaveLength(3)
    })

    test('color at scenario root produces an error', () => {
      const scenario = [{ type: 'color', value: 'red', content: ['Red'] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('color')
      expect(errors[0].message).toContain('<text>')
      expect(errors[0].message).toContain('<say>')
    })

    test('ruby at scenario root produces an error', () => {
      const scenario = [{ type: 'ruby', text: 'ルビ', content: ['漢字'] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('ruby')
      expect(errors[0].message).toContain('<text>')
    })

    test('b and i at scenario root produce errors', () => {
      const scenario = [
        { type: 'b', content: ['Bold'] },
        { type: 'i', content: ['Italic'] },
      ]
      const errors = check(scenario)
      expect(errors).toHaveLength(2)
      expect(errors[0].node).toBe('b')
      expect(errors[1].node).toBe('i')
    })

    test('br at scenario root produces an error', () => {
      const scenario = [{ type: 'br', content: [] }]
      const errors = check(scenario)
      expect(errors).toHaveLength(1)
      expect(errors[0].node).toBe('br')
      expect(errors[0].message).toContain('<text>')
    })

    test('color inside choice (not text/say) produces an error', () => {
      const scenario = [
        {
          type: 'choice',
          content: [{ type: 'color', value: 'red', content: ['Red'] }],
        },
      ]
      const errors = check(scenario)
      expect(errors.some((e) => e.node === 'color')).toBe(true)
    })

    test('HTTP sub-tags at scenario root produce errors', () => {
      const scenario = [
        { type: 'header', content: [] },
        { type: 'data', content: [] },
        { type: 'error', content: ['Error'] },
        { type: 'progress', content: ['Loading'] },
      ]
      const errors = check(scenario)
      expect(errors).toHaveLength(4)
      expect(errors.map((e) => e.node)).toEqual(['header', 'data', 'error', 'progress'])
    })
  })

  describe('unknown attribute warnings', () => {
    test('unknown attribute on text produces a warning', () => {
      const scenario = [{ type: 'text', content: ['Hello'], unknownAttr: 'value' }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('text')
      expect(warnings[0].attribute).toBe('unknownAttr')
      expect(warnings[0].message).toContain('"unknownAttr"')
      expect(warnings[0].message).toContain('will be ignored')
    })

    test('unknown attribute on show produces a warning', () => {
      const scenario = [{ type: 'show', src: './bg.jpg', content: [], typo: 'yes' }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('show')
      expect(warnings[0].attribute).toBe('typo')
    })

    test('unknown attribute on jump produces a warning', () => {
      const scenario = [{ type: 'jump', index: 5, content: [], badAttr: true }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('jump')
      expect(warnings[0].attribute).toBe('badAttr')
    })

    test('any attribute on newpage produces a warning', () => {
      const scenario = [{ type: 'newpage', content: [], extra: 'ignored' }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('newpage')
      expect(warnings[0].attribute).toBe('extra')
    })

    test('unknown attribute on item produces a warning', () => {
      const scenario = [
        {
          type: 'choice',
          content: [{ type: 'item', label: 'A', content: [], ghost: true }],
        },
      ]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('item')
      expect(warnings[0].attribute).toBe('ghost')
    })

    test('multiple unknown attributes on one node produce multiple warnings', () => {
      const scenario = [{ type: 'route', to: 'next', content: [], foo: 1, bar: 2 }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(2)
      expect(warnings.map((w) => w.attribute).sort()).toEqual(['bar', 'foo'])
    })

    test('unknown attribute on inline color tag produces a warning', () => {
      const scenario = [
        {
          type: 'text',
          content: [{ type: 'color', value: 'red', content: ['Red'], extra: true }],
        },
      ]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('color')
      expect(warnings[0].attribute).toBe('extra')
    })

    test('unknown attribute on HTTP sub-tag produces a warning', () => {
      const scenario = [
        {
          type: 'text',
          get: 'https://api.example.com',
          content: [{ type: 'error', content: ['Fail'], retries: 3 }],
        },
      ]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(1)
      expect(warnings[0].node).toBe('error')
      expect(warnings[0].attribute).toBe('retries')
    })

    test('global attributes never produce warnings', () => {
      const scenario = [
        {
          type: 'say',
          name: 'Alice',
          if: 'flag',
          get: 'https://api.example.com',
          post: 'https://api.example.com',
          put: 'https://api.example.com',
          delete: 'https://api.example.com',
          content: ['Hello'],
        },
      ]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(0)
    })

    test('unknown node types do not produce attribute warnings', () => {
      // Custom/unknown tag types should not be flagged
      const scenario = [{ type: 'custom-tag', anything: 'value', content: [] }]
      const warnings = check(scenario).filter((r) => r.type === 'unknown_attribute')
      expect(warnings).toHaveLength(0)
    })

    test('warnings and errors can occur together', () => {
      // item at root (error) with an unknown attribute (warning)
      const scenario = [{ type: 'item', label: 'A', content: [], badAttr: true }]
      const results = check(scenario)
      const errors = results.filter((r) => r.type === 'invalid_parent')
      const warnings = results.filter((r) => r.type === 'unknown_attribute')
      expect(errors).toHaveLength(1)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].attribute).toBe('badAttr')
    })
  })
})
