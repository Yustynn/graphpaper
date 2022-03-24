import makeGraph from './graph'
import setupSvg from './setup'
import makePanel from './panel'
import mockData from './mockData'
import processData from './processData'
import dendrogram from './dendrogram'
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
  // const panel = makePanel(svg)
  // await makeGraph(content, panel)
  const raw = mockData({
    pRandomLink: 0.2,
    minNumNodes: 30,
    maxNumNodes: 50,
  })
  const data = processData(raw)
  removeNonCanonicalLinks(data)

  console.log(data)
  // dendrogram(content, data.nodes)
  tidyTree(content, data)
}

main()