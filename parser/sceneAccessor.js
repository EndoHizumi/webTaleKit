'use strict'

/**
 * シーンの <script> の末尾に足す関数（#230）。
 * モジュールの外（エンジン）からは `export let` の変数に代入できないため、モジュールの中で代入する関数を置く。
 * エンジンは、タグ（<call>・if・{{…}}）で代入した変数をこの関数でモジュールへ戻す。
 * 名前の検査はエンジン側（識別子だけを渡す）。const への代入は TypeError になり、エンジンが受け止める。
 * 引数名を使わず arguments で受け取るのは、JS の圧縮で引数名が変わっても eval の中から参照できるようにするため。
 */
const SCENE_ASSIGN_NAME = '__wtkAssign'
const SCENE_ASSIGN_SOURCE = `function ${SCENE_ASSIGN_NAME}() { eval(arguments[0] + ' = arguments[1]') }`

module.exports = { SCENE_ASSIGN_NAME, SCENE_ASSIGN_SOURCE }
