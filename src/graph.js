import { select } from 'd3-selection'
import * as d3Fetch from 'd3-fetch'
import * as d3Force from 'd3-force'
import { transition, easeLinear } from 'd3'
import { textwrap } from 'd3-textwrap'
import katex from 'katex'

import {
    GRAPH_DATA_PATH,
    LINK_COLORS,
    LINK_THICKNESS,
    NODE_COLORS,
    NODE_PADDING,
    NODE_SIZE,
    HEIGHT,
    WIDTH,
} from './constants'

function setupNodes(content, data, link, panel) {
    const nodes = content.append('g').attr('id', 'nodes')

    const node = nodes.selectAll('g')
        .data(data.nodes)
        .enter()
        .append('g')
    
    node
        .on('click', function(_, {id}) {
            const selectedNodes = new Set()
            selectedNodes.add(id)
            data.links
                .filter(l => l.source.id == id || l.target.id == id)
                .forEach(l => {
                    selectedNodes.add(l.source.id)
                    selectedNodes.add(l.target.id)
                })

            const t = transition()
                .duration(200)
                .ease(easeLinear)
            

            node.transition(t)
                .style('opacity', d => selectedNodes.has(d.id) ? 1 : 0 )

            link.transition(t)
                .style('opacity', l => l.source.id == id || l.target.id == id ? 1 : 0 )

            select(this).select('rect')
                .style('fill', 'orange')

            panel
                .transition()
                .style('transform', `translate(${window.innerWidth/2}px,0)`)
        })

    node.each(function (d) {
        // rectangle
        select(this)
            .append('rect')
                .attr('width', NODE_SIZE)
                .attr('height', NODE_SIZE)
                .attr('x', -NODE_SIZE/2)
                .attr('rx', 10)
                .style('fill', d => d.id == 0 ? NODE_COLORS.root : NODE_COLORS.default)
                .style('stroke', 'black')
                .style('stroke-width', 2)

        // text
        const foreignObject = select(this).append('foreignObject')
            .attr('height', NODE_SIZE - 2*NODE_PADDING)
            .attr('width', NODE_SIZE - 2*NODE_PADDING)
            .attr('x', -NODE_SIZE/2 + NODE_PADDING)
            .attr('y', NODE_PADDING)

        const span = foreignObject.append("xhtml:span")
            .text(d.text)

        // katex.render(d.text, span.node());
        // const text = select(this)
        //     .append('text')
        //     .text(d => d.text)
        //     .style('dominant-baseline', 'middle')
        //     .call(textwrap()
        //         .bounds({height: NODE_SIZE, width: NODE_SIZE})
        //         .method('tspans')
        //     )
        //     .attr('dx', -NODE_SIZE/2)




        // node id text for debugging
        select(this)
            .append('text')
            .style('dominant-baseline', 'middle')
            .text(d => 'ID: ' + d.id)
            .attr('dx', -NODE_SIZE/2+NODE_PADDING)
            .attr('dy', NODE_SIZE-20)

    })

    return node

}

function setupLinks(content, data) {
    const links = content.append('g').attr('id', 'links')

    return links.selectAll('line')
        .data(data.links)
        .enter()
            .append('line')
            .style('stroke', d => LINK_COLORS[d.kind])
            .style('stroke-width', LINK_THICKNESS)
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

async function loadData() {
    const data = await d3Fetch.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.text = n.text.replaceAll(/%(.+?)\|/g, '').replaceAll('%', '')
        return n
    })

    document.data = data // for debugging

    return data
}


export default async function makeGraph(content, panel) {
    const data = await loadData()
    const link = setupLinks(content, data)
    const node = setupNodes(content, data, link, panel)

    const sim = d3Force.forceSimulation(data.nodes)
        .force('link', d3Force.forceLink()
            .id(d => d.id)
            .links(data.links)
        )
        .force('charge', d3Force.forceManyBody().strength(-500))
        .force('center', d3Force.forceCenter(WIDTH / 2, HEIGHT / 2))
        .force('collision', d3Force.forceCollide(NODE_SIZE-1).iterations(3))
        .on('end', makeTicked(node, link))
        .tick(500)

    return sim
}

