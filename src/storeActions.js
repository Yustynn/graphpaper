import * as d3 from 'd3'
import store from './store'

export function setSelectedNode(n) {
    if (store.selectedNode) {
        d3.select(`#node-${store.selectedNode.id}`)
            .classed('active', false)

    }
    const panelWidth = document.querySelector('#panel').getBoundingClientRect().width
    const tZoom = d3.transition().duration(500)

    d3.select('svg')
        .transition(tZoom)
        .call(store.zoom.translateTo, n.y + panelWidth/2, n.x)

    store.selectedNode = n.data
    d3.select(`#node-${store.selectedNode.id}`)
        .classed('active', true)
}