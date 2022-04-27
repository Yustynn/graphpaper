import { select } from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import { COLORS, LINK_COLORS, HEIGHT, WIDTH } from './constants'
import store from './store'


export default function setupSvg() {
    // Setup SVG and content container, with zoom/pan

    const svg = select('#svg-container').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewbox', `0 0 ${WIDTH} ${HEIGHT}`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

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

    // make legend
    mkLegend()

    // make container
    const content = svg.append('g')
        .attr('class', 'content')

    const zoom = d3Zoom.zoom().on("zoom", e => {
        content.attr("transform", e.transform);
    });
    store.zoom = zoom

    svg
        .call(zoom)
        .call(zoom.transform, d3Zoom.zoomIdentity)
    
    return { svg, content }
}

function mkLegend() {
    const R = 10
    const startX = 30
    const startY = 30

    select('svg')
        .append('g')
        .attr('id', 'legends')
        .selectAll('g')
        .data(Object.entries(LINK_COLORS))
        .join('g')
            .classed('legend', true)
            .each(function([kind, color], idx) {
                console.log(kind, color)
                const sel = select(this)
                const y = idx * 30 + 10
                sel.append('circle')
                    .attr('fill', color)
                    .attr('r', R)
                    .attr('cx', startX)
                    .attr('cy', startY + y)
                sel.append('text')
                    .text(kind)
                    .attr('fill', color)
                    .attr('x', startX + 20)
                    .attr('y', startY + y + R/2)
                    .attr('text-anchor', 'center')
            })
}

