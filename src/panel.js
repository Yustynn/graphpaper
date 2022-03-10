import { COLORS } from './constants'
import katex from 'katex'
import store from './store'

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
    panelContent.append('h1')
        .text('Node Content')
        .attr('class', 'node-content')
    panelContent.append('p')
        .text('Whatever stuff lol')
        .attr('class', 'node-content')

    // node-context
    panelContent.append('h1')
        .text('Context')
        .attr('class', 'node-context')
    panelContent.append('p')
        .text('Whatever stuff lol')
        .attr('class', 'node-context')

    // narrative
    panelContent.append('h1')
        .text('Narrative')
        .attr('class', 'narrative')
    panelContent.append('p')
        .text('Whatever stuff lol')
        .attr('class', 'narrative')

    panel.update = update.bind(panel)

    return panel
}

function getTextChunks() {
    // this is a hacky solution to render latex :(

    const { text } = store.selectedNode
    const matches = text.match(/\$.*?\$/g)
    let chunks = [{ text, kind: 'text'}]

    for (let match of matches) {
        const processedChunks = []
        for (let chunk of chunks) {
            if (chunk.kind != 'text') {
                processedChunks.push(chunk)
                continue
            }
            const currChunks = chunk.text.split(match)

            for (let currChunk of currChunks.slice(0, currChunks.length-1)) {
                processedChunks.push({ text: currChunk, kind: 'text' })
                processedChunks.push({text: match.replaceAll('$', ''), kind: 'latex'})
            }
            processedChunks.push({ text: currChunks[currChunks.length-1], kind: 'text' })
        }
        chunks = processedChunks
    }

    return chunks
}

function update() {
    const chunks = getTextChunks()

    const nodeContent = this.select('p.node-content')
    nodeContent.html('')

    for (const { kind, text } of chunks) {
        const span = nodeContent.append('span')

        if (kind == 'text') span.text(text)
        else katex.render(text, span.node())
    }

    this.select('p.node-context')
        .text('')

    this.select('p.narrative')
        .text('Nah bruh')
}