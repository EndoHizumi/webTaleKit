import StackTrace from 'stacktrace-js'

export async function outputLog(msg = 'None', level = 'log', option) {
  if (!['log', 'debug', 'warn', 'error'].includes(level)) {
    level = 'log'
  }
  StackTrace.get().then((stack) => {
    const caller = stack[1]
    const callerText = `${caller.functionName}:${caller.lineNumber}:${caller.columnNumber}`
    // prettier-ignore
    console[level](level.toUpperCase(), callerText, msg, option || '')
  })
}
