'use strict'

/**
 * Defines which node types can only appear as children of specific parent types.
 * key: child node type, value: array of allowed parent node types
 */
const ALLOWED_PARENTS = {
  item: ['choice'],
  action: ['actions'],
  then: ['if'],
  else: ['if'],
  prompt: ['dialog'],
  actions: ['dialog'],
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
