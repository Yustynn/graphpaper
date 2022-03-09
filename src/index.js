import { select, selectAll } from 'd3-selection'
import * as d3fetch from 'd3-fetch'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'
import { COLORS } from './constants'

const [SVG_WIDTH, SVG_HEIGHT] = [1000, 700]

function setupSvg() {

  const svg = select('#svg-container').append('svg')
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT)

  // make background
  svg.append('rect')
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT)
    .attr('fill', COLORS[1])

  const nodes = svg.append('g').attr('id', 'nodes')
  const links = svg.append('g').attr('id', 'links')

  return { svg, nodes, links }

}

async function makeSim(nodes, links) {
  const data = await d3fetch.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_network.json");
  console.log(data)

  const link = links.selectAll('line')
    .data(data.links)
    .enter()
    .append('line')
      .style('stroke', 'white')

  const node = nodes.selectAll('g')
    .data(data.nodes)
    .enter()
    .append('g')
  node.each(function(d) {

    select(this)
      .append('circle')
      .attr('r', 20)
      .style('fill', 'yellow')

    select(this)
      .append('text')
      .text(d => d.id)
  })


  const sim = forceSimulation(data.nodes)
    .force('link', forceLink()
      .id(d => d.id)
      .links(data.links)
    )
    .force('charge', forceManyBody().strength(-400))
    .force('center', forceCenter(SVG_WIDTH / 2, SVG_HEIGHT / 2))
    .on('end', ticked)


  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    
    node.attr('transform', d => `translate(${d.x+6},${d.y-6})`)
  }
}



async function main() {
  const { svg, nodes, links } = setupSvg()
  await makeSim(nodes, links)

}

main()