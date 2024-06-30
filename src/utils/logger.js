export function outputLog(msg = 'None', level = 'log', option) {
  // prettier-ignore
  console[level](level.toUpperCase(),msg,option || undefined)
}

export function getOriginalPosition(line, column, sourceMap) {
  const consumer = new sourceMap.SourceMapConsumer(sourceMap)
  const position = consumer.originalPositionFor({ line, column })
  consumer.destroy()
  return position
}

export function hookMethods(module) {
  const originalMethods = {}

  for (const key in module) {
    if (typeof module[key] === 'function') {
      originalMethods[key] = module[key]

      module[key] = function (...args) {
        const callerInfo = getCallerInfo()
        console.log(
          `Called from ${callerInfo.method} at line ${callerInfo.line}`,
        )
        const result = originalMethods[key].apply(this, args)
        return result
      }
    }
  }
}
