import { select } from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import { COLORS, HEIGHT, WIDTH } from './constants'


export default function setupSvg() {
    // Setup SVG and content container, with zoom/pan

    const svg = select('#svg-container').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewbox', `0 0 ${WIDTH} ${HEIGHT}`)

    svg.append('defs')
        .html(`  <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        `)

    // make background
    svg.append('rect')
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