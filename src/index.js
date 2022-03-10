import makeGraph from './graph'
import setupSvg from './setup'
import makePanel from './panel'
import katex from 'katex'


function mathTest(svg) {

  const foreignObject = svg.append('foreignObject')
    .attr('height', 100)
    .attr('width', 100)
    .attr('x', 10)
    .attr('y', 10)
  const span = foreignObject.append("xhtml:span")
  katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, span.node())

  // katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, span.node(), {
  //   delimiters: [
  //         {left: "$", right: "$", display: true},
  //   ]
  // });

}


async function main() {
  const { svg, content } = setupSvg()
  const panel = makePanel(svg)
  await makeGraph(content, panel)
  mathTest(svg)
}

main()