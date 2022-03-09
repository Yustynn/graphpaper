import makeGraph from './graph'
import setupSvg from './setup'


async function main() {
  const { content } = setupSvg()
  await makeGraph(content)
}

main()