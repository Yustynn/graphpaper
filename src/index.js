import { select } from 'd3-selection'
import { SVG_HEIGHT, SVG_WIDTH, COLORS } from './constants'
import makeGraph from './graph'


function setupSvg() {
  const svg = select('#svg-container').append('svg')
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT)

  // make background
  svg.append('rect')
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT)
    .attr('fill', COLORS[1])
    .attr('class', 'bg')

  // make container
  const content = svg.append('g')
    .attr('class', 'content')

  return { svg, content }
}

async function main() {
  const { content } = setupSvg()
  await makeGraph(content)
}

main()