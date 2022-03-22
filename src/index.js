import makeGraph from './graph'
import setupSvg from './setup'
import makePanel from './panel'
import mockData from './mockData'
import processData from './processData'
import dendrogram from './dendrogram'


async function main() {
  const { svg, content } = setupSvg()
  // const panel = makePanel(svg)
  // await makeGraph(content, panel)
  const raw = mockData({ pRandomLink: 0.0 })
  const processed = processData(raw)
  dendrogram(content, processed)

  console.log(processed)
}

main()