'use strict'

/**
 * All top-level command types (from Core.commandList in core/index.js).
 * HTTP sub-tags can appear as children of any of these commands.
 */
const TOP_LEVEL_COMMANDS = [
  'text', 'choice', 'show', 'newpage', 'hide', 'jump', 'sound', 'say',
  'if', 'call', 'moveto', 'route', 'wait', 'dialog', 'save', 'load',
]

/**
 * Defines which node types can only appear as children of specific parent types.
 * key: child node type, value: array of allowed parent node types
 */
const ALLOWED_PARENTS = {
  // choice structure
  item: ['choice'],
  // dialog structure
  prompt: ['dialog'],
  actions: ['dialog'],
  action: ['actions'],
  // if structure
  else: ['if'],
  // then is used both in <if> and as an HTTP response child of any top-level command
  then: ['if', ...TOP_LEVEL_COMMANDS],
  // inline text decoration tags (from drawer.ts createDecoratedElement and textHandler)
  color: ['text', 'say'],
  ruby: ['text', 'say'],
  b: ['text', 'say'],
  i: ['text', 'say'],
  br: ['text', 'say'],
  // HTTP sub-tags (from httpHandler) — valid inside any top-level command
  header: TOP_LEVEL_COMMANDS,
  data: TOP_LEVEL_COMMANDS,
  error: TOP_LEVEL_COMMANDS,
  progress: TOP_LEVEL_COMMANDS,
}

/**
 * Build a human-readable error message for an invalid parent-child relationship.
 * @param {string} nodeType - The type of the misplaced node
 * @param {string|null} parentType - The actual parent type, or null for root
 * @param {string[]} allowedParents - The allowed parent types
 * @returns {string}
 */
const buildInvalidParentMessage = (nodeType, parentType, allowedParents) => {
  const allowed = allowedParents.map((p) => `<${p}>`).join(' or ')
  const actual = parentType ? `<${parentType}>` : 'scenario root'
  return `<${nodeType}> must be inside ${allowed}, but found inside ${actual}`
}

/**
 * Recursively check nodes for parent-child relationship violations.
 * @param {Array} nodes - Array of parsed scenario nodes
 * @param {string|null} parentType - The type of the parent node, or null for root
 * @param {Array} errors - Array to accumulate error objects
 */
const checkNodes = (nodes, parentType, errors) => {
  if (!Array.isArray(nodes)) return
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue
    const nodeType = node.type
    if (!nodeType) continue

    const allowedParents = ALLOWED_PARENTS[nodeType]
    if (allowedParents && !allowedParents.includes(parentType)) {
      errors.push({
        type: 'invalid_parent',
        node: nodeType,
        parent: parentType,
        message: buildInvalidParentMessage(nodeType, parentType, allowedParents),
      })
    }

    if (Array.isArray(node.content)) {
      checkNodes(node.content, nodeType, errors)
    }
  }
}

/**
 * Check the parsed scenario array for syntax errors.
 * @param {Array} scenario - The parsed and flattened scenario array
 * @returns {Array} Array of error objects (empty if valid)
 */
const check = (scenario) => {
  const errors = []
  checkNodes(scenario, null, errors)
  return errors
}

module.exports = { check, ALLOWED_PARENTS }
