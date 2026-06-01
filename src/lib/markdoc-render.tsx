import React from 'react'
import Markdoc, { type Node } from '@markdoc/markdoc'
import { fields } from '@keystatic/core'
import { blogBlocks } from './blog-blocks'
import { blockComponents } from './blog-renderers'

const markdocConfig = fields.markdoc.createMarkdocConfig({
  components: blogBlocks,
})

export function renderMarkdoc(node: Node): React.ReactNode {
  const renderableTree = Markdoc.transform(node, markdocConfig)
  return Markdoc.renderers.react(renderableTree, React, { components: blockComponents })
}