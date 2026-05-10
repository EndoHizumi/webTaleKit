import { logError, outputLog } from './logger'

export interface ValidationMessage {
  index: number
  type: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationMessage[]
  warnings: ValidationMessage[]
  sanitizedScenario: any[]
  sanitized: boolean
}

export interface ValidationOutput {
  errors: string[]
  warnings: string[]
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

function sanitizeValue(value: any): { value: any; changed: boolean } {
  if (typeof value === 'string') {
    if (!HTML_TAG_PATTERN.test(value)) {
      return { value, changed: false }
    }

    return { value: escapeHtml(value), changed: true }
  }

  if (Array.isArray(value)) {
    let changed = false
    const sanitizedArray = value.map((item) => {
      const sanitizedItem = sanitizeValue(item)
      if (sanitizedItem.changed) {
        changed = true
      }

      return sanitizedItem.value
    })

    return { value: sanitizedArray, changed }
  }

  if (!value || typeof value !== 'object') {
    return { value, changed: false }
  }

  let changed = false
  const sanitizedObject: Record<string, any> = {}

  for (const key of Object.keys(value)) {
    const sanitizedEntry = sanitizeValue(value[key])
    sanitizedObject[key] = sanitizedEntry.value
    if (sanitizedEntry.changed) {
      changed = true
    }
  }

  return { value: sanitizedObject, changed }
}

export function sanitizeScenarioObjects(scenarioObjects: any[]): { sanitizedScenario: any[]; sanitized: boolean } {
  const sanitizedResult = sanitizeValue(scenarioObjects)
  return {
    sanitizedScenario: Array.isArray(sanitizedResult.value) ? sanitizedResult.value : [],
    sanitized: sanitizedResult.changed,
  }
}

function formatIndexedMessage(message: ValidationMessage): string {
  const indexText = message.index >= 0 ? `[index:${message.index}] ` : ''
  const typeText = message.type ? `<${message.type}> ` : ''
  return `${indexText}${typeText}${message.message}`.trim()
}

export function formatValidationOutput(result: ValidationResult): ValidationOutput {
  const warnings = result.warnings.map(formatIndexedMessage)
  const errors = result.errors.map(formatIndexedMessage)

  if (result.sanitized) {
    warnings.push('Scenario content contained HTML-like text and was sanitized.')
  }

  return { errors, warnings }
}

export function createScenarioValidationError(
  result: ValidationResult,
  context: string = 'Scenario validation failed',
): Error | null {
  if (result.errors.length === 0) {
    return null
  }

  const formatted = formatValidationOutput(result)
  const details = formatted.errors.join('\n')
  return new Error(`${context}\n${details}`)
}

export function assertScenarioValidation(
  result: ValidationResult,
  context: string = 'Scenario validation failed',
): void {
  const error = createScenarioValidationError(result, context)
  if (error) {
    throw error
  }
}

export async function reportScenarioValidation(
  result: ValidationResult,
  context: string = 'Scenario validation',
): Promise<void> {
  const formatted = formatValidationOutput(result)

  for (const warning of formatted.warnings) {
    await outputLog(`${context}: ${warning}`, 'warn')
  }

  const error = createScenarioValidationError(result, context)
  if (error) {
    await logError(error, context)
  }
}

export function validateScenarioObjects(
  scenarioObjects: any[],
  commandList: Record<string, Function>,
): ValidationResult {
  const errors: ValidationMessage[] = []
  const warnings: ValidationMessage[] = []
  const { sanitizedScenario, sanitized } = sanitizeScenarioObjects(scenarioObjects)

  if (!Array.isArray(scenarioObjects) || scenarioObjects.length === 0) {
    errors.push({ index: -1, type: '', message: 'シナリオ配列が空です' })
    return { valid: false, errors, warnings, sanitizedScenario, sanitized }
  }

  for (let i = 0; i < sanitizedScenario.length; i++) {
    const obj = sanitizedScenario[i]
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
      if (jumpIndex < 0 || jumpIndex >= sanitizedScenario.length) {
        warnings.push({
          index: i,
          type,
          message: `jump の index (${obj.index}) がシナリオ範囲外です`,
        })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedScenario,
    sanitized,
  }
}
