import { COLORS } from './constants'
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
function update() {
    this.select('p.node-content')
        .text(store.selectedNode.text)
    
    this.select('p.node-context')
        .text('')

    this.select('p.narrative')
        .text('Nah bruh')
}