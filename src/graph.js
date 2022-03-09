import { select } from 'd3-selection'
import * as d3Fetch from 'd3-fetch'
import * as d3Force from 'd3-force'
import {
    SVG_HEIGHT,
    SVG_WIDTH,
    LINK_COLORS,
    GRAPH_DATA_PATH,
    NODE_SIZE
} from './constants'

function setupNodes(content, data) {
    const nodes = content.append('g').attr('id', 'nodes')

    const node = nodes.selectAll('g')
        .data(data.nodes)
        .enter()
        .append('g')

    node.each(function (d) {
        // rectangle
        select(this)
            .append('rect')
            .attr('width', NODE_SIZE)
            .attr('height', NODE_SIZE)
            .attr('x', -NODE_SIZE/2)
            .style('fill', 'yellow')
            .style('stroke', 'black')
            .style('stroke-width', 2)

        // text
        select(this)
            .append('text')
            .text(d => d.text)
            .attr('dx', -NODE_SIZE/2)
            .attr('dy', NODE_SIZE/2)
    })

    return node

}

function setupLinks(content, data) {
    const links = content.append('g').attr('id', 'links')

    return links.selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .style('dominant-baseline', 'middle')
        .style('stroke', d => LINK_COLORS[d.kind])
        .style('stroke-width', 2)
        .attr('class', d => `link ${d.kind}`)
}

function makeTicked(node, link) {
    return () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        node.attr('transform', d => `translate(${d.x + 6},${d.y - 6})`)
    }
}


export default async function makeGraph(content) {
    const data = await d3Fetch.json(GRAPH_DATA_PATH);
    const node = setupNodes(content, data)
    const link = setupLinks(content, data)

    const sim = d3Force.forceSimulation(data.nodes)
        .force('link', d3Force.forceLink()
            .id(d => d.id)
            .links(data.links)
        )
        .force('charge', d3Force.forceManyBody().strength(-100))
        .force('center', d3Force.forceCenter(SVG_WIDTH / 2, SVG_HEIGHT / 2))
        .force('collision', d3Force.forceCollide(NODE_SIZE-1).iterations(3))
        .on('end', makeTicked(node, link))
        .tick(500)

    return sim
}

