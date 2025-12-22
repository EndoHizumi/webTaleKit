import { describe, it, expect, beforeEach } from '@jest/globals'

describe('executeCode with call handler', () => {
  let mockSceneFile: any
  let executeCode: (code: string) => any

  beforeEach(() => {
    mockSceneFile = {
      hoge: 2,
      fuga: 10,
      sceneConfig: { name: 'test' }
    }

    // Simulate the executeCode function from Core
    executeCode = (code: string) => {
      try {
        const context = new Proxy(mockSceneFile, {
          has: (target, key) => {
            return key in target
          },
          get: (target, key) => {
            return target[key]
          },
          set: (target, key, value) => {
            target[key] = value
            return true
          }
        })
        
        const func = new Function('context', `with(context) { ${code} }`)
        return func.call(null, context)
      } catch (error) {
        console.error('Error executing code:', error)
      }
    }
  })

  it('should assign variables correctly', () => {
    expect(mockSceneFile.hoge).toBe(2)
    executeCode('hoge = 1')
    expect(mockSceneFile.hoge).toBe(1)
  })

  it('should handle multiple assignments', () => {
    executeCode('hoge = 100')
    executeCode('fuga = 200')
    expect(mockSceneFile.hoge).toBe(100)
    expect(mockSceneFile.fuga).toBe(200)
  })

  it('should return values for conditions', () => {
    executeCode('hoge = 1')
    const result = executeCode('return hoge == 1')
    expect(result).toBe(true)
  })

  it('should work with variable expansion', () => {
    executeCode('hoge = 5')
    const value = executeCode('return hoge')
    expect(value).toBe(5)
  })

  it('should handle complex expressions', () => {
    executeCode('hoge = 10')
    const result = executeCode('return hoge > 5 && hoge < 15')
    expect(result).toBe(true)
  })

  it('should modify variables in if attribute scenarios', () => {
    // Simulate the if_test scenario
    expect(mockSceneFile.hoge).toBe(2)
    
    // First call: hoge = 1
    executeCode('hoge = 1')
    expect(mockSceneFile.hoge).toBe(1)
    
    // Check if condition
    const condition1 = executeCode('return hoge == 1')
    expect(condition1).toBe(true)
    
    const condition2 = executeCode('return hoge == 2')
    expect(condition2).toBe(false)
    
    // Second call: hoge = 2
    executeCode('hoge = 2')
    expect(mockSceneFile.hoge).toBe(2)
    
    // Check if conditions again
    const condition3 = executeCode('return hoge == 1')
    expect(condition3).toBe(false)
    
    const condition4 = executeCode('return hoge == 2')
    expect(condition4).toBe(true)
  })

  it('should not create local variables', () => {
    const initialHoge = mockSceneFile.hoge
    executeCode('hoge = 999')
    // The value should be changed in the sceneFile, not a local variable
    expect(mockSceneFile.hoge).toBe(999)
    expect(mockSceneFile.hoge).not.toBe(initialHoge)
  })

  it('should handle assignment with expressions', () => {
    executeCode('hoge = fuga + 5')
    expect(mockSceneFile.hoge).toBe(15)
  })

  it('should allow reading and writing the same variable', () => {
    executeCode('hoge = hoge + 1')
    expect(mockSceneFile.hoge).toBe(3)
    
    executeCode('hoge = hoge * 2')
    expect(mockSceneFile.hoge).toBe(6)
  })
})
