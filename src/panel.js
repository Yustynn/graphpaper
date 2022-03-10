import { COLORS } from './constants'

export default function(svg) {
    const panel = svg.append('g')
        .attr('id', 'panel')
        .style('transform', `translate(${window.innerWidth/2}px, 0)`)

    // background
    panel.append('rect')
        .attr('width', '50%')
        .attr('height', '100%')
        .attr('x', '50%')
        .attr('y', 0)
        .attr('fill', COLORS[2])

    // panel.append('')

    return panel
}