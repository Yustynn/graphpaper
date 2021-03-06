import { CHUNK_LATEX, CHUNK_TEXT, COLORS, LINK_COLORS, PANEL_WIDTH_RATIO } from './constants'
import katex from 'katex'
import store from './store'
import { setSelectedNode } from './storeActions'

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
        .attr('width', window.innerWidth * PANEL_WIDTH_RATIO)
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
    panel.showOrHide = showOrHide.bind(panel)
    panel.show = show.bind(panel)
    panel.hide = hide.bind(panel)

    return panel
}


function update() {
    const nodeContent = this.select('p.node-content')
    nodeContent.html('')

    console.log(store.selectedNode)

    for (const chunk of store.selectedNode.chunks) {
        chunk.attachToD3Element(nodeContent)
    }

    const incomingLinks = {}
    const outgoingLinks = {}
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

    const ul = this.select('p.node-context').html('').append('ul')
    for (const chunk of store.selectedNode.contextChunks) {
        const li = ul.append('li')
        const header = li.append('h3')
            .classed('context-header', true)
        const button = li.append('button')
            .classed('context-button', true)
            .text('Go to node')
        chunk.attachToD3Element(header)

        const contextNodeId = store.data.contextNameToNodeId[chunk.contextName]
        const contextNode = store.nodeIdToTreeNode.get(contextNodeId)

        // add content
        if (contextNode) {
            const contextNodeContent = li.append('p').classed('context-node-text', true)

            for (const chunk of contextNode.data.chunks) {
                chunk.attachToD3Element(contextNodeContent)
            }
        }


        if (contextNodeId !== undefined) 
            button.on('click', () => {
                setSelectedNode(contextNode)
                this.update()
            })

    }

    this.select('p.narrative')
        .text('(not built yet)')

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

function showOrHide(isShow) {
    const tx = isShow ? window.innerWidth * (1 - PANEL_WIDTH_RATIO) : window.innerWidth

    this
        .transition()
        .duration(300)
        .style('transform', `translate(${tx}px,0)`)
}

function show() {
    this.showOrHide(true)
}

function hide() {
    this.showOrHide(false)
}