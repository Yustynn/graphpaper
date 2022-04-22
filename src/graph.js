import { select } from 'd3-selection'
import * as d3Force from 'd3-force'
import { transition, easeLinear } from 'd3'
import store from './store'
import loadData from './loadData'

import {
    CHUNK_LATEX,
    CHUNK_TEXT,

    LINK_COLORS,
    LINK_THICKNESS,

    NODE_COLORS,
    NODE_PADDING,
    NODE_WIDTH,
    NODE_HEIGHT,

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
        .on('click', function(_, n) {
            const { id } = n
            store.selectedNode = n

            store.visibleNodes.clear()
            store.visibleNodes.add(id)
            data.links
                .filter(l => l.source.id == id || l.target.id == id)
                .forEach(l => {
                    store.visibleNodes.add(l.source.id)
                    store.visibleNodes.add(l.target.id)
                })

            const t = transition()
                .duration(100)
                .ease(easeLinear)
            

            node.transition(t)
                .style('opacity', d => store.visibleNodes.has(d.id) ? 1 : 0 )

            link.transition(t)
                .style('opacity', l => l.source.id == id || l.target.id == id ? 1 : 0 )

            select(this).select('rect')
                .attr('fill', 'white')

            panel
                .transition()
                .duration(300)
                .style('transform', `translate(${window.innerWidth/2}px,0)`)

            panel.update()
        })

    node.each(function (d) {
        // rectangle
        select(this)
            .append('rect')
                .attr('width', NODE_WIDTH)
                .attr('height', NODE_HEIGHT)
                .attr('x', -NODE_WIDTH/2)
                .attr('rx', 10)
                .style('fill', d => d.id == 0 ? NODE_COLORS.root : NODE_COLORS.default)
                .style('stroke', 'black')
                .style('stroke-width', 2)

        // text
        const p = select(this)
            .append('foreignObject')
                .attr('width', NODE_WIDTH - 2*NODE_PADDING)
                .attr('height', NODE_HEIGHT - 2*NODE_PADDING)
                .attr('x', -NODE_WIDTH/2 + NODE_PADDING)
                .attr('y', NODE_PADDING)
                .append('xhtml:p')
        
        for (const chunk of d.chunks) {
            if ([CHUNK_TEXT, CHUNK_LATEX].contains(chunk.kind))
                p.node().append(chunk.htmlElement)
        }


        // node id text for debugging
        select(this)
            .append('text')
            .style('dominant-baseline', 'middle')
            .text(d => 'ID: ' + d.id)
            .attr('dx', -NODE_WIDTH/2+NODE_PADDING)
            .attr('dy', NODE_HEIGHT-20)

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
            .attr('marker-end', 'url(#arrowhead)')
}

function makeTicked(node, link) {
    const LINK_BUFFER = 10
    return () => {
        link
            .attr('x1', d => {
                // if s on right of t, then arrow should start from left side of s
                if (d.source.x > d.target.x) return d.source.x - NODE_WIDTH/2
                // else arrow should touch right side of t
                return d.source.x + NODE_WIDTH/2
            })
            .attr('y1', d => {
                // if s below t, then arrow should start from bottom side of s
                if (d.source.y < d.target.y) return d.source.y + NODE_HEIGHT/2
                // else arrow should start from top side of s
                return d.source.y
            })
            .attr('x2', d => {
                // if s on right of t, then arrow should touch right side of t
                if (d.source.x > d.target.x) return d.target.x + NODE_WIDTH/2
                // else arrow should touch left side of t
                return d.target.x - NODE_WIDTH/2
            })
            .attr('y2', d => {
                // if s above t, then arrow should touch top side of t
                if (d.source.y < d.target.y) return d.target.y - NODE_HEIGHT/2
                // else arrow should touch bottom side of t
                return d.target.y + NODE_HEIGHT/2
            })

        node.attr('transform', d => `translate(${d.x + 6},${d.y - 6})`)
    }
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
        .force('charge', d3Force.forceManyBody().strength(100))
        .force('center', d3Force.forceCenter(WIDTH / 2, HEIGHT / 2))
        .force('collision', d3Force.forceCollide(Math.max(NODE_WIDTH, NODE_HEIGHT)-1).iterations(3))
        .on('end', makeTicked(node, link))
        .tick(500)

    return sim
}

