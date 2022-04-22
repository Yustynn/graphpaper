import * as d3 from 'd3'
import store from './store'

export function setSelectedNode(n) {
    const panelWidth = document.querySelector('#panel').getBoundingClientRect().width
    const tZoom = d3.transition().duration(500)

    d3.select('svg')
        .transition(tZoom)
        .call(store.zoom.translateTo, n.y + panelWidth/2, n.x)

    store.selectedNode = n.data

    // const { id } = n
    // store.visibleNodes.clear()
    // store.visibleNodes.add(id)
    // linksData
    //     .filter(l => l.source.id == id || l.target.id == id)
    //     .forEach(l => {
    //         store.visibleNodes.add(l.source.id)
    //         store.visibleNodes.add(l.target.id)
    //     })

    // const t = d3.transition()
    //     .duration(100)
    //     .ease(d3.easeLinear)


    // node.transition(t)
    //     .style('opacity', d => store.visibleNodes.has(d.id) ? 1 : 0)

    // link.transition(t)
    //     .style('opacity', l => l.source.id == id || l.target.id == id ? 1 : 0)
}