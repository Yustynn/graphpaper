import { select } from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import { SVG_HEIGHT, SVG_WIDTH, COLORS } from './constants'


export default function setupSvg() {
  // Setup SVG and content container, with zoom/pan

  const svg = select('#svg-container').append('svg')
    // .attr('width', SVG_WIDTH)
    // .attr('height', SVG_HEIGHT)
    .attr('width', '100%')
    .attr('height', '100%')

  // make background
  svg.append('rect')
    // .attr('width', SVG_WIDTH)
    // .attr('height', SVG_HEIGHT)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', COLORS[1])
    .attr('class', 'bg')

  // make container
  const content = svg.append('g')
    .attr('class', 'content')

    const zoom = d3Zoom.zoom().on("zoom", e => {
      content.attr("transform", e.transform);
    });
    
    svg
      .call(zoom)
      .call(zoom.transform, d3Zoom.zoomIdentity)

  return { svg, content }
}