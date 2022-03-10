import { COLORS } from './constants'

export default function(svg) {
    const panel = svg.append('g')
        .attr('id', 'panel')
        .style('transform', `translate(${window.innerWidth}px, 0)`)

    // const { width, height } = panel.node().getBoundingRect()
    const panelContent = panel.append('foreignObject')
        .attr('height', '100%')
        .attr('width', window.innerWidth/2)
        .append('xhtml:div')
            .attr('id', 'panel-content')
            .style('background-color', COLORS[2])
            .style('height', '100%')
    
    panelContent.append('h1')
        .text('Node Content')
    panelContent.append('p')
        .text('Whatever stuff lol')

    panelContent.append('h1')
        .text('Context')
    panelContent.append('p')
        .text('Whatever stuff lol')

    panelContent.append('h1')
        .text('Narrative')
    panelContent.append('p')
        .text('Whatever stuff lol')

    return panel
}