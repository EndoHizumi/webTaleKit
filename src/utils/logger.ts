import StackTrace from 'stacktrace-js';

type LogLevel = 'log' | 'debug' | 'warn' | 'error';

export async function outputLog(msg: string = 'None', level: LogLevel = 'log', option?: any): Promise<void> {
  if (!['log', 'debug', 'warn', 'error'].includes(level)) {
    level = 'log';
  }
  
  try {
    const stack = await StackTrace.get();
    const caller = stack[1];
    const callerText = `${caller.functionName}:${caller.lineNumber}:${caller.columnNumber}`;
    // prettier-ignore
    console[level](level.toUpperCase(), callerText, msg, option || '');
  } catch (error) {
    console.error('Error getting stack trace:', error);
  }
}

/**
 * Log an error with stack trace
 * @param error - The error object to log
 * @param additionalInfo - Additional context information
 */
export async function logError(error: Error, additionalInfo?: string): Promise<void> {
  try {
    const stackframes = await StackTrace.fromError(error);
    const stackString = stackframes
      .map(sf => {
        const functionName = sf.functionName || '<anonymous>';
        const fileName = sf.fileName || '<unknown>';
        const lineNumber = sf.lineNumber || 0;
        const columnNumber = sf.columnNumber || 0;
        return `    at ${functionName} (${fileName}:${lineNumber}:${columnNumber})`;
      })
      .join('\n');
    
    const errorMessage = [
      'ERROR:',
      additionalInfo ? `Context: ${additionalInfo}` : '',
      `Message: ${error.message}`,
      'Stack trace:',
      stackString
    ].filter(line => line).join('\n');
    
    console.error(errorMessage);
  } catch (stackError) {
    // Fallback if stack trace generation fails
    console.error('ERROR:', additionalInfo || '', error.message, error.stack);
  }
}
