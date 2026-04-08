export interface ValidationMessage {
  index: number
  type: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationMessage[]
  warnings: ValidationMessage[]
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch])
}

const HTML_TAG_PATTERN = /<[^>]*>|<[^>]*$/

function sanitizeStrings(obj: any): void {
  if (!obj || typeof obj !== 'object') return
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (typeof value === 'string' && HTML_TAG_PATTERN.test(value)) {
      obj[key] = escapeHtml(value)
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string' && HTML_TAG_PATTERN.test(value[i])) {
          value[i] = escapeHtml(value[i])
        } else if (typeof value[i] === 'object') {
          sanitizeStrings(value[i])
        }
      }
    } else if (typeof value === 'object') {
      sanitizeStrings(value)
    }
  }
}

export function validateScenarioObjects(
  scenarioObjects: any[],
  commandList: Record<string, Function>,
): ValidationResult {
  const errors: ValidationMessage[] = []
  const warnings: ValidationMessage[] = []

  if (!Array.isArray(scenarioObjects) || scenarioObjects.length === 0) {
    errors.push({ index: -1, type: '', message: 'シナリオ配列が空です' })
    return { valid: false, errors, warnings }
  }

  for (let i = 0; i < scenarioObjects.length; i++) {
    const obj = scenarioObjects[i]
    const type: string = obj.type ?? 'text'

    if (!(type in commandList)) {
      errors.push({ index: i, type, message: `未知のコマンドタイプ "${type}" が指定されています` })
      continue
    }

    if (type === 'say' && !obj.name) {
      warnings.push({ index: i, type, message: 'say コマンドに name 属性がありません' })
    }

    if ((type === 'text' || type === 'say') && (!obj.content || obj.content.length === 0)) {
      warnings.push({ index: i, type, message: `${type} コマンドの content が空です` })
    }

    if (type === 'show' && obj.src) {
      // Resource existence check is deferred to runtime; warn only if src is clearly empty
      if (!obj.src.trim()) {
        warnings.push({ index: i, type, message: 'show コマンドの src が空です' })
      }
    }

    if (type === 'choice') {
      const items = Array.isArray(obj.content)
        ? obj.content.filter((c: any) => c.type === 'item')
        : []
      if (items.length === 0) {
        errors.push({ index: i, type, message: 'choice コマンドに item が含まれていません' })
      }
    }

    if (type === 'jump' && obj.index !== undefined) {
      const jumpIndex = Number(obj.index)
      if (jumpIndex < 0 || jumpIndex >= scenarioObjects.length) {
        warnings.push({
          index: i,
          type,
          message: `jump の index (${obj.index}) がシナリオ範囲外です`,
        })
      }
    }

    // Sanitize HTML tags in any string properties
    sanitizeStrings(obj)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
