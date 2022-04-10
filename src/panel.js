import { COLORS, LINK_COLORS } from './constants'
import katex from 'katex'
import store from './store'

function mkText(parent, element, text, cls) {
    return parent.append(element)
        .text(text)
        .attr('class', cls)
}

export default function(svg) {
    const panel = svg.append('g')
        .attr('id', 'panel')
        .style('transform', `translate(${window.innerWidth}px, 0)`)

    const panelContent = panel.append('foreignObject')
        .attr('height', '100%')
        .attr('width', window.innerWidth/2)
        .append('xhtml:div')
            .attr('id', 'panel-content')
            .style('background-color', COLORS[2])
            .style('height', '100%')

    // node content
    mkText(panelContent, 'h1', 'Node Content', 'node-content')
    mkText(panelContent, 'p', 'Node Content', 'node-content')

    // node-context
    mkText(panelContent, 'h1', 'Node Context', 'node-context')
    mkText(panelContent, 'p', 'Node Context', 'node-context')

    // incoming links
    mkText(panelContent, 'h1', 'Incoming Links', 'incoming-links')
    mkText(panelContent, 'p', 'Incoming Links', 'incoming-links')

    // outgoing links
    mkText(panelContent, 'h1', 'Outgoing Links', 'outgoing-links')
    mkText(panelContent, 'p', 'Outgoing Links', 'outgoing-links')

    // narrative
    mkText(panelContent, 'h1', 'Narrative', 'narrative')
    mkText(panelContent, 'p', 'Narrative', 'narrative')

    panel.update = update.bind(panel)

    return panel
}


function update() {
    const nodeContent = this.select('p.node-content')
    nodeContent.html('')

    for (const { kind, text } of store.selectedNode.textChunks) {
        const span = nodeContent.append('span')

        if (kind == 'text') span.text(text)
        else katex.render(text, span.node())
    }

    const incomingLinks = {}
    const outgoingLinks = {}
    console.log(store.selectedNode.id)
    store.data.links.forEach(l => {
        if (l.target == store.selectedNode.id) {
            if (!incomingLinks[l.kind]) incomingLinks[l.kind] = [l.source.id]
            else incomingLinks[l.kind].push(l.source.id)
        }
        if (l.source == store.selectedNode.id) {
            if (!outgoingLinks[l.kind]) outgoingLinks[l.kind] = [l.target.id]
            else outgoingLinks[l.kind].push(l.target.id)
        }
    })

    console.log('incomingLinks', incomingLinks)
    console.log('outgoingLinks', outgoingLinks)

    this.select('p.node-context')
        .text('')

    this.select('p.narrative')
        .text('Nah bruh')

    for (const [links, cls] of [[incomingLinks, 'incoming-links'], [outgoingLinks, 'outgoing-links']]) {
        const p = this.select(`p.${cls}`)
        p.html('')
        Object.keys(links).forEach(k => p.append('p')
            .text(`${k}: ${links[k].length} links`)
            .style('background-color', LINK_COLORS[k])
            .style('display', 'inline-block')
            .style('padding', '5px 10px')
        )

    }
}