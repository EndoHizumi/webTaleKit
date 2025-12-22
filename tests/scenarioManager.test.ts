/**
 * @jest-environment jsdom
 */
import { ScenarioManager } from '../src/core/scenarioManager'

describe('ScenarioManager', () => {
  let scenarioManager: ScenarioManager

  beforeEach(() => {
    scenarioManager = new ScenarioManager()
  })

  describe('setScenario with deep copy', () => {
    test('should create a deep copy of scenario array to prevent mutations', () => {
      // Create a test scenario
      const originalScenario = [
        { type: 'text', content: ['Hello'] },
        { type: 'choice', content: [] },
      ]

      // Set the scenario
      scenarioManager.setScenario(originalScenario, 'test-scene')

      // Get the scenario data
      const scenarioData = scenarioManager.getScenario()

      // Modify the scenario data (simulating what addScenario does)
      scenarioData.splice(1, 0, { type: 'say', content: ['Inserted'], sub: true })

      // Verify that the original scenario was not modified
      expect(originalScenario.length).toBe(2)
      expect(scenarioData.length).toBe(3)
    })

    test('should not affect original scenario when route reloads the scene', () => {
      // Simulate the bug scenario: choice -> insert scenario -> route -> choice again
      const originalScenario = [
        { type: 'say', content: ['Start'] },
        { type: 'choice', content: [] },
        { type: 'say', content: ['End'] },
      ]

      // First load
      scenarioManager.setScenario(originalScenario, 'test-scene')
      let scenario1 = scenarioManager.getScenario()
      
      // User makes a choice - addScenario inserts new scenarios
      scenario1.splice(2, 0, { type: 'say', content: ['Choice 1 result'], sub: true })
      expect(scenario1.length).toBe(4)

      // User uses route to reload the scene
      scenarioManager.setScenario(originalScenario, 'test-scene')
      let scenario2 = scenarioManager.getScenario()

      // The scenario should be reset to original length (3), not have the inserted scenario (4)
      expect(scenario2.length).toBe(3)
      expect(originalScenario.length).toBe(3)

      // User makes another choice - addScenario inserts new scenarios
      scenario2.splice(2, 0, { type: 'say', content: ['Choice 2 result'], sub: true })
      expect(scenario2.length).toBe(4)

      // Verify the second inserted scenario is different from the first
      const insertedScenario = scenario2[2] as any
      expect(insertedScenario.content[0]).toBe('Choice 2 result')
    })

    test('should preserve individual scenario object properties', () => {
      const originalScenario = [
        { type: 'text', content: ['Test'], someProperty: 'value' },
      ]

      scenarioManager.setScenario(originalScenario, 'test-scene')
      const scenarioData = scenarioManager.getScenario()

      // Verify properties are copied
      expect(scenarioData[0].type).toBe('text');
      const firstScenario = scenarioData[0] as any;
      expect(firstScenario.someProperty).toBe('value')

      // Modify the copy
      firstScenario.someProperty = 'modified'

      // Original should not be affected (shallow copy of object properties)
      // Note: This is a shallow copy, so nested objects would still be referenced
      const originalFirst = originalScenario[0] as any;
      expect(originalFirst.someProperty).toBe('value')
    })
  })

  describe('addScenario', () => {
    test('should add scenarios at current index', () => {
      const originalScenario = [
        { type: 'text', content: ['First'] },
        { type: 'text', content: ['Second'] },
      ]

      scenarioManager.setScenario(originalScenario, 'test-scene')
      
      // Move to index 1
      scenarioManager.setIndex(1)
      
      // Add new scenarios
      const newScenarios = [{ type: 'say', content: ['Inserted'] }]
      scenarioManager.addScenario(newScenarios, 0)

      const scenarioData = scenarioManager.getScenario()
      
      // Verify scenarios were added
      expect(scenarioData.length).toBe(3)
      expect((scenarioData[1] as any).sub).toBe(true)
    })
  })
})
