export function outputLog(msg = '', level = 'log', option) {
  const error = new Error()
  const stack = error.stack?.split('\n') || []
  // スタックトレースの3番目の要素が呼び出し元の情報
  const callerInfo = stack[2].trim()
  console.log(callerInfo)
  // 呼び出し元の情報から行数とメソッド名を抽出
  const matched = callerInfo.match(/at (.+) \((.+)\)/)
  console[level](
    level.toUpperCase(),
    msg,
    matched?.callerMethod,
    option || undefined,
    matched?.callerLine,
  )
}

export function getOriginalPosition(line, column, sourceMap) {
  const consumer = new sourceMap.SourceMapConsumer(sourceMap)
  const position = consumer.originalPositionFor({ line, column })
  consumer.destroy()
  return position
}

// export function hookMethods(module) {
//   const originalMethods = {};

//   for (const key in module) {
//     if (typeof module[key] === 'function') {
//       originalMethods[key] = module[key];

//       module[key] = function(...args) {
//         const callerInfo = getCallerInfo();
//         console.log(`Called from ${callerInfo.method} at line ${callerInfo.line}`);
//         const result = originalMethods[key].apply(this, args);
//         return result;
//       };
//     }
//   }
// }
