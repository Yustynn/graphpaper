import makeGraph from './graph'
import setupSvg from './setup'
import makePanel from './panel'


async function main() {
  const { svg, content } = setupSvg()
  const panel = makePanel(svg)
  await makeGraph(content, panel)
}

main()