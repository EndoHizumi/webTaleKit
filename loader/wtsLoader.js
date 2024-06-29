const { getOptions } = require('loader-utils')
const { parse } = require('./parser.js')

module.exports = async (source) => {
  const options = getOptions(this)

  try {
    // パーサーを呼び出す。
    const { logic, scenario } = await parse(data)
    return `${logic};\nexport const scenario = ${JSON.stringify(scenario)}; `
  } catch (error) {
    this.emitError(error)
    return error
  }
}
