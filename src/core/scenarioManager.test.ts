import { ScenarioManager } from './scenarioManager';

describe('ScenarioManager', () => {
  let scenarioManager: ScenarioManager;

  beforeEach(() => {
    scenarioManager = new ScenarioManager();
  });

  describe('Save/Load with dynamically added scenarios', () => {
    it('should track dynamically added scenarios', () => {
      // Set initial scenario
      const initialScenario = [
        { type: 'text', text: 'Line 1' },
        { type: 'text', text: 'Line 2' },
        { type: 'text', text: 'Line 3' },
      ];
      
      scenarioManager.setScenario(initialScenario, 'test-scene');
      expect(scenarioManager.getOriginalScenarioLength()).toBe(3);
      expect(scenarioManager.getAddedScenarios()).toEqual([]);

      // Move to line 1
      scenarioManager.next();
      
      // Add scenarios dynamically at current position
      const addedScenario = [
        { type: 'text', text: 'Added Line 1' },
        { type: 'text', text: 'Added Line 2' },
      ];
      
      scenarioManager.addScenario(addedScenario, 0);
      
      // Check that added scenarios are tracked
      const tracked = scenarioManager.getAddedScenarios();
      expect(tracked.length).toBe(1);
      expect(tracked[0].index).toBe(1);
      expect(tracked[0].scenarios.length).toBe(2);
      expect(tracked[0].scenarios[0].sub).toBe(true);
    });

    it('should restore dynamically added scenarios in correct order', () => {
      // Set initial scenario
      const initialScenario = [
        { type: 'text', text: 'Line 1' },
        { type: 'text', text: 'Line 2' },
        { type: 'text', text: 'Line 3' },
        { type: 'text', text: 'Line 4' },
      ];
      
      scenarioManager.setScenario(initialScenario, 'test-scene');
      
      // Simulate adding scenarios at different positions
      // These indices represent where they were inserted in the MODIFIED scenario
      // So if we insert at 1, then at 4 (after the first insertion), the actual positions are:
      // When restoring in descending order (4, then 1):
      // [Line 1, Line 2, Line 3, Line 4, Added at 4-1]  (insert at 4)
      // [Line 1, Added at 1-1, Added at 1-2, Line 2, Line 3, Line 4, Added at 4-1]  (insert at 1)
      const addedScenarios = [
        {
          index: 1,
          scenarios: [
            { type: 'text', text: 'Added at 1-1', sub: true },
            { type: 'text', text: 'Added at 1-2', sub: true },
          ]
        },
        {
          index: 4, // This is the position AFTER the first insertion
          scenarios: [
            { type: 'text', text: 'Added at 4-1', sub: true },
          ]
        }
      ];
      
      // Restore the added scenarios
      scenarioManager.restoreAddedScenarios(addedScenarios);
      
      // Check the scenario structure
      const scenario = scenarioManager.getScenario();
      expect(scenario.length).toBe(7); // 4 original + 3 added
      
      // Verify order - note that descending insertion causes Added at 4-1 to be at the end
      expect(scenario[0].text).toBe('Line 1');
      expect(scenario[1].text).toBe('Added at 1-1');
      expect(scenario[2].text).toBe('Added at 1-2');
      expect(scenario[3].text).toBe('Line 2');
      expect(scenario[4].text).toBe('Line 3');
      expect(scenario[5].text).toBe('Line 4');
      expect(scenario[6].text).toBe('Added at 4-1');
    });

    it('should preserve added scenarios tracking through get/set', () => {
      const initialScenario = [
        { type: 'text', text: 'Line 1' },
        { type: 'text', text: 'Line 2' },
      ];
      
      scenarioManager.setScenario(initialScenario, 'test-scene');
      scenarioManager.next();
      
      const addedScenario = [{ type: 'text', text: 'Added Line' }];
      scenarioManager.addScenario(addedScenario, 0);
      
      // Get the tracked additions
      const tracked = scenarioManager.getAddedScenarios();
      
      // Create new scenario manager and restore
      const newScenarioManager = new ScenarioManager();
      newScenarioManager.setScenario(initialScenario, 'test-scene');
      newScenarioManager.setAddedScenarios(tracked);
      newScenarioManager.restoreAddedScenarios(tracked);
      
      // Verify scenarios are the same
      const originalScenario = scenarioManager.getScenario();
      const restoredScenario = newScenarioManager.getScenario();
      
      expect(restoredScenario.length).toBe(originalScenario.length);
      expect(restoredScenario[1].text).toBe('Added Line');
    });

    it('should handle multiple sequential additions', () => {
      const initialScenario = [
        { type: 'text', text: 'Line 1' },
        { type: 'text', text: 'Line 2' },
      ];
      
      scenarioManager.setScenario(initialScenario, 'test-scene');
      
      // Add first set at index 1
      scenarioManager.addScenario([{ type: 'text', text: 'Add 1' }], 1);
      
      // Add second set at index 2 (after first addition)
      scenarioManager.addScenario([{ type: 'text', text: 'Add 2' }], 2);
      
      // Check tracking
      const tracked = scenarioManager.getAddedScenarios();
      expect(tracked.length).toBe(2);
      expect(tracked[0].index).toBe(1);
      expect(tracked[1].index).toBe(2);
      
      // Verify final scenario
      const scenario = scenarioManager.getScenario();
      expect(scenario.length).toBe(4);
      expect(scenario[1].text).toBe('Add 1');
      expect(scenario[2].text).toBe('Add 2');
    });

    it('should reset added scenarios when setting new scenario', () => {
      const initialScenario = [
        { type: 'text', text: 'Line 1' },
      ];
      
      scenarioManager.setScenario(initialScenario, 'test-scene');
      scenarioManager.addScenario([{ type: 'text', text: 'Added' }], 0);
      
      expect(scenarioManager.getAddedScenarios().length).toBe(1);
      
      // Set new scenario
      const newScenario = [{ type: 'text', text: 'New Line 1' }];
      scenarioManager.setScenario(newScenario, 'new-scene');
      
      // Added scenarios should be reset
      expect(scenarioManager.getAddedScenarios().length).toBe(0);
      expect(scenarioManager.getOriginalScenarioLength()).toBe(1);
    });
  });
});
