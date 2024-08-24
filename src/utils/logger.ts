import StackTrace from 'stacktrace-js';

type LogLevel = 'log' | 'debug' | 'warn' | 'error';

export async function outputLog(msg: any = 'None', level: LogLevel = 'log', option?: any): Promise<void> {
  if (!['log', 'debug', 'warn', 'error'].includes(level)) {
    level = 'log';
  }
  StackTrace.get().then((stack) => {
    const caller = stack[1];
    const callerText = `${caller.functionName}:${caller.lineNumber}:${caller.columnNumber}`;
    console[level](level.toUpperCase(), callerText, msg, option || '');
  });
}