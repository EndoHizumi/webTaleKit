import { logError, outputLog } from '../src/utils/logger';

describe('Logger', () => {
  // Mock console methods
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('logError', () => {
    it('should log error with stack trace', async () => {
      const error = new Error('Test error message');
      
      await logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR:');
      expect(loggedMessage).toContain('Test error message');
      expect(loggedMessage).toContain('Stack trace:');
    });

    it('should log error with additional context', async () => {
      const error = new Error('Test error');
      const context = 'Error in test function';
      
      await logError(error, context);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Context: Error in test function');
      expect(loggedMessage).toContain('Test error');
    });

    it('should handle errors when stack trace generation fails', async () => {
      const error = new Error('Test error');
      error.stack = 'mock stack trace';
      
      // This should still work even if StackTrace.fromError fails
      await logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('outputLog', () => {
    it('should output log with stack trace', async () => {
      await outputLog('Test message', 'log');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedArgs = consoleLogSpy.mock.calls[0];
      expect(loggedArgs[0]).toBe('LOG');
      expect(loggedArgs[2]).toBe('Test message');
    });

    it('should handle error level', async () => {
      await outputLog('Error message', 'error');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should default to log level if invalid level provided', async () => {
      await outputLog('Test message', 'invalid' as any);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
