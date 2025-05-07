import StackTrace from 'stacktrace-js';

type LogLevel = 'log' | 'debug' | 'warn' | 'error';

export async function outputLog(msg: string = 'None', level: LogLevel = 'log', option?: any): Promise<void> {
  if (!['log', 'debug', 'warn', 'error'].includes(level)) {
    level = 'log';
  }

  try {
    const stack = await StackTrace.get();
    const caller = stack[stack.length - 1];
    const callerText = `${caller.functionName}:${caller.lineNumber}:${caller.columnNumber}`;
    // prettier-ignore
    console[level](level.toUpperCase(), callerText, msg, option || '');
  } catch (error) {
    console.error('Error getting stack trace:', error);
  }
}

