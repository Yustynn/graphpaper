import * as d3Fetch from 'd3-fetch'
import { GRAPH_DATA_PATH } from './constants';
import store from './store'

export default async function loadData() {
    const data = await d3Fetch.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.text = n.text.replaceAll(/%(.+?)\|/g, '').replaceAll('%', '')
        return n
    })

    store.data = data

    return data
}

