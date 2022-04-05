import makeGraph from './graph'
import setupSvg from './setup'
import makePanel from './panel'
import mockData from './mockData'
import loadData from './loadData'
import processData from './processData'
import tidyTree from './tidyTree'

function removeNonCanonicalLinks(data) {
  const visited = new Set()
  function traverse(node) {
    if (visited.has(node.id)) return
    visited.add(node.id)

    node.children = node.children.filter(({ canonicalParent }) => node == canonicalParent)
    node.children.forEach(traverse)
  }

  traverse(data.nodes)
}


async function main() {
  const { svg, content } = setupSvg()
  const panel = makePanel(svg)
  // await makeGraph(content, panel)

  const raw = await loadData()
  // there's an error in the data where source and target are swapped. This is a temp fix.
  raw.links = raw.links.map(l => ({ ...l, source: l.target, target: l.source})) 
  console.log('raw', raw)

  const data = processData(raw)
  console.log('data', data)
  removeNonCanonicalLinks(data)

  tidyTree(content, data, panel)
}

main()