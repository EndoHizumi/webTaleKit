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
          id: 'test',
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
  })
})
