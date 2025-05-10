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
    
    // ミリ秒まで表示する日付フォーマット
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    const timestamp = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}]`;
    
    console[level]("%o %o: %o: %o %o", timestamp, level.toUpperCase(), callerText, msg, option || '');
  } catch (error) {
    console.error('Error getting stack trace:', error);
  }
}

