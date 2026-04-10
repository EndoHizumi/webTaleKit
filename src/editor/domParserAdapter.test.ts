/// <reference types="jest" />

import { DOMParser } from '@xmldom/xmldom'
import { HTMLToJSON } from 'html-to-json-parser'

import { domParserAdapter } from './domParserAdapter.js'

const { minify } = require('html-minifier') as {
  minify: (html: string, options: typeof minifyOptions) => string
}

const minifyOptions = {
  removeTagWhitespace: true,
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
}

const fixtures = [
  {
    name: 'scene root with mixed text and script content',
    html: `
      <scene>
        <scenario>
          <text>Hello <b>world</b></text>
          <choice prompt="start?">
            <item label="yes"><jump index="1"/></item>
          </choice>
        </scenario>
        <script type="text/typescript">
          export const sceneConfig = { name: 'title' }
        </script>
      </scene>
    `,
  },
  {
    name: 'self closing tags and nested attributes',
    html: `
      <scene>
        <scenario>
          <!-- removed by minify -->
          <show mode="bg" src="./bg/title.png" />
          <say name="Narrator">line <color value="red">red</color><br/></say>
          <choice prompt="go">
            <item label="A" default="./a.png" hover="./a_hover.png">
              <jump index="2" />
            </item>
          </choice>
        </scenario>
        <script>export const flag = true</script>
      </scene>
    `,
  },
]

describe('domParserAdapter', () => {
  const globalAny = globalThis as any
  const originalDOMParser = globalAny.DOMParser
  const originalNode = globalAny.Node
  let warnSpy: jest.SpyInstance

  beforeAll(() => {
    globalAny.DOMParser = DOMParser
    globalAny.Node = {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
    }
  })

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  afterAll(() => {
    if (originalDOMParser) {
      globalAny.DOMParser = originalDOMParser
    } else {
      delete globalAny.DOMParser
    }

    if (originalNode) {
      globalAny.Node = originalNode
    } else {
      delete globalAny.Node
    }
  })

  test.each(fixtures)('$name', async ({ html }: { html: string }) => {
    const expected = await HTMLToJSON(minify(html, minifyOptions))

    await expect(domParserAdapter(html)).resolves.toEqual(expected)
  })
})