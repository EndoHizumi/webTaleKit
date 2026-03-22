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
 * Attributes valid on every node regardless of type.
 * - type: the tag type itself
 * - content: child node array
 * - if: conditional execution (runScenario in core/index.js)
 * - get/post/put/delete: HTTP method attributes (httpHandler in core/index.js)
 */
const GLOBAL_ATTRIBUTES = new Set(['type', 'content', 'if', 'get', 'post', 'put', 'delete'])

/**
 * Per-node-type set of known attributes (beyond GLOBAL_ATTRIBUTES).
 * Attributes not in this set for their node type will generate an unknown_attribute warning.
 * If a node type is absent from this map, attribute checking is skipped for that node
 * (covers free-form child elements such as <header> or <data> children).
 */
const KNOWN_ATTRIBUTES = {
  // Top-level commands (sourced from handler implementations in core/index.js)
  text:     new Set(['name', 'speed', 'time']),
  say:      new Set(['name', 'speed', 'voice']),
  choice:   new Set(['prompt', 'position']),
  show:     new Set(['src', 'name', 'mode', 'x', 'y', 'width', 'height', 'pos', 'look', 'entry', 'sepia', 'mono', 'blur', 'opacity', 'transition', 'duration']),
  hide:     new Set(['name', 'mode', 'transition', 'duration']),
  moveto:   new Set(['name', 'x', 'y', 'duration']),
  sound:    new Set(['src', 'name', 'mode', 'play', 'loop', 'stop', 'pause']),
  jump:     new Set(['index', 'sub']),
  if:       new Set(['condition']),
  call:     new Set(['method']),
  route:    new Set(['to']),
  wait:     new Set(['wait', 'time']),
  newpage:  new Set([]),
  dialog:   new Set(['name', 'template']),
  save:     new Set(['slot', 'name', 'message']),
  load:     new Set(['slot', 'message']),
  // Sub-nodes
  item:     new Set(['label', 'id', 'default', 'hover', 'select', 'color', 'position']),
  action:   new Set(['id', 'label', 'value']),
  then:     new Set([]),
  else:     new Set([]),
  prompt:   new Set([]),
  actions:  new Set([]),
  // Inline text decoration (from drawer.ts createDecoratedElement)
  color:    new Set(['value']),
  ruby:     new Set(['text']),
  b:        new Set([]),
  i:        new Set([]),
  br:       new Set([]),
  // HTTP sub-tags (children of header/data use free-form type names as keys — not checked)
  header:   new Set([]),
  data:     new Set([]),
  error:    new Set([]),
  progress: new Set([]),
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
 * Build a human-readable warning message for an unknown (ignored) attribute.
 * @param {string} nodeType
 * @param {string} attrName
 * @returns {string}
 */
const buildUnknownAttributeMessage = (nodeType, attrName) => {
  return `<${nodeType}> has unknown attribute "${attrName}" which will be ignored`
}

/**
 * Check a single node for attributes not recognised by the engine.
 * Emits an unknown_attribute warning for each such attribute.
 * @param {Object} node
 * @param {Array} results - Array to accumulate result objects
 */
const checkAttributes = (node, results) => {
  const nodeType = node.type
  if (!nodeType) return
  const knownForType = KNOWN_ATTRIBUTES[nodeType]
  if (knownForType === undefined) return // Unknown node type — skip
  for (const key of Object.keys(node)) {
    if (GLOBAL_ATTRIBUTES.has(key)) continue
    if (knownForType.has(key)) continue
    results.push({
      type: 'unknown_attribute',
      node: nodeType,
      attribute: key,
      message: buildUnknownAttributeMessage(nodeType, key),
    })
  }
}

/**
 * Recursively check nodes for parent-child relationship violations and unknown attributes.
 * @param {Array} nodes - Array of parsed scenario nodes
 * @param {string|null} parentType - The type of the parent node, or null for root
 * @param {Array} results - Array to accumulate result objects
 */
const checkNodes = (nodes, parentType, results) => {
  if (!Array.isArray(nodes)) return
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue
    const nodeType = node.type
    if (!nodeType) continue

    const allowedParents = ALLOWED_PARENTS[nodeType]
    if (allowedParents && !allowedParents.includes(parentType)) {
      results.push({
        type: 'invalid_parent',
        node: nodeType,
        parent: parentType,
        message: buildInvalidParentMessage(nodeType, parentType, allowedParents),
      })
    }

    checkAttributes(node, results)

    if (Array.isArray(node.content)) {
      checkNodes(node.content, nodeType, results)
    }
  }
}

/**
 * Check the parsed scenario array for syntax errors and attribute warnings.
 * Returns an array of result objects:
 *   - type 'invalid_parent': structural error (invalid parent-child relationship)
 *   - type 'unknown_attribute': warning (attribute not read by the engine)
 * @param {Array} scenario - The parsed and flattened scenario array
 * @returns {Array}
 */
const check = (scenario) => {
  const results = []
  checkNodes(scenario, null, results)
  return results
}

module.exports = { check, ALLOWED_PARENTS, KNOWN_ATTRIBUTES, GLOBAL_ATTRIBUTES }
