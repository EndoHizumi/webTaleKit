import { HTMLToJSON } from 'html-to-json-parser'
import { minify, MinifyOptions } from 'html-minifier'
import { HtmlParser, ParsedElement } from './parser'

const minifyOptions: MinifyOptions = {
  removeTagWhitespace: true,
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
}

/**
 * Node.js 向け HTMLParserAdapter（minify + HTMLToJSON）。
 * CLI（wtc）とAPIサーバーの両方から使用する。
 */
export const nodeHtmlParser: HtmlParser = async (data) => {
  const html = minify(data, minifyOptions)
  return (await HTMLToJSON(html)) as ParsedElement
}
